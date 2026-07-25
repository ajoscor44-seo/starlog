import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

// Ensure required env vars are set
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const SENDER_EMAIL = Deno.env.get("SENDER_EMAIL") || "support@starlog.com.ng";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const generateFollowUpEmail = (name: string) => `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f0a18; color: #fff; padding: 30px; border-radius: 12px; border: 1px solid #2d1a45;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="color: #ab47fc; margin: 0; font-size: 24px;">Still Exploring StarLog?</h1>
  </div>
  <p style="font-size: 16px; color: #e2e8f0; line-height: 1.6;">Hi ${name},</p>
  <p style="font-size: 16px; color: #e2e8f0; line-height: 1.6;">
    We noticed you signed up for StarLog recently, but haven't placed your first order yet! 
  </p>
  <p style="font-size: 16px; color: #e2e8f0; line-height: 1.6;">
    Whether you're looking for cheap temporary SMS numbers for verification or premium social media accounts logs, we've got you covered at unbeatable prices.
  </p>
  
  <div style="background: rgba(171, 71, 252, 0.1); border: 1px solid rgba(171, 71, 252, 0.2); padding: 15px; border-radius: 8px; margin: 25px 0;">
    <h3 style="margin: 0 0 10px 0; color: #ab47fc; font-size: 16px;">Quick Start Guide:</h3>
    <ul style="margin: 0; padding-left: 20px; color: #94a3b8; font-size: 14px; line-height: 1.8;">
      <li><strong>Step 1:</strong> Deposit funds securely into your wallet.</li>
      <li><strong>Step 2:</strong> Browse our marketplace for OTPs or Social Media packages.</li>
      <li><strong>Step 3:</strong> Purchase instantly and get details delivered right on your dashboard!</li>
    </ul>
  </div>

  <p style="font-size: 15px; color: #94a3b8; line-height: 1.6;">
    If you have any questions or need help setting up, simply reply to this email. Our support team is ready to assist you.
  </p>
  
  <div style="text-align: center; margin: 35px 0;">
    <a href="https://starlog.ng/dashboard" style="background: #ab47fc; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
  </div>

  <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 40px;">
    You're receiving this because you signed up on StarLog.ng.
  </p>
</div>
`;

serve(async (req) => {
  try {
    // 1. Fetch profiles created > 24h ago that haven't received a follow-up
    const { data: profiles, error: profileErr } = await supabase
      .from('profiles')
      .select('id, full_name') 
      .eq('followup_email_sent', false)
      .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (profileErr) throw profileErr;
    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ message: "No eligible profiles found." }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    let emailsSent = 0;

    for (const profile of profiles) {
      // 2. Check if the user has any purchases (transactions where type != 'Deposit')
      const { data: txs, error: txErr } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', profile.id)
        .neq('type', 'Deposit')
        .limit(1);

      if (txErr) {
        console.error("Error fetching transactions for user", profile.id, txErr);
        continue;
      }

      if (txs && txs.length > 0) {
        // User has purchases, mark them as sent anyway so we don't check again
        await supabase.from('profiles').update({ followup_email_sent: true }).eq('id', profile.id);
        continue;
      }

      // 3. Get the user's email from auth.users
      const { data: userAuth, error: authErr } = await supabase.auth.admin.getUserById(profile.id);
      
      if (authErr || !userAuth?.user?.email) {
        console.error("Error fetching auth email for user", profile.id, authErr);
        continue;
      }

      const email = userAuth.user.email;
      const name = profile.full_name || "Valued Customer";
      const htmlBody = generateFollowUpEmail(name);

      console.log(`Sending follow-up email to ${email}`);

      // 4. Send Email via Resend
      const resendReq = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: `StarLog <${SENDER_EMAIL}>`,
          to: email,
          subject: "Still exploring StarLog?",
          html: htmlBody
        })
      });

      if (!resendReq.ok) {
        const errorText = await resendReq.text();
        console.error("Resend API Error:", errorText);
        continue;
      }

      // 5. Update the flag
      await supabase.from('profiles').update({ followup_email_sent: true }).eq('id', profile.id);
      emailsSent++;
    }

    return new Response(JSON.stringify({ success: true, processed: profiles.length, emailsSent }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in followup-cron:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
