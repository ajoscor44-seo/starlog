import { serve } from "https://cdn.jsdelivr.net/gh/denoland/deno_std@v0.177.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

async function getBearerToken(apiKey: string, username: string): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt - 60000) {
    return cachedToken;
  }

  const res = await fetch("https://www.textverified.com/api/pub/v2/auth", {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "X-API-USERNAME": username,
      "Content-Type": "application/json"
    }
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Failed to authenticate with Textverified: ${res.statusText}. ${errText}`);
  }

  const data = await res.json();
  cachedToken = data.token;
  tokenExpiresAt = new Date(data.expiresAt).getTime();
  return cachedToken;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('TEXTVERIFIED_API_KEY') ?? 'GnMunP3FeemUbAFxLrft3Qw6r4NLjlqcXDnoWQt2DAiD4j1W2e4kD3TgJGITmH';
    const username = Deno.env.get('TEXTVERIFIED_USERNAME') ?? 'ademartins077@gmail.com';

    if (!apiKey || !username) {
      throw new Error('Missing TEXTVERIFIED_API_KEY or TEXTVERIFIED_USERNAME environment variables');
    }

    const token = await getBearerToken(apiKey, username);

    const requestBody = await req.json().catch(() => ({}))
    const { action } = requestBody

    if (!action) {
      throw new Error('Missing action parameter')
    }

    if (action === 'get_services') {
      const res = await fetch("https://www.textverified.com/api/pub/v2/services?numberType=mobile&reservationType=verification", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch services: ${res.statusText}`);
      }
      const data = await res.json();
      return new Response(JSON.stringify({ status: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'get_price') {
      const { serviceName } = requestBody;
      if (!serviceName) throw new Error('Missing serviceName parameter');

      const res = await fetch("https://www.textverified.com/api/pub/v2/pricing/verifications", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          serviceName,
          areaCode: false,
          carrier: false,
          numberType: "mobile",
          capability: "sms"
        })
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`Failed to fetch price for ${serviceName}: ${res.statusText}. ${errText}`);
      }
      const data = await res.json();
      return new Response(JSON.stringify({ status: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'buy') {
      const { serviceName } = requestBody;
      if (!serviceName) throw new Error('Missing serviceName parameter');

      // Create Verification
      const createRes = await fetch("https://www.textverified.com/api/pub/v2/verifications", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          serviceName,
          capability: "sms"
        })
      });

      if (!createRes.ok) {
        const errText = await createRes.text().catch(() => "");
        throw new Error(`Failed to order number for ${serviceName}: ${createRes.statusText}. ${errText}`);
      }

      const createData = await createRes.json();
      const verificationId = createData.href ? createData.href.split('/').pop() : '';

      if (!verificationId) {
        throw new Error('Failed to extract verification ID from Textverified response');
      }

      // Retrieve full details (including number)
      const detailRes = await fetch(`https://www.textverified.com/api/pub/v2/verifications/${verificationId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!detailRes.ok) {
        throw new Error(`Failed to fetch verification details: ${detailRes.statusText}`);
      }

      const detailData = await detailRes.json();
      return new Response(JSON.stringify({ status: true, data: detailData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'check') {
      const { id } = requestBody;
      if (!id) throw new Error('Missing id parameter');

      // 1. Fetch SMS
      const smsRes = await fetch(`https://www.textverified.com/api/pub/v2/sms?reservationId=${id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!smsRes.ok) {
        throw new Error(`Failed to check SMS: ${smsRes.statusText}`);
      }

      const smsData = await smsRes.json();
      if (smsData.data && smsData.data.length > 0) {
        const firstSms = smsData.data[0];
        return new Response(JSON.stringify({
          status: true,
          data: {
            status: 'COMPLETED',
            smsText: firstSms.smsContent,
            otpCode: firstSms.parsedCode || null
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 2. No SMS yet. Check status of verification
      const detailRes = await fetch(`https://www.textverified.com/api/pub/v2/verifications/${id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!detailRes.ok) {
        throw new Error(`Failed to fetch verification details: ${detailRes.statusText}`);
      }

      const detailData = await detailRes.json();
      const state = detailData.state; // e.g. verificationPending, verificationCompleted, verificationCanceled, verificationTimedOut

      if (['verificationCanceled', 'verificationTimedOut', 'verificationRefunded'].includes(state)) {
        return new Response(JSON.stringify({
          status: true,
          data: {
            status: 'FAILED',
            smsText: null,
            otpCode: null
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({
        status: true,
        data: {
          status: 'PENDING',
          smsText: null,
          otpCode: null
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'cancel') {
      const { id } = requestBody;
      if (!id) throw new Error('Missing id parameter');

      const res = await fetch(`https://www.textverified.com/api/pub/v2/verifications/${id}/cancel`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`Failed to cancel verification ${id}: ${res.statusText}. ${errText}`);
      }

      return new Response(JSON.stringify({ status: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'reuse') {
      const { id } = requestBody;
      if (!id) throw new Error('Missing id parameter');

      // Attempt to reactivate/reuse the verification ID
      // First, try reactivating (most common if window expired)
      let reuseRes = await fetch(`https://www.textverified.com/api/pub/v2/verifications/${id}/reactivate`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      // If reactivate fails (e.g. status 409 or 400 because it is still within the reuse window), try reuse
      if (!reuseRes.ok) {
        const reactivateErr = await reuseRes.text().catch(() => "");
        console.log(`Reactivate failed: ${reactivateErr}. Trying reuse endpoint...`);
        
        reuseRes = await fetch(`https://www.textverified.com/api/pub/v2/verifications/${id}/reuse`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
      }

      if (!reuseRes.ok) {
        const errText = await reuseRes.text().catch(() => "");
        throw new Error(`Failed to reuse/reactivate number: ${reuseRes.statusText}. ${errText}`);
      }

      // If the reuse/reactivate was successful, retrieve the new verification details
      const reuseData = await reuseRes.json().catch(() => ({}));
      
      let newVerificationId = reuseData.id || (reuseData.href ? reuseData.href.split('/').pop() : '');
      if (!newVerificationId) {
        // Check Location header as fallback
        const loc = reuseRes.headers.get('Location');
        if (loc) {
          newVerificationId = loc.split('/').pop();
        }
      }

      if (!newVerificationId) {
        newVerificationId = id;
      }

      // Retrieve full details of the newly created reuse session
      const detailRes = await fetch(`https://www.textverified.com/api/pub/v2/verifications/${newVerificationId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!detailRes.ok) {
        throw new Error(`Failed to fetch reused verification details: ${detailRes.statusText}`);
      }

      const detailData = await detailRes.json();
      return new Response(JSON.stringify({ status: true, data: detailData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    throw new Error(`Unsupported action: ${action}`)

  } catch (error) {
    return new Response(JSON.stringify({ status: false, error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
