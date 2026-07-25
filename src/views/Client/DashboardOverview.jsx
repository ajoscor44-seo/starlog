import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import {
  CreditCard, Smartphone, Key, RefreshCw, Share2, User, ShieldCheck,
  Clock, TrendingUp, Zap, ClipboardList, ArrowRight, Copy, Check
} from 'lucide-react';

const DashboardOverview = () => {
  const navigate = useNavigate();
  const context = useContext(AppContext) || {};
  const {
    walletBalance = 0,
    activeOtps = [],
    rentedNumbers = [],
    activeEsims = [],
    smmOrders = [],
    transactions = [],
    formatCost = (v) => v,
  } = context;

  const isMobile = useIsMobile();

  const [copiedId, setCopiedId] = useState(null);
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const recentOtps = activeOtps.slice(0, 5);

  const activeEsimsCount = activeEsims.filter(e => e?.status === 'ACTIVE').length;
  const pendingSmmCount = smmOrders.filter(o => o?.status === 'In Progress').length;
  const recentTransactions = transactions.slice(0, isMobile ? 3 : 4);

  const stats = [
    { label: 'Balance', value: formatCost(walletBalance), icon: CreditCard, color: 'var(--color-turquoise)', bg: 'rgba(0,210,255,0.12)', tab: 'wallet' },
    { label: 'Active OTP Leases', value: activeOtps.length, icon: Key, color: 'var(--color-pink)', bg: 'rgba(236,72,153,0.12)', tab: 'otp' },
  ];

  const quickLinks = [
    { label: 'OTP Verification', icon: Key, tab: 'otp' },
    { label: 'Social Logs', icon: ShieldCheck, tab: 'social' },
    { label: 'Fund Wallet', icon: CreditCard, tab: 'wallet' },
    { label: 'Order History', icon: ClipboardList, tab: 'orders' },
  ];

  /* ── Mobile Layout ── */
  if (isMobile) {
    return (
      <div className="animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Balance Hero Card */}
        <div
          onClick={() => navigate('/dashboard/wallet')}
          style={{
            background: 'linear-gradient(135deg, rgba(0,242,254,0.18) 0%, rgba(127,0,255,0.18) 100%)',
            border: '1px solid rgba(0,242,254,0.25)',
            borderRadius: 20,
            padding: '24px 20px',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(0,242,254,0.07)' }} />
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            💳 Wallet Balance
          </div>
          <div style={{ fontSize: 34, fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--color-turquoise)', letterSpacing: '-0.02em' }}>
            {formatCost(walletBalance)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            Tap to fund <ArrowRight size={12} />
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {stats.slice(1).map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                onClick={() => navigate(`/dashboard/${s.tab}`)}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 14,
                  padding: '14px 10px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', color: s.color }}>
                  <Icon size={18} />
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-heading)', color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, fontWeight: 600 }}>{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Quick Launch – 3×2 grid */}
        <div className="glass-panel" style={{ padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={14} style={{ color: 'var(--color-turquoise)' }} />
            Quick Launch
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {quickLinks.map((ql, i) => {
              const Icon = ql.icon;
              return (
                <button
                  key={i}
                  onClick={() => ql.ext ? window.open(ql.url, '_blank') : navigate(`/dashboard/${ql.tab}`)}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 12,
                    padding: '12px 6px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    color: 'var(--text-primary)',
                    transition: 'all 0.2s',
                  }}
                >
                  <Icon size={20} style={{ color: 'var(--color-turquoise)' }} />
                  <span style={{ fontSize: 11, fontWeight: 600 }}>{ql.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="glass-panel" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <CreditCard size={14} style={{ color: 'var(--color-pink)' }} />
              Recent Activity
            </div>
            <button
              onClick={() => navigate('/dashboard/orders')}
              style={{ background: 'none', border: 'none', color: 'var(--color-turquoise)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              See All <ArrowRight size={12} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentTransactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 13 }}>No transactions yet</div>
            ) : recentTransactions.map(tx => (
              <div key={tx.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 12px', borderRadius: 10,
                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)'
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{tx.method}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{tx.date}</div>
                </div>
                <div style={{
                  fontSize: 14, fontWeight: 800, fontFamily: 'var(--font-heading)',
                  color: tx.type === 'Deposit' || tx.type === 'Refund' ? 'var(--color-green)' : 'var(--text-primary)'
                }}>
                  {tx.type === 'Deposit' || tx.type === 'Refund' ? '+' : '−'}{formatCost(tx.amountNgn)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent SMS Verifications */}
        <div className="glass-panel" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Key size={14} style={{ color: 'var(--color-turquoise)' }} />
              Recent OTP Verifications
            </div>
            <button
              onClick={() => navigate('/dashboard/otp')}
              style={{ background: 'none', border: 'none', color: 'var(--color-turquoise)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              Get New Code <ArrowRight size={12} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentOtps.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 13 }}>No OTP orders yet</div>
            ) : recentOtps.map(otp => (
              <div key={otp.id} style={{
                padding: '12px', borderRadius: 12,
                background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)',
                display: 'flex', flexDirection: 'column', gap: 8
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '14px' }}>{otp.flag || '🏳️'}</span>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{otp.service}</span>
                  </div>
                  <span className={`badge ${
                    otp.status === 'COMPLETED' ? 'badge-success' : 
                    otp.status === 'PENDING' ? 'badge-warning' : 'badge-danger'
                  }`} style={{ fontSize: '9px' }}>
                    {otp.status}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-secondary)' }}>
                    {otp.phoneNumber}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {otp.otpCode ? (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 8, 
                        background: 'rgba(0, 255, 135, 0.08)', 
                        border: '1px dashed var(--color-green)', 
                        padding: '2px 8px', 
                        borderRadius: '6px' 
                      }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: '800', color: 'var(--color-green)' }}>
                          {otp.otpCode}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(otp.otpCode, otp.id);
                          }}
                          style={{ background: 'none', border: 'none', padding: 0, color: 'var(--color-green)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          title="Copy Code"
                        >
                          {copiedId === otp.id ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {otp.status === 'PENDING' ? 'Waiting for SMS...' : 'No code'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Assets */}
        {activeEsims.length > 0 && (
          <div className="glass-panel" style={{ padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={14} style={{ color: 'var(--color-violet)' }} />
              Active Assets
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activeEsims.slice(0, 2).map(esim => (
                <div key={esim.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(0,242,254,0.05)', borderRadius: 10, border: '1px solid rgba(0,242,254,0.15)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Smartphone size={16} style={{ color: 'var(--color-turquoise)' }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>eSIM · {esim.country}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{esim.usedDataGb}GB / {esim.totalDataGb === 999 ? '∞' : esim.totalDataGb + 'GB'}</div>
                    </div>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: 10 }}>Active</span>
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



      <div className="stat-grid">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="glass-panel stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/dashboard/${stat.tab}`)}>
              <div className="stat-icon-wrapper" style={{ backgroundColor: stat.bg }}>
                <Icon size={24} style={{ color: stat.color }} />
              </div>
              <div>
                <div className="stat-lbl">{stat.label}</div>
                <div className="stat-val">{stat.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          <div className="glass-panel">
            <h3 style={{ fontSize: 18, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={18} style={{ color: 'var(--color-turquoise)' }} />
              Quick Launch Terminal
            </h3>
            <div className="quick-links">
              {quickLinks.map((ql, i) => {
                const Icon = ql.icon;
                return (
                  <div key={i} className="glass-panel interactive quick-link-card"
                    onClick={() => ql.ext ? window.open(ql.url, '_blank') : navigate(`/dashboard/${ql.tab}`)}>
                    <Icon size={24} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{ql.label}</span>
                  </div>
                );
              })}
            </div>
          </div>


        </div>

        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 18, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CreditCard size={18} style={{ color: 'var(--color-pink)' }} />
              Recent Transactions
            </h3>
            <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => navigate('/dashboard/orders')}>
              View All
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentTransactions.map(tx => (
              <div key={tx.id} style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border-color)', background: 'var(--bg-recent-tx)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{tx.method}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{tx.date}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: tx.type === 'Deposit' || tx.type === 'Refund' ? 'var(--color-green)' : '#ff453a', fontFamily: 'var(--font-heading)' }}>
                    {tx.type === 'Deposit' || tx.type === 'Refund' ? '+' : '−'}{formatCost(tx.amountNgn)}
                  </div>
                  <span style={{ fontSize: 9, opacity: 0.7 }} className={`badge ${tx.status === 'SUCCESS' ? 'badge-success' : 'badge-warning'}`}>{tx.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent OTP Verifications Section (Desktop) ── */}
      <div className="glass-panel" style={{ marginTop: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 18, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Key size={18} style={{ color: 'var(--color-turquoise)' }} />
            Recent OTP Verifications
          </h3>
          <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => navigate('/dashboard/otp')}>
            Get New Code
          </button>
        </div>
        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Phone Number</th>
                <th>Country</th>
                <th>Status</th>
                <th>Verification Code</th>
                <th>SMS Message</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOtps.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-secondary)' }}>
                    No OTP verifications found.
                  </td>
                </tr>
              ) : (
                recentOtps.map((otp) => (
                  <tr key={otp.id}>
                    <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{otp.service}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '13px' }}>{otp.phoneNumber}</td>
                    <td>
                      <span style={{ marginRight: '6px' }}>{otp.flag}</span>
                      <span>{otp.country}</span>
                    </td>
                    <td>
                      <span className={`badge ${
                        otp.status === 'COMPLETED' ? 'badge-success' : 
                        otp.status === 'PENDING' ? 'badge-warning' : 'badge-danger'
                      }`} style={{ fontSize: '9px' }}>
                        {otp.status}
                      </span>
                    </td>
                    <td>
                      {otp.otpCode ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0, 255, 135, 0.08)', border: '1px dashed var(--color-green)', padding: '2px 8px', borderRadius: '6px' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: '800', color: 'var(--color-green)' }}>{otp.otpCode}</span>
                          <button
                            onClick={() => handleCopy(otp.otpCode, otp.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--color-green)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                            title="Copy Code"
                          >
                            {copiedId === otp.id ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                          {otp.status === 'PENDING' ? 'Waiting for SMS...' : '—'}
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: '12px', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={otp.smsText || ''}>
                      {otp.smsText || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td style={{ fontSize: '12px' }}>{otp.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
