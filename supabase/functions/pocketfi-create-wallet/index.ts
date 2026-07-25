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
    const bank = requestBody.bank || 'paga'

    // Retrieve full profile details to populate customer info for PocketFi
    const supabaseAdmin = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      throw new Error('Profile details not found in database')
    }

    const email = user.email || 'customer@discountzar.ng'
    
    // Normalize phone number to exactly 11 digits (e.g. 08012345678)
    let phone = (profile.phone || '').replace(/\D/g, '')
    if (phone.startsWith('234') && phone.length === 13) {
      phone = '0' + phone.substring(3)
    }
    if (phone.length === 10 && !phone.startsWith('0')) {
      phone = '0' + phone
    }
    if (phone.length !== 11) {
      phone = '08000000000'
    }

    const fullName = profile.full_name || 'Valued Customer'
    const names = fullName.trim().split(' ')
    const firstName = names[0] || 'Customer'
    const lastName = names.slice(1).join(' ') || 'User'

    const pocketFiPublicKey = Deno.env.get('POCKETFI_PUBLIC_KEY') || '34910|Ji5GKNF7XwPgdpDRRJT5o7qzVQMKjPn7GvpGiqG1aa500c6a'
    const pocketFiBusinessId = Deno.env.get('POCKETFI_BUSINESS_ID') || '30266'

    // Call PocketFi virtual account generation endpoint
    const response = await fetch('https://api.pocketfi.ng/api/v1/virtual-accounts/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pocketFiPublicKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        email: email,
        businessId: pocketFiBusinessId,
        bank: bank
      })
    })

    let result: any = {}
    try {
      const text = await response.text()
      result = JSON.parse(text)
    } catch {
      throw new Error("This bank partner is temporarily unavailable on PocketFi. Please try selecting another bank (e.g., Paga Bank or Kuda Bank).")
    }

    if (!response.ok || !result.status) {
      const errorMsg = result.message || 'Failed to create virtual wallet with PocketFi'
      if (errorMsg.toLowerCase().includes('unable to process') || errorMsg.toLowerCase().includes('not supported') || errorMsg.toLowerCase().includes('invalid bank')) {
        throw new Error("This bank partner is temporarily unavailable on PocketFi. Please try selecting another bank (e.g., Paga Bank or Kuda Bank).")
      }
      throw new Error(errorMsg)
    }

    const bankObj = result.banks[0]
    if (!bankObj) {
      throw new Error('No banking credentials returned by PocketFi')
    }

    // Save to virtual_wallets table in Supabase
    // To bypass potential missing unique constraint issues on user_id,
    // we query first and then insert or update.
    const { data: existingWallet } = await supabaseAdmin
      .from('virtual_wallets')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    let savedWallet, saveError;
    if (existingWallet) {
      const res = await supabaseAdmin
        .from('virtual_wallets')
        .update({
          bank_name: bankObj.bankName,
          account_number: bankObj.accountNumber,
          account_name: `${bankObj.accountName} - ZAR (Pocketfi)`,
          business_id: String(result.businessId)
        })
        .eq('user_id', user.id)
        .select()
        .single()
      savedWallet = res.data
      saveError = res.error
    } else {
      const res = await supabaseAdmin
        .from('virtual_wallets')
        .insert({
          user_id: user.id,
          bank_name: bankObj.bankName,
          account_number: bankObj.accountNumber,
          account_name: `${bankObj.accountName} - ZAR (Pocketfi)`,
          business_id: String(result.businessId)
        })
        .select()
        .single()
      savedWallet = res.data
      saveError = res.error
    }

    if (saveError) {
      throw new Error('Failed to record virtual wallet in database: ' + saveError.message)
    }

    return new Response(JSON.stringify({ status: true, wallet: savedWallet }), {
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
