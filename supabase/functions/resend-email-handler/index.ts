import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const SENDER_EMAIL = "support@starlog.com.ng"; // verified domain on Resend

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

const generateWelcomeEmail = (name: string) => `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f0a18; color: #fff; padding: 30px; border-radius: 12px; border: 1px solid #2d1a45;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #ab47fc; margin: 0; font-size: 28px;">Welcome to StarLog! 🚀</h1>
  </div>
  <p style="font-size: 16px; color: #e2e8f0;">Hi ${name || 'there'},</p>
  <p style="font-size: 16px; color: #e2e8f0; line-height: 1.6;">
    Thank you for joining StarLog! We're thrilled to have you on board.
    You now have access to premium digital services, including SMS OTP numbers and Social Media logs.
  </p>
  <p style="font-size: 16px; color: #e2e8f0; line-height: 1.6;">
    To get started, you can generate your virtual PocketFi wallet and fund your account instantly.
  </p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="https://starlog.ng/dashboard" style="background: linear-gradient(90deg, #9333ea 0%, #ab47fc 100%); color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
  </div>
  <p style="font-size: 14px; color: #94a3b8;">If you have any questions, simply reply to this email.</p>
</div>
`;

const generateFundingEmail = (amount: any, reference: string) => `
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
    <a href="https://starlog.ng/dashboard" style="background: #ab47fc; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block;">View Wallet</a>
  </div>
</div>
`;

const generateAdminFundingEmail = (userProfile: any, amount: any, method: any, reference: any) => `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f0a18; color: #fff; padding: 30px; border-radius: 12px; border: 1px solid #2d1a45;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="color: #ab47fc; margin: 0; font-size: 24px;">New Deposit Received 💰</h1>
  </div>
  <p style="font-size: 16px; color: #e2e8f0;">Hello Admin,</p>
  <p style="font-size: 16px; color: #e2e8f0; line-height: 1.6;">
    A user has successfully funded their wallet. Below are the transaction details:
  </p>
  
  <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin: 20px 0;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.1);">User:</td>
        <td style="padding: 8px 0; color: #fff; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.1); font-weight: bold;">
          ${userProfile.full_name || userProfile.username || 'N/A'} (${userProfile.email || 'No email'})
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.1);">Amount:</td>
        <td style="padding: 8px 0; color: #3bb75e; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.1); font-weight: bold;">
          ₦${Number(amount).toLocaleString()}
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.1);">Funding Method:</td>
        <td style="padding: 8px 0; color: #fff; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.1);">${method}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #94a3b8;">Transaction ID:</td>
        <td style="padding: 8px 0; color: #94a3b8; text-align: right;">${reference}</td>
      </tr>
    </table>
  </div>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="https://starlog.ng/dashboard/admin" style="background: linear-gradient(90deg, #9333ea 0%, #ab47fc 100%); color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block;">Go to Admin Console</a>
  </div>
</div>
`;

const generateVirtualAccountEmail = (name: string, bankName: string, accountNumber: string, accountName: string) => `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f0a18; color: #fff; padding: 30px; border-radius: 12px; border: 1px solid #2d1a45;">
  <div style="text-align: center; margin-bottom: 25px;">
    <h1 style="color: #00f2fe; margin: 0; font-size: 24px;">Dedicated Funding Account Active 🏦</h1>
  </div>
  <p style="font-size: 16px; color: #e2e8f0;">Hi ${name || 'there'},</p>
  <p style="font-size: 16px; color: #e2e8f0; line-height: 1.6;">
    Your dedicated virtual bank account is now active. You can fund your wallet instantly at any time by making a bank transfer to this account:
  </p>
  
  <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin: 20px 0;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.1);">Bank Name:</td>
        <td style="padding: 8px 0; color: #fff; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.1); font-weight: bold;">${bankName}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.1);">Account Number:</td>
        <td style="padding: 8px 0; color: #00f2fe; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.1); font-weight: bold; font-family: monospace; font-size: 16px;">${accountNumber}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #94a3b8;">Account Name:</td>
        <td style="padding: 8px 0; color: #fff; text-align: right; font-weight: bold;">${accountName}</td>
      </tr>
    </table>
  </div>
  
  <p style="font-size: 14px; color: #94a3b8; line-height: 1.5;">
    Deposits sent to this account are credited to your StarLog wallet automatically within seconds.
  </p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="https://starlog.ng/dashboard" style="background: linear-gradient(90deg, #00c6ff 0%, #00f2fe 100%); color: #000; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
  </div>
</div>
`;

