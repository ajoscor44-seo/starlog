import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { RefreshCw, Key, Search, Phone, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';

const ReuseNumbers = () => {
  const { countries, otpServices, activeOtps, reuseOtpNumber, formatCost } = useContext(AppContext);
  const isMobile = useIsMobile();

  // Form State
  const [selectedCountry, setSelectedCountry] = useState(countries[0]?.id || 'us');
  const [selectedService, setSelectedService] = useState(otpServices[0]?.id || 'srv-whatsapp');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isRebuying, setIsRebuying] = useState(false);
  const [feedback, setFeedback] = useState({ success: null, msg: '' });
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique previously purchased numbers from activeOtps list
  const previousNumbers = useMemo(() => {
    const seen = new Set();
    const list = [];
    
    // Sort activeOtps by latest first
    const sorted = [...activeOtps].sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    for (const otp of sorted) {
      if (otp.phoneNumber && !seen.has(otp.phoneNumber)) {
        seen.add(otp.phoneNumber);
        list.push({
          phoneNumber: otp.phoneNumber,
          service: otp.service,
          country: otp.country,
          flag: otp.flag,
          timestamp: otp.timestamp
        });
      }
    }
    return list;
  }, [activeOtps]);

  const filteredPreviousNumbers = previousNumbers.filter(item => 
    item.phoneNumber.includes(searchQuery) || 
    item.service.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleManualReuse = async (e) => {
    e.preventDefault();
    setFeedback({ success: null, msg: '' });
    
    const cleanNum = phoneNumber.trim().replace(/\s+/g, '').replace(/\+/g, '');
    if (!cleanNum) {
      setFeedback({ success: false, msg: 'Please enter a valid phone number.' });
      return;
    }

    const countryObj = countries.find(c => c.id === selectedCountry);
    const serviceObj = otpServices.find(s => s.id === selectedService);
    if (!countryObj || !serviceObj) return;

    setIsRebuying(true);
    const res = await reuseOtpNumber(cleanNum, serviceObj.id, countryObj.name, countryObj.flag);
    setIsRebuying(false);

    if (res.success) {
      setFeedback({ 
        success: true, 
        msg: `Number request submitted! Go to the 'SMS OTP (Temp)' tab to view the active session.` 
      });
      setPhoneNumber('');
    } else {
      setFeedback({ success: false, msg: res.msg || 'Failed to request reuse.' });
    }
  };

  const handleListItemReuse = async (item) => {
    setFeedback({ success: null, msg: '' });
    setIsRebuying(true);
    
    // Find matching service in catalogue
    const matchingService = otpServices.find(s => s.name.toLowerCase() === item.service.toLowerCase());
    const serviceId = matchingService ? matchingService.id : 'srv-whatsapp';

    const res = await reuseOtpNumber(item.phoneNumber, serviceId, item.country, item.flag);
    setIsRebuying(false);

    if (res.success) {
      setFeedback({ 
        success: true, 
        msg: `Number request submitted! Go to the 'SMS OTP (Temp)' tab to view the active session.` 
      });
    } else {
      setFeedback({ success: false, msg: res.msg || 'Failed to request reuse.' });
    }
  };

  const selectedServiceObj = otpServices.find(s => s.id === selectedService);
  const cost = selectedServiceObj ? selectedServiceObj.priceNgn : 500;

  return (
    <div className="animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Intro Banner */}
      <div className="glass-panel" style={{ 
        background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.05) 0%, rgba(255, 0, 127, 0.03) 100%)', 
        border: '1px solid rgba(0, 242, 254, 0.2)',
        padding: '20px',
        borderRadius: '16px'
      }}>
        <h3 style={{ fontSize: '20px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <RefreshCw size={24} style={{ color: 'var(--color-turquoise)' }} className="spin-slow" />
          Re-buy & Reuse OTP Numbers
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0, lineHeight: '1.6' }}>
          Need additional verification codes or lost access? Enter any previously purchased number below or choose from your history list to request a re-rent session.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', gap: '24px' }}>
        
        {/* Form and History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Reuse Request Form */}
          <div className="glass-panel">
            <h4 style={{ fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={18} style={{ color: 'var(--color-turquoise)' }} />
              New Reuse Session
            </h4>

            <form onSubmit={handleManualReuse} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="form-label">Select Country</label>
                  <select 
                    className="form-select" 
                    value={selectedCountry} 
                    onChange={(e) => setSelectedCountry(e.target.value)}
                  >
                    {countries.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.flag} {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Target Service</label>
                  <select 
                    className="form-select" 
                    value={selectedService} 
                    onChange={(e) => setSelectedService(e.target.value)}
                  >
                    {otpServices.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.emoji} {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label" htmlFor="reuse-phone">Phone Number (include country code, e.g. 18059039121)</label>
                <input 
                  id="reuse-phone"
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. 18059039121"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              {feedback.msg && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '10px 14px', 
                  background: feedback.success ? 'rgba(0, 255, 135, 0.08)' : 'rgba(255, 59, 48, 0.08)',
                  border: feedback.success ? '1px solid rgba(0, 255, 135, 0.15)' : '1px solid rgba(255, 59, 48, 0.15)',
                  borderRadius: '8px', 
                  color: feedback.success ? 'var(--color-green)' : '#ff453a',
                  fontSize: '13px'
                }}>
                  {feedback.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  <span>{feedback.msg}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <div>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Reuse Rate: </span>
                  <strong style={{ fontSize: '18px', color: 'var(--color-turquoise)', fontFamily: 'var(--font-heading)' }}>
                    {formatCost(cost)}
                  </strong>
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={isRebuying || !phoneNumber}
                  style={{ minWidth: '160px' }}
                >
                  {isRebuying ? 'Requesting...' : 'Request Reuse'}
                </button>
              </div>
            </form>
          </div>

          {/* History List */}
          <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexDirection: isMobile ? 'column' : 'row', gap: '10px' }}>
              <h4 style={{ fontSize: '16px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={18} style={{ color: 'var(--color-pink)' }} />
                Your Purchased Numbers History
              </h4>
              <div style={{ position: 'relative', width: isMobile ? '100%' : '200px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Filter history..." 
                  style={{ paddingLeft: '28px', fontSize: '12px', height: '32px' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {filteredPreviousNumbers.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '12px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                {searchQuery ? 'No matching phone numbers found.' : 'You have not purchased any OTP numbers yet. Go to dynamic SMS OTP (Temp) tab to order first.'}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredPreviousNumbers.map((item, idx) => (
                  <div 
                    key={idx}
                    className="glass-panel interactive"
                    style={{ 
                      padding: '14px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      background: 'rgba(255,255,255,0.01)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{item.flag}</span>
                        <span>{item.phoneNumber}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {item.service} • {item.country} • Purchased on {item.timestamp.split(',')[0]}
                      </div>
                    </div>

                    <button
                      className="btn btn-secondary"
                      style={{ padding: '6px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      onClick={() => handleListItemReuse(item)}
                      disabled={isRebuying}
                    >
                      <RefreshCw size={12} />
                      <span>Re-buy</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Info Rules Panel */}
        <div className="glass-panel" style={{ height: 'fit-content' }}>
          <h4 style={{ fontSize: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <HelpCircle size={16} style={{ color: 'var(--color-turquoise)' }} />
            Number Reuse Guidelines
          </h4>
          <ul style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '10px', margin: 0, lineHeight: '1.6' }}>
            <li>Number reuse requests target the same physical SIM pool on 5SIM carrier nodes.</li>
            <li><strong>Availability:</strong> A number is eligible for reuse only if it is still online and active in the carrier's gateway (usually within 12-48 hours of original use).</li>
            <li><strong>Pricing:</strong> Requesting number reuse deducts the same standard rate as a new temporary OTP number purchase.</li>
            <li>If the request is rejected (e.g. number is no longer online), your wallet balance will be refunded automatically.</li>
            <li>Once requested, monitor the <strong>SMS OTP (Temp)</strong> tab for incoming codes.</li>
          </ul>
        </div>

      </div>

    </div>
  );
};

export default ReuseNumbers;
