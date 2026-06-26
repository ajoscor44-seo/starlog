import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { createPortal } from 'react-dom';
import { useIsMobile } from '../../hooks/useIsMobile';
import { User, Eye, EyeOff, Check, Clipboard, AlertCircle } from 'lucide-react';

import netflixLogo from '../../assets/netflix.jpeg';
import spotifyLogo from '../../assets/spotify.jpeg';
import claudeLogo from '../../assets/claude.jpeg';
import chatgptLogo from '../../assets/chatgpt.jpeg';
import youtubeLogo from '../../assets/youtube.jpeg';
import surfsharkLogo from '../../assets/surfshark.jpeg';

const logoMapping = {
  'sub-netflix': netflixLogo,
  'sub-spotify': spotifyLogo,
  'sub-claude': claudeLogo,
  'sub-chatgpt': chatgptLogo,
  'sub-youtube': youtubeLogo,
  'sub-surfshark': surfsharkLogo
};

const Subscriptions = () => {
  const { subscriptions, accountSubscriptions, buySharedSubscription, formatCost } = useContext(AppContext);
  const isMobile = useIsMobile();
  const [accPage, setAccPage] = useState(1);
  const ACC_PER_PAGE = 5;

  const [selectedSub, setSelectedSub] = useState(null);
  const [showCreds, setShowCreds] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [purchaseError, setPurchaseError] = useState('');
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [generatedAccount, setGeneratedAccount] = useState(null);

  const togglePasswordVisibility = (id) => {
    setShowCreds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePurchase = async () => {
    if (!selectedSub) return;
    setPurchaseError('');
    setPurchaseSuccess(false);

    const result = await buySharedSubscription(selectedSub.id);
    if (result.success) {
      setPurchaseSuccess(true);
      setGeneratedAccount(result.sub);
      setTimeout(() => {
        setSelectedSub(null);
        setPurchaseSuccess(false);
        setGeneratedAccount(null);
      }, 5000);
    } else {
      setPurchaseError(result.msg);
    }
  };

  return (
    <div className="animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Introduction Banner */}
      <div className="glass-panel intro-banner">
        <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Shared Accounts Marketplace</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
          Access premium digital subscriptions at a fraction of their original cost. We purchase family subscription tiers and sell individual profile slots. Pay in local currency and receive your credentials instantly upon purchase.
        </p>
      </div>

      {/* Grid Shop */}
      <div>
        <h3 style={{ fontSize: '18px', marginBottom: '16px', fontFamily: 'var(--font-heading)' }}>Available Shared Accounts</h3>
        <div className="subs-grid">
          {subscriptions.map((sub) => (
            <div key={sub.id} className="glass-panel interactive sub-card glowing-cyan">
              <div>
                <div className="sub-header">
                  <div className="sub-icon" style={{ 
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg-main)',
                    borderRadius: '8px'
                  }}>
                    {logoMapping[sub.id] ? (
                      <img src={logoMapping[sub.id]} alt={sub.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      sub.name[0]
                    )}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px' }}>{sub.name}</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{sub.category}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '12px 0' }}>
                  <span style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
                    {formatCost(sub.priceNgn)}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>/ month</span>
                </div>

                <ul className="sub-details">
                  {sub.features.map((feat, i) => (
                    <li key={i}>
                      <Check size={14} style={{ color: 'var(--color-green)' }} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '16px' }}
                onClick={() => setSelectedSub(sub)}
              >
                Purchase Access Slot
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Active Account locker */}
      <div className="glass-panel" style={{ marginTop: '12px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={18} style={{ color: 'var(--color-turquoise)' }} />
          Your Credentials Locker
        </h3>

        {accountSubscriptions.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
            You haven't purchased any premium accounts yet.
          </div>
        ) : (
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Login Email</th>
                  <th>Password</th>
                  <th>Designated Profile / Screen</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const totalAccPages = Math.max(1, Math.ceil(accountSubscriptions.length / ACC_PER_PAGE));
                  const paginatedAcc = accountSubscriptions.slice((accPage - 1) * ACC_PER_PAGE, accPage * ACC_PER_PAGE);

                  return (
                    <>
                      {paginatedAcc.map((acc) => (
                        <tr key={acc.id}>
                          <td style={{ fontWeight: '700' }}>{acc.name}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>{acc.email}</span>
                              <button 
                                onClick={() => copyToClipboard(acc.email, `${acc.id}-email`)} 
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: varColor(acc.id, 'email') }}
                                title="Copy Email"
                              >
                                {copiedId === `${acc.id}-email` ? <Check size={14} style={{ color: 'var(--color-green)' }} /> : <Clipboard size={14} />}
                              </button>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>{showCreds[acc.id] ? acc.pass : '••••••••••••'}</span>
                              <button 
                                onClick={() => togglePasswordVisibility(acc.id)} 
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                              >
                                {showCreds[acc.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                              <button 
                                onClick={() => copyToClipboard(acc.pass, `${acc.id}-pass`)} 
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: varColor(acc.id, 'pass') }}
                                title="Copy Password"
                              >
                                {copiedId === `${acc.id}-pass` ? <Check size={14} style={{ color: 'var(--color-green)' }} /> : <Clipboard size={14} />}
                              </button>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-info">{acc.screen}</span>
                          </td>
                          <td>{acc.expiry}</td>
                          <td>
                            <span className="badge badge-success">{acc.status}</span>
                          </td>
                        </tr>
                      ))}
                      {accountSubscriptions.length > ACC_PER_PAGE && (
                        <tr>
                          <td colSpan="6">
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '10px 0' }}>
                              <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} disabled={accPage === 1} onClick={() => setAccPage(p => p - 1)}>Prev</button>
                              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Page {accPage} of {totalAccPages}</span>
                              <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} disabled={accPage === totalAccPages} onClick={() => setAccPage(p => p + 1)}>Next</button>
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

      {/* Buy Modal */}
      {selectedSub && createPortal(
        <div className="modal-overlay" style={{ display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? 0 : '20px' }}>
          <div className={`modal-content ${isMobile ? 'animate-slide-up-mobile' : 'animate-slide-in'}`} style={{ borderRadius: isMobile ? '24px 24px 0 0' : '20px', padding: isMobile ? '24px 16px 40px 16px' : '28px', margin: isMobile ? 0 : 'auto', width: '100%', maxWidth: '500px', maxHeight: isMobile ? '85vh' : '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>Confirm Purchase</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
              You are about to purchase shared slot access for <strong>{selectedSub.name}</strong>.
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
              <span>Total Price:</span>
              <strong style={{ color: 'var(--color-turquoise)', fontFamily: 'var(--font-heading)', fontSize: '18px' }}>
                {formatCost(selectedSub.priceNgn)}
              </strong>
            </div>

            {purchaseError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.3)', borderRadius: '8px', color: '#ff453a', marginBottom: '16px', fontSize: '13px' }}>
                <AlertCircle size={16} />
                <span>{purchaseError}</span>
              </div>
            )}

            {purchaseSuccess ? (
              <div style={{ padding: '16px', background: 'rgba(0, 255, 135, 0.1)', border: '1px solid rgba(0, 255, 135, 0.2)', borderRadius: '10px', color: 'var(--color-green)', textAlign: 'center', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 6px' }}>Slot Purchased Successfully!</h4>
                <p style={{ margin: 0, fontSize: '12px' }}>Credentials loaded instantly into your locker below.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setSelectedSub(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={handlePurchase}>Confirm & Deduct</button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

    </div>
  );

  function varColor(id, type) {
    return copiedId === `${id}-${type}` ? 'var(--color-green)' : 'var(--text-secondary)';
  }
};

export default Subscriptions;