const generateOtpRequestedEmail = (service: string, phone: string, server: string, cost: any) => `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f0a18; color: #fff; padding: 30px; border-radius: 12px; border: 1px solid #2d1a45;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="color: #ab47fc; margin: 0; font-size: 24px;">Temporary OTP Number Assigned 📲</h1>
  </div>
  <p style="font-size: 16px; color: #e2e8f0;">Your temporary SMS verification number is ready:</p>
  
  <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
    <p style="margin: 0 0 10px 0; color: #94a3b8; font-size: 14px; text-transform: uppercase;">Your Temporary Number</p>
    <p style="margin: 0; font-size: 26px; font-weight: bold; color: #ab47fc; font-family: monospace;">${phone}</p>
  </div>
  
  <div style="background: rgba(255,255,255,0.02); padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.05);">
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr>
        <td style="padding: 6px 0; color: #94a3b8;">Service:</td>
        <td style="padding: 6px 0; color: #fff; text-align: right; font-weight: bold;">${service}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #94a3b8;">Server Gateway:</td>
        <td style="padding: 6px 0; color: #fff; text-align: right;">${server === 'server1' ? 'Server 1 (5SIM)' : server === 'server2' ? 'Server 2 (SMSPool)' : server === 'server3' ? 'Server 3 (Textverified)' : 'Server 4 (HeroSMS)'}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #94a3b8;">Cost:</td>
        <td style="padding: 6px 0; color: #ab47fc; text-align: right; font-weight: bold;">₦${Number(cost).toLocaleString()}</td>
      </tr>
    </table>
  </div>
  
  <p style="font-size: 13px; color: #94a3b8; line-height: 1.5;">
    Please enter this number in the target application's screen. Once the code arrives, you will receive another notification email and it will display instantly on your dashboard.
  </p>
</div>
`;

const generateOtpReceivedEmail = (service: string, phone: string, code: string, smsText: string) => `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f0a18; color: #fff; padding: 30px; border-radius: 12px; border: 1px solid #2d1a45;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="color: #3bb75e; margin: 0; font-size: 24px;">SMS Code Received! 🎉</h1>
  </div>
  <p style="font-size: 16px; color: #e2e8f0;">Your verification code for <strong>${service}</strong> (${phone}) has arrived:</p>
  
  <div style="background: rgba(59, 183, 94, 0.08); border: 2px dashed #3bb75e; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
    <span style="font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 5px;">Verification Code</span>
    <span style="font-size: 32px; font-weight: 800; color: #3bb75e; font-family: monospace; letter-spacing: 4px;">${code}</span>
  </div>
  
  <div style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.05);">
    <p style="margin: 0 0 6px 0; color: #94a3b8; font-size: 12px; text-transform: uppercase;">Full SMS Text</p>
    <p style="margin: 0; color: #e2e8f0; font-size: 13.5px; line-height: 1.5;">"${smsText}"</p>
  </div>
</div>
`;

const generatePurchaseReceiptEmail = (method: string, amount: any, txId: string) => `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f0a18; color: #fff; padding: 30px; border-radius: 12px; border: 1px solid #2d1a45;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="color: #ab47fc; margin: 0; font-size: 24px;">Receipt for Purchase 🧾</h1>
  </div>
  <p style="font-size: 16px; color: #e2e8f0;">Thank you for your purchase on StarLog!</p>
  
  <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin: 20px 0;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.1);">Product/Service:</td>
        <td style="padding: 8px 0; color: #fff; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.1); font-weight: bold;">${method}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.1);">Amount Paid:</td>
        <td style="padding: 8px 0; color: #ab47fc; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.1); font-weight: bold;">₦${Number(amount).toLocaleString()}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #94a3b8;">Transaction Reference:</td>
        <td style="padding: 8px 0; color: #94a3b8; text-align: right; font-family: monospace;">${txId}</td>
      </tr>
    </table>
  </div>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="https://starlog.ng/dashboard" style="background: #ab47fc; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
  </div>
</div>
`;

const formatDetailsForEmail = (details: any): string => {
  if (!details) return "";
  
  // If it's an array (multiple items)
  if (Array.isArray(details)) {
    return details.map((item: any, idx: number) => {
      const itemNum = item.item_number || (idx + 1);
      const lines = Object.entries(item)
        .filter(([k]) => k !== "item_number" && k !== "status")
        .map(([key, value]) => `<strong>${key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}:</strong> ${value}`)
        .join("<br/>");
      return `<div style="margin-bottom: 12px; padding-bottom: 12px; ${idx < details.length - 1 ? 'border-bottom: 1px solid rgba(255,255,255,0.05);' : ''}">
        <span style="color: #ab47fc; font-weight: bold;">Item #${itemNum}</span><br/>
        ${lines}
      </div>`;
    }).join("");
  }
  
  // If it's a flat object (single item)
  if (typeof details === "object") {
    if (details.status && details.status !== "completed") {
      return `Order status: <strong>${details.status}</strong>. Credentials will be available shortly.`;
    }
    return Object.entries(details)
      .filter(([k]) => k !== "raw_response" && k !== "status")
      .map(([key, value]) => `<strong>${key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}:</strong> ${value}`)
      .join("<br/>");
  }
  
  return String(details);
};

