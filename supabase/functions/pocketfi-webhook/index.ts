import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Helper function to recursively find any 10-digit bank account number in the JSON body
function findAccountNumber(obj: any): string | null {
  if (typeof obj === 'string') {
    if (/^\d{10}$/.test(obj)) return obj;
  } else if (typeof obj === 'number') {
    const s = String(obj);
    if (/^\d{10}$/.test(s)) return s;
  } else if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      const result = findAccountNumber(obj[key]);
      if (result) return result;
    }
  }
  return null;
}

// Helper function to recursively find any email address in the JSON body
function findEmail(obj: any): string | null {
  if (typeof obj === 'string') {
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(obj)) return obj;
  } else if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      const result = findEmail(obj[key]);
      if (result) return result;
    }
  }
  return null;
}

serve(async (req) => {
  try {
    // 1. Signature Verification
    // Retrieve headers
    const signature = req.headers.get('http_pocketfi_signature') || 
                      req.headers.get('x-pocketfi-signature') ||
                      req.headers.get('pocketfi-signature') ||
                      req.headers.get('HTTP_POCKETFI_SIGNATURE') || 
                      req.headers.get('x-signature-512') ||
                      req.headers.get('signature');

    if (!signature) {
      const allHeaders = Object.fromEntries(req.headers.entries());
      console.error("Missing PocketFi signature header. Received headers:", allHeaders);
      return new Response(JSON.stringify({ 
        error: 'Missing PocketFi signature header',
        received_headers: allHeaders 
      }), { status: 401 })
    }

    const secret = Deno.env.get('POCKETFI_SECRET_KEY') || '490d286bfc3611eaa3a8c709b702158e60139067e38c96d1b9850a71439e0eea'
    const rawBody = await req.text()

    const encoder = new TextEncoder()
    const keyData = encoder.encode(secret)
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign']
    )

    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      encoder.encode(rawBody)
    )

    const hashArray = Array.from(new Uint8Array(signatureBuffer))
    const calculatedSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    if (signature !== calculatedSignature) {
      return new Response(JSON.stringify({ error: 'Invalid HMAC signature' }), { status: 400 })
    }

    // 2. Parse Webhook Data
    const data = JSON.parse(rawBody)
    
    // Extract transaction details
    const pocketfiRef = data.transaction?.reference || 
                        data.reference || 
                        `dep-${Math.floor(Math.random() * 100000000)}`;
                        
    // Deterministic short ID generation to ensure idempotency while displaying clean short receipts
    let ref = "";
    if (pocketfiRef.startsWith("dep-")) {
      ref = pocketfiRef;
    } else {
      let hash = 0;
      for (let i = 0; i < pocketfiRef.length; i++) {
        hash = (hash << 5) - hash + pocketfiRef.charCodeAt(i);
        hash |= 0;
      }
      const hex = Math.abs(hash).toString(16).padEnd(8, "0").substring(0, 8);
      ref = `tx-${hex}`;
    }
                
    const amount = Number(data.order?.amount || 
                          data.transaction?.amount || 
                          data.amount || 
                          0);

    if (amount <= 0) {
      return new Response(JSON.stringify({ status: 'ignored', message: 'Zero or invalid amount' }), { status: 200 })
    }

    // Initialize Supabase Admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // 3. Identify User
    let userId: string | null = null;
    let lookupMethod = '';

    // A. Check for bank account number in the payload
    const accountNumber = findAccountNumber(data);
    if (accountNumber) {
      const { data: wallet } = await supabaseAdmin
        .from('virtual_wallets')
        .select('user_id')
        .eq('account_number', accountNumber)
        .maybeSingle()

      if (wallet) {
        userId = wallet.user_id;
        lookupMethod = `virtual wallet: ${accountNumber}`;
      }
    }

    // B. Check for email in the payload
    if (!userId) {
      const email = findEmail(data);
      if (email) {
        // Query auth.users via admin
        const { data: authData } = await supabaseAdmin.auth.admin.listUsers()
        const user = authData?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase())
        if (user) {
          userId = user.id;
          lookupMethod = `user email: ${email}`;
        }
      }
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Could not associate payment with any user profile' }), { status: 404 })
    }

    // 4. Safely credit balance and log transaction using our PostgreSQL RPC
    const { data: success, error: rpcError } = await supabaseAdmin.rpc('process_deposit', {
      p_tx_id: ref,
      p_user_id: userId,
      p_amount: amount,
      p_method: 'PocketFi Bank Transfer'
    })

    if (rpcError) {
      throw new Error('Database transaction failed: ' + rpcError.message)
    }

    if (!success) {
      return new Response(JSON.stringify({ status: 'ignored', message: 'Transaction already processed' }), { status: 200 })
    }

    return new Response(JSON.stringify({ 
      status: 'success', 
      message: 'Account credited successfully',
      userId,
      amount,
      reference: ref,
      lookupMethod
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ status: 'error', error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
