import { serve } from "https://cdn.jsdelivr.net/gh/denoland/deno_std@v0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized user')
    }

    const requestBody = await req.json().catch(() => ({}))
    const { action } = requestBody

    if (!action) {
      throw new Error('Missing action parameter')
    }

    const apiKey = 'WPEqw3A3GHdSYYLztpJRKb28sul5xlQI' // Provided by user
    
    let url = ''
    let formData = new FormData()
    formData.append('key', apiKey)

    if (action === 'retrieve_all') {
      const { type } = requestBody
      url = 'https://api.smspool.net/rental/retrieve_all'
      formData.append('type', type || '1')
    } else if (action === 'stock') {
      const { id, days } = requestBody
      url = 'https://api.smspool.net/rental/stock'
      formData.append('id', id)
      formData.append('days', days)
    } else if (action === 'order') {
      const { id, days, service_id } = requestBody
      url = 'https://api.smspool.net/purchase/rental'
      formData.append('id', id)
      formData.append('days', days)
      if (service_id) formData.append('service_id', service_id)
    } else if (action === 'retrieve_messages') {
      const { rental_code } = requestBody
      url = 'https://api.smspool.net/rental/retrieve_messages'
      formData.append('rental_code', rental_code)
    } else if (action === 'retrieve') {
      url = 'https://api.smspool.net/rental/retrieve'
    } else if (action === 'retrieve_pricing') {
      const { id } = requestBody
      url = 'https://api.smspool.net/rental/retrieve_pricing'
      formData.append('id', id)
    } else {
      throw new Error(`Unsupported action: ${action}`)
    }

    // Call SMSPool API
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    })

    const text = await response.text()
    
    // Attempt to parse response as JSON
    let result
    try {
      result = JSON.parse(text)
    } catch {
      throw new Error(text)
    }

    return new Response(JSON.stringify({ status: true, data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ status: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }
})
