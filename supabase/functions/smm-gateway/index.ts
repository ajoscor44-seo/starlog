import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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

    const apiKey = Deno.env.get('SMM_API_KEY')
    if (!apiKey) {
      throw new Error('SMM_API_KEY is not configured on the backend')
    }

    const url = 'https://the-owlet.com/api/v2'
    const params = new URLSearchParams()
    params.append('key', apiKey)
    params.append('action', action)

    if (action === 'add') {
      const { service, link, quantity } = requestBody
      if (!service || !link || !quantity) {
        throw new Error('Missing service, link, or quantity for add action')
      }
      params.append('service', String(service))
      params.append('link', String(link))
      params.append('quantity', String(quantity))
    } else if (action === 'status') {
      const { order } = requestBody
      if (!order) {
        throw new Error('Missing order ID for status action')
      }
      params.append('order', String(order))
    } else if (action === 'balance') {
      // No extra params needed
    } else if (action === 'services') {
      // No extra params needed
    } else {
      throw new Error(`Unsupported action: ${action}`)
    }

    // Call SMM API (The Owlet) using POST application/x-www-form-urlencoded
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: params.toString()
    })

    const text = await response.text()
    
    let result
    try {
      result = JSON.parse(text)
    } catch {
      throw new Error(text || `SMM API returned error status: ${response.status}`)
    }

    if (!response.ok || result.error) {
      throw new Error(result.error || `SMM API returned error status: ${response.status}`)
    }

    return new Response(JSON.stringify({ status: true, data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ status: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
