import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Key, Eye, EyeOff, Copy, Check, RefreshCw, Code, Server, ShieldCheck, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const DeveloperApi = () => {
  const { profile, regenerateApiKey, isAdmin, isAuthLoading } = useContext(AppContext);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Safeguard role access: navigate away if loading finishes and user is not an administrator
  useEffect(() => {
    if (!isAuthLoading && !isAdmin) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAdmin, isAuthLoading, navigate]);

  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState({});

  if (isAuthLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#f0f0f1' }}>
        <div className="spinner-loader" style={{ width: '40px', height: '40px', borderTopColor: 'var(--color-turquoise)' }}></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  // Accordion open states
  const [expandedEndpoints, setExpandedEndpoints] = useState({
    profile: true,
    smsBuy: false,
    smsCheck: false,
    smmAdd: false,
    smmStatus: false,
  });

  // Code snippet language tabs (endpoint -> language)
  const [activeTabs, setActiveTabs] = useState({
    profile: 'curl',
    smsBuy: 'curl',
    smsCheck: 'curl',
    smmAdd: 'curl',
    smmStatus: 'curl',
  });

  const apiKey = profile?.api_key || 'dz_live_not_generated_yet';

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    const res = await regenerateApiKey();
    setIsRegenerating(false);
    setShowRegenConfirm(false);
  };

  const toggleEndpoint = (key) => {
    setExpandedEndpoints(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleTabChange = (endpoint, lang) => {
    setActiveTabs(prev => ({
      ...prev,
      [endpoint]: lang
    }));
  };

  const copyCodeToClipboard = (endpoint, codeText) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodes(prev => ({ ...prev, [endpoint]: true }));
    setTimeout(() => {
      setCopiedCodes(prev => ({ ...prev, [endpoint]: false }));
    }, 2000);
  };

  const baseUrl = 'https://hpkpkkjmfpnbklpctyiy.supabase.co/functions/v1';

  // Endpoint Details configurations
  const endpoints = {
    profile: {
      key: 'profile',
      method: 'GET',
      path: '/profile',
      description: 'Retrieve user profile details, including the current wallet balance.',
      params: [],
      codes: {
        curl: `curl -X GET "${baseUrl}/profile" \\\n  -H "Authorization: Bearer ${apiKey}"`,
        python: `import requests\n\nurl = "${baseUrl}/profile"\nheaders = {\n    "Authorization": "Bearer ${apiKey}"\n}\n\nresponse = requests.get(url, headers=headers)\nprint(response.json())`,
        nodejs: `fetch("${baseUrl}/profile", {\n  method: "GET",\n  headers: {\n    "Authorization": "Bearer ${apiKey}"\n  }\n})\n.then(res => res.json())\n.then(console.log);`
      },
      responseSuccess: `{
  "success": true,
  "data": {
    "id": "e0e84bfa-8cae-4f51-a957-c81b95ffc0fb",
    "full_name": "John Doe",
    "username": "johndoe",
    "email": "johndoe@example.com",
    "phone": "08012345678",
    "wallet_balance": 2500.00
  }
}`,
      responseError: `{
  "success": false,
  "error": "Invalid API key"
}`
    },
    smsBuy: {
      key: 'smsBuy',
      method: 'POST',
      path: '/sms-gateway',
      description: 'Order a temporary mobile phone number to receive OTP verification codes.',
      params: [
        { name: 'action', type: 'string (required)', desc: 'Must be set to "buy"' },
        { name: 'country', type: 'string (required)', desc: 'The country code (e.g. "usa", "england", "nigeria", "canada", etc.)' },
        { name: 'service', type: 'string (required)', desc: 'The service key (e.g. "whatsapp", "telegram", "google", "openai")' }
      ],
      codes: {
        curl: `curl -X POST "${baseUrl}/sms-gateway" \\\n  -H "Authorization: Bearer ${apiKey}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"action": "buy", "country": "usa", "service": "whatsapp"}'`,
        python: `import requests\n\nurl = "${baseUrl}/sms-gateway"\nheaders = {\n    "Authorization": "Bearer ${apiKey}",\n    "Content-Type": "application/json"\n}\npayload = {\n    "action": "buy",\n    "country": "usa",\n    "service": "whatsapp"\n}\n\nresponse = requests.post(url, headers=headers, json=payload)\nprint(response.json())`,
        nodejs: `fetch("${baseUrl}/sms-gateway", {\n  method: "POST",\n  headers: {\n    "Authorization": "Bearer ${apiKey}",\n    "Content-Type": "application/json"\n  },\n  body: JSON.stringify({\n    action: "buy",\n    country: "usa",\n    service: "whatsapp"\n  })\n})\n.then(res => res.json())\n.then(console.log);`
      },
      responseSuccess: `{
  "status": true,
  "data": {
    "id": 98765432,
    "phone": "13215550199",
    "operator": "tmobile",
    "product": "whatsapp",
    "price": 800
  }
}`,
      responseError: `{
  "status": false,
  "error": "Insufficient wallet balance"
}`
    },
    smsCheck: {
      key: 'smsCheck',
      method: 'POST',
      path: '/sms-gateway',
      description: 'Check the status of a requested temporary OTP order and retrieve the SMS code once received.',
      params: [
        { name: 'action', type: 'string (required)', desc: 'Must be set to "check"' },
        { name: 'orderId', type: 'number (required)', desc: 'The order ID returned from the number purchase request' }
      ],
      codes: {
        curl: `curl -X POST "${baseUrl}/sms-gateway" \\\n  -H "Authorization: Bearer ${apiKey}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"action": "check", "orderId": 98765432}'`,
        python: `import requests\n\nurl = "${baseUrl}/sms-gateway"\nheaders = {\n    "Authorization": "Bearer ${apiKey}",\n    "Content-Type": "application/json"\n}\npayload = {\n    "action": "check",\n    "orderId": 98765432\n}\n\nresponse = requests.post(url, headers=headers, json=payload)\nprint(response.json())`,
        nodejs: `fetch("${baseUrl}/sms-gateway", {\n  method: "POST",\n  headers: {\n    "Authorization": "Bearer ${apiKey}",\n    "Content-Type": "application/json"\n  },\n  body: JSON.stringify({\n    action: "check",\n    orderId: 98765432\n  })\n})\n.then(res => res.json())\n.then(console.log);`
      },
      responseSuccess: `{
  "status": true,
  "data": {
    "id": 98765432,
    "status": "completed",
    "sms": [
      {
        "created_at": "2026-06-26T03:22:15Z",
        "date": "2026-06-26 03:22:15",
        "sender": "WhatsApp",
        "text": "Your WhatsApp verification code is: 123-456",
        "code": "123456"
      }
    ]
  }
}`,
      responseError: `{
  "status": false,
  "error": "Order ID not found or expired"
}`
    },
    smmAdd: {
      key: 'smmAdd',
      method: 'POST',
      path: '/smm-gateway',
      description: 'Order SMM social media boosts (followers, likes, views) for TikTok, Instagram, Telegram, and YouTube.',
      params: [
        { name: 'action', type: 'string (required)', desc: 'Must be set to "add"' },
        { name: 'service', type: 'number (required)', desc: 'The unique SMM service API identification code (e.g. 6453 for Instagram Followers)' },
        { name: 'link', type: 'string (required)', desc: 'The URL link to the target social media profile or post (e.g. "https://instagram.com/profile")' },
        { name: 'quantity', type: 'number (required)', desc: 'Amount of engagements to dispatch (must satisfy min/max constraints of the service)' }
      ],
      codes: {
        curl: `curl -X POST "${baseUrl}/smm-gateway" \\\n  -H "Authorization: Bearer ${apiKey}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"action": "add", "service": 6453, "link": "https://instagram.com/myprofile", "quantity": 1000}'`,
        python: `import requests\n\nurl = "${baseUrl}/smm-gateway"\nheaders = {\n    "Authorization": "Bearer ${apiKey}",\n    "Content-Type": "application/json"\n}\npayload = {\n    "action": "add",\n    "service": 6453,\n    "link": "https://instagram.com/myprofile",\n    "quantity": 1000\n}\n\nresponse = requests.post(url, headers=headers, json=payload)\nprint(response.json())`,
        nodejs: `fetch("${baseUrl}/smm-gateway", {\n  method: "POST",\n  headers: {\n    "Authorization": "Bearer ${apiKey}",\n    "Content-Type": "application/json"\n  },\n  body: JSON.stringify({\n    action: "add",\n    service: 6453,\n    link: "https://instagram.com/myprofile",\n    quantity: 1000\n  })\n})\n.then(res => res.json())\n.then(console.log);`
      },
      responseSuccess: `{
  "status": true,
  "data": {
    "order": 453120
  }
}`,
      responseError: `{
  "status": false,
  "error": "Minimum order quantity is 100"
}`
    },
    smmStatus: {
      key: 'smmStatus',
      method: 'POST',
      path: '/smm-gateway',
      description: 'Check status of an SMM panel campaign order to track fulfillment and count delivery.',
      params: [
        { name: 'action', type: 'string (required)', desc: 'Must be set to "status"' },
        { name: 'order', type: 'number (required)', desc: 'The SMM transaction order code returned when deploying the campaign' }
      ],
      codes: {
        curl: `curl -X POST "${baseUrl}/smm-gateway" \\\n  -H "Authorization: Bearer ${apiKey}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"action": "status", "order": 453120}'`,
        python: `import requests\n\nurl = "${baseUrl}/smm-gateway"\nheaders = {\n    "Authorization": "Bearer ${apiKey}",\n    "Content-Type": "application/json"\n}\npayload = {\n    "action": "status",\n    "order": 453120\n}\n\nresponse = requests.post(url, headers=headers, json=payload)\nprint(response.json())`,
        nodejs: `fetch("${baseUrl}/smm-gateway", {\n  method: "POST",\n  headers: {\n    "Authorization": "Bearer ${apiKey}",\n    "Content-Type": "application/json"\n  },\n  body: JSON.stringify({\n    action: "status",\n    order: 453120\n  })\n})\n.then(res => res.json())\n.then(console.log);`
      },
      responseSuccess: `{
  "status": true,
  "data": {
    "charge": "2.40",
    "start_count": "1050",
    "status": "In Progress",
    "remains": "300",
    "currency": "USD"
  }
}`,
      responseError: `{
  "status": false,
  "error": "Order not found"
}`
    }
  };

  const getMethodColor = (method) => {
    return method === 'GET' ? 'var(--color-green)' : 'var(--color-turquoise)';
  };

  return (
    <div className="animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : 24 }}>
      
      {/* ── HEADER CARD ── */}
      <div className="glass-panel" style={{
        background: 'linear-gradient(135deg, rgba(127,0,255,0.08) 0%, rgba(0,242,254,0.06) 100%)',
        border: '1px solid rgba(0,242,254,0.12)',
        padding: isMobile ? '20px 16px' : '28px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'rgba(0,242,254,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-turquoise)', border: '1px solid rgba(0,242,254,0.2)'
          }}>
            <Code size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: isMobile ? 18 : 22, margin: '0 0 4px', fontWeight: 800 }}>Developer API Portal</h2>
            <p style={{ margin: 0, fontSize: isMobile ? 12 : 13, color: 'var(--text-secondary)' }}>
              Integrate StarLog Plus automated services directly into your own reseller portals and applications.
            </p>
          </div>
        </div>
      </div>

      {/* ── API KEY & GLOBAL INFO ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', gap: isMobile ? 16 : 24 }}>
        
        {/* Credentials Manager Card */}
        <div className="glass-panel" style={{ padding: isMobile ? 16 : 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Key size={16} className="text-violet" />
            <h4 style={{ fontSize: 14, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
              Your Access Credentials
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>API Secret Key</label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border-color)',
              borderRadius: 10,
              padding: '10px 14px',
              gap: 12
            }}>
              <div style={{
                flex: 1,
                fontFamily: 'monospace',
                fontSize: isMobile ? 12 : 13,
                color: showKey ? 'var(--text-primary)' : 'var(--text-muted)',
                letterSpacing: showKey ? 'normal' : '0.25em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {showKey ? apiKey : 'dz_live_' + '•'.repeat(24)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  onClick={() => setShowKey(!showKey)}
                  style={{
                    background: 'none', border: 'none', color: 'var(--text-secondary)',
                    cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex', alignItems: 'center'
                  }}
                  title={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={handleCopyKey}
                  style={{
                    background: 'none', border: 'none', color: copiedKey ? 'var(--color-green)' : 'var(--text-secondary)',
                    cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex', alignItems: 'center'
                  }}
                  title="Copy to clipboard"
                >
                  {copiedKey ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Regenerate Action */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            {!showRegenConfirm ? (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowRegenConfirm(true)}
                style={{
                  alignSelf: 'flex-start',
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  borderRadius: 8,
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={12} />
                Regenerate API Key
              </button>
            ) : (
              <div style={{
                background: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 10,
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}>
                <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>
                  Are you absolutely sure?
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  This will immediately invalidate your current API key. Any active integrations using it will start failing.
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    style={{
                      background: 'var(--color-red, #ef4444)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 6,
                      padding: '4px 10px',
                      fontSize: 11,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    {isRegenerating ? <RefreshCw size={10} className="animate-spin" /> : null}
                    Yes, Regenerate
                  </button>
                  <button
                    onClick={() => setShowRegenConfirm(false)}
                    style={{
                      background: 'none',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      borderRadius: 6,
                      padding: '4px 10px',
                      fontSize: 11,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Global Connection details */}
        <div className="glass-panel" style={{ padding: isMobile ? 16 : 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Server size={16} className="text-turquoise" />
            <h4 style={{ fontSize: 14, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
              Connection Reference
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 2 }}>Base Endpoints URL</div>
              <div style={{
                fontFamily: 'monospace', fontSize: 12, padding: '8px 12px',
                background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)',
                borderRadius: 8, color: 'var(--color-turquoise)', wordBreak: 'break-all'
              }}>
                {baseUrl}
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 2 }}>Headers Structure</div>
              <div style={{
                fontFamily: 'monospace', fontSize: 12, padding: '8px 12px',
                background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)',
                borderRadius: 8, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4
              }}>
                <div>Content-Type: application/json</div>
                <div>Authorization: Bearer &lt;your_api_key&gt;</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── INTERACTIVE DOCUMENTATION ACCORDION ── */}
      <div>
        <h3 style={{ fontSize: 16, margin: '8px 0 16px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldCheck size={18} className="text-green" />
          API Endpoint Reference
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Object.values(endpoints).map((ep) => {
            const isOpen = expandedEndpoints[ep.key];
            const activeTab = activeTabs[ep.key];
            const codeToCopy = ep.codes[activeTab];

            return (
              <div key={ep.key} className="glass-panel" style={{
                padding: 0,
                overflow: 'hidden',
                border: isOpen ? '1px solid rgba(0,242,254,0.2)' : '1px solid var(--border-color)',
                transition: 'all 0.2s ease-in-out',
                background: isOpen ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.01)'
              }}>
                {/* Header/Toggler */}
                <div
                  onClick={() => toggleEndpoint(ep.key)}
                  style={{
                    padding: isMobile ? '12px 14px' : '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none',
                    background: 'rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: 'rgba(255,255,255,0.08)',
                      color: getMethodColor(ep.method),
                      border: `1px solid ${getMethodColor(ep.method)}`
                    }}>
                      {ep.method}
                    </span>
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 700,
                      color: 'var(--text-primary)'
                    }}>
                      {ep.path}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
                    <span style={{ fontSize: 12, display: isMobile ? 'none' : 'inline' }}>
                      {ep.key.startsWith('sms') ? 'SMS Verification' : ep.key.startsWith('smm') ? 'SMM Campaign' : 'Wallet Profile'}
                    </span>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* Expanded Content */}
                {isOpen && (
                  <div style={{ padding: isMobile ? 14 : 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                      {ep.description}
                    </p>

                    {/* Query/Body Parameters table */}
                    {ep.params.length > 0 && (
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Request Parameters
                        </div>
                        <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: 8 }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                            <thead>
                              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Parameter</th>
                                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Type</th>
                                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Description</th>
                              </tr>
                            </thead>
                            <tbody>
                              {ep.params.map((p) => (
                                <tr key={p.name} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-turquoise)' }}>{p.name}</td>
                                  <td style={{ padding: '8px 12px', color: 'var(--text-muted)', fontSize: 11 }}>{p.type}</td>
                                  <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{p.desc}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Code Snippet & Tab Selector */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Code Sample
                        </div>
                        <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.2)', padding: 3, borderRadius: 8 }}>
                          {['curl', 'python', 'nodejs'].map((lang) => (
                            <button
                              key={lang}
                              onClick={() => handleTabChange(ep.key, lang)}
                              style={{
                                background: activeTab === lang ? 'rgba(255,255,255,0.1)' : 'none',
                                border: 'none',
                                color: activeTab === lang ? 'var(--color-turquoise)' : 'var(--text-muted)',
                                padding: '3px 8px',
                                borderRadius: 6,
                                cursor: 'pointer',
                                fontSize: 11,
                                fontWeight: 600,
                                textTransform: 'capitalize'
                              }}
                            >
                              {lang === 'nodejs' ? 'Node.js' : lang}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Snippet Block */}
                      <div style={{ position: 'relative' }}>
                        <pre style={{
                          margin: 0,
                          padding: '12px 14px',
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 8,
                          overflowX: 'auto',
                          fontSize: 12,
                          fontFamily: 'monospace',
                          color: '#e5e7eb',
                          lineHeight: 1.5,
                          whiteSpace: 'pre'
                        }}>
                          <code>{codeToCopy}</code>
                        </pre>
                        <button
                          onClick={() => copyCodeToClipboard(ep.key, codeToCopy)}
                          style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid var(--border-color)',
                            color: copiedCodes[ep.key] ? 'var(--color-green)' : 'var(--text-secondary)',
                            padding: 6,
                            borderRadius: 6,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                          title="Copy Code"
                        >
                          {copiedCodes[ep.key] ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* Payloads Section (Side-by-side or stacked on mobile) */}
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-green)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                          Success Response
                        </div>
                        <pre style={{
                          margin: 0,
                          padding: '10px 12px',
                          background: 'rgba(0,180,100,0.03)',
                          border: '1px solid rgba(0,180,100,0.15)',
                          borderRadius: 8,
                          overflowX: 'auto',
                          fontSize: 11,
                          fontFamily: 'monospace',
                          color: '#10b981',
                          maxHeight: 200,
                          lineHeight: 1.4
                        }}>
                          <code>{ep.responseSuccess}</code>
                        </pre>
                      </div>

                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-red, #ef4444)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                          Error Response
                        </div>
                        <pre style={{
                          margin: 0,
                          padding: '10px 12px',
                          background: 'rgba(239,68,68,0.03)',
                          border: '1px solid rgba(239,68,68,0.15)',
                          borderRadius: 8,
                          overflowX: 'auto',
                          fontSize: 11,
                          fontFamily: 'monospace',
                          color: '#f87171',
                          maxHeight: 200,
                          lineHeight: 1.4
                        }}>
                          <code>{ep.responseError}</code>
                        </pre>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default DeveloperApi;
