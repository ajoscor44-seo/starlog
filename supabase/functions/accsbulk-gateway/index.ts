import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

const API_BASE_URL = "https://accsbulk.com/api/v1";
const API_KEY = Deno.env.get("ACCSBULK_API_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

const providerRequest = async (path: string, init: RequestInit = {}) => {
  if (!API_KEY) throw new Error("AccsBulk is not configured");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "X-API-Key": API_KEY,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || result?.error || "AccsBulk request failed");
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
      const result = await providerRequest("/listings?per_page=100&sort=title&direction=asc");
      const products = (result.data ?? []).map((listing: Record<string, unknown>) => ({
        id: listing.id,
        slug: listing.slug,
        providerSlug: listing.slug,
        provider: "accsbulk",
        providerCode: "AB",
        providerName: "AccsBulk",
        name: listing.title,
        category: (listing.subcategory as Record<string, unknown> | undefined)?.title
          ?? (listing.category as Record<string, unknown> | undefined)?.title
          ?? "Social media",
        image: (listing.category as Record<string, unknown> | undefined)?.image ?? null,
        price: Number(listing.price ?? 0),
        priceCurrency: "USD",
        stock: Number(listing.available_stock ?? 0),
        description: "",
      }));
      return json({ success: true, products });
    }

    if (action === "product") {
      const slug = String(payload.slug ?? "");
      if (!slug) return json({ success: false, error: "Missing listing slug" }, 400);
      const result = await providerRequest(`/listings/${encodeURIComponent(slug)}`);
      const listing = result.data ?? {};
      return json({
        success: true,
        product: {
          id: listing.id,
          name: listing.title,
          description: listing.description ?? "",
          image: listing.image ?? (listing.category as Record<string, unknown> | undefined)?.image ?? null,
          stock: Number(listing.available_stock ?? 0),
          provider: "accsbulk",
          providerCode: "AB",
          providerName: "AccsBulk",
        },
      });
    }

    if (action === "buy") {
      const listingId = Number(payload.listing_id);
      const slug = String(payload.slug ?? "");
      const quantity = Number(payload.quantity);
      const chargedCost = Number(payload.cost);
      if (!Number.isInteger(listingId) || !slug || !Number.isInteger(quantity) || quantity < 1 || !Number.isFinite(chargedCost) || chargedCost <= 0) {
        return json({ success: false, error: "Invalid purchase details" }, 400);
      }

      // Refresh the listing before charging so a stale browser price cannot cause a loss.
      const listingResult = await providerRequest(`/listings/${encodeURIComponent(slug)}`);
      const listing = listingResult.data ?? {};
      if (Number(listing.id) !== listingId || Number(listing.available_stock ?? 0) < quantity) {
        return json({ success: false, error: "This listing is unavailable or no longer has enough stock" }, 400);
      }

      const { data: rateConfig } = await admin.from("system_config").select("value").eq("id", "exchange_rate").maybeSingle();
      const exchangeRate = Number(rateConfig?.value) || 1350;
      const providerCostNgn = Math.ceil(Number(listing.price ?? 0) * exchangeRate * quantity);
      if (!Number.isFinite(providerCostNgn) || providerCostNgn <= 0 || chargedCost < providerCostNgn) {
        return json({ success: false, error: "The listing price changed. Refresh the catalogue and try again." }, 409);
      }

      const { data: profile, error: profileError } = await admin
        .from("profiles").select("wallet_balance").eq("id", user.id).single();
      if (profileError || !profile || Number(profile.wallet_balance) < chargedCost) {
        return json({ success: false, error: "Insufficient wallet balance" }, 400);
      }

      const orderId = crypto.randomUUID();
      const pendingReference = `AB:pending_${orderId}`;
      const { data: pendingOrder, error: pendingError } = await admin.from("social_media_orders").insert({
        id: orderId,
        user_id: user.id,
        plan_id: String(listingId),
        plan_name: String(listing.title ?? payload.plan_name ?? "Social media account"),
        quantity,
        cost: chargedCost,
        status: "processing",
        account_details: { status: "processing" },
        ologstore_order_id: pendingReference,
      }).select().single();
      if (pendingError || !pendingOrder) {
        console.error("Unable to create AccsBulk history record", pendingError);
        return json({ success: false, error: "Unable to create your order history. You have not been charged." }, 500);
      }

      const newBalance = Number(profile.wallet_balance) - chargedCost;
      const { error: debitError } = await admin.from("profiles")
        .update({ wallet_balance: newBalance }).eq("id", user.id);
      if (debitError) {
        await admin.from("social_media_orders").delete().eq("id", orderId).eq("user_id", user.id);
        throw new Error("Unable to debit wallet");
      }

      let purchase;
      try {
        purchase = await providerRequest("/purchase", {
          method: "POST",
          body: JSON.stringify({ ad_id: listingId, quantity }),
        });
      } catch (error) {
        await admin.from("profiles").update({ wallet_balance: Number(profile.wallet_balance) }).eq("id", user.id);
        await admin.from("social_media_orders").update({
          status: "failed",
          account_details: { status: "failed", message: "Provider could not complete the order; wallet refunded." },
        }).eq("id", orderId).eq("user_id", user.id);
        return json({ success: false, error: "The provider could not complete the order. Your wallet has been refunded." }, 502);
      }

      const order = purchase.data ?? {};
      const providerOrderId = String(order.order_id ?? "");
      const accountDetails = asAccountDetails(order.accounts);
      const status = Array.isArray(order.accounts) && order.accounts.length ? "completed" : "processing";
      const providerReference = providerOrderId ? `AB:${providerOrderId}` : pendingReference;
      const { data: savedOrder, error: saveError } = await admin.from("social_media_orders").update({
        status,
        account_details: accountDetails,
        ologstore_order_id: providerReference,
      }).eq("id", orderId).eq("user_id", user.id).select().single();
      if (saveError) console.error("Failed to attach AccsBulk delivery to history record", saveError);

      await admin.from("transactions").insert({
        id: `tx-${crypto.randomUUID()}`,
        user_id: user.id,
        amount: chargedCost,
        type: "debit",
        method: `AccsBulk: ${String(listing.title ?? "Social media account")}`,
        status: "SUCCESS",
      });

      return json({
        success: true,
        order: savedOrder ?? { ...pendingOrder, status, account_details: accountDetails, ologstore_order_id: providerReference },
        newBalance,
      });
    }

    if (action === "status") {
      const orderId = Number(payload.order_id);
      const storedReference = String(payload.stored_reference ?? `AB:${orderId}`);
      if (!Number.isInteger(orderId)) return json({ success: false, error: "Invalid order ID" }, 400);
      const result = await providerRequest(`/orders/${orderId}`);
      const order = result.data ?? {};
      const accountDetails = asAccountDetails(order.accounts);
      const status = Array.isArray(order.accounts) && order.accounts.length ? "completed" : "processing";
      const { data: updatedOrder, error } = await admin.from("social_media_orders")
        .update({ status, account_details: accountDetails })
        .eq("ologstore_order_id", storedReference).eq("user_id", user.id).select().single();
      if (error) throw new Error("Unable to update the saved order");
      return json({ success: true, order: updatedOrder });
    }

    return json({ success: false, error: "Invalid action" }, 400);
  } catch (error) {
    console.error(error);
    return json({ success: false, error: error instanceof Error ? error.message : "Internal server error" }, 500);
  }
});
