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
  
  // Clean up unicode characters and normalize
  let result = text.normalize("NFC");
  
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
    'Mật khẩu': 'Password',
    'xác minh danh tính': 'Identity Verified',
    'xác minh': 'Verified',
    'xác thực': 'Authenticated',
    'đã kháng': 'Appealed/Reinstated',
    'kháng ads': 'Ads Appealed',
    'kháng': 'Appealed',
    'chất lượng': 'Quality',
    'quốc gia': 'Country',
    'ngẫu nhiên': 'Random',
    'định dạng': 'Format',
    'bạn bè': 'Friends',
    'bè': 'Friends',
    'theo dõi': 'Followers',
    'lọc': 'Filtered',
    'sạch': 'Clean',
    'quảng cáo': 'Ads',
    'bảo mật': 'Security/2FA',
    'mã': 'Code',
    'khôi phục': 'Recovery',
    'ảo': 'Virtual',
    'chưa': 'Not',
    'đã': 'Already/Yes',
    'quét': 'Scanned',
    'sở hữu': 'Owned',
    'tạo': 'Created',
    'thanh toán': 'Payment',
    'thẻ': 'Card',
    'giá': 'Price',
    'rẻ': 'Cheap',
    'sỉ': 'Wholesale',
    'lẻ': 'Retail',
    'loại': 'Type',
    'dưới': 'Under',
    'trên': 'Above',
    'kho': 'Stock',
    'hết hàng': 'Out of Stock',
    'còn hàng': 'In Stock',
    'bao': 'Guarantee',
    'lỗi': 'Error',
    'đổi': 'Change/Replace',
    'hoàn tiền': 'Refund',
    'hỗ trợ': 'Support',
    'giờ': 'Hours',
    'phút': 'Minutes',
    'giây': 'Seconds',
    'Việt Nam': 'Vietnam',
    'Ngoại': 'Foreign/International',
    'Cổ': 'Aged',
    'Mới': 'New',
    'Siêu cổ': 'Super Aged',
    'Mỹ': 'USA',
    'Anh': 'UK',
    'Pháp': 'France',
    'Đức': 'Germany',
    'Nga': 'Russia',
    'Trung Quốc': 'China',
    'Thái Lan': 'Thailand',
    'Ấn Độ': 'India',
    'Philippines': 'Philippines',
    'Indonesia': 'Indonesia',
    'Campuchia': 'Cambodia',
    'Lào': 'Laos',
    'Thường': 'Regular/Standard',
    'Cá nhân': 'Personal',
    'Doanh nghiệp': 'Business',
    'Đại lý': 'Reseller',
    'Vnd': 'VND',
    'Đồng': 'Dong',
    'Giá rẻ': 'Budget/Cheap',
    'Cao cấp': 'Premium',
    'Hạn': 'Limit/Expiry',
    'Khóa': 'Locked/Blocked',
    'Mở khóa': 'Unlocked',
    'Liên kết': 'Linked',
    'Không': 'No/Without',
    'Có': 'Yes/With',
    'Bao gồm': 'Including',
    'Yêu cầu': 'Required',
    'Tự động': 'Automatic',
    'Thủ công': 'Manual',
    'Nhanh': 'Fast',
    'Chậm': 'Slow',
    'Ổn định': 'Stable',
    'Hệ thống': 'System',
    'Hỗ trợ 24/7': '24/7 Support',
    'Thông tin': 'Information/Details',
    'Tên': 'Name',
    'Tuổi': 'Age',
    'Giới tính': 'Gender',
    'Nam': 'Male',
    'Nữ': 'Female',
    'không đủ tiền': 'insufficient balance',
    'Số dư không đủ': 'insufficient balance',
    'Tài khoản không đủ': 'insufficient balance'
  };

  const sortedKeys = Object.keys(map).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(escapedKey, "gi");
    result = result.replace(regex, (match) => {
      const replacement = map[key];
      if (match === match.toUpperCase()) {
        return replacement.toUpperCase();
      }
      if (match[0] === match[0].toUpperCase()) {
        return replacement.charAt(0).toUpperCase() + replacement.slice(1);
      }
      return replacement;
    });
  }

  return result;
};

