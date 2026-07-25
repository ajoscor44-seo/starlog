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

    const apiKey = Deno.env.get('HEROSMS_API_KEY') || 'd5eA83A2cfcf6045cf1c2e40c79bf163'

    const requestBody = await req.json().catch(() => ({}))
    const { action } = requestBody

    if (!action) {
      throw new Error('Missing action parameter')
    }

    const BASE_URL = 'https://hero-sms.com/stubs/handler_api.php'
    let targetUrl = ''
    let isJson = false

    if (action === 'get_countries') {
      targetUrl = `${BASE_URL}?api_key=${apiKey}&action=getCountries`
      isJson = true
    } else if (action === 'get_prices') {
      const { country } = requestBody
      targetUrl = `${BASE_URL}?api_key=${apiKey}&action=getPrices`
      if (country) {
        targetUrl += `&country=${country}`
      }
      isJson = true
    } else if (action === 'buy') {
      const { country, service } = requestBody
      if (!country || !service) {
        throw new Error('Missing country or service for buy action')
      }
      targetUrl = `${BASE_URL}?api_key=${apiKey}&action=getNumber&service=${service}&country=${country}`
      isJson = false
    } else if (action === 'check') {
      const { id } = requestBody
      if (!id) {
        throw new Error('Missing id for check action')
      }
      targetUrl = `${BASE_URL}?api_key=${apiKey}&action=getStatus&id=${id}`
      isJson = false
    } else if (action === 'cancel') {
      const { id } = requestBody
      if (!id) {
        throw new Error('Missing id for cancel action')
      }
      targetUrl = `${BASE_URL}?api_key=${apiKey}&action=setStatus&status=8&id=${id}`
      isJson = false
    } else if (action === 'finish') {
      const { id } = requestBody
      if (!id) {
        throw new Error('Missing id for finish action')
      }
      targetUrl = `${BASE_URL}?api_key=${apiKey}&action=setStatus&status=6&id=${id}`
      isJson = false
    } else {
      throw new Error(`Unsupported action: ${action}`)
    }

    const response = await fetch(targetUrl)
    const responseText = await response.text()

    if (!response.ok) {
      throw new Error(`HeroSMS API responded with code: ${response.status}. Response: ${responseText}`)
    }

    // Process responses based on expectation
    if (isJson) {
      try {
        const data = JSON.parse(responseText)
        return new Response(JSON.stringify({ status: true, data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      } catch (err) {
        throw new Error(`Failed to parse HeroSMS JSON response. Raw: ${responseText}`)
      }
    } else {
      // Text protocol parsing
      if (action === 'buy') {
        // Expected format: ACCESS_NUMBER:$id:$number
        if (responseText.startsWith('ACCESS_NUMBER:')) {
          const parts = responseText.split(':')
          return new Response(JSON.stringify({
            status: true,
            data: {
              id: parts[1],
              number: parts[2]
            }
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          })
        } else {
          // It's an error message, e.g. NO_NUMBERS, NO_BALANCE
          return new Response(JSON.stringify({
            status: false,
            error: responseText
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          })
        }
      } else if (action === 'check') {
        // Expected format: STATUS_WAIT_CODE, STATUS_CANCEL, STATUS_OK:$code
        const parts = responseText.split(':')
        const statusType = parts[0]
        
        if (statusType === 'STATUS_OK') {
          return new Response(JSON.stringify({
            status: true,
            data: {
              status: 'COMPLETED',
              otpCode: parts[1],
              smsText: parts.slice(1).join(':') // in case full SMS was returned
            }
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          })
        } else if (statusType === 'STATUS_CANCEL') {
          return new Response(JSON.stringify({
            status: true,
            data: {
              status: 'FAILED'
            }
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          })
        } else {
          // Waiting for SMS
          return new Response(JSON.stringify({
            status: true,
            data: {
              status: 'PENDING',
              raw: responseText
            }
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          })
        }
      } else if (action === 'cancel' || action === 'finish') {
        // Expected response e.g. ACCESS_CANCEL or ACCESS_ACTIVATION
        if (responseText.includes('ACCESS_CANCEL') || responseText.includes('ACCESS_ACTIVATION')) {
          return new Response(JSON.stringify({
            status: true,
            data: {
              result: responseText
            }
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          })
        } else {
          return new Response(JSON.stringify({
            status: false,
            error: responseText
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          })
        }
      }
    }

    throw new Error('Fallback execution failure')

  } catch (error) {
    return new Response(JSON.stringify({ status: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }
})
