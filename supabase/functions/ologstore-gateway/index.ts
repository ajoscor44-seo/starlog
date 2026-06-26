import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

const OLOGSTORE_API_KEY = Deno.env.get("OLOGSTORE_API_KEY") || "";
const OLOGSTORE_API_SECRET = Deno.env.get("OLOGSTORE_API_SECRET") || "";
const OLOGSTORE_BASE_URL = "https://ologstore.com/api/v1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper to translate common Vietnamese terms to English
const translateToEnglish = (text: string) => {
  if (!text) return text;
  const map: Record<string, string> = {
    'Học Tập': 'Learning',
    'Giải trí': 'Entertainment',
    'Làm việc': 'Work',
    'Tiện ích': 'Utility',
    'Tài khoản': 'Account',
    'Tháng': 'Month',
    'Năm': 'Year',
    'Ngày': 'Days',
    'Gia hạn': 'Renewal',
    'Nâng cấp': 'Upgrade',
    'Chính chủ': 'Official',
    'Bảo hành': 'Warranty',
    'Vĩnh viễn': 'Lifetime',
    'Mật khẩu': 'Password'
  };
  
  let result = text;
  Object.keys(map).forEach(key => {
    const regex = new RegExp(key, "gi");
    result = result.replace(regex, map[key]);
  });
  return result;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the user making the request
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, payload } = await req.json();

    if (action === "products") {
      let products = [];
      try {
        if (!OLOGSTORE_API_KEY) throw new Error("No API Key");

        const response = await fetch(`${OLOGSTORE_BASE_URL}/products/list?page=1&limit=100`, {
          method: "GET",
          headers: {
            "X-API-Key": OLOGSTORE_API_KEY,
            "X-API-Secret": OLOGSTORE_API_SECRET,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && data.data.products) {
            // Map OlogStore format to our frontend format
            products = data.data.products.flatMap((p: any) => 
              (p.plans || []).map((plan: any) => ({
                id: plan.id,
                category: translateToEnglish(p.category?.name || "General"),
                name: translateToEnglish(`${p.name} - ${plan.name}`),
                slug: p.slug,
                image: p.image,
                price: Number(plan.final_price) || 0,
                stock: plan.stock_count || 0,
                description: translateToEnglish(p.description || "")
              }))
            );
          }
        } else {
          throw new Error("Failed to fetch products");
        }
      } catch (err) {
        console.warn("Falling back to simulated products");
        products = [
          { id: 18, category: "Facebook", name: "Facebook Aged Account", price: 5000, stock: 120, description: "Aged FB account.", image: "https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" },
          { id: 19, category: "Instagram", name: "Instagram + 100 Followers", price: 2500, stock: 300, description: "Email verified.", image: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" }
        ];
      }

      // Add a 20% markup to the cost
      products = products.map((p: any) => ({ ...p, price: p.price * 1.2 }));

      return new Response(JSON.stringify({ success: true, products }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (action === "buy") {
      const { plan_id, plan_name, quantity, cost } = payload;

      const { data: profile, error: profileError } = await supabaseClient
        .from("profiles")
        .select("wallet_balance")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        return new Response(JSON.stringify({ success: false, error: "Failed to load wallet balance" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (profile.wallet_balance < cost) {
        return new Response(JSON.stringify({ success: false, error: "Insufficient wallet balance" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 2. Deduct Balance
      const newBalance = profile.wallet_balance - cost;
      const { error: deductError } = await supabaseAdmin
        .from("profiles")
        .update({ wallet_balance: newBalance })
        .eq("id", user.id);

      if (deductError) {
        throw new Error("Failed to deduct balance");
      }

      // 3. Log the transaction
      await supabaseAdmin.from("transactions").insert({
        user_id: user.id,
        amount: cost,
        type: "debit",
        description: `Purchased Social Media Log: ${plan_name} (x${quantity})`,
        status: "completed",
        reference: `olog_${Date.now()}`
      });

      // 4. Place order with OlogStore
      let orderResult = null;
      try {
        const response = await fetch(`${OLOGSTORE_BASE_URL}/orders/create`, {
          method: "POST",
          headers: {
            "X-API-Key": OLOGSTORE_API_KEY,
            "X-API-Secret": OLOGSTORE_API_SECRET,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: [
              {
                plan_id: plan_id,
                quantity: quantity,
                fields: {
                  email_dang_nhap: profile.email || "customer@discountzar.ng"
                }
              }
            ]
          })
        });

        if (response.ok) {
          orderResult = await response.json();
        } else {
          console.error("Ologstore API Order Error:", response.status, await response.text());
          throw new Error("OlogStore order creation failed");
        }
      } catch (err) {
        console.warn("OlogStore error, refunding user:", err);
        // Refund User
        const { data: currentProfile } = await supabaseAdmin.from("profiles").select("wallet_balance").eq("id", user.id).single();
        if (currentProfile) {
          await supabaseAdmin.from("profiles").update({ wallet_balance: currentProfile.wallet_balance + cost }).eq("id", user.id);
        }
          
        await supabaseAdmin.from("transactions").insert({
          user_id: user.id,
          amount: cost,
          type: "credit",
          description: `Refund: Failed to purchase ${plan_name}`,
          status: "completed",
          reference: `refund_olog_${Date.now()}`
        });

        return new Response(JSON.stringify({ success: false, error: "Failed to place order with provider. You have been refunded." }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 5. Insert into social_media_orders table
      const { data: orderRecord, error: orderInsertError } = await supabaseAdmin
        .from("social_media_orders")
        .insert({
          user_id: user.id,
          plan_id: plan_id,
          plan_name: plan_name,
          quantity: quantity,
          cost: cost,
          status: "completed",
          account_details: orderResult.account_details || orderResult,
          ologstore_order_id: orderResult.order_id || "simulated"
        })
        .select()
        .single();

      if (orderInsertError) {
         console.error("Failed to insert order record", orderInsertError);
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: "Order placed successfully!", 
        order: orderRecord,
        newBalance
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
