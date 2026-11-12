const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN") ?? ""
const adminChatId = Deno.env.get("TELEGRAM_ADMIN_CHAT_ID") ?? ""

export const notifyTelegramAdmin = async (text: string) => {
  if (!botToken || !adminChatId) {
    console.warn("Telegram admin notification skipped: bot token or admin chat ID is missing")
    return false
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: adminChatId,
        text: text.slice(0, 4096),
        disable_web_page_preview: true,
      }),
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok || !result.ok) {
      console.error("Telegram admin notification failed:", result.description ?? response.statusText)
      return false
    }
    return true
  } catch (error) {
    console.error("Telegram admin notification failed:", error)
    return false
  }
}

export const notifyOutOfStock = (
  provider: string,
  item: string,
  details = "The requested quantity is unavailable.",
) => notifyTelegramAdmin([
  "OUT OF STOCK",
  `Provider: ${provider}`,
  `Item: ${item || "Unknown item"}`,
  `Details: ${details}`,
  `Time: ${new Date().toISOString()}`,
].join("\n"))
