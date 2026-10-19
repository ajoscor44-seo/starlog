import { serve } from "https://cdn.jsdelivr.net/gh/denoland/deno_std@v0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, x-webhook-secret',
}
const extractOtp = (message: string) => message.match(/\b\d{3,8}\b/g)?.at(-1) ?? null

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  try {
    const configuredSecret = Deno.env.get('PVADEALS_WEBHOOK_SECRET') ?? ''
    if (configuredSecret && req.headers.get('x-webhook-secret') !== configuredSecret) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }
    const payload = await req.json()
    const event = payload?.event ?? payload?.type
    const requestId = payload?.requestId ?? payload?.request_id ?? payload?.request?._id ?? payload?.data?.requestId
    const message = payload?.message ?? payload?.sms ?? payload?.smsText ?? payload?.data?.message ?? payload?.data?.sms
    if ((event && event !== 'sms_received' && event !== 'sms.received') || !requestId || !message) {
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )
    const { error } = await supabase.from('otp_orders').update({
      status: 'COMPLETED',
      otp_code: extractOtp(String(message)),
      sms_text: String(message),
    }).eq('id', `pva-${requestId}`).eq('server', 'server4')
    if (error) throw error
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
