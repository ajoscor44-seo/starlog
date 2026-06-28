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
    const apiKey = Deno.env.get('TEXTVERIFIED_API_KEY') ?? '';
    const username = Deno.env.get('TEXTVERIFIED_USERNAME') ?? '';

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

    throw new Error(`Unsupported action: ${action}`)

  } catch (error) {
    return new Response(JSON.stringify({ status: false, error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
