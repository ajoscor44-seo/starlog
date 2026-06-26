import React, { useContext, useState } from 'react';
import { useNavigate, useMatch } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Smartphone, Download, Wifi, AlertCircle, Info, Check, Copy, X } from 'lucide-react';

const regionEmoji = { 'All': '🌍', 'North America': '🌎', 'Europe': '🇪🇺', 'Asia': '🌏', 'Africa': '🌍', 'Global': '🛰️' };

const ESim = () => {
  const { esimPackages, activeEsims, buyEsim, formatCost, dbIsAdmin } = useContext(AppContext);
  const isMobile = useIsMobile();

  if (!dbIsAdmin) {
    return (
      <div className="animate-slide-in" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ display: 'inline-block', padding: '40px 30px', maxWidth: '400px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
          <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>Coming Soon</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Our Global eSIM functionality is currently being finalized. Check back soon for seamless global connectivity without physical SIM cards!
          </p>
        </div>
      </div>
    );
  }

  const [selectedRegion, setSelectedRegion] = useState('All');
  
  const navigate = useNavigate();
  const buyMatch = useMatch('/dashboard/esim/buy/:id');
  const selectedPkgId = buyMatch?.params?.id;
  const selectedPkg = selectedPkgId ? esimPackages.find(p => String(p.id) === String(selectedPkgId)) : null;

  const [activeEsimDetails, setActiveEsimDetails] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const regions = ['All', 'North America', 'Europe', 'Asia', 'Africa', 'Global'];
  const filteredPackages = selectedRegion === 'All' ? esimPackages : esimPackages.filter(p => p.region === selectedRegion);

  const [isBuying, setIsBuying] = useState(false);

  const handleBuy = async () => {
    if (!selectedPkg) return;
    setErrorMsg('');
    setIsBuying(true);
    const result = await buyEsim(selectedPkg.id);
    setIsBuying(false);
    if (result.success) { setActiveEsimDetails(result.esim); navigate('/dashboard/esim'); }
    else setErrorMsg(result.msg);
  };

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 2000);
  };

  /* ── MOBILE ── */
  if (isMobile) {
    return (
      <div className="animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Header */}
        <div className="glass-panel intro-banner" style={{ padding: '14px 16px' }}>
          <h3 style={{ fontSize: 16, marginBottom: 4 }}>📡 Global eSIM Connectivity</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.5, margin: 0 }}>
            Instant digital travel SIMs for 85+ destinations. Scan QR → connect. No physical card needed.
          </p>
        </div>

        {/* Region filter – horizontal scroll chips */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {regions.map(reg => (
            <button
              key={reg}
              onClick={() => setSelectedRegion(reg)}
              style={{
                padding: '7px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700,
                border: `1px solid ${selectedRegion === reg ? 'var(--color-turquoise)' : 'var(--border-color)'}`,
                background: selectedRegion === reg ? 'rgba(0,242,254,0.12)' : 'transparent',
                color: selectedRegion === reg ? 'var(--color-turquoise)' : 'var(--text-muted)',
                cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
              }}
            >
              {regionEmoji[reg]} {reg}
            </button>
          ))}
        </div>

        {/* Package cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredPackages.map(pkg => (
            <div
              key={pkg.id}
              className="glass-panel"
              style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, border: '1px solid var(--border-color)' }}
            >
              <div style={{ fontSize: 32, flexShrink: 0 }}>{pkg.flag || '📡'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{pkg.country}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {pkg.isUnlimited ? '∞ Unlimited' : `${pkg.dataGb} GB`} · {pkg.durationDays}d
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--color-turquoise)', marginTop: 4 }}>
                  {formatCost(pkg.priceNgn)}
                </div>
              </div>
              <button
                className="btn btn-primary"
                style={{ padding: '8px 16px', fontSize: 13, flexShrink: 0 }}
                onClick={() => navigate('/dashboard/esim/buy/' + pkg.id)}
              >
                Buy
              </button>
            </div>
          ))}
        </div>

        {/* Active profiles */}
        {activeEsims.length > 0 && (
          <div className="glass-panel" style={{ padding: 16 }}>
            <h3 style={{ fontSize: 15, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Smartphone size={16} style={{ color: 'var(--color-turquoise)' }} />
              My Active eSIMs
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {activeEsims.map(esim => {
                const usagePct = esim.totalDataGb === 999 ? 0 : Math.round((esim.usedDataGb / esim.totalDataGb) * 100);
                return (
                  <div key={esim.id} style={{ padding: '14px', background: 'rgba(0,242,254,0.05)', borderRadius: 12, border: '1px solid rgba(0,242,254,0.15)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{esim.flag || '📡'} {esim.country}</div>
                      <span className="badge badge-success" style={{ fontSize: 10 }}>Active</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      {esim.usedDataGb}GB / {esim.totalDataGb === 999 ? 'Unlimited' : esim.totalDataGb + 'GB'}
                    </div>
                    {esim.totalDataGb !== 999 && (
                      <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden', marginBottom: 10 }}>
                        <div style={{ width: `${usagePct}%`, height: '100%', background: 'var(--gradient-primary)', borderRadius: 99 }} />
                      </div>
                    )}
                    <button
                      className="btn btn-secondary"
                      style={{ width: '100%', fontSize: 13, padding: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                      onClick={() => setActiveEsimDetails(esim)}
                    >
                      <Download size={14} /> Show QR Code
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Requirements */}
        <div className="glass-panel" style={{ padding: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Requirements</div>
          {['Your phone must be unlocked & eSIM-capable.', 'Connect to Wi-Fi before scanning QR code.', 'Do not delete the profile after setup.'].map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
              <Info size={14} style={{ color: 'var(--color-turquoise)', flexShrink: 0, marginTop: 1 }} />
              <span>{t}</span>
            </div>
          ))}
        </div>

        {/* Confirm modal */}
        {selectedPkg && (
          <div className="modal-overlay">
            <div className="modal-content animate-slide-in" style={{ width: '100%', maxWidth: '400px', borderRadius: '20px 20px 0 0', padding: '20px 16px' }}>
              <button className="modal-close" onClick={() => navigate('/dashboard/esim')}><X size={18} /></button>
              <h3 style={{ marginBottom: 6 }}>{selectedPkg.flag} {selectedPkg.country}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
                {selectedPkg.isUnlimited ? 'Unlimited Data' : `${selectedPkg.dataGb} GB`} · {selectedPkg.durationDays} days
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: 10, marginBottom: 16 }}>
                <span>Cost:</span>
                <strong style={{ color: 'var(--color-turquoise)', fontSize: 18, fontFamily: 'var(--font-heading)' }}>{formatCost(selectedPkg.priceNgn)}</strong>
              </div>
              {errorMsg && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, background: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.3)', borderRadius: 8, color: '#ff453a', marginBottom: 12, fontSize: 13 }}>
                  <AlertCircle size={14} /><span>{errorMsg}</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/dashboard/esim')} disabled={isBuying}>Cancel</button>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1 }} 
                  onClick={handleBuy}
                  disabled={isBuying}
                >
                  {isBuying ? (
                    <>
                      <span className="spinner-loader" style={{ width: 14, height: 14 }}></span>
                      <span>Processing…</span>
                    </>
                  ) : (
                    'Confirm & Pay'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QR modal */}
        {activeEsimDetails && (
          <div className="modal-overlay">
            <div className="modal-content animate-slide-in" style={{ width: '100%', maxWidth: '450px', padding: '20px 16px', borderRadius: '20px 20px 0 0', textAlign: 'center' }}>
              <button className="modal-close" onClick={() => setActiveEsimDetails(null)}><X size={18} /></button>
              <h3 style={{ marginBottom: 4 }}>eSIM Setup</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 16 }}>{activeEsimDetails.country}</p>
              <div style={{ background: '#fff', padding: 12, borderRadius: 12, width: 180, height: 180, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={activeEsimDetails.qrCodeUrl} alt="eSIM QR" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', padding: 12, borderRadius: 10, fontSize: 12, marginBottom: 16 }}>
                {[['SM-DP+ Address', activeEsimDetails.smdppa, 'smdppa'], ['Activation Code', activeEsimDetails.activationCode, 'actcode']].map(([label, val, key]) => (
                  <div key={key}>
                    <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{label}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                      <code style={{ fontSize: 11, wordBreak: 'break-all' }}>{val}</code>
                      <button onClick={() => copyText(val, key)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedId === key ? 'var(--color-green)' : 'var(--text-secondary)', marginLeft: 8 }}>
                        {copiedId === key ? <Check size={13} /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setActiveEsimDetails(null)}>Done</button>
            </div>
          </div>
        )}

      </div>
    );
  }

  /* ── DESKTOP ── */
  return (
    <div className="animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="glass-panel intro-banner">
        <h3 style={{ fontSize: 20, marginBottom: 8 }}>Global eSIM Connectivity</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
          Stay connected worldwide without swap SIM cards. Purchase digital travel profiles for over 85 destinations, receive your QR installation codes instantly, and track data usage statistics dynamically.
        </p>
      </div>

      <div className="esim-shop-grid">
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <h3 style={{ fontSize: 18, margin: 0 }}>Choose Data Package</h3>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
              {regions.map(reg => (
                <button key={reg} className={`btn ${selectedRegion === reg ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setSelectedRegion(reg)}>
                  {regionEmoji[reg]} {reg}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredPackages.map(pkg => (
              <div key={pkg.id} className="glass-panel interactive" style={{ padding: '16px 20px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ marginBottom: 6 }}>
                  <h4 style={{ margin: '0 0 4px', fontSize: 15 }}>{pkg.flag} {pkg.country}</h4>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{pkg.isUnlimited ? 'Unlimited Data' : `${pkg.dataGb} GB`} · {pkg.durationDays} Days</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: 18, fontFamily: 'var(--font-heading)', color: 'var(--color-turquoise)' }}>{formatCost(pkg.priceNgn)}</strong>
                  <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 13 }} onClick={() => navigate('/dashboard/esim/buy/' + pkg.id)}>Purchase Plan</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel" style={{ height: 'fit-content', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: 16, margin: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}>eSIM Installation Requirements</h3>
          {['Ensure your smartphone is unlocked and supports eSIM profiles.', 'Connect to Wi-Fi before scanning the QR setup code.', 'Do not delete the profile after setup. Re-adding is locked.'].map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
              <Info size={18} style={{ color: 'var(--color-turquoise)', flexShrink: 0 }} />
              <span>{t}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel">
        <h3 style={{ fontSize: 18, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Smartphone size={18} style={{ color: 'var(--color-turquoise)' }} />
          Your Active eSIM Profiles
        </h3>
        {activeEsims.length === 0 ? (
          <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)', borderRadius: 12 }}>No eSIM profiles provisioned yet.</div>
        ) : (
          <div className="esim-grid">
            {activeEsims.map(esim => {
              const usagePct = esim.totalDataGb === 999 ? 0 : Math.round((esim.usedDataGb / esim.totalDataGb) * 100);
              return (
                <div key={esim.id} className="glass-panel" style={{ border: '1px solid rgba(0,242,254,0.12)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div><h4 style={{ margin: 0, fontSize: 18 }}>{esim.flag} {esim.country}</h4><span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>ICCID: {esim.iccid}</span></div>
                    <span className="badge badge-success">Active</span>
                  </div>
                  <div className="esim-usage-container" style={{ margin: '20px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Data Usage:</span>
                      <strong>{esim.usedDataGb}GB / {esim.totalDataGb === 999 ? 'Unlimited' : `${esim.totalDataGb}GB`}</strong>
                    </div>
                    {esim.totalDataGb !== 999 ? (
                      <div className="esim-usage-bar"><div className="esim-usage-fill" style={{ width: `${usagePct}%` }} /></div>
                    ) : (
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: 12, color: 'var(--color-green)' }}>
                        <Wifi size={14} className="blink-loader" /><span>Unlimited – active feed.</span>
                      </div>
                    )}
                  </div>
                  <button className="btn btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={() => setActiveEsimDetails(esim)}>
                    <Download size={16} /><span>Show QR Code</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedPkg && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? 0 : '20px' }}>
          <div 
            className={`modal-content ${isMobile ? 'animate-slide-up-mobile' : 'animate-slide-in'}`} 
            style={{ 
              width: '100%', 
              maxWidth: '400px', 
              borderRadius: isMobile ? '24px 24px 0 0' : '12px',
              padding: isMobile ? '24px 16px 40px 16px' : '24px',
              margin: isMobile ? 0 : 'auto',
              maxHeight: isMobile ? '85vh' : '90vh',
              overflowY: 'auto'
            }}
          >
            <h3 style={{ marginBottom: 8 }}>Confirm eSIM Setup</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
              {selectedPkg.flag} <strong>{selectedPkg.country}</strong> ({selectedPkg.isUnlimited ? 'Unlimited' : `${selectedPkg.dataGb} GB`} – {selectedPkg.durationDays} Days)
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: 10, marginBottom: 20 }}>
              <span>Cost:</span><strong style={{ color: 'var(--color-turquoise)', fontSize: 18, fontFamily: 'var(--font-heading)' }}>{formatCost(selectedPkg.priceNgn)}</strong>
            </div>
            {errorMsg && <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, background: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.3)', borderRadius: 8, color: '#ff453a', marginBottom: 16, fontSize: 13 }}><AlertCircle size={16} /><span>{errorMsg}</span></div>}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => navigate('/dashboard/esim')} disabled={isBuying}>Cancel</button>
              <button 
                className="btn btn-primary" 
                onClick={handleBuy}
                disabled={isBuying}
              >
                {isBuying ? (
                  <>
                    <span className="spinner-loader" style={{ width: 14, height: 14 }}></span>
                    <span>Processing…</span>
                  </>
                ) : (
                  'Confirm & Charge'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeEsimDetails && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? 0 : '20px' }}>
          <div 
            className={`modal-content ${isMobile ? 'animate-slide-up-mobile' : 'animate-slide-in'}`} 
            style={{ 
              width: '100%', 
              maxWidth: '450px', 
              padding: isMobile ? '24px 16px 40px 16px' : '24px', 
              borderRadius: isMobile ? '24px 24px 0 0' : '12px', 
              textAlign: 'center',
              margin: isMobile ? 0 : 'auto',
              maxHeight: isMobile ? '85vh' : '90vh',
              overflowY: 'auto'
            }}
          >
            <h3 style={{ marginBottom: 4 }}>eSIM Setup Guide</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>{activeEsimDetails.country}</p>
            <div style={{ background: '#fff', padding: 16, borderRadius: 12, width: 220, height: 220, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={activeEsimDetails.qrCodeUrl} alt="eSIM QR" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', padding: 14, borderRadius: 10, fontSize: 13, marginBottom: 20 }}>
              {[['SM-DP+ Address', activeEsimDetails.smdppa, 'smdppa'], ['Activation Code', activeEsimDetails.activationCode, 'actcode']].map(([label, val, key]) => (
                <div key={key}>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{label}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                    <code style={{ fontSize: 12 }}>{val}</code>
                    <button onClick={() => copyText(val, key)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedId === key ? 'var(--color-green)' : 'var(--text-secondary)' }}>
                      {copiedId === key ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setActiveEsimDetails(null)}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ESim;
