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

    if (action.startsWith('admin-')) {
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()
        
      if (profileError || !profile || profile.is_admin !== true) {
        return new Response(JSON.stringify({ error: 'Unauthorized: Admin access required' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        })
      }
    }

    // Intercept admin endpoints that use SUPABASE_SERVICE_ROLE_KEY to bypass RLS
    if (action === 'admin-get-transactions') {
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
      const { data, error } = await supabaseAdmin
        .from('transactions')
        .select('id, amount, type, method, status, created_at, user_id, profiles(full_name, phone)')
        .order('created_at', { ascending: false })
      if (error) throw error
      
      const formatted = data.map((tx: any) => ({
        id: tx.id,
        user_id: tx.user_id,
        amountNgn: Number(tx.amount),
        amountUsd: Number(tx.amount) / 750,
        type: tx.type,
        method: tx.method,
        status: tx.status,
        date: new Date(tx.created_at).toLocaleString(),
        user_name: tx.profiles?.full_name || 'N/A',
        user_phone: tx.profiles?.phone || 'N/A'
      }))

      return new Response(JSON.stringify({ status: true, data: formatted }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    if (action === 'admin-get-profiles') {
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, username, email, phone, wallet_balance, updated_at, created_at')
        .order('created_at', { ascending: false })
      if (error) throw error

      return new Response(JSON.stringify({ status: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    if (action === 'admin-get-config') {
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

      const { data, error } = await supabaseAdmin
        .from('system_config')
        .select('*')
      if (error) throw error

      return new Response(JSON.stringify({ status: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    if (action === 'admin-update-config') {
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
      const { id, value } = requestBody

      if (!id || value === undefined) {
        throw new Error('Missing id or value for config update')
      }

      const { data, error } = await supabaseAdmin
        .from('system_config')
        .upsert({ id, value, updated_at: new Date().toISOString() })
        .select()
        .single()
      if (error) throw error

      return new Response(JSON.stringify({ status: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    if (action === 'admin-update-profile') {
      const { targetUserId, newBalance, username, phone, fullName, isAdmin } = requestBody
      if (!targetUserId) {
        throw new Error('Missing targetUserId')
      }
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

      const updateData: any = {}
      if (newBalance !== undefined) updateData.wallet_balance = newBalance
      if (username !== undefined) updateData.username = username
      if (phone !== undefined) updateData.phone = phone
      if (fullName !== undefined) updateData.full_name = fullName
      if (isAdmin !== undefined) updateData.is_admin = isAdmin
      updateData.updated_at = new Date().toISOString()

      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update(updateData)
        .eq('id', targetUserId)
        .select()
      if (error) throw error

      return new Response(JSON.stringify({ status: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const apiKey = Deno.env.get('FIVESIM_API_KEY') || 'd5eA83A2cfcf6045cf1c2e40c79bf163'

    if (action === 'get_countries') {
      // Public endpoint — no API key required
      const resp = await fetch('https://5sim.net/v1/guest/countries', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      })
      const text = await resp.text()
      let result
      try { result = JSON.parse(text) } catch { throw new Error(text) }
      return new Response(JSON.stringify({ status: true, data: result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    let url = ''
    if (action === 'buy') {
      const { country, service } = requestBody
      if (!country || !service) {
        throw new Error('Missing country or service for buy action')
      }
      url = `https://5sim.net/v1/user/buy/activation/${country}/any/${service}`
    } else if (action === 'check') {
      const { orderId } = requestBody
      if (!orderId) {
        throw new Error('Missing orderId for check action')
      }
      url = `https://5sim.net/v1/user/check/${orderId}`
    } else if (action === 'cancel') {
      const { orderId } = requestBody
      if (!orderId) {
        throw new Error('Missing orderId for cancel action')
      }
      url = `https://5sim.net/v1/user/cancel/${orderId}`
    } else if (action === 'finish') {
      const { orderId } = requestBody
      if (!orderId) {
        throw new Error('Missing orderId for finish action')
      }
      url = `https://5sim.net/v1/user/finish/${orderId}`
    } else if (action === 'reuse') {
      const { product, number } = requestBody
      if (!product || !number) {
        throw new Error('Missing product or number for reuse action')
      }
      url = `https://5sim.net/v1/user/reuse/${product}/${number}`
    } else if (action === 'products') {
      const { country } = requestBody
      if (!country) {
        throw new Error('Missing country for products action')
      }
      url = `https://5sim.net/v1/guest/products/${country}/any`
    } else {
      throw new Error(`Unsupported action: ${action}`)
    }

    // Call 5sim API
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      }
    })

    const text = await response.text()
    
    // Attempt to parse response as JSON
    let result
    try {
      result = JSON.parse(text)
    } catch {
      // If it is not JSON (e.g. "no free phones", "no money"), throw it as a descriptive error
      throw new Error(text)
    }

    if (!response.ok) {
      throw new Error(result.message || result.error || `5SIM API returned error status: ${response.status}`)
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