// Helper to parse delivery items (strings like "Account: user@mail.com | Pass: abc123") into structured objects
const parseDeliveryItem = (itemStr: string): Record<string, string> => {
  const parts: Record<string, string> = {};
  if (!itemStr) return parts;
  const segments = itemStr.split('|');
  segments.forEach((seg: string) => {
    const colonIdx = seg.indexOf(':');
    if (colonIdx > 0) {
      let key = seg.substring(0, colonIdx).trim();
      const val = seg.substring(colonIdx + 1).trim();
      if (key && val) {
        const lowerKey = key.toLowerCase();
        if (lowerKey === 'tài khoản' || lowerKey === 'tai khoan' || lowerKey === 'username' || lowerKey === 'user' || lowerKey === 'login') {
          key = 'Username/Email';
        } else if (lowerKey === 'mật khẩu' || lowerKey === 'mat khau' || lowerKey === 'pass') {
          key = 'Password';
        } else if (lowerKey === 'mã bảo mật' || lowerKey === '2fa' || lowerKey === 'code' || lowerKey === 'mã 2fa') {
          key = '2FA Backup Key';
        } else {
          key = translateToEnglish(key);
        }
        parts[key] = val;
      }
    }
  });
  if (Object.keys(parts).length === 0 && itemStr.trim()) {
    parts['Details'] = translateToEnglish(itemStr.trim());
  }
  return parts;
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

      // Keep raw provider price (markup is added dynamically in frontend)
      products = products.map((p: any) => ({ ...p, price: p.price }));

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
          console.log("OlogStore order response:", JSON.stringify(orderResult));
          if (orderResult && orderResult.success === false) {
            throw new Error(orderResult.message || orderResult.error || "OlogStore order creation failed");
          }
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

        const errMsg = err.message || '';
        let userFriendlyError = "Failed to place order with provider. You have been refunded.";
        if (
          errMsg.toLowerCase().includes('không đủ tiền') ||
          errMsg.toLowerCase().includes('số dư') ||
          errMsg.toLowerCase().includes('balance') ||
          errMsg.toLowerCase().includes('money') ||
          errMsg.toLowerCase().includes('fund')
        ) {
          userFriendlyError = "This service is currently unavailable on this server. Please try using another server.";
        }

        return new Response(JSON.stringify({ success: false, error: userFriendlyError }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 5. Parse the OlogStore response to extract delivery data
      // OlogStore returns: { success, data: { orders: [{trans_id, ...}], delivery: { items: ["Account: x | Pass: y"], delivered_count, expected_count } } }
      const ologData = orderResult?.data || {};
      const ologOrders = ologData.orders || (ologData.order ? [ologData.order] : []);
      const transId = (ologOrders[0]?.trans_id) || orderResult?.trans_id || null;
      const deliveryItems = 
        ologOrders[0]?.delivery?.items || 
        ologData.delivery?.items || 
        orderResult?.delivery?.items || 
        orderResult?.data?.delivery?.items || 
        [];

      // Build account_details as a structured object
      const finalStatus = ologData?.status || ologOrders[0]?.status || orderResult?.status || "completed";
      let accountDetails: any;
      if (deliveryItems.length === 1) {
        // Single item: flatten to a simple key-value object
        accountDetails = parseDeliveryItem(deliveryItems[0]);
      } else if (deliveryItems.length > 1) {
        // Multiple items: array of parsed objects
        accountDetails = deliveryItems.map((item: string, idx: number) => ({
          item_number: idx + 1,
          ...parseDeliveryItem(item)
        }));
      } else {
        // No delivery items yet (order may be processing) - store raw response for reference
        accountDetails = { status: finalStatus, raw_response: ologData };
      }

      // 6. Insert into social_media_orders table
      const orderId = crypto.randomUUID();
      const { data: orderRecord, error: orderInsertError } = await supabaseAdmin
        .from("social_media_orders")
        .insert({
          id: orderId,
          user_id: user.id,
          plan_id: plan_id,
          plan_name: plan_name,
          quantity: quantity,
          cost: cost,
          status: finalStatus,
          account_details: accountDetails,
          ologstore_order_id: transId || `local_${Date.now()}`
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

    } else if (action === "status") {
      const { trans_id } = payload;
      if (!trans_id) {
        return new Response(JSON.stringify({ success: false, error: "Missing trans_id" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Query OlogStore status API
      const response = await fetch(`${OLOGSTORE_BASE_URL}/orders/status?trans_id=${trans_id}`, {
        method: "GET",
        headers: {
          "X-API-Key": OLOGSTORE_API_KEY,
          "X-API-Secret": OLOGSTORE_API_SECRET,
        },
      });

      if (!response.ok) {
        console.error("OlogStore status error:", response.status, await response.text());
        return new Response(JSON.stringify({ success: false, error: "Failed to fetch status from OlogStore" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const statusResult = await response.json();
      console.log("OlogStore status query response:", JSON.stringify(statusResult));

      const ologData = statusResult?.data || {};
      const ologOrders = ologData.orders || (ologData.order ? [ologData.order] : []);
      const status = ologData?.status || ologOrders[0]?.status || statusResult?.status || "completed";
      const deliveryItems = 
        statusResult?.delivery?.items || 
        ologOrders[0]?.delivery?.items || 
        ologData.delivery?.items || 
        statusResult?.data?.delivery?.items || 
        [];

      // Parse delivery items
      let accountDetails: any;
      if (deliveryItems.length === 1) {
        accountDetails = parseDeliveryItem(deliveryItems[0]);
      } else if (deliveryItems.length > 1) {
        accountDetails = deliveryItems.map((item: string, idx: number) => ({
          item_number: idx + 1,
          ...parseDeliveryItem(item)
        }));
      } else {
        accountDetails = { status: status, raw_response: ologData };
      }

      // Update in the database
      const { data: updatedOrder, error: updateError } = await supabaseAdmin
        .from("social_media_orders")
        .update({
          status: status,
          account_details: accountDetails
        })
        .eq("ologstore_order_id", trans_id)
        .select()
        .single();

      if (updateError) {
        console.error("Failed to update order status in DB:", updateError);
        return new Response(JSON.stringify({ success: false, error: "Failed to update order in database" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        order: updatedOrder
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
