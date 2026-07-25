import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useMatch } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { AppContext } from '../../context/AppContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { createPortal } from 'react-dom';
import { Share2, ShoppingCart, Tag, AlertCircle, CheckCircle, Search, Shield, ChevronRight } from 'lucide-react';
import { supabase } from '../../supabase';

const SocialMediaLogs = () => {
  const { fetchSocialMediaLogs, buySocialMediaLog, formatCost, currency } = useContext(AppContext);
  const isMobile = useIsMobile();
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  const navigate = useNavigate();
  const buyMatch = useMatch('/dashboard/social/buy/:id');
  const selectedLogId = buyMatch?.params?.id;
  const selectedLog = selectedLogId ? logs.find(l => String(l.slug) === String(selectedLogId) || String(l.id) === String(selectedLogId)) : null;
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    const res = await fetchSocialMediaLogs();
    if (res.success) {
      setLogs(res.data);
      setError(null);
    } else {
      setError(res.msg);
    }
    setLoading(false);
  };

  const categories = ['All', ...new Set(logs.map(l => l.category))];

  const filteredLogs = logs.filter(l => {
    if (activeCategory !== 'All' && l.category !== activeCategory) return false;
    if (searchQuery && !l.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    const getScore = (log) => {
      let score = 0;
      const text = `${log.name} ${log.category}`.toLowerCase();
      if (text.includes('usa') || text.includes(' us ')) score += 10;
      if (text.includes('aged')) score += 5;
      if (text.includes('verified') || text.includes('official')) score += 5;
      if (text.includes('facebook') || text.includes('instagram')) score += 2;
      return score;
    };
    return getScore(b) - getScore(a);
  });

  const handleBuy = async (e) => {
    e.preventDefault();
    if (!selectedLog) return;
    
    setPurchaseLoading(true);
    // Cost calculation in NGN
    const totalCost = selectedLog.priceNgn * purchaseQuantity;
    
    const res = await buySocialMediaLog(selectedLog.id, selectedLog.name, purchaseQuantity, totalCost);
    setPurchaseLoading(false);
    
    if (res.success) {
      setPurchaseSuccess(res.order);
    } else {
      alert("Purchase failed: " + res.msg);
    }
  };

  const closePurchaseModal = () => {
    navigate('/dashboard/social');
    setPurchaseQuantity(1);
    setPurchaseSuccess(null);
  };

  const getPlatformIcon = (category) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('facebook') || cat.includes('fb')) return '📘';
    if (cat.includes('instagram') || cat.includes('ig')) return '📸';
    if (cat.includes('tiktok') || cat.includes('tt')) return '🎵';
    if (cat.includes('twitter') || cat.includes('x')) return '🐦';
    return '📱';
  };

  if (selectedLog && buyMatch) {
    return (
      <div className="animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
        <button 
          onClick={closePurchaseModal} 
          style={{ background: 'none', border: 'none', color: '#ab47fc', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: 0, fontSize: '14px', fontWeight: 'bold' }}
        >
          <div style={{ background: 'rgba(171,71,252,0.1)', borderRadius: '50%', padding: '6px' }}><ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} /></div>
          Back to Accounts
        </button>

        <div className="glass-panel" style={{ padding: isMobile ? '24px 16px' : '40px', borderRadius: '24px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '32px' }}>
          
          {/* Left Column: Details */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {selectedLog.image && (
              <div style={{ width: '100%', height: '200px', borderRadius: '16px', overflow: 'hidden', background: 'rgba(255,255,255,0.02)' }}>
                <img src={selectedLog.image} alt={selectedLog.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ fontSize: '24px', background: 'rgba(255,255,255,0.05)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {getPlatformIcon(selectedLog.category)}
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#ab47fc', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>{selectedLog.category}</span>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ref: {selectedLog.slug}</div>
                </div>
              </div>
              
              <h1 style={{ fontSize: isMobile ? '24px' : '32px', margin: '0 0 16px 0', lineHeight: '1.3' }}>{selectedLog.name}</h1>
              
              {selectedLog.description ? (
                <div className="social-log-html-content" style={{ marginTop: 12, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 8, wordBreak: 'break-word' }}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedLog.description.replace(/color:\s*[^;"]+;?/gi, '').replace(/background(?:-color)?:\s*[^;"]+;?/gi, '')) }} />
              ) : (
                <div style={{ fontSize: '15px', color: 'var(--text-muted)' }}>No description available for this product.</div>
              )}
            </div>
          </div>

          {/* Right Column: Checkout Card */}
          <div style={{ width: isMobile ? '100%' : '380px', flexShrink: 0 }}>
            {purchaseSuccess ? (
              <div className="glass-panel pulse-glow-cyan" style={{ padding: '32px 24px', textAlign: 'center', background: 'rgba(59, 183, 94, 0.05)', border: '1px solid rgba(59, 183, 94, 0.2)' }}>
                <div style={{ width: '64px', height: '64px', background: 'rgba(59, 183, 94, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <CheckCircle size={32} color="var(--color-green)" />
                </div>
                <h2 style={{ margin: '0 0 10px', fontSize: '24px' }}>Purchase Successful!</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                  Your social media account details are ready. Please save them securely.
                </p>
                
                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '20px', textAlign: 'left', marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 16px', color: '#ab47fc', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account Credentials</h4>
                  
                  {(() => {
                    const details = purchaseSuccess.account_details;
                    if (!details || (typeof details === 'object' && Object.keys(details).length === 0)) {
                      return <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Order is being processed. Check your order history for delivery updates.</div>;
                    }
                    // If it's an array (multiple items)
                    if (Array.isArray(details)) {
                      return details.map((item, idx) => (
                        <div key={idx} style={{ marginBottom: idx < details.length - 1 ? '16px' : '0', paddingBottom: idx < details.length - 1 ? '16px' : '0', borderBottom: idx < details.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                          {item.item_number && <div style={{ fontSize: '11px', color: '#ab47fc', marginBottom: '8px', fontWeight: 'bold' }}>Item #{item.item_number}</div>}
                          {Object.entries(item).filter(([k]) => k !== 'item_number').map(([key, value]) => (
                            <div key={key} style={{ marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <code style={{ fontSize: '14px', color: '#fff', background: 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: '6px', flex: 1, fontFamily: 'var(--mono)', wordBreak: 'break-all' }}>
                                  {String(value || 'N/A')}
                                </code>
                              </div>
                            </div>
                          ))}
                        </div>
                      ));
                    }
                    // If it's an object with status "processing"
                    if (details.status && details.status !== 'completed') {
                      return <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Order status: <strong style={{ color: '#eab308' }}>{details.status}</strong>. Delivery details will be available shortly.</div>;
                    }
                    // Flat object (single item) — filter out raw_response
                    return Object.entries(details).filter(([k]) => k !== 'raw_response' && k !== 'status').map(([key, value]) => (
                      <div key={key} style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <code style={{ fontSize: '14px', color: '#fff', background: 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: '6px', flex: 1, fontFamily: 'var(--mono)', wordBreak: 'break-all' }}>
                            {String(value || 'N/A')}
                          </code>
                        </div>
                      </div>
                    ));
                  })()}
                  
                  <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.2)', borderRadius: '8px', fontSize: '12px', color: '#eab308' }}>
                    <AlertCircle size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} />
                    We recommend changing the password and securing the account immediately.
                  </div>
                </div>
                
                <button className="btn btn-primary" onClick={closePurchaseModal} style={{ width: '100%', background: '#ab47fc', color: '#fff', border: 'none' }}>Back to Accounts</button>
              </div>
            ) : (
              <div className="glass-panel" style={{ border: '1px solid rgba(171, 71, 252, 0.2)', borderRadius: '20px', padding: '24px', position: 'sticky', top: '24px' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: 'var(--text-primary)' }}>Order Summary</h3>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Availability</span>
                  {selectedLog.stock > 0 ? (
                    <div style={{ fontSize: '13px', color: 'var(--color-green)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                      <span style={{ width: '8px', height: '8px', background: 'var(--color-green)', borderRadius: '50%', display: 'inline-block' }}></span>
                      In Stock ({selectedLog.stock})
                    </div>
                  ) : (
                    <div style={{ fontSize: '13px', color: 'var(--color-red)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                      <span style={{ width: '8px', height: '8px', background: 'var(--color-red)', borderRadius: '50%', display: 'inline-block' }}></span>
                      Out of Stock
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Price per account</span>
                  <span style={{ color: 'var(--text-primary)', fontSize: '16px', fontFamily: 'var(--mono)' }}>{formatCost(currency === 'NGN' ? selectedLog.priceNgn : selectedLog.priceUsd)}</span>
                </div>

                {!selectedLog.isLocal && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Quantity</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-input)', padding: '6px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                      <button 
                        type="button" 
                        onClick={() => setPurchaseQuantity(Math.max(1, purchaseQuantity - 1))}
                        disabled={purchaseLoading || selectedLog.stock <= 0}
                        style={{ width: '32px', height: '32px', background: 'var(--bg-btn-secondary)', border: 'none', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >-</button>
                      <span style={{ fontSize: '16px', width: '24px', textAlign: 'center', fontFamily: 'var(--mono)', fontWeight: 'bold', color: 'var(--text-primary)' }}>{purchaseQuantity}</span>
                      <button 
                        type="button" 
                        onClick={() => setPurchaseQuantity(Math.min(selectedLog.stock, purchaseQuantity + 1))}
                        disabled={purchaseLoading || selectedLog.stock <= 0}
                        style={{ width: '32px', height: '32px', background: 'var(--bg-btn-secondary)', border: 'none', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >+</button>
                    </div>
                  </div>
                )}
                
                <hr style={{ border: 'none', borderTop: '1px dashed rgba(255,255,255,0.1)', margin: '20px 0' }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <span style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 'bold' }}>Total Cost</span>
                  <span style={{ color: '#ab47fc', fontSize: '24px', fontWeight: 'bold', fontFamily: 'var(--mono)' }}>
                    {formatCost((currency === 'NGN' ? selectedLog.priceNgn : selectedLog.priceUsd) * purchaseQuantity)}
                  </span>
                </div>

                <button 
                  className="btn btn-primary" 
                  onClick={handleBuy} 
                  disabled={purchaseLoading || selectedLog.stock <= 0}
                  style={{ width: '100%', padding: '16px', fontSize: '16px', background: 'linear-gradient(90deg, #9333ea 0%, #ab47fc 100%)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '12px' }}
                >
                  {purchaseLoading ? <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '3px', borderTopColor: '#fff' }}></div> : <><ShoppingCart size={18} /> Pay Securely</>}
                </button>
                
                <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <Shield size={12} style={{ display: 'inline', verticalAlign: 'text-top', marginRight: '4px' }} />
                  Secure transaction via wallet balance
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      
      {/* Header Banner */}
      <div className="glass-panel pulse-glow-purple" style={{ 
        background: 'linear-gradient(135deg, rgba(31, 13, 49, 0.9) 0%, rgba(18, 10, 34, 0.9) 100%)',
        border: '1px solid rgba(171, 71, 252, 0.25)', 
        padding: isMobile ? '24px 20px' : '36px', 
        borderRadius: '16px',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: isMobile ? 16 : 0,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '600px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(171, 71, 252, 0.1)', border: '1px solid rgba(171, 71, 252, 0.2)', borderRadius: '20px', width: 'fit-content' }}>
            <Share2 size={14} color="#ab47fc" />
            <span style={{ fontSize: '12px', color: '#ab47fc', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Instant Delivery</span>
          </div>
          <h1 style={{ margin: 0, fontSize: isMobile ? '32px' : '42px', fontFamily: 'var(--font-heading)', background: 'linear-gradient(90deg, #ffffff 0%, #ab47fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800', lineHeight: '1.1' }}>
            Social Media Logs
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', margin: 0, lineHeight: '1.6' }}>
            Buy aged, verified, and high-quality social media accounts instantly. Delivered straight to your dashboard with 100% security.
          </p>
        </div>
        
        {/* Decorative Graphic */}
        {!isMobile && (
          <div style={{ position: 'relative', width: '120px', height: '120px' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '100%', height: '100%', background: 'radial-gradient(circle, rgba(171,71,252,0.2) 0%, rgba(0,0,0,0) 70%)' }}></div>
            <Shield size={80} color="rgba(171, 71, 252, 0.8)" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', filter: 'drop-shadow(0 0 15px rgba(171, 71, 252, 0.5))' }} />
          </div>
        )}
      </div>

      {/* Controls: Search and Categories */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '16px', alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'space-between' }}>
        
        <div style={{ position: 'relative', flex: 1, maxWidth: isMobile ? '100%' : '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search accounts..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '44px', width: '100%', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }} className="hide-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: `1px solid ${activeCategory === cat ? '#ab47fc' : 'rgba(255,255,255,0.1)'}`,
                background: activeCategory === cat ? 'rgba(171,71,252,0.15)' : 'rgba(255,255,255,0.02)',
                color: activeCategory === cat ? '#fff' : 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: activeCategory === cat ? '600' : '400',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px', gap: '16px', minHeight: '260px' }}>
              <div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                  <div className="skeleton-pulse" style={{ width: '40px', height: '40px', borderRadius: '10px' }}></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center' }}>
                    <div className="skeleton-pulse" style={{ width: '60px', height: '10px', borderRadius: '4px' }}></div>
                    <div className="skeleton-pulse" style={{ width: '80px', height: '10px', borderRadius: '4px' }}></div>
                  </div>
                </div>
                <div className="skeleton-pulse" style={{ width: '100%', height: '14px', borderRadius: '4px', marginBottom: '8px' }}></div>
                <div className="skeleton-pulse" style={{ width: '80%', height: '14px', borderRadius: '4px', marginBottom: '12px' }}></div>
                <div className="skeleton-pulse" style={{ width: '100%', height: '40px', borderRadius: '8px' }}></div>
              </div>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div className="skeleton-pulse" style={{ width: '60px', height: '24px', borderRadius: '4px' }}></div>
                 <div className="skeleton-pulse" style={{ width: '100px', height: '32px', borderRadius: '16px' }}></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Search size={24} color="var(--text-muted)" />
          </div>
          <h3 style={{ margin: 0, fontSize: '18px' }}>No accounts found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0, maxWidth: '300px' }}>We couldn't find any accounts matching your current search or category filter.</p>
          <button className="btn btn-secondary" onClick={() => { setSearchQuery(''); setActiveCategory('All'); }} style={{ marginTop: '8px' }}>Clear Filters</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {filteredLogs.map(log => (
            <div key={log.id} className="glass-panel hover-lift" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px', gap: '16px', position: 'relative', overflow: 'hidden' }}>
              
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(171,71,252,0.15) 0%, rgba(0,0,0,0) 70%)', zIndex: 0 }}></div>
              
              <div style={{ zIndex: 1 }}>
                {log.image && (
                  <div style={{ width: '100%', height: '120px', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px', background: 'rgba(255,255,255,0.02)' }}>
                    <img src={log.image} alt={log.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ fontSize: '24px', background: 'rgba(255,255,255,0.05)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {getPlatformIcon(log.category)}
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#ab47fc', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>{log.category}</span>
                      {log.stock > 0 ? (
                        <div style={{ fontSize: '11px', color: 'var(--color-green)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <span style={{ width: '6px', height: '6px', background: 'var(--color-green)', borderRadius: '50%', display: 'inline-block' }}></span>
                          In Stock ({log.stock})
                        </div>
                      ) : (
                        <div style={{ fontSize: '11px', color: 'var(--color-red)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <span style={{ width: '6px', height: '6px', background: 'var(--color-red)', borderRadius: '50%', display: 'inline-block' }}></span>
                          Out of Stock
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <h3 style={{ fontSize: '15px', lineHeight: '1.4', margin: '0 0 8px 0', fontWeight: '600' }}>{log.name}</h3>
                
                {log.description && (
                  <div 
                    className="social-log-html-content"
                    style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-word' }}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(log.description.replace(/color:\s*[^;"]+;?/gi, '').replace(/background(?:-color)?:\s*[^;"]+;?/gi, '')) }}
                  />
                )}
              </div>

              <div style={{ zIndex: 1, marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Price</span>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'var(--mono)' }}>
                    {formatCost(currency === 'NGN' ? log.priceNgn : log.priceUsd)}
                  </div>
                </div>
                <button 
                  className="btn"
                  onClick={() => navigate('/dashboard/social/buy/' + (log.slug || log.id))}
                  disabled={log.stock <= 0}
                  style={{ 
                    background: log.stock > 0 ? 'rgba(171, 71, 252, 0.15)' : 'rgba(255,255,255,0.05)', 
                    color: log.stock > 0 ? '#ab47fc' : 'var(--text-muted)',
                    border: `1px solid ${log.stock > 0 ? 'rgba(171, 71, 252, 0.3)' : 'rgba(255,255,255,0.1)'}`,
                    padding: '8px 16px',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    opacity: log.stock > 0 ? 1 : 0.5
                  }}
                >
                  <ShoppingCart size={14} />
                  View details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SocialMediaLogs;
