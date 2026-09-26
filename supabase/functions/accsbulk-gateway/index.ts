import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

const API_BASE_URL = "https://www.logsapi.cv/api";
const API_KEY = Deno.env.get("LOGSAPI_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

const providerRequest = async (path: string, init: RequestInit = {}) => {
  if (!API_KEY) throw new Error("LogsAPI is not configured");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || result?.error || "LogsAPI request failed");
  }
  return result;
};

const asAccountDetails = (accounts: unknown) => {
  const values = Array.isArray(accounts) ? accounts.filter(Boolean).map(String) : [];
  if (values.length === 0) return { status: "processing" };
  if (values.length === 1) return { Credentials: values[0] };
  return values.map((credential, index) => ({ item_number: index + 1, Credentials: credential }));
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const client = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } },
    );
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) return json({ success: false, error: "Unauthorized" }, 401);

    const { action, payload = {} } = await req.json();

    if (action === "products") {
      const result = await providerRequest("/products");
      const categoryIcons = new Map(
        (result.categories ?? []).map((category: Record<string, unknown>) => [String(category.name ?? ""), category.icon ?? null]),
      );
      const products = (result.products ?? [])
        .filter((product: Record<string, unknown>) => Number(product.stock ?? 0) > 0)
        .map((product: Record<string, unknown>) => ({
          id: String(product.id),
          slug: `logsapi-${product.id}`,
          providerSlug: String(product.id),
          name: product.name,
          category: product.category ?? "Other",
          image: categoryIcons.get(String(product.category ?? "")) ?? null,
          price: Number(product.price ?? 0),
          priceCurrency: "NGN",
          min: Number(product.min ?? 1),
          max: Number(product.max ?? product.stock ?? 1),
          stock: Number(product.stock ?? 0),
          description: product.description ?? "",
        }));
      return json({ success: true, products });
    }

    if (action === "product") {
      const slug = String(payload.slug ?? "");
      if (!slug) return json({ success: false, error: "Missing listing slug" }, 400);
      const result = await providerRequest(`/products/${encodeURIComponent(slug)}`);
      const listing = result.product ?? result;
      return json({
        success: true,
        product: {
          id: listing.id,
          name: listing.name,
          description: listing.description ?? "",
          image: listing.image ?? null,
          stock: Number(listing.stock ?? 0),
        },
      });
    }

    if (action === "buy") {
      const listingId = String(payload.listing_id ?? "");
      const slug = String(payload.slug ?? listingId);
      const quantity = Number(payload.quantity);
      const chargedCost = Number(payload.cost);
      if (!listingId || !slug || !Number.isInteger(quantity) || quantity < 1 || !Number.isFinite(chargedCost) || chargedCost <= 0) {
        return json({ success: false, error: "Invalid purchase details" }, 400);
      }

      // Refresh the listing before charging so a stale browser price cannot cause a loss.
      const listingResult = await providerRequest(`/products/${encodeURIComponent(slug)}`);
      const listing = listingResult.product ?? listingResult;
      if (String(listing.id) !== listingId || Number(listing.stock ?? 0) < quantity) {
        return json({ success: false, error: "This listing is unavailable or no longer has enough stock" }, 400);
      }

      const providerCostNgn = Math.ceil(Number(listing.price ?? 0) * quantity);
      if (!Number.isFinite(providerCostNgn) || providerCostNgn <= 0 || chargedCost < providerCostNgn) {
        return json({ success: false, error: "The listing price changed. Refresh the catalogue and try again." }, 409);
      }

      const { data: profile, error: profileError } = await admin
        .from("profiles").select("wallet_balance").eq("id", user.id).single();
      if (profileError || !profile || Number(profile.wallet_balance) < chargedCost) {
        return json({ success: false, error: "Insufficient wallet balance" }, 400);
      }

      const newBalance = Number(profile.wallet_balance) - chargedCost;
      const { error: debitError } = await admin.from("profiles")
        .update({ wallet_balance: newBalance }).eq("id", user.id);
      if (debitError) throw new Error("Unable to debit wallet");

      let purchase;
      try {
        purchase = await providerRequest("/orders", {
          method: "POST",
          body: JSON.stringify({ id: listingId, amount: quantity }),
        });
      } catch (error) {
        await admin.from("profiles").update({ wallet_balance: Number(profile.wallet_balance) }).eq("id", user.id);
        return json({ success: false, error: "The provider could not complete the order. Your wallet has been refunded." }, 502);
      }

      const order = purchase.data ?? purchase;
      const providerOrderId = String(order.orderId ?? order.transId ?? "");
      const accountDetails = asAccountDetails(order.logs);
      const status = order.status === "delivered" ? "completed" : "processing";
      const orderId = crypto.randomUUID();
      const { data: savedOrder, error: saveError } = await admin.from("social_media_orders").insert({
        id: orderId,
        user_id: user.id,
        plan_id: String(listingId),
        plan_name: String(listing.name ?? payload.plan_name ?? "Social media account"),
        quantity,
        cost: chargedCost,
        status,
        account_details: accountDetails,
        ologstore_order_id: providerOrderId || `logsapi_${orderId}`,
      }).select().single();
      if (saveError) console.error("Failed to save AccsBulk order", saveError);

      await admin.from("transactions").insert({
        id: `tx-${crypto.randomUUID()}`,
        user_id: user.id,
        amount: chargedCost,
        type: "debit",
        method: `LogsAPI: ${String(listing.name ?? "Social media account")}`,
        status: "SUCCESS",
      });

      return json({ success: true, order: savedOrder ?? { id: orderId, account_details: accountDetails, status }, newBalance });
    }

    if (action === "status") {
      const orderId = String(payload.order_id ?? "");
      if (!orderId) return json({ success: false, error: "Invalid order ID" }, 400);
      const result = await providerRequest("/orders?limit=100");
      const order = (result.orders ?? []).find((item: Record<string, unknown>) => String(item.id) === orderId || String(item.transId) === orderId) ?? {};
      const logs = Array.isArray(order.logs) ? order.logs : (order.logs ? [order.logs] : []);
      const accountDetails = asAccountDetails(logs);
      const status = order.status === "delivered" ? "completed" : "processing";
      const { data: updatedOrder, error } = await admin.from("social_media_orders")
        .update({ status, account_details: accountDetails })
        .eq("ologstore_order_id", String(orderId)).eq("user_id", user.id).select().single();
      if (error) throw new Error("Unable to update the saved order");
      return json({ success: true, order: updatedOrder });
    }

    return json({ success: false, error: "Invalid action" }, 400);
  } catch (error) {
    console.error(error);
    return json({ success: false, error: error instanceof Error ? error.message : "Internal server error" }, 500);
  }
});