const generateOrderEmail = (planName: string, quantity: number, cost: any, orderId: string, additionalDetails = null) => `
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
    <div style="margin: 0; color: #e2e8f0; font-family: sans-serif; font-size: 13px; line-height: 1.5;">${formatDetailsForEmail(additionalDetails)}</div>
  </div>
  ` : ''}
  
  <p style="font-size: 14px; color: #94a3b8; margin: 5px 0;">Order ID: ${orderId}</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="https://starlog.ng/dashboard" style="background: #ab47fc; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block;">View Order History</a>
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

    // Database webhooks typically send { type: "INSERT" | "UPDATE", table: "...", record: {...} }
    const { type, table, record, old_record } = payload;
    
    // Validate trigger type
    if (type !== "INSERT" && type !== "UPDATE") {
      return new Response(JSON.stringify({ message: "Ignored: Not an INSERT or UPDATE event" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let recipientEmail = null;
    let recipientName = "";
    let emailSubject = "";
    let emailHtml = "";

    // Helper to fetch user's email if not in the current record
    const fetchUserProfile = async (userId: string) => {
      const { data } = await supabase.from("profiles").select("email, full_name, username").eq("id", userId).single();
      return data;
    };

    if (type === "INSERT") {
      if (table === "profiles") {
        // Welcome Email
        recipientEmail = record.email;
        recipientName = record.username || record.full_name || "Valued Customer";
        emailSubject = "Welcome to StarLog!";
        emailHtml = generateWelcomeEmail(recipientName);

      } else if (table === "transactions") {
        const profile = await fetchUserProfile(record.user_id);
        if (profile && profile.email) {
          recipientEmail = profile.email;
          
          if (record.type === "Deposit") {
            // Funding Email
            emailSubject = "Wallet Funded Successfully - StarLog";
            emailHtml = generateFundingEmail(record.amount, record.id);

            // Also notify admins if this is a real deposit (not a refund or welcome bonus)
            const isRefund = record.method?.toLowerCase().includes("refund");
            const isBonus = record.method?.toLowerCase().includes("bonus");

            if (!isRefund && !isBonus) {
              try {
                // Fetch admins
                const { data: admins } = await supabase
                  .from("profiles")
                  .select("email")
                  .eq("is_admin", true);

                const adminEmails = admins?.map(a => a.email).filter(Boolean) || [];

                if (adminEmails.length > 0) {
                  console.log("Notifying admins of deposit:", adminEmails);
                  const adminEmailHtml = generateAdminFundingEmail(profile, record.amount, record.method, record.id);

                  await fetch("https://api.resend.com/emails", {
                    method: "POST",
                    headers: {
                      "Authorization": `Bearer ${RESEND_API_KEY}`,
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                      from: `StarLog <${SENDER_EMAIL}>`,
                      to: adminEmails,
                      subject: `[Admin Alert] User Wallet Funded: ₦${Number(record.amount).toLocaleString()}`,
                      html: adminEmailHtml
                    })
                  });
                }
              } catch (adminErr) {
                console.error("Failed to notify admins of deposit:", adminErr);
              }
            }
          } else if (record.type === "Purchase") {
            // Purchase Receipt Email
            emailSubject = "Purchase Receipt - StarLog";
            emailHtml = generatePurchaseReceiptEmail(record.method, record.amount, record.id);
          }
        }
      } else if (table === "social_media_orders") {
        // SMM Order Notification Email
        const profile = await fetchUserProfile(record.user_id);
        if (profile && profile.email) {
          recipientEmail = profile.email;
          emailSubject = "Your StarLog Order Receipt";
          
          const planName = record.plan_name || record.service_name || record.package_name || "Digital Service";
          const cost = record.cost || record.price || 0;
          const quantity = record.quantity || 1;
          
          emailHtml = generateOrderEmail(planName, quantity, cost, record.id, record.account_details);
        }
      } else if (table === "otp_orders") {
        // OTP Number Order Receipt
        const profile = await fetchUserProfile(record.user_id);
        if (profile && profile.email) {
          recipientEmail = profile.email;
          emailSubject = "Your Temporary OTP Number Assigned";
          emailHtml = generateOtpRequestedEmail(record.service, record.phone_number, record.server, record.price_ngn);
        }
      } else if (table === "virtual_wallets") {
        // Dedicated account generated
        const profile = await fetchUserProfile(record.user_id);
        if (profile && profile.email) {
          recipientEmail = profile.email;
          recipientName = profile.username || profile.full_name || "Customer";
          emailSubject = "Dedicated Funding Account Active - StarLog";
          emailHtml = generateVirtualAccountEmail(recipientName, record.bank_name, record.account_number, record.account_name);
        }
      }
    } else if (type === "UPDATE") {
      if (table === "otp_orders") {
        // OTP Code Received (status changed PENDING -> COMPLETED)
        if (record.status === "COMPLETED" && (!old_record || old_record.status !== "COMPLETED") && record.otp_code) {
          const profile = await fetchUserProfile(record.user_id);
          if (profile && profile.email) {
            recipientEmail = profile.email;
            emailSubject = `Your ${record.service} Verification Code has Arrived!`;
            emailHtml = generateOtpReceivedEmail(record.service, record.phone_number, record.otp_code, record.sms_text || "");
          }
        }
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
          from: `StarLog <${SENDER_EMAIL}>`,
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
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
