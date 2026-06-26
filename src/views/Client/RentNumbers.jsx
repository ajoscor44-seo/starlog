import React, { useContext, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AppContext } from '../../context/AppContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Phone, Clock, Mail, RefreshCw, AlertCircle, AlertTriangle, ChevronRight, Check } from 'lucide-react';

const RentNumbers = () => {
  const { countries, rentedNumbers, rentNumber, formatCost, fetchOtpServicesForCountry } = useContext(AppContext);
  const isMobile = useIsMobile();

  const [selectedCountry, setSelectedCountry] = useState(countries[0].id);
  const [purpose, setPurpose] = useState('All Services');
  const [duration, setDuration] = useState(7);
  const [activeInbox, setActiveInbox] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [rentSuccess, setRentSuccess] = useState(false);
  const [isRenting, setIsRenting] = useState(false);
  const [dynamicPurposes, setDynamicPurposes] = useState([]);
  const [isLoadingPurposes, setIsLoadingPurposes] = useState(false);

  useEffect(() => {
    const loadPurposes = async () => {
      setIsLoadingPurposes(true);
      const res = await fetchOtpServicesForCountry(selectedCountry);
      setIsLoadingPurposes(false);
      if (res.success && res.services.length > 0) {
        setDynamicPurposes(['All Services', ...res.services.map(s => s.name)]);
        setPurpose('All Services');
      } else {
        setDynamicPurposes([]);
        setPurpose('All Services');
      }
    };
    loadPurposes();
  }, [selectedCountry]);

  const handleRent = async () => {
    setErrorMsg('');
    setRentSuccess(false);
    setIsRenting(true);
    const result = await rentNumber(selectedCountry, purpose, duration);
    setIsRenting(false);
    if (result.success) {
      setRentSuccess(true);
      setTimeout(() => setRentSuccess(false), 3000);
    } else {
      setErrorMsg(result.msg);
    }
  };

  const getPrice = () => {
    let rateNgn = 2500;
    if (duration === 30) rateNgn = 7000;
    if (duration === 90) rateNgn = 18000;
    if (purpose !== 'All Services') rateNgn = Math.round(rateNgn * 0.7);
    return rateNgn;
  };

  const activePurposes = dynamicPurposes.length > 0 ? dynamicPurposes : [
    'All Services', 
    'WhatsApp', 
    'Telegram', 
    'Google', 
    'Facebook', 
    'Discord',
    'Instagram',
    'TikTok',
    'Twitter / X',
    'OpenAI / ChatGPT',
    'Netflix',
    'Snapchat',
    'Microsoft',
    'Steam',
    'Amazon',
    'Tinder'
  ];

  const selectedCountryObj = countries.find(c => c.id === selectedCountry);

  /* ── MOBILE ── */
  if (isMobile) {
    return (
      <div className="animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Intro */}
        <div className="glass-panel intro-banner" style={{ padding: '14px 16px' }}>
          <h3 style={{ fontSize: 16, marginBottom: 4 }}>📞 Rent a Virtual Number</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.5, margin: 0 }}>
            Dedicated, non-VOIP lines reserved exclusively for you. Receive unlimited SMS during your rental period.
          </p>
        </div>

        {/* Country picker */}
        <div className="glass-panel" style={{ padding: 16 }}>
          <label className="form-label">1. Select Country</label>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {countries.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCountry(c.id)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  padding: '10px 12px', borderRadius: 12, cursor: 'pointer', flexShrink: 0,
                  border: `1px solid ${selectedCountry === c.id ? 'var(--color-turquoise)' : 'var(--border-color)'}`,
                  background: selectedCountry === c.id ? 'rgba(0,242,254,0.1)' : 'rgba(255,255,255,0.02)',
                  minWidth: 72, transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: 26 }}>{c.flag}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: selectedCountry === c.id ? 'var(--color-turquoise)' : 'var(--text-muted)', textAlign: 'center' }}>{c.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Purpose */}
        <div className="glass-panel" style={{ padding: 16 }}>
          <label className="form-label">2. Purpose</label>
          {isLoadingPurposes ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', color: 'var(--text-secondary)' }}>
              <span className="spinner-loader" style={{ width: 16, height: 16, borderTopColor: 'var(--color-turquoise)' }}></span>
              <span style={{ fontSize: 13 }}>Loading available services…</span>
            </div>
          ) : activePurposes.length <= 8 ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {activePurposes.map(p => (
                <button
                  key={p}
                  onClick={() => setPurpose(p)}
                  style={{
                    padding: '7px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                    border: `1px solid ${purpose === p ? 'var(--color-pink)' : 'var(--border-color)'}`,
                    background: purpose === p ? 'rgba(255,0,127,0.1)' : 'transparent',
                    color: purpose === p ? 'var(--color-pink)' : 'var(--text-secondary)',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          ) : (
            <select 
              className="form-select" 
              value={purpose} 
              onChange={e => setPurpose(e.target.value)}
              style={{ width: '100%' }}
            >
              {activePurposes.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          )}
        </div>

        {/* Duration */}
        <div className="glass-panel" style={{ padding: 16 }}>
          <label className="form-label">3. Duration</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[7, 30, 90].map(d => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                style={{
                  padding: '12px 0', borderRadius: 12, cursor: 'pointer', textAlign: 'center',
                  border: `1px solid ${duration === d ? 'var(--color-amber)' : 'var(--border-color)'}`,
                  background: duration === d ? 'rgba(255,185,0,0.12)' : 'rgba(255,255,255,0.02)',
                  color: duration === d ? 'var(--color-amber)' : 'var(--text-secondary)',
                  fontWeight: 700, fontSize: 14, transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-heading)' }}>{d}</div>
                <div style={{ fontSize: 11, marginTop: 2 }}>Days</div>
              </button>
            ))}
          </div>
        </div>

        {/* Summary + CTA */}
        <div className="glass-panel" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-color)', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Renting in</div>
              <div style={{ fontWeight: 700 }}>{selectedCountryObj?.flag} {selectedCountryObj?.name}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Cost</div>
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--color-amber)' }}>{formatCost(getPrice())}</div>
            </div>
          </div>
          {errorMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, background: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.3)', borderRadius: 8, color: '#ff453a', fontSize: 13, marginBottom: 12 }}>
              <AlertCircle size={14} /><span>{errorMsg}</span>
            </div>
          )}
          {rentSuccess && (
            <div style={{ padding: 10, background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.2)', borderRadius: 8, color: 'var(--color-green)', textAlign: 'center', fontSize: 14, marginBottom: 12 }}>
              ✓ Number rented! Check your active list below.
            </div>
          )}
          <button 
            className="btn btn-accent" 
            style={{ padding: 14, width: '100%' }} 
            onClick={handleRent}
            disabled={isRenting}
          >
            {isRenting ? (
              <>
                <span className="spinner-loader" style={{ width: 16, height: 16 }}></span>
                <span>Renting Number…</span>
              </>
            ) : (
              '📱 Rent Virtual Number'
            )}
          </button>
        </div>

        {/* Active rentals */}
        {rentedNumbers.length > 0 && (
          <div className="glass-panel" style={{ padding: 16 }}>
            <h3 style={{ fontSize: 15, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Phone size={16} style={{ color: 'var(--color-amber)' }} />
              Active Lines ({rentedNumbers.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {rentedNumbers.map(rent => (
                <div key={rent.id} style={{ padding: '12px 14px', background: 'rgba(255,185,0,0.05)', borderRadius: 12, border: '1px solid rgba(255,185,0,0.15)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 24 }}>{rent.flag}</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{rent.country}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Expires {rent.expiryDate}</div>
                      </div>
                    </div>
                    <span className="badge badge-success" style={{ fontSize: 10 }}>Active</span>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: 8 }}>{rent.phoneNumber}</div>
                  <button
                    className="btn btn-secondary"
                    style={{ width: '100%', fontSize: 13, padding: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    onClick={() => setActiveInbox(rent)}
                  >
                    <Mail size={14} /> View Inbox ({rent.messages.length})
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inbox modal */}
        {activeInbox && createPortal(
          <div className="modal-overlay" style={{ display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? 0 : '20px' }}>
            <div className={`modal-content ${isMobile ? 'animate-slide-up-mobile' : 'animate-slide-in'}`} style={{ width: '100%', maxWidth: 500, padding: isMobile ? '24px 16px 40px 16px' : '28px', borderRadius: isMobile ? '24px 24px 0 0' : '20px', margin: isMobile ? 0 : 'auto', maxHeight: isMobile ? '85vh' : '90vh', overflowY: 'auto' }}>
              <button className="modal-close" onClick={() => setActiveInbox(null)}>
                <ChevronRight style={{ transform: 'rotate(90deg)' }} />
              </button>
              <h3 style={{ marginBottom: 4 }}>📥 Inbox</h3>
              <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-heading)', marginBottom: 4 }}>{activeInbox.flag} {activeInbox.phoneNumber}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>Expires {activeInbox.expiryDate}</div>
              <div style={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16, padding: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: 10 }}>
                {activeInbox.messages.length === 0 ? (
                  <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--text-secondary)' }}>Inbox empty. Ready to receive messages.</div>
                ) : activeInbox.messages.map(msg => (
                  <div key={msg.id} className="sms-bubble">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11, color: 'var(--text-secondary)' }}>
                      <span>Incoming SMS</span><span>{msg.timestamp}</span>
                    </div>
                    <div style={{ color: 'var(--text-primary)', fontSize: 14 }}>{msg.text}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { const ref = rentedNumbers.find(r => r.id === activeInbox.id); if (ref) setActiveInbox(ref); }}>
                  <RefreshCw size={13} /> Refresh
                </button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setActiveInbox(null)}>Close</button>
              </div>
            </div>
          </div>,
          document.body
        )}


      </div>
    );
  }

  /* ── DESKTOP ── */
  return (
    <div className="animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="glass-panel intro-banner">
        <h3 style={{ fontSize: 20, marginBottom: 8 }}>Dedicated Number Rental</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
          Rent physical, non-VOIP numbers for long-term project use. Reserved exclusively for you. Receive unlimited SMS messages from any application during the rental term.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h3 style={{ fontSize: 18, margin: 0 }}>Rent New Number</h3>
          <div>
            <label className="form-label">1. Select Country Location</label>
            <select className="form-select" value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)}>
              {countries.map(c => <option key={c.id} value={c.id}>{c.flag} {c.name} ({c.code})</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">2. Target Application Purpose</label>
            <select className="form-select" value={purpose} onChange={e => setPurpose(e.target.value)} disabled={isLoadingPurposes}>
              {isLoadingPurposes ? (
                <option>Loading services…</option>
              ) : (
                activePurposes.map(p => <option key={p} value={p}>{p}</option>)
              )}
            </select>
          </div>
          <div>
            <label className="form-label">3. Rental Duration Period</label>
            <div style={{ display: 'flex', gap: 12 }}>
              {[7, 30, 90].map(d => (
                <button key={d} type="button" className={`btn ${duration === d ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, padding: '12px 0' }} onClick={() => setDuration(d)}>{d} Days</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: 10 }}>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Rental Cost:</span>
            <strong style={{ color: 'var(--color-amber)', fontFamily: 'var(--font-heading)', fontSize: 18 }}>{formatCost(getPrice())}</strong>
          </div>
          {errorMsg && <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, background: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.3)', borderRadius: 8, color: '#ff453a', fontSize: 13 }}><AlertCircle size={16} /><span>{errorMsg}</span></div>}
          {rentSuccess && <div style={{ padding: 12, background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.2)', borderRadius: 8, color: 'var(--color-green)', textAlign: 'center', fontSize: 14 }}>Number Rented Successfully!</div>}
          <button 
            className="btn btn-accent" 
            style={{ padding: 14 }} 
            onClick={handleRent}
            disabled={isRenting}
          >
            {isRenting ? (
              <>
                <span className="spinner-loader" style={{ width: 16, height: 16 }}></span>
                <span>Renting Number…</span>
              </>
            ) : (
              'Rent Virtual Number'
            )}
          </button>
        </div>

        <div className="glass-panel" style={{ height: 'fit-content', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: 16, margin: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}>Rental Rules & Terms</h3>
          {['Dedicated SIM line. Nobody else gets your messages.', 'No recurring charge. Re-rent manually when near expiry.', 'Fully refundable within first 1 hour if no messages received.'].map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, fontSize: 13, color: 'var(--text-secondary)' }}><Check size={18} style={{ color: 'var(--color-green)', flexShrink: 0 }} /><span>{t}</span></div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, background: 'rgba(255,185,0,0.1)', border: '1px dashed var(--color-amber)', borderRadius: 8, color: 'var(--color-amber)', fontSize: 12, marginTop: 10 }}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} /><span>Subject to telecom carrier coverage.</span>
          </div>
        </div>
      </div>

      <div className="glass-panel">
        <h3 style={{ fontSize: 18, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Phone size={18} style={{ color: 'var(--color-amber)' }} />
          Active Rented Lines
        </h3>
        {rentedNumbers.length === 0 ? (
          <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)', borderRadius: 12 }}>No rented numbers yet.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {rentedNumbers.map(rent => (
              <div key={rent.id} className="glass-panel interactive" style={{ border: '1px solid rgba(255,185,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ fontSize: 20 }}>{rent.flag}</span><strong style={{ fontSize: 14 }}>{rent.country}</strong></div>
                  <span className="badge badge-success" style={{ fontSize: 10 }}>Active</span>
                </div>
                <h4 style={{ margin: '0 0 4px', fontSize: 20, fontFamily: 'var(--font-heading)' }}>{rent.phoneNumber}</h4>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4, margin: '12px 0' }}>
                  <div>Purpose: <strong>{rent.service}</strong></div>
                  <div>Expiry: <strong>{rent.expiryDate}</strong></div>
                </div>
                <button className="btn btn-secondary" style={{ flex: 1, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, width: '100%' }} onClick={() => setActiveInbox(rent)}>
                  <Mail size={14} /><span>View Inbox ({rent.messages.length})</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {activeInbox && createPortal(
        <div className="modal-overlay" style={{ display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? 0 : '20px' }}>
          <div className={`modal-content ${isMobile ? 'animate-slide-up-mobile' : 'animate-slide-in'}`} style={{ width: '100%', maxWidth: 600, padding: isMobile ? '24px 16px 40px 16px' : '28px', borderRadius: isMobile ? '24px 24px 0 0' : '20px', margin: isMobile ? 0 : 'auto', maxHeight: isMobile ? '85vh' : '90vh', overflowY: 'auto' }}>
            <button className="modal-close" onClick={() => setActiveInbox(null)}><ChevronRight style={{ transform: 'rotate(90deg)' }} /></button>
            <h3 style={{ marginBottom: 4 }}>Inbox: {activeInbox.phoneNumber}</h3>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20, display: 'flex', justifyContent: 'space-between' }}>
              <span>{activeInbox.flag} {activeInbox.country}</span><span>Expires: {activeInbox.expiryDate}</span>
            </div>
            <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20, padding: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: 10 }}>
              {activeInbox.messages.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>Inbox is empty.</div>
              ) : activeInbox.messages.map(msg => (
                <div key={msg.id} className="sms-bubble">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11, color: 'var(--text-secondary)' }}><span>Incoming SMS</span><span>{msg.timestamp}</span></div>
                  <div style={{ color: 'var(--text-primary)', fontSize: 14 }}>{msg.text}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button className="btn btn-secondary" onClick={() => { const ref = rentedNumbers.find(r => r.id === activeInbox.id); if (ref) setActiveInbox(ref); }}>
                <RefreshCw size={14} style={{ marginRight: 4 }} />Refresh
              </button>
              <button className="btn btn-primary" onClick={() => setActiveInbox(null)}>Close</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default RentNumbers;
