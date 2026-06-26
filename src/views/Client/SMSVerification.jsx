import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { supabase } from '../../lib/supabaseClient';
import { Key, Copy, Check, Clock, AlertTriangle, AlertCircle, RefreshCw, XCircle, Search } from 'lucide-react';

const serviceLogoMap = {
  'srv-whatsapp': (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <circle cx="12" cy="12" r="12" fill="#25D366"/>
      <path d="M12.012 5.5a6.5 6.5 0 0 0-5.65 9.75l-.83 3.03 3.1-.81a6.5 6.5 0 1 0 3.38-11.97Zm3.89 9.35c-.21.58-1.21 1.12-1.67 1.17-.46.05-.9-.13-2.91-.97-2.58-1.07-4.22-3.7-4.35-3.87-.13-.17-1.04-1.38-1.04-2.63 0-1.25.65-1.86.88-2.1.23-.25.5-.3.67-.3.17 0 .33.01.48.01.15 0 .35-.06.55.43.2.5.69 1.68.75 1.8.06.12.1.27.02.44-.08.17-.12.27-.25.42-.13.15-.27.33-.38.45-.13.12-.26.26-.11.51.15.25.66 1.09 1.41 1.76.97.86 1.78 1.13 2.03 1.25.25.13.4.1.55-.07.15-.17.65-.76.82-1.02.17-.26.34-.22.58-.13.23.09 1.5.71 1.76.84.26.13.43.2.49.3.06.1.06.58-.15 1.16Z" fill="#FFF"/>
    </svg>
  ),
  'srv-telegram': (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <circle cx="12" cy="12" r="12" fill="#0088cc"/>
      <path d="M17.5 7.82l-2.27 10.7a.84.84 0 0 1-1.24.58l-3.3-2.43-1.57 1.51a.42.42 0 0 1-.72-.3v-2.91l6.11-5.52c.27-.24-.06-.38-.42-.14L6.56 14.1l-3.08-.96a.54.54 0 0 1-.03-.97l13.1-5.05a.55.55 0 0 1 .75.7z" fill="#FFF"/>
    </svg>
  ),
  'srv-google': (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <circle cx="12" cy="12" r="12" fill="#fff" stroke="#eee" strokeWidth="0.5"/>
      <path d="M17.64 12.2c0-.63-.06-1.25-.16-1.84H12v3.49h3.17c-.14.72-.56 1.33-1.17 1.74v2.27h2.89c1.69-1.56 2.67-3.86 2.67-6.66Z" fill="#4285F4"/>
      <path d="M12 18c1.62 0 2.98-.54 3.97-1.46l-2.89-2.27c-.8.54-1.82.87-2.97.87-2.28 0-4.21-1.54-4.9-3.61H2.18v2.34C3.89 16.92 7.7 18 12 18Z" fill="#34A853"/>
      <path d="M7.1 11.53a3.61 3.61 0 0 1 0-2.3v-2.34H2.18a6.04 6.04 0 0 0 0 5.68l4.92-2.34c.18-.54.18-1.14 0-1.7Z" fill="#FBBC05"/>
      <path d="M12 6.75c.88 0 1.67.3 2.3.9l2.6-2.6A5.92 5.92 0 0 0 12 3.25C7.7 3.25 3.89 4.33 2.18 7.37l4.92 2.34C7.79 8.1 9.72 6.75 12 6.75Z" fill="#EA4335"/>
    </svg>
  ),
  'srv-openai': (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <circle cx="12" cy="12" r="12" fill="#10a37f"/>
      <path d="M17.13 10.3c.3-.5.47-1.1.47-1.74 0-1.84-1.5-3.34-3.34-3.34-.45 0-.87.09-1.25.26-.4-.69-1.13-1.16-1.98-1.16-1.04 0-1.92.7-2.2 1.67a3.3 3.3 0 0 0-2.18.52c-1.37.8-1.84 2.55-1.04 3.92.3.5.7.89 1.18 1.15-.3.51-.48 1.1-.48 1.74 0 1.84 1.5 3.34 3.34 3.34.45 0 .87-.09 1.25-.26.4.7 1.13 1.17 1.98 1.17 1.04 0 1.92-.7 2.2-1.68a3.3 3.3 0 0 0 2.18-.51c1.37-.8 1.84-2.55 1.04-3.92a3.34 3.34 0 0 0-1.18-1.16Zm-6.52 4.14-1.63-.94.7-1.2 1.62.93-.7 1.21Zm1.16-4.57.01-1.88 1.38.01v1.88h-1.39Zm2.54 1.27.7 1.21-1.63.94-.7-1.2 1.63-.95Zm.7-2.54 1.63.94-.7 1.2-1.63-.94.7-1.2Zm-1.87-.27.01-1.88 1.38.01v1.88h-1.39Zm-2.54 1.27-.7-1.21 1.63-.94.7 1.2-1.63.95Z" fill="#FFF"/>
    </svg>
  ),
  'srv-facebook': (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <circle cx="12" cy="12" r="12" fill="#1877F2"/>
      <path d="M14 12h-2v7H9.5v-7h-1.5V9.75h1.5v-1.5c0-1.86 1.1-2.88 2.8-2.88.8 0 1.5.06 1.7.08v2h-1.18c-.9 0-1.07.43-1.07 1.05v1.25H14L14 12z" fill="#FFF"/>
    </svg>
  ),
  'srv-instagram': (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <defs>
        <radialGradient id="ig-grad-otp" cx="20%" cy="100%" r="150%">
          <stop offset="0%" stopColor="#fdf497"/>
          <stop offset="5%" stopColor="#fdf497"/>
          <stop offset="45%" stopColor="#fd5949"/>
          <stop offset="60%" stopColor="#d6249f"/>
          <stop offset="90%" stopColor="#285AEB"/>
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="12" fill="url(#ig-grad-otp)"/>
      <path d="M12 7.7a4.3 4.3 0 1 0 4.3 4.3A4.3 4.3 0 0 0 12 7.7Zm0 7.14a2.84 2.84 0 1 1 2.84-2.84A2.84 2.84 0 0 1 12 14.84Zm4.7-6.9a1.02 1.02 0 1 1-1.02-1.02A1.02 1.02 0 0 1 16.7 7.94ZM12 5.5c2.11 0 2.36.01 3.2.05a4.37 4.37 0 0 1 1.47.27 2.62 2.62 0 0 1 1.5 1.5 4.37 4.37 0 0 1 .27 1.47c.04.83.05 1.08.05 3.2s-.01 2.36-.05 3.2a4.37 4.37 0 0 1-.27 1.47 2.62 2.62 0 0 1-1.5 1.5 4.37 4.37 0 0 1-1.47.27c-.83.04-1.08.05-3.2.05s-2.36-.01-3.2-.05a4.37 4.37 0 0 1-1.47-.27 2.62 2.62 0 0 1-1.5-1.5 4.37 4.37 0 0 1-.27-1.47c-.04-.83-.05-1.08-.05-3.2s.01-2.36.05-3.2a4.37 4.37 0 0 1 .27-1.47 2.62 2.62 0 0 1 1.5-1.5 4.37 4.37 0 0 1 1.47-.27c.83-.04 1.08-.05 3.2-.05Z" fill="#FFF"/>
    </svg>
  ),
  'srv-tiktok': (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <circle cx="12" cy="12" r="12" fill="#010101"/>
      <path d="M16.8 9.38a3.72 3.72 0 0 1-2.12-.68v4.86c0 2.31-1.87 4.2-4.18 4.2A4.19 4.19 0 0 1 6.3 13.56c0-2.31 1.88-4.2 4.19-4.2.24 0 .47.02.7.06v1.9c-.22-.05-.45-.08-.7-.08-1.27 0-2.3 1.03-2.3 2.3 0 1.28 1.03 2.3 2.3 2.3 1.28 0 2.3-1.03 2.3-2.3V5.5h1.9c.1 1.15.89 2.08 1.95 2.38v1.5Z" fill="#FFF"/>
    </svg>
  ),
  'srv-netflix': (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <circle cx="12" cy="12" r="12" fill="#000000"/>
      <path d="M8.5 5.5h2.1l2.9 8.2v-8.2h2v13h-2.1L10.5 10.3v8.2h-2v-13Z" fill="#E50914"/>
    </svg>
  )
};
const SMSVerification = () => {
  const { 
    countries, 
    otpServices, 
    activeOtps, 
    requestOtpNumber, 
    cancelOtp, 
    formatCost,
    activeSession,
    setActiveSession,
    reuseOtpNumber,
    fetchOtpServicesForCountry,
    smsPoolShortTermCountries,
    smsPoolShortTermServices,
    profitMarkup
  } = useContext(AppContext);
  const isMobile = useIsMobile();
  const [otpPage, setOtpPage] = useState(1);
  const OTP_PER_PAGE = 10;

  const [server, setServer] = useState('server1');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [searchCountry, setSearchCountry] = useState('');
  const [searchService, setSearchService] = useState('');
  
  const [isRequesting, setIsRequesting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRebuying, setIsRebuying] = useState(false);
  const [dynamicServices, setDynamicServices] = useState([]);
  const [smsPoolDynamicServices, setSmsPoolDynamicServices] = useState([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedText, setCopiedText] = useState('');
  const [step, setStep] = useState(1); // mobile wizard: 1=country, 2=service

  useEffect(() => {
    if (activeSession) {
      const updated = activeOtps.find(o => o.id === activeSession.id);
      if (updated) setActiveSession(updated);
    }
  }, [activeOtps, activeSession]);

  useEffect(() => {
    const loadServices = async () => {
      if (!selectedCountry) return;
      
      setIsLoadingServices(true);
      if (server === 'server1') {
        const res = await fetchOtpServicesForCountry(selectedCountry);
        if (res.success && res.services.length > 0) {
          setDynamicServices(res.services);
          setSelectedService(res.services[0].id);
        } else {
          setDynamicServices([]);
          setSelectedService(otpServices[0].id);
        }
      } else {
        // Server 2 (SMSPool) fetching prices for selected country
        try {
          const res = await supabase.functions.invoke('smspool-gateway', {
            body: { action: 'get_pricing', country: selectedCountry }
          });
          if (!res.error && res.data?.status) {
            // The API returns an array of prices, e.g. [{ service: 1012, price: "1.20" }, ...]
            // Some services might appear multiple times if they exist in multiple pools, so we take the cheapest or first.
            const pricingData = res.data.data || [];
            
            // Map the pricing to the smsPoolShortTermServices
            const merged = smsPoolShortTermServices.map(s => {
              const priceObj = pricingData.find(p => p.service === s.ID);
              const costUsd = priceObj ? parseFloat(priceObj.price) : 0;
              const NGN_RATE = 1500;
              const priceNgn = Math.round(costUsd * NGN_RATE * (1 + (profitMarkup.otp / 100)));
              
              return {
                ...s,
                priceNgn
              };
            });
            // We only keep services that have a price for this country
            const availableServices = merged.filter(s => s.priceNgn > 0);
            setSmsPoolDynamicServices(availableServices);
            if (availableServices.length > 0) {
              setSelectedService(availableServices[0].ID);
            } else {
              setSelectedService(null);
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
      setIsLoadingServices(false);
    };
    loadServices();
  }, [selectedCountry, server]);

  useEffect(() => {
    // Automatically select first country when switching servers
    if (server === 'server1') {
      setSelectedCountry(countries[0]?.id);
    } else {
      setSelectedCountry(smsPoolShortTermCountries[0]?.ID);
    }
  }, [server, countries, smsPoolShortTermCountries]);

  const activeCountriesList = server === 'server1' ? countries : smsPoolShortTermCountries;

  const filteredCountries = activeCountriesList.filter(c =>
    (c.name || '').toLowerCase().includes(searchCountry.toLowerCase())
  );

  const activeServicesList = server === 'server1' 
    ? (dynamicServices.length > 0 ? dynamicServices : otpServices) 
    : smsPoolDynamicServices;

  const filteredServices = activeServicesList.filter(s =>
    (s.name || '').toLowerCase().includes(searchService.toLowerCase())
  );

  const selectedCountryObj = server === 'server1' 
    ? activeCountriesList.find(c => c.id === selectedCountry) 
    : activeCountriesList.find(c => c.ID === selectedCountry);
    
  const selectedServiceObj = server === 'server1' 
    ? (activeServicesList.find(s => s.id === selectedService) || activeServicesList[0])
    : (activeServicesList.find(s => s.ID === selectedService) || activeServicesList[0]);

  const handleRequestNumber = async () => {
    if (!selectedCountry || !selectedService) {
      setErrorMsg('Please select a country and a target app before requesting.');
      return;
    }
    setErrorMsg('');
    setIsRequesting(true);
    const result = await requestOtpNumber(selectedCountry, selectedService, selectedServiceObj, server);
    setIsRequesting(false);
    if (result.success) setActiveSession(result.otp);
    else setErrorMsg(result.error || result.msg || 'Failed to request number');
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedText(key);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const handleCancel = async (otpId) => {
    setIsCancelling(true);
    const result = await cancelOtp(otpId);
    setIsCancelling(false);
    if (result.success) setActiveSession(null);
  };

  const handleRebuy = async (number, serviceName, countryName, flag) => {
    setErrorMsg('');
    setIsRebuying(true);
    const result = await reuseOtpNumber(number, serviceName, countryName, flag);
    setIsRebuying(false);
    if (!result.success) {
      setErrorMsg(result.msg);
    }
  };

  const getRemainingTimeText = (expiryTime) => {
    const rem = expiryTime - Date.now();
    if (rem <= 0) return 'Expired';
    const mins = Math.floor(rem / 60000);
    const secs = Math.floor((rem % 60000) / 1000);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  /* ── Active Session Panel (shared mobile/desktop) ── */
  const ActiveSessionPanel = () => (
    <div className="glass-panel pulse-glow-cyan" style={{ border: '1px solid rgba(0,242,254,0.3)', padding: isMobile ? 20 : 32, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', borderBottom: '1px solid var(--border-color)', paddingBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 24 }}>{activeSession.flag}</span>
            <div style={{ position: 'absolute', right: -4, bottom: -4, background: 'var(--bg-main)', borderRadius: '50%', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.3)' }}>
              {serviceLogoMap[activeSession.serviceId] ? React.cloneElement(serviceLogoMap[activeSession.serviceId], { style: { width: '14px', height: '14px', flexShrink: 0 } }) : <span style={{ fontSize: 12 }}>💬</span>}
            </div>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{activeSession.country}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{activeSession.service}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: activeSession.status === 'PENDING' ? 'var(--color-turquoise)' : 'var(--color-green)' }}>
          <Clock size={14} />
          <span style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', fontSize: 14 }}>
            {activeSession.status === 'PENDING' ? getRemainingTimeText(activeSession.expiresAt) : activeSession.status}
          </span>
        </div>
      </div>

      {/* Radar */}
      {activeSession.status === 'PENDING' && (
        <div style={{ position: 'relative', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: '3px solid rgba(0,242,254,0.15)', animation: 'pulseCyan 1.5s infinite' }} />
          <div style={{ position: 'absolute', width: '60%', height: '60%', margin: '20%', borderRadius: '50%', background: 'rgba(0,242,254,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RefreshCw size={20} className="blink-loader" style={{ color: 'var(--color-turquoise)' }} />
          </div>
        </div>
      )}

      {/* Phone number */}
      <div style={{ width: '100%' }}>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Your Temporary Number</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <h1 style={{ margin: 0, fontSize: isMobile ? 24 : 34, fontFamily: 'var(--font-heading)', letterSpacing: isMobile ? 0 : 1, wordBreak: 'break-all' }}>
            {activeSession.phoneNumber}
          </h1>
          <button className="btn btn-secondary" style={{ padding: 8 }} onClick={() => handleCopy(activeSession.phoneNumber, 'phone')}>
            {copiedText === 'phone' ? <Check size={16} style={{ color: 'var(--color-green)' }} /> : <Copy size={16} />}
          </button>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 6 }}>Paste into the app's verification screen</p>
      </div>

      {/* Code Box */}
      <div style={{ width: '100%', maxWidth: 450, padding: 16, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {activeSession.status === 'PENDING' ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: 13 }} className="blink-loader">Waiting for SMS code…</div>
        ) : activeSession.status === 'COMPLETED' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--color-green)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>SMS Code Received ✓</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
              <span style={{ fontSize: isMobile ? 32 : 42, fontWeight: 900, color: 'var(--color-green)', letterSpacing: 2, fontFamily: 'var(--font-heading)' }}>
                {activeSession.otpCode}
              </span>
              <button className="btn btn-secondary" style={{ padding: 8 }} onClick={() => handleCopy(activeSession.otpCode, 'code')}>
                {copiedText === 'code' ? <Check size={16} style={{ color: 'var(--color-green)' }} /> : <Copy size={16} />}
              </button>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 8, fontSize: 13, color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
              "{activeSession.smsText}"
            </div>
          </div>
        ) : (
          <div style={{ color: '#ff453a', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <XCircle size={16} />
            <span>Session {activeSession.status}. Wallet refunded.</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
        {activeSession.status === 'WAITING' ? (
          <button 
            className="btn btn-danger" 
            style={{ flex: isMobile ? 1 : 'none' }} 
            onClick={() => handleCancel(activeSession.id)}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <>
                <span className="spinner-loader" style={{ width: 14, height: 14 }}></span>
                <span>Cancelling…</span>
              </>
            ) : (
              'Cancel & Refund'
            )}
          </button>
        ) : (
          <button 
            className="btn btn-accent" 
            style={{ flex: isMobile ? 1 : 'none' }} 
            onClick={() => handleRebuy(activeSession.phoneNumber, activeSession.service, activeSession.country, activeSession.flag)}
            disabled={isRebuying}
          >
            {isRebuying ? (
              <>
                <span className="spinner-loader" style={{ width: 14, height: 14 }}></span>
                <span>Rebuying…</span>
              </>
            ) : (
              'Rebuy / Reuse Number'
            )}
          </button>
        )}
        <button className="btn btn-secondary" style={{ flex: isMobile ? 1 : 'none' }} onClick={() => setActiveSession(null)} disabled={isCancelling || isRebuying}>
          {activeSession.status === 'PENDING' ? 'Order Another' : 'Back to Order Panel'}
        </button>
      </div>
    </div>
  );

  /* ── MOBILE layout ── */
  if (isMobile) {
    return (
      <div className="animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Intro */}
        <div className="glass-panel intro-banner" style={{ padding: '14px 16px' }}>
          <h3 style={{ fontSize: 16, marginBottom: 4 }}>📱 SMS OTP Verification</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.5, margin: 0 }}>
            Pick a country + app → get a real temp number → receive OTP. No code = free refund.
          </p>
        </div>

        {activeSession ? (
          <ActiveSessionPanel />
        ) : (
          <>
            {/* Step indicator */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {[1, 2].map(s => (
                <React.Fragment key={s}>
                  <div
                    onClick={() => setStep(s)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                      padding: '6px 14px', borderRadius: 99,
                      background: step === s ? 'rgba(0,242,254,0.12)' : 'transparent',
                      border: `1px solid ${step === s ? 'var(--color-turquoise)' : 'var(--border-color)'}`,
                      color: step === s ? 'var(--color-turquoise)' : 'var(--text-muted)',
                      fontSize: 12, fontWeight: 700, transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ width: 18, height: 18, borderRadius: '50%', background: step === s ? 'var(--color-turquoise)' : 'var(--border-color)', color: step === s ? '#000' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{s}</span>
                    {s === 1 ? 'Country' : 'App'}
                  </div>
                  {s < 2 && <div style={{ height: 1, flex: 1, background: 'var(--border-color)' }} />}
                </React.Fragment>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 4, marginBottom: 4 }}>
              <button 
                onClick={() => setServer('server1')}
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: `1px solid ${server === 'server1' ? 'var(--color-turquoise)' : 'var(--border-color)'}`, background: server === 'server1' ? 'rgba(0,242,254,0.1)' : 'rgba(255,255,255,0.02)', color: server === 'server1' ? 'var(--color-turquoise)' : 'var(--text-secondary)', fontSize: 13, fontWeight: 600, transition: '0.2s' }}
              >
                Server 1 (Fast)
              </button>
              <button 
                onClick={() => setServer('server2')}
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: `1px solid ${server === 'server2' ? 'var(--color-turquoise)' : 'var(--border-color)'}`, background: server === 'server2' ? 'rgba(0,242,254,0.1)' : 'rgba(255,255,255,0.02)', color: server === 'server2' ? 'var(--color-turquoise)' : 'var(--text-secondary)', fontSize: 13, fontWeight: 600, transition: '0.2s' }}
              >
                Server 2 (High Success)
              </button>
            </div>

            {/* Step 1: Country */}
            {step === 1 && (
              <div className="glass-panel" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    className="form-input"
                    style={{ paddingLeft: 34, height: 40 }}
                    placeholder="Search country..."
                    value={searchCountry}
                    onChange={e => setSearchCountry(e.target.value)}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
                  {filteredCountries.map(c => (
                    <div
                      key={c.id}
                      onClick={() => { setSelectedCountry(c.id); setStep(2); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                        border: `1px solid ${selectedCountry === c.id ? 'var(--color-turquoise)' : 'var(--border-color)'}`,
                        background: selectedCountry === c.id ? 'rgba(0,242,254,0.08)' : 'rgba(255,255,255,0.02)',
                        color: selectedCountry === c.id ? 'var(--color-turquoise)' : 'var(--text-primary)',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span style={{ fontSize: 20 }}>{c.flag}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Service */}
            {step === 2 && (
              <div className="glass-panel" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--color-turquoise)', fontSize: 12, fontWeight: 600, cursor: 'pointer', textAlign: 'left', padding: 0 }}>
                  ← {selectedCountryObj?.flag} {selectedCountryObj?.name}
                </button>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    className="form-input"
                    style={{ paddingLeft: 34, height: 40 }}
                    placeholder="Search app..."
                    value={searchService}
                    onChange={e => setSearchService(e.target.value)}
                  />
                </div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
                  {isLoadingServices ? (
                    <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                      <span className="spinner-loader" style={{ width: 24, height: 24, borderTopColor: 'var(--color-turquoise)' }}></span>
                      <span>Loading available services…</span>
                    </div>
                  ) : filteredServices.length === 0 ? (
                    <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--text-secondary)' }}>No matching services found.</div>
                  ) : filteredServices.map(s => (
                    <div
                      key={s.id}
                      onClick={() => setSelectedService(s.id)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                        border: `1px solid ${selectedService === s.id ? 'var(--color-pink)' : 'var(--border-color)'}`,
                        background: selectedService === s.id ? 'rgba(255,0,127,0.07)' : 'rgba(255,255,255,0.02)',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {serviceLogoMap[s.id] ? React.cloneElement(serviceLogoMap[s.id], { style: { width: '22px', height: '22px', flexShrink: 0 } }) : <span style={{ fontSize: 22 }}>{s.emoji}</span>}
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 600, color: selectedService === s.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{s.name}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-turquoise)' }}>{formatCost(s.priceNgn)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary + CTA */}
            <div className="glass-panel" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, fontSize: 13, color: 'var(--text-secondary)' }}>
                <span>Country:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedCountryObj?.flag} {selectedCountryObj?.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, fontSize: 13, color: 'var(--text-secondary)' }}>
                <span>Service:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--text-primary)' }}>
                  <div style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {selectedServiceObj && serviceLogoMap[selectedServiceObj.id] 
                      ? React.cloneElement(serviceLogoMap[selectedServiceObj.id], { style: { width: '16px', height: '16px', flexShrink: 0 } }) 
                      : (selectedServiceObj?.emoji && <span style={{ fontSize: 16 }}>{selectedServiceObj.emoji}</span>)}
                  </div>
                  <span>{selectedServiceObj?.name}</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 15 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Cost:</span>
                <strong style={{ color: 'var(--color-turquoise)', fontSize: 18, fontFamily: 'var(--font-heading)' }}>{formatCost(selectedServiceObj?.priceNgn || 0)}</strong>
              </div>
              {errorMsg && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, background: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.3)', borderRadius: 8, color: '#ff453a', fontSize: 13, marginBottom: 12 }}>
                  <AlertCircle size={14} />
                  <span>{errorMsg}</span>
                </div>
              )}
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: 14 }} 
                onClick={handleRequestNumber}
                disabled={isRequesting}
              >
                {isRequesting ? (
                  <>
                    <span className="spinner-loader" style={{ width: 16, height: 16 }}></span>
                    <span>Requesting Number…</span>
                  </>
                ) : (
                  '🔢 Request Verification Number'
                )}
              </button>
            </div>
          </>
        )}

        {/* History */}
        {activeOtps.length > 0 && (
          <div className="glass-panel" style={{ padding: 16 }}>
            <h3 style={{ fontSize: 15, marginBottom: 12 }}>Session Logs</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activeOtps.slice(0, 5).map(log => (
                <div 
                  key={log.id} 
                  onClick={() => setActiveSession(log)} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '10px 12px', 
                    background: 'rgba(255,255,255,0.02)', 
                    borderRadius: 10, 
                    border: '1px solid var(--border-color)', 
                    cursor: 'pointer',
                    transition: 'all 0.2s' 
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 242, 254, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(0, 242, 254, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                  }}
                  title="Click to view session details"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ position: 'relative', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 18 }}>{log.flag}</span>
                      <div style={{ position: 'absolute', right: -4, bottom: -4, background: 'var(--bg-card)', borderRadius: '50%', padding: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {serviceLogoMap[log.serviceId] ? React.cloneElement(serviceLogoMap[log.serviceId], { style: { width: '12px', height: '12px', flexShrink: 0 } }) : null}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{log.service}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{log.phoneNumber}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge ${log.status === 'COMPLETED' ? 'badge-success' : log.status === 'PENDING' ? 'badge-info' : 'badge-danger'}`} style={{ fontSize: 9 }}>
                      {log.status}
                    </span>
                    {log.otpCode && <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-green)', marginTop: 2 }}>{log.otpCode}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    );
  }

  /* ── Desktop Layout ── */
  return (
    <div className="animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="glass-panel intro-banner">
        <h3 style={{ fontSize: 20, marginBottom: 8 }}>One-time OTP Verification</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
          Need to verify an account? Pick a country and target application, request a temporary physical non-VOIP SIM number, and receive your verification code. You only pay if an SMS code is successfully received. If no code is received within 15 minutes, the order is automatically canceled and fully refunded.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: activeSession ? '1fr' : '1.3fr 1fr', gap: 24 }}>
        {activeSession ? (
          <ActiveSessionPanel />
        ) : (
          <>
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 18, margin: 0 }}>Configure SMS OTP</h3>
                <div style={{ display: 'flex', gap: 6, background: 'rgba(0,0,0,0.2)', padding: 4, borderRadius: 8, border: '1px solid var(--border-color)' }}>
                  <button onClick={() => setServer('server1')} style={{ padding: '6px 12px', fontSize: 12, borderRadius: 6, border: 'none', background: server === 'server1' ? 'var(--color-turquoise)' : 'transparent', color: server === 'server1' ? '#000' : 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer', transition: '0.2s' }}>Server 1</button>
                  <button onClick={() => setServer('server2')} style={{ padding: '6px 12px', fontSize: 12, borderRadius: 6, border: 'none', background: server === 'server2' ? 'var(--color-turquoise)' : 'transparent', color: server === 'server2' ? '#000' : 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer', transition: '0.2s' }}>Server 2</button>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label className="form-label" style={{ margin: 0 }}>1. Choose Country</label>
                  <input type="text" placeholder="Search country..." value={searchCountry} onChange={e => setSearchCountry(e.target.value)} style={{ padding: '4px 8px', fontSize: 12, width: 150, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-primary)' }} />
                </div>
                <div className="country-list-grid">
                  {filteredCountries.map(c => (
                    <div key={c.id} className={`country-item ${selectedCountry === c.id ? 'selected' : ''}`} onClick={() => setSelectedCountry(c.id)}>
                      <span className="country-flag">{c.flag}</span>
                      <span>{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label className="form-label" style={{ margin: 0 }}>2. Select Target App</label>
                  <input type="text" placeholder="Search app..." value={searchService} onChange={e => setSearchService(e.target.value)} style={{ padding: '4px 8px', fontSize: 12, width: 150, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-primary)' }} />
                </div>
                <div className="service-list-grid" style={{ position: 'relative', minHeight: isLoadingServices ? 150 : 'auto', display: isLoadingServices ? 'flex' : 'grid', alignItems: 'center', justifyContent: 'center' }}>
                  {isLoadingServices ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color: 'var(--text-secondary)', gridColumn: '1 / -1' }}>
                      <span className="spinner-loader" style={{ width: 24, height: 24, borderTopColor: 'var(--color-turquoise)' }}></span>
                      <span>Loading available services…</span>
                    </div>
                  ) : filteredServices.length === 0 ? (
                    <div style={{ padding: '20px', color: 'var(--text-secondary)', textAlign: 'center', gridColumn: '1 / -1' }}>No matching services found.</div>
                  ) : (
                    filteredServices.map(s => (
                      <div key={s.id} className={`service-item ${selectedService === s.id ? 'selected' : ''}`} onClick={() => setSelectedService(s.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {serviceLogoMap[s.id] ? React.cloneElement(serviceLogoMap[s.id], { style: { width: '20px', height: '20px', flexShrink: 0 } }) : (s.emoji && <span style={{ fontSize: 20 }}>{s.emoji}</span>)}
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <span className="service-name" style={{ fontSize: '13px' }}>{s.name}</span>
                          <span className="service-price" style={{ fontSize: '11px' }}>{formatCost(s.priceNgn)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              {errorMsg && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, background: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.3)', borderRadius: 8, color: '#ff453a', fontSize: 13 }}>
                  <AlertCircle size={16} /><span>{errorMsg}</span>
                </div>
              )}
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: 14 }} 
                onClick={handleRequestNumber}
                disabled={isRequesting}
              >
                {isRequesting ? (
                  <>
                    <span className="spinner-loader" style={{ width: 16, height: 16 }}></span>
                    <span>Requesting Number…</span>
                  </>
                ) : (
                  'Request Verification Number'
                )}
              </button>
            </div>

            <div className="glass-panel" style={{ height: 'fit-content', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontSize: 16, margin: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}>Gateway Specifications</h3>
              <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 10, color: 'var(--text-secondary)' }}>
                {[['SIM Type:', 'Physical (Non-VOIP)'], ['Support:', 'Receive OTP, SMS'], ['Speed:', '< 10 seconds'], ['Guarantee:', 'No Code = Free Refund']].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}><span>{k}</span><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{v}</span></div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="glass-panel">
        <h3 style={{ fontSize: 18, marginBottom: 16 }}>Active OTP Session Logs</h3>
        {activeOtps.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)', borderRadius: 12 }}>No recent OTP verifications.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Timestamp</th><th>Service</th><th>Country</th>
                  <th>Phone Number</th><th>Status</th><th>Code</th><th>Cost</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const totalOtpPages = Math.max(1, Math.ceil(activeOtps.length / OTP_PER_PAGE));
                  const paginatedOtps = activeOtps.slice((otpPage - 1) * OTP_PER_PAGE, otpPage * OTP_PER_PAGE);
                  
                  return (
                    <>
                      {paginatedOtps.map(log => (
                        <tr 
                          key={log.id} 
                          onClick={() => setActiveSession(log)} 
                          style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 242, 254, 0.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                          title="Click to view session details"
                        >
                          <td>{log.date}</td>
                          <td style={{ fontWeight: 600 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {serviceLogoMap[log.serviceId] ? React.cloneElement(serviceLogoMap[log.serviceId], { style: { width: '18px', height: '18px', flexShrink: 0 } }) : null}
                              </div>
                              <span>{log.service}</span>
                              {log.server === 'server2' && <span className="badge" style={{ fontSize: 9, background: 'rgba(255,0,127,0.15)', color: 'var(--color-pink)' }}>S2</span>}
                            </div>
                          </td>
                          <td>{log.flag} {log.country}</td>
                          <td style={{ fontFamily: 'var(--mono)' }}>{log.phoneNumber}</td>
                          <td><span className={`badge ${log.status === 'COMPLETED' ? 'badge-success' : log.status === 'PENDING' ? 'badge-info' : 'badge-danger'}`}>{log.status}</span></td>
                          <td style={{ fontFamily: 'var(--mono)', fontWeight: 'bold', fontSize: 15, color: 'var(--color-green)' }}>{log.otpCode || '—'}</td>
                          <td>{formatCost(log.priceNgn)}</td>
                        </tr>
                      ))}
                      {activeOtps.length > OTP_PER_PAGE && (
                        <tr>
                          <td colSpan="7">
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '10px 0' }}>
                              <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} disabled={otpPage === 1} onClick={() => setOtpPage(p => p - 1)}>Prev</button>
                              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Page {otpPage} of {totalOtpPages}</span>
                              <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} disabled={otpPage === totalOtpPages} onClick={() => setOtpPage(p => p + 1)}>Next</button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })()}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SMSVerification;
