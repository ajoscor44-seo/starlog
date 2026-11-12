import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json" },
})

const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN") ?? ""
const webhookSecret = Deno.env.get("TELEGRAM_WEBHOOK_SECRET") ?? ""
const notificationSecret = Deno.env.get("TELEGRAM_NOTIFICATION_SECRET") ?? ""
const adminChatId = Deno.env.get("TELEGRAM_ADMIN_CHAT_ID") ?? ""

const sendTelegramMessage = async (chatId: string | number, text: string) => {
  if (!botToken) throw new Error("TELEGRAM_BOT_TOKEN is not configured")

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    }),
  })

  const result = await response.json()
  if (!response.ok || !result.ok) {
    throw new Error(result.description || "Telegram rejected the message")
  }

  return result.result
}

serve(async (req) => {
  try {
    if (req.method === "GET") {
      return json({ status: "ok", service: "telegram-admin-bot" })
    }

    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405)

    const telegramSecret = req.headers.get("x-telegram-bot-api-secret-token")
    if (telegramSecret) {
      if (!webhookSecret || telegramSecret !== webhookSecret) {
        return json({ error: "Invalid Telegram webhook secret" }, 401)
      }

      const update = await req.json()
      const message = update.message
      const chatId = message?.chat?.id
      const text = String(message?.text ?? "").trim().toLowerCase()

      if (chatId && (text === "/start" || text === "/id" || text.startsWith("/id@"))) {
        await sendTelegramMessage(
          chatId,
          `StarLog admin notifications are connected.\n\nYour Telegram chat ID is: ${chatId}\n\nSave this value as TELEGRAM_ADMIN_CHAT_ID.`,
        )
      }

      return json({ ok: true })
    }

    if (!notificationSecret || req.headers.get("x-notification-secret") !== notificationSecret) {
      return json({ error: "Unauthorized" }, 401)
    }

    if (!adminChatId) {
      return json({ error: "TELEGRAM_ADMIN_CHAT_ID is not configured" }, 503)
    }

    const payload = await req.json()
    const text = String(payload?.text ?? "").trim()
    if (!text) return json({ error: "text is required" }, 400)
    if (text.length > 4096) return json({ error: "text exceeds Telegram's 4096-character limit" }, 400)

    const sentMessage = await sendTelegramMessage(adminChatId, text)
    return json({ ok: true, message_id: sentMessage.message_id })
  } catch (error) {
    console.error("Telegram admin bot error:", error)
    return json({ error: error instanceof Error ? error.message : "Unexpected error" }, 500)
  }
})
