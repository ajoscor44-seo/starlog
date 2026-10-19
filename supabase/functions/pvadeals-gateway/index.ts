import { serve } from "https://cdn.jsdelivr.net/gh/denoland/deno_std@v0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const BASE_URL = 'https://prod-v3.pvadeals.com/v3/api'
let servicesCache: { services: unknown[] } | null = null

const normalizeServices = (result: any): unknown[] => {
  const candidates = [result?.data?.services, result?.services, result?.data, result]
  return candidates.find(Array.isArray) ?? []
}

const normalizeApiKey = (value: string): string => value
  .trim()
  .replace(/^Bearer\s+/i, '')
  .replace(/^['"]|['"]$/g, '')
  .trim()

const extractMessage = (value: any): string | null => {
  const candidates = [
    value?.smsText, value?.sms_text, value?.sms, value?.message,
    value?.data?.smsText, value?.data?.sms_text, value?.data?.sms, value?.data?.message,
    value?.request?.sms, value?.request?.message,
  ]
  const message = candidates.find((item) => typeof item === 'string' && item.trim())
  return message?.trim() ?? null
}

const extractOtp = (message: string | null): string | null =>
  message?.match(/\b\d{3,8}\b/g)?.at(-1) ?? null

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) throw new Error('Unauthorized user')

    const apiKey = normalizeApiKey(Deno.env.get('PVADEALS_API_KEY') ?? '')
    if (!apiKey) throw new Error('Server 4 is not configured')
    const body = await req.json().catch(() => ({}))
    const { action } = body
    let url = BASE_URL
    let method = 'GET'
    let payload: unknown

    if (action === 'get_services') {
      url += '/services/all'
    } else if (action === 'buy') {
      if (!body.serviceId) throw new Error('Missing serviceId for buy action')
      url += '/purchase'
      method = 'POST'
      payload = { services: [{ serviceId: body.serviceId }] }
    } else if (action === 'check') {
      if (!body.id) throw new Error('Missing id for check action')
      url += `/request/${encodeURIComponent(body.id)}`
    } else if (action === 'cancel') {
      if (!body.id) throw new Error('Missing id for cancel action')
      url += `/flag/${encodeURIComponent(body.id)}`
      method = 'POST'
    } else {
      throw new Error(`Unsupported action: ${action}`)
    }

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
        ...(payload ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(payload ? { body: JSON.stringify(payload) } : {}),
    })
    const responseText = await response.text()
    let result: any
    try { result = JSON.parse(responseText) } catch { result = { message: responseText } }
    if (!response.ok || result?.success === false) {
      if (action === 'get_services' && servicesCache) {
        return new Response(JSON.stringify({ status: true, data: servicesCache, stale: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
        })
      }
      throw new Error(result?.message || result?.error || `Server 4 returned ${response.status}`)
    }

    let responseData = result?.data ?? result
    if (action === 'get_services') {
      const services = normalizeServices(result)
      if (services.length === 0) {
        if (servicesCache) responseData = servicesCache
        else throw new Error('Server 4 returned an empty service catalog')
      } else {
        responseData = { services }
        servicesCache = responseData
      }
    }

    // PVA Deals has returned the SMS under several keys across API versions.
    // Give the client one stable shape while preserving the complete payload.
    if (action === 'check') {
      const smsText = extractMessage(result)
      responseData = {
        ...(typeof responseData === 'object' && responseData ? responseData : { value: responseData }),
        smsText,
        otpCode: extractOtp(smsText),
      }
    }

    return new Response(JSON.stringify({ status: true, data: responseData, message: result?.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ status: false, error: error instanceof Error ? error.message : String(error) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
    })
  }
})
