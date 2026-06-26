import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Layers, Share2, AlertCircle, Check } from 'lucide-react';

const SmmPanel = () => {
  const { smmServices, smmOrders, submitSmmOrder, formatCost } = useContext(AppContext);
  const isMobile = useIsMobile();
  
  // State for form
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [quantity, setQuantity] = useState(1000);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  
  const [smmPage, setSmmPage] = useState(1);
  const SMM_PER_PAGE = 10;

  // Extract unique platforms
  const platforms = [...new Set(smmServices.map(s => s.platform))];

  // Set initial category
  useEffect(() => {
    if (platforms.length > 0 && !selectedCategory) {
      setSelectedCategory(platforms[0]);
    }
  }, [platforms, selectedCategory]);

  const filteredServices = smmServices.filter(s => s.platform === selectedCategory);

  // Set initial service
  useEffect(() => {
    if (filteredServices.length > 0 && (!selectedServiceId || !filteredServices.find(s => s.id === selectedServiceId))) {
      setSelectedServiceId(filteredServices[0].id);
    }
  }, [filteredServices, selectedServiceId]);

  const selectedService = smmServices.find(s => s.id === selectedServiceId);

  // Sync min quantity when service changes
  useEffect(() => {
    if (selectedService) {
      setQuantity(selectedService.min || 100);
    }
  }, [selectedService]);

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setOrderSuccess(false);

    if (!selectedService) return;
    if (!targetUrl.trim()) { setErrorMsg('Please enter a destination URL.'); return; }
    
    const minLimit = selectedService.min || 100;
    const maxLimit = selectedService.max || 100000;
    if (quantity < minLimit) { setErrorMsg(`Minimum quantity is ${minLimit.toLocaleString()} units.`); return; }
    if (quantity > maxLimit) { setErrorMsg(`Maximum quantity is ${maxLimit.toLocaleString()} units.`); return; }

    setIsLaunching(true);
    const result = await submitSmmOrder(selectedService.id, targetUrl, quantity);
    setIsLaunching(false);

    if (result.success) {
      setOrderSuccess(true);
      setTimeout(() => {
        setOrderSuccess(false);
        setTargetUrl('');
        setQuantity(selectedService.min || 100);
      }, 2500);
    } else {
      setErrorMsg(result.msg);
    }
  };

  const totalCost = selectedService ? Math.round(selectedService.pricePerThousandNgn * (quantity / 1000)) : 0;

  return (
    <div className="animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : 24 }}>

      {/* Intro Banner */}
      <div className="glass-panel intro-banner" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h3 style={{ fontSize: isMobile ? 16 : 20, marginBottom: 0, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-heading)' }}>
          <Share2 size={18} style={{ color: 'var(--color-turquoise)' }} />
          SMM Growth Panel
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: isMobile ? 12 : 14, lineHeight: 1.6, margin: 0 }}>
          Boost your online visibility with curated social media packages at wholesale rates. Select a platform and service to get started.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: isMobile ? 16 : 24 }}>
        <form onSubmit={handleOrderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
            {/* Category Dropdown */}
            <div>
              <label className="form-label">Select Platform</label>
              <select 
                className="form-input" 
                value={selectedCategory} 
                onChange={e => setSelectedCategory(e.target.value)}
                style={{ cursor: 'pointer' }}
              >
                {platforms.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Service Dropdown */}
            <div>
              <label className="form-label">Select Service</label>
              <select 
                className="form-input" 
                value={selectedServiceId} 
                onChange={e => setSelectedServiceId(e.target.value)}
                style={{ cursor: 'pointer' }}
              >
                {filteredServices.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} - {formatCost(s.pricePerThousandNgn)} / 1K
                  </option>
                ))}
              </select>
              {selectedService?.description && (
                <div style={{ fontSize: 11, color: 'var(--color-turquoise)', marginTop: 6, lineHeight: 1.4 }}>
                  {selectedService.description}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: 16 }}>
            {/* Target URL */}
            <div>
              <label className="form-label">Target Link</label>
              <input
                type="text" 
                className="form-input"
                placeholder="https://"
                value={targetUrl}
                onChange={e => setTargetUrl(e.target.value)}
                required
              />
            </div>

            {/* Quantity */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label className="form-label" style={{ margin: 0 }}>Quantity</label>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Min: {selectedService?.min?.toLocaleString()}
                </span>
              </div>
              <input
                type="number" 
                className="form-input"
                min={selectedService?.min || 100}
                max={selectedService?.max || 100000}
                step="10"
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                required
              />
            </div>
          </div>

          {/* Dynamic Price Summary & Submit */}
          <div style={{
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '16px', 
            background: 'var(--bg-input)',
            border: '1px solid var(--border-color)', 
            borderRadius: 10,
            marginTop: 8
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Calculated Price</span>
              <strong style={{ color: 'var(--color-green)', fontFamily: 'var(--font-heading)', fontSize: 20 }}>
                {formatCost(totalCost)}
              </strong>
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={isLaunching}>
              {isLaunching ? (
                <><span className="spinner-loader" style={{ width: 14, height: 14 }} /> Launching...</>
              ) : (
                'Place Order'
              )}
            </button>
          </div>

          {errorMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'rgba(255,59,48,0.12)', border: '1px solid rgba(255,59,48,0.25)', borderRadius: 8, color: '#ff453a', fontSize: 12 }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {orderSuccess && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.2)', borderRadius: 8, color: 'var(--color-green)', fontSize: 13, justifyContent: 'center' }}>
              <Check size={16} />
              <span>Order successfully placed!</span>
            </div>
          )}
        </form>
      </div>

      {/* ── ORDER LOGS TABLE ── */}
      <div className="glass-panel" style={{ padding: isMobile ? 14 : 24 }}>
        <h3 style={{ fontSize: isMobile ? 15 : 18, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-heading)' }}>
          <Layers size={16} style={{ color: 'var(--color-turquoise)' }} />
          Order Logs
        </h3>
        {smmOrders.length === 0 ? (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)', borderRadius: 10, fontSize: 13 }}>
            No orders deployed yet.
          </div>
        ) : (
          <div className="smm-orders-table-wrap custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th className="smm-col-id">Order ID</th>
                  <th className="smm-col-date">Date</th>
                  <th>Platform</th>
                  <th>Service</th>
                  <th>Quantity</th>
                  <th className="smm-col-dest">Target Link</th>
                  <th>Cost</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const totalSmmPages = Math.max(1, Math.ceil(smmOrders.length / SMM_PER_PAGE));
                  const paginatedSmm = smmOrders.slice((smmPage - 1) * SMM_PER_PAGE, smmPage * SMM_PER_PAGE);
                  return (
                    <>
                      {paginatedSmm.map(ord => (
                        <tr key={ord.id}>
                          <td className="smm-col-id" style={{ fontFamily: 'var(--font-heading)', fontSize: 11, color: 'var(--text-muted)' }}>{ord.id}</td>
                          <td className="smm-col-date" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{ord.date}</td>
                          <td>
                            <span className="badge" style={{ fontSize: 9 }}>
                              {ord.platform}
                            </span>
                          </td>
                          <td style={{ fontSize: 12, fontWeight: 600, minWidth: 120 }}>{ord.serviceName}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>{ord.quantity.toLocaleString()}</td>
                          <td className="smm-col-dest">
                            <a href={ord.targetUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, display: 'inline-block', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ord.targetUrl}</a>
                          </td>
                          <td style={{ whiteSpace: 'nowrap', color: 'var(--color-green)', fontWeight: 700 }}>{formatCost(ord.costNgn)}</td>
                          <td>
                            <span className={`badge ${ord.status === 'Completed' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: 10 }}>{ord.status}</span>
                          </td>
                        </tr>
                      ))}
                      {smmOrders.length > SMM_PER_PAGE && (
                        <tr>
                          <td colSpan="8">
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '10px 0' }}>
                              <button type="button" className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} disabled={smmPage === 1} onClick={() => setSmmPage(p => p - 1)}>Prev</button>
                              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Page {smmPage} of {totalSmmPages}</span>
                              <button type="button" className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} disabled={smmPage === totalSmmPages} onClick={() => setSmmPage(p => p + 1)}>Next</button>
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

export default SmmPanel;
