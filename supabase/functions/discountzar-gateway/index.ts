import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

const API_BASE_URL = "https://www.discountzar.com/api/v1";
const API_KEY = Deno.env.get("DISCOUNTZAR_API_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

const providerRequest = async (path: string, init: RequestInit = {}) => {
  if (!API_KEY) throw new Error("DiscountZar is not configured");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result?.status === "error") {
    throw new Error(result?.error || result?.message || "DiscountZar request failed");
  }
  return result;
};

const isVpnListing = (listing: Record<string, any>) => {
  const text = `${listing.service_name ?? ""} ${listing.category ?? ""} ${listing.slug ?? ""}`.toLowerCase();
  return text.includes("vpn") || text.includes("privacy & security") || text.includes("privacy and security");
};

const getMarkup = async (admin: ReturnType<typeof createClient>) => {
  const { data } = await admin.from("system_config").select("value").eq("id", "profit_markup").maybeSingle();
  try {
    const value = typeof data?.value === "string" ? JSON.parse(data.value) : data?.value;
    return Math.max(0, Number(value?.subs ?? 30));
  } catch {
    return 30;
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const client = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) return json({ success: false, error: "Unauthorized" }, 401);

    const { action, payload = {} } = await req.json();

    if (action === "products") {
      const result = await providerRequest("/listings");
      const markup = await getMarkup(admin);
      const products = (result.listings ?? [])
        .filter((listing: Record<string, any>) => isVpnListing(listing) && Number(listing.available_slots ?? 0) > 0)
        .map((listing: Record<string, any>) => {
          const wholesalePrice = Number(listing.reseller_price ?? listing.price ?? 0);
          return {
            id: `dz-${listing.id}`,
            providerListingId: String(listing.id),
            provider: "discountzar",
            providerCode: "DZ",
            name: listing.service_name ?? "VPN Subscription",
            category: listing.category ?? "Privacy & Security",
            priceNgn: Math.max(100, Math.round(wholesalePrice * (1 + markup / 100))),
            availableSlots: Number(listing.available_slots ?? 0),
            billingCycle: listing.billing_cycle ?? "monthly",
            fulfillmentType: listing.fulfillment_type ?? "Credentials",
            features: [
              `${listing.billing_cycle ?? "Monthly"} access`,
              `${listing.fulfillment_type ?? "Instant credentials"}`,
              `${Number(listing.available_slots ?? 0)} slot(s) available`,
            ],
          };
        });
      return json({ success: true, products });
    }

    if (action === "buy") {
      const listingId = String(payload.listing_id ?? "");
      const chargedCost = Number(payload.cost);
      if (!listingId || !Number.isFinite(chargedCost) || chargedCost <= 0) {
        return json({ success: false, error: "Invalid purchase details" }, 400);
      }

      const catalogue = await providerRequest("/listings");
      const listing = (catalogue.listings ?? []).find((item: Record<string, any>) => String(item.id) === listingId);
      if (!listing || !isVpnListing(listing) || Number(listing.available_slots ?? 0) < 1) {
        return json({ success: false, error: "This VPN subscription is unavailable" }, 409);
      }

      const markup = await getMarkup(admin);
      const wholesalePrice = Number(listing.reseller_price ?? listing.price ?? 0);
      const requiredCharge = Math.max(100, Math.round(wholesalePrice * (1 + markup / 100)));
      if (chargedCost !== requiredCharge) {
        return json({ success: false, error: "The subscription price changed. Refresh and try again." }, 409);
      }

      const { data: profile, error: profileError } = await admin
        .from("profiles").select("wallet_balance").eq("id", user.id).single();
      if (profileError || !profile || Number(profile.wallet_balance) < chargedCost) {
        return json({ success: false, error: "Insufficient wallet balance" }, 400);
      }

      const localOrderId = crypto.randomUUID();
      const pendingReference = `DZ:pending_${localOrderId}`;
      const { data: pendingOrder, error: pendingError } = await admin.from("social_media_orders").insert({
        id: localOrderId,
        user_id: user.id,
        plan_id: `discountzar:${listingId}`,
        plan_name: String(listing.service_name ?? "VPN Subscription"),
        quantity: 1,
        cost: chargedCost,
        status: "processing",
        account_details: { status: "processing", provider: "DiscountZar" },
        ologstore_order_id: pendingReference,
      }).select().single();
      if (pendingError || !pendingOrder) {
        return json({ success: false, error: "Unable to create order history. You have not been charged." }, 500);
      }

      const previousBalance = Number(profile.wallet_balance);
      const newBalance = previousBalance - chargedCost;
      const { error: debitError } = await admin.from("profiles").update({ wallet_balance: newBalance }).eq("id", user.id);
      if (debitError) {
        await admin.from("social_media_orders").delete().eq("id", localOrderId);
        throw new Error("Unable to debit wallet");
      }

      let purchase;
      try {
        purchase = await providerRequest("/orders", {
          method: "POST",
          body: JSON.stringify({
            type: "subscription",
            listing_id: listingId,
            assigned_email: user.email,
          }),
        });
      } catch (error) {
        await admin.from("profiles").update({ wallet_balance: previousBalance }).eq("id", user.id);
        await admin.from("social_media_orders").update({
          status: "failed",
          account_details: { status: "failed", message: "Provider order failed; wallet refunded." },
        }).eq("id", localOrderId);
        throw error;
      }

      const fulfillment = purchase.fulfillment_data ?? {};
      const accountDetails = {
        ...fulfillment,
        portal_url: purchase.portal_url ?? null,
        expires_at: purchase.expires_at ?? null,
        provider: "DiscountZar",
      };
      const providerReference = `DZ:${purchase.order_id ?? localOrderId}`;
      const { data: savedOrder, error: saveError } = await admin.from("social_media_orders").update({
        status: "completed",
        account_details: accountDetails,
        ologstore_order_id: providerReference,
      }).eq("id", localOrderId).select().single();
      if (saveError) console.error("Failed to attach DiscountZar delivery", saveError);

      await admin.from("transactions").insert({
        id: `tx-${crypto.randomUUID()}`,
        user_id: user.id,
        amount: chargedCost,
        type: "debit",
        method: `DiscountZar VPN: ${String(listing.service_name ?? "VPN Subscription")}`,
        status: "SUCCESS",
      });

      return json({
        success: true,
        order: savedOrder ?? { ...pendingOrder, status: "completed", account_details: accountDetails, ologstore_order_id: providerReference },
        newBalance,
      });
    }

    return json({ success: false, error: "Invalid action" }, 400);
  } catch (error) {
    console.error(error);
    return json({ success: false, error: error instanceof Error ? error.message : "Internal server error" }, 500);
  }
});
