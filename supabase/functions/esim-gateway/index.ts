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
    const { action, iso3, dataGb, iccid } = requestBody

    if (!action) {
      throw new Error('Missing action parameter')
    }

    // Termii API config
    const apiKey = Deno.env.get('TERMII_API_KEY') ?? ''
    const baseUrl = 'https://v3.api.termii.com'

    // 1. Authenticate with Termii Sotel to get bearer token
    const authRes = await fetch(`${baseUrl}/api/esim/authenticate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey })
    })
    
    if (!authRes.ok) {
      const authErrorText = await authRes.text()
      throw new Error(`Termii Authentication failed: ${authErrorText}`)
    }
    
    const authData = await authRes.json()
    const token = authData.data?.token || authData.token || authData.encryptedKey
    if (!token) {
      throw new Error(`Authentication token not found in Termii response: ${JSON.stringify(authData)}`)
    }

    // 2. Route based on action
    if (action === 'buy') {
      if (!iso3) {
        throw new Error('Missing iso3 country code')
      }

      // Fetch Sotel plans list to select a product ID
      const countryMap = {
        'USA': 'United States',
        'GBR': 'United Kingdom',
        'NGA': 'Nigeria',
        'EUR': 'Europe',
        'ASI': 'Asia'
      }
      const countryName = countryMap[iso3] || iso3

      console.log(`Fetching Sotel plans for ${countryName}...`)
      const plansRes = await fetch(`${baseUrl}/api/esim/data/plan/fetch?country=${encodeURIComponent(countryName)}`, {
        method: 'GET',
        headers: {
          'X-Token': token,
          'Accept': 'application/json'
        }
      })
      
      if (!plansRes.ok) {
        throw new Error(`Failed to fetch Sotel plans list: ${plansRes.statusText}`)
      }
      
      const plansData = await plansRes.json()
      
      // Check if plans list has entries
      let selectedProductId = ''
      
      const plansList = plansData.data?.content || plansData.data || []
      
      if (plansList.length > 0) {
        // Try to find a plan matching data size (dataGb)
        const match = plansList.find((p: any) => {
          const pData = Number(p.dataGb || p.data || 0)
          return pData === Number(dataGb)
        })
        selectedProductId = match ? match.productId || match.id : plansList[0].productId || plansList[0].id
      }
      
      // If no plans found in Sotel list, return a clear descriptive setup instruction
      if (!selectedProductId) {
        throw new Error(`No available eSIM data packages found for ${countryName} in your Termii Sotel account. Please load and configure packages in your Termii console first.`)
      }

      console.log(`Provisioning eSIM for product: ${selectedProductId} (${iso3})...`)
      
      // Create Sotel eSIM profile
      const createRes = await fetch(`${baseUrl}/api/esim/create`, {
        method: 'POST',
        headers: {
          'X-Token': token,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          productId: selectedProductId,
          iso3: iso3
        })
      })
      
      const createData = await createRes.json()
      if (!createRes.ok || !createData.sim) {
        throw new Error(createData.message || createData.error || `Sotel eSIM creation failed: ${createRes.status}`)
      }
      
      return new Response(JSON.stringify({ status: true, data: createData.sim }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })

    } else if (action === 'plans') {
      const plansRes = await fetch(`${baseUrl}/api/esim/data/plan/fetch`, {
        method: 'GET',
        headers: {
          'X-Token': token,
          'Accept': 'application/json'
        }
      })
      const plansData = await plansRes.json()
      return new Response(JSON.stringify({ status: true, data: plansData.data?.content || plansData.data || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })

    } else if (action === 'details') {
      if (!iccid) {
        throw new Error('Missing iccid parameter')
      }
      const detailsRes = await fetch(`${baseUrl}/api/esim/euicc/${iccid}`, {
        method: 'GET',
        headers: {
          'X-Token': token,
          'Accept': 'application/json'
        }
      })
      const detailsData = await detailsRes.json()
      return new Response(JSON.stringify({ status: true, data: detailsData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })

    } else if (action === 'qrcode') {
      if (!iccid) {
        throw new Error('Missing iccid parameter')
      }
      const qrRes = await fetch(`${baseUrl}/api/esim/activate/${iccid}/qr/code`, {
        method: 'GET',
        headers: {
          'X-Token': token,
          'Accept': 'application/json'
        }
      })
      const qrData = await qrRes.json()
      return new Response(JSON.stringify({ status: true, data: qrData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })

    } else {
      throw new Error(`Unsupported eSIM gateway action: ${action}`)
    }

  } catch (error) {
    return new Response(JSON.stringify({ status: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // keep 200 to allow graceful client-side handling
    })
  }
})
