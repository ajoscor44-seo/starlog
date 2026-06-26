import { serve } from "https://cdn.jsdelivr.net/gh/denoland/deno_std@v0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  // Webhooks usually POST data
  if (req.method === 'POST') {
    try {
      const payload = await req.json().catch(() => ({}));
      console.log('Received SMSPool Webhook:', JSON.stringify(payload));
      
      // If a Discord Webhook URL is set in Supabase Env variables, forward it
      const discordWebhookUrl = Deno.env.get('DISCORD_WEBHOOK_URL');
      if (discordWebhookUrl) {
        await fetch(discordWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `📬 **New SMS Received (SMSPool)**\n\`\`\`json\n${JSON.stringify(payload, null, 2)}\n\`\`\``
          })
        });
      }

      // Respond OK to SMSPool
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (err) {
      console.error('Error parsing webhook payload:', err);
      return new Response(JSON.stringify({ error: 'Bad Request' }), { status: 400 });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
})
