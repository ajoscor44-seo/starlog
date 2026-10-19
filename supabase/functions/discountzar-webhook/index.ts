import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

const WEBHOOK_SECRET = Deno.env.get("DISCOUNTZAR_WEBHOOK_SECRET") ?? "";

const secureEqual = (left: string, right: string) => {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return result === 0;
};

const sign = async (value: string) => {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(signature), byte => byte.toString(16).padStart(2, "0")).join("");
};

serve(async (request) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (!WEBHOOK_SECRET) return new Response("Webhook is not configured", { status: 500 });

  const rawBody = await request.text();
  const header = request.headers.get("x-discountzar-signature") ?? "";
  const timestamp = header.match(/(?:^|,)\s*t=(\d+)/)?.[1];
  const receivedSignature = header.match(/(?:^|,)\s*v1=([a-f0-9]+)/i)?.[1];
  const age = timestamp ? Math.abs(Date.now() / 1000 - Number(timestamp)) : Number.POSITIVE_INFINITY;

  if (!timestamp || !receivedSignature || age > 300 || !secureEqual(await sign(`${timestamp}.${rawBody}`), receivedSignature)) {
    return new Response("Invalid signature", { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const event = String(payload.event ?? "");
  const data = (payload.data && typeof payload.data === "object" ? payload.data : {}) as Record<string, unknown>;
  const orderId = String(data.order_id ?? payload.order_id ?? "");
  if (!orderId) return new Response(JSON.stringify({ received: true }), { status: 200 });

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );
  const { data: order } = await admin
    .from("social_media_orders")
    .select("id, account_details")
    .eq("ologstore_order_id", `DZ:${orderId}`)
    .maybeSingle();

  if (!order) return new Response(JSON.stringify({ received: true }), { status: 200 });

  const details = {
    ...(order.account_details && typeof order.account_details === "object" ? order.account_details : {}),
    ...data,
  };
  const status = event === "order.fulfilled" ? "completed"
    : event === "order.failed" ? "failed"
    : event === "order.processing" ? "processing"
    : undefined;
  const update: Record<string, unknown> = { account_details: details };
  if (status) update.status = status;

  const { error } = await admin.from("social_media_orders").update(update).eq("id", order.id);
  if (error) {
    console.error("Unable to update DiscountZAR order", error);
    return new Response("Database update failed", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
