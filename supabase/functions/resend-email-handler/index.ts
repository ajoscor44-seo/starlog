import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const SENDER_EMAIL = "support@discountzar.ng"; // Make sure to verify this domain on Resend, or use "onboarding@resend.dev" for testing

// Supabase client (Service Role for admin DB access)
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// --- HTML Email Templates ---

const generateWelcomeEmail = (name) => `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f0a18; color: #fff; padding: 30px; border-radius: 12px; border: 1px solid #2d1a45;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #ab47fc; margin: 0; font-size: 28px;">Welcome to DiscountZar Plus! 🚀</h1>
  </div>
  <p style="font-size: 16px; color: #e2e8f0;">Hi ${name || 'there'},</p>
  <p style="font-size: 16px; color: #e2e8f0; line-height: 1.6;">
    Thank you for joining DiscountZar! We're thrilled to have you on board.
    You now have access to premium digital services, including shared subscriptions, SMS OTP numbers, eSIMs, and SMM Panel boosts.
  </p>
  <p style="font-size: 16px; color: #e2e8f0; line-height: 1.6;">
    To get started, you can generate your virtual PocketFi wallet and fund your account instantly.
  </p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="https://discountzar.ng/dashboard" style="background: linear-gradient(90deg, #9333ea 0%, #ab47fc 100%); color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
  </div>
  <p style="font-size: 14px; color: #94a3b8;">If you have any questions, simply reply to this email.</p>
</div>
`;

const generateFundingEmail = (amount, newBalance, reference) => `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f0a18; color: #fff; padding: 30px; border-radius: 12px; border: 1px solid #2d1a45;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="color: #3bb75e; margin: 0; font-size: 24px;">Wallet Funded Successfully 💰</h1>
  </div>
  <p style="font-size: 16px; color: #e2e8f0;">Your wallet has been successfully credited!</p>
  
  <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p style="margin: 0 0 10px 0; color: #94a3b8;">Amount Credited</p>
    <p style="margin: 0; font-size: 24px; font-weight: bold; color: #fff;">₦${Number(amount).toLocaleString()}</p>
  </div>
  
  <p style="font-size: 14px; color: #94a3b8; margin: 5px 0;">Transaction Ref: ${reference}</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="https://discountzar.ng/dashboard" style="background: #ab47fc; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block;">View Wallet</a>
  </div>
</div>
`;

const generateOrderEmail = (planName, quantity, cost, orderId, additionalDetails = null) => `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f0a18; color: #fff; padding: 30px; border-radius: 12px; border: 1px solid #2d1a45;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="color: #ab47fc; margin: 0; font-size: 24px;">Order Notification 🛒</h1>
  </div>
  <p style="font-size: 16px; color: #e2e8f0;">Your order has been placed successfully!</p>
  
  <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin: 20px 0;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.1);">Service:</td>
        <td style="padding: 8px 0; color: #fff; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.1); font-weight: bold;">${planName}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.1);">Quantity:</td>
        <td style="padding: 8px 0; color: #fff; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.1);">${quantity}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #94a3b8;">Total Cost:</td>
        <td style="padding: 8px 0; color: #ab47fc; text-align: right; font-weight: bold;">₦${Number(cost).toLocaleString()}</td>
      </tr>
    </table>
  </div>
  
  ${additionalDetails ? `
  <div style="background: rgba(171, 71, 252, 0.1); border: 1px solid rgba(171, 71, 252, 0.2); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
    <h3 style="margin: 0 0 10px 0; color: #ab47fc; font-size: 14px; text-transform: uppercase;">Order Details</h3>
    <pre style="margin: 0; color: #e2e8f0; font-family: monospace; white-space: pre-wrap; font-size: 13px;">${JSON.stringify(additionalDetails, null, 2)}</pre>
  </div>
  ` : ''}
  
  <p style="font-size: 14px; color: #94a3b8; margin: 5px 0;">Order ID: ${orderId}</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="https://discountzar.ng/dashboard" style="background: #ab47fc; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block;">View Order History</a>
  </div>
</div>
`;


serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("Received Webhook Payload:", payload);

    // Database webhooks typically send { type: "INSERT", table: "...", record: {...} }
    const { type, table, record } = payload;
    
    // We only care about INSERTS
    if (type !== "INSERT" || !record) {
      return new Response(JSON.stringify({ message: "Ignored: Not an INSERT event" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let recipientEmail = null;
    let recipientName = "";
    let emailSubject = "";
    let emailHtml = "";

    // Helper to fetch user's email if not in the current record
    const fetchUserProfile = async (userId) => {
      const { data } = await supabase.from("profiles").select("email, full_name, username").eq("id", userId).single();
      return data;
    };

    if (table === "profiles") {
      // Welcome Email
      recipientEmail = record.email;
      recipientName = record.username || record.full_name || "Valued Customer";
      emailSubject = "Welcome to DiscountZar Plus!";
      emailHtml = generateWelcomeEmail(recipientName);

    } else if (table === "transactions" && record.type === "Deposit") {
      // Funding Email
      const profile = await fetchUserProfile(record.user_id);
      if (profile && profile.email) {
        recipientEmail = profile.email;
        emailSubject = "Wallet Funded Successfully - DiscountZar";
        emailHtml = generateFundingEmail(record.amount, 0, record.id);
      }
    } else if (["social_media_orders"].includes(table)) {
      // Order Notification Email
      const profile = await fetchUserProfile(record.user_id);
      if (profile && profile.email) {
        recipientEmail = profile.email;
        emailSubject = "Your DiscountZar Order Receipt";
        
        const planName = record.plan_name || record.service_name || record.package_name || "Digital Service";
        const cost = record.cost || record.price || 0;
        const quantity = record.quantity || 1;
        
        let details = null;
        if (table === "esim_orders") details = { ICCID: record.iccid, Data: record.data_gb + 'GB' };
        if (table === "social_media_orders") details = record.account_details;
        
        emailHtml = generateOrderEmail(planName, quantity, cost, record.id, details);
      }
    }

    // Dispatch the email via Resend if we have a recipient and HTML content
    if (recipientEmail && emailHtml) {
      console.log(`Sending email to ${recipientEmail} for event on table ${table}...`);
      
      const resendReq = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: `DiscountZar <${SENDER_EMAIL}>`,
          to: recipientEmail,
          subject: emailSubject,
          html: emailHtml
        })
      });

      const resendRes = await resendReq.json();
      
      if (!resendReq.ok) {
        console.error("Resend API Error:", resendRes);
        throw new Error(`Resend Error: ${resendRes.message}`);
      }

      return new Response(JSON.stringify({ success: true, message: "Email dispatched", resend_id: resendRes.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ message: "Ignored: No suitable recipient or email content" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Webhook Handler Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
