import React, { useContext, useEffect, useState } from 'react';
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
  
  const [selectedLog, setSelectedLog] = useState(null);
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
    // Cost calculation
    const totalCost = selectedLog.price * purchaseQuantity;
    
    const res = await buySocialMediaLog(selectedLog.id, selectedLog.name, purchaseQuantity, totalCost);
    setPurchaseLoading(false);
    
    if (res.success) {
      setPurchaseSuccess(res.order);
    } else {
      alert("Purchase failed: " + res.msg);
    }
  };

  const closePurchaseModal = () => {
    setSelectedLog(null);
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: '16px' }}>
          <div className="spinner" style={{ borderTopColor: '#ab47fc' }}></div>
          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading available accounts...</span>
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
                    style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                    dangerouslySetInnerHTML={{ __html: log.description }}
                  />
                )}
              </div>

              <div style={{ zIndex: 1, marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Price</span>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', fontFamily: 'var(--mono)' }}>
                    {formatCost(currency === 'NGN' ? log.price * 1150 : log.price)}
                  </div>
                </div>
                <button 
                  className="btn"
                  onClick={() => setSelectedLog(log)}
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
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Purchase Modal */}
      {selectedLog && createPortal(
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content animate-slide-in" style={{ width: '100%', maxWidth: '440px', padding: isMobile ? '20px 16px' : '28px', borderRadius: isMobile ? '20px 20px 0 0' : '16px', border: '1px solid rgba(171, 71, 252, 0.3)', background: '#0f0a18' }}>
            
            {purchaseSuccess ? (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{ width: '64px', height: '64px', background: 'rgba(59, 183, 94, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <CheckCircle size={32} color="var(--color-green)" />
                </div>
                <h2 style={{ margin: '0 0 10px', fontSize: '24px' }}>Purchase Successful!</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                  Your social media account details are ready. Please save them securely.
                </p>
                
                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '20px', textAlign: 'left', marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 16px', color: '#ab47fc', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account Credentials</h4>
                  
                  {Object.entries(purchaseSuccess.account_details || {}).map(([key, value]) => (
                    <div key={key} style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{key.replace('_', ' ')}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <code style={{ fontSize: '14px', color: '#fff', background: 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: '6px', flex: 1, fontFamily: 'var(--mono)', wordBreak: 'break-all' }}>
                          {value?.toString() || 'N/A'}
                        </code>
                      </div>
                    </div>
                  ))}
                  
                  <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.2)', borderRadius: '8px', fontSize: '12px', color: '#eab308' }}>
                    <AlertCircle size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} />
                    We recommend changing the password and securing the account immediately.
                  </div>
                </div>
                
                <button className="btn btn-primary" onClick={closePurchaseModal} style={{ width: '100%', background: '#ab47fc', color: '#fff', border: 'none' }}>Done</button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: '#ab47fc', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Confirm Purchase</span>
                    <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', lineHeight: '1.3' }}>{selectedLog.name}</h3>
                  </div>
                  <div style={{ fontSize: '24px', background: 'rgba(255,255,255,0.05)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {getPlatformIcon(selectedLog.category)}
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Price per account</span>
                    <span style={{ color: '#fff', fontSize: '15px', fontFamily: 'var(--mono)' }}>{formatCost(currency === 'NGN' ? selectedLog.price * 1150 : selectedLog.price)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Quantity</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <button 
                        type="button" 
                        onClick={() => setPurchaseQuantity(Math.max(1, purchaseQuantity - 1))}
                        style={{ width: '28px', height: '28px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >-</button>
                      <span style={{ fontSize: '14px', width: '20px', textAlign: 'center', fontFamily: 'var(--mono)' }}>{purchaseQuantity}</span>
                      <button 
                        type="button" 
                        onClick={() => setPurchaseQuantity(Math.min(selectedLog.stock, purchaseQuantity + 1))}
                        style={{ width: '28px', height: '28px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >+</button>
                    </div>
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px dashed rgba(255,255,255,0.1)', margin: '16px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>Total Cost</span>
                    <span style={{ color: '#ab47fc', fontSize: '20px', fontWeight: 'bold', fontFamily: 'var(--mono)' }}>
                      {formatCost((currency === 'NGN' ? selectedLog.price * 1150 : selectedLog.price) * purchaseQuantity)}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    className="btn btn-secondary" 
                    onClick={closePurchaseModal} 
                    style={{ flex: 1 }}
                    disabled={purchaseLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleBuy} 
                    disabled={purchaseLoading}
                    style={{ flex: 2, background: 'linear-gradient(90deg, #9333ea 0%, #ab47fc 100%)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    {purchaseLoading ? <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', borderTopColor: '#fff' }}></div> : <><ShoppingCart size={16} /> Pay Securely</>}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default SocialMediaLogs;
