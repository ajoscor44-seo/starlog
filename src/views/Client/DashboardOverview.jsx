import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import {
  CreditCard, Smartphone, Key, RefreshCw, Share2, User,
  Clock, TrendingUp, Zap, ClipboardList, ArrowRight
} from 'lucide-react';

const DashboardOverview = ({ setActiveTab }) => {
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

  const activeEsimsCount = activeEsims.filter(e => e?.status === 'ACTIVE').length;
  const pendingSmmCount = smmOrders.filter(o => o?.status === 'In Progress').length;
  const recentTransactions = transactions.slice(0, isMobile ? 3 : 4);

  const stats = [
    { label: 'Balance', value: formatCost(walletBalance), icon: CreditCard, color: 'var(--color-turquoise)', bg: 'rgba(0,242,254,0.12)', tab: 'wallet' },
    { label: 'eSIMs', value: activeEsimsCount, icon: Smartphone, color: 'var(--color-violet)', bg: 'rgba(127,0,255,0.12)', tab: 'esim' },
    { label: 'Reuse Num', value: activeOtps.length, icon: RefreshCw, color: 'var(--color-amber)', bg: 'rgba(255,185,0,0.12)', tab: 'reuse' },
    { label: 'SMM', value: smmOrders.length, icon: Share2, color: 'var(--color-green)', bg: 'rgba(0,255,135,0.12)', tab: 'smm' },
  ];

  const quickLinks = [
    { label: 'Accounts', icon: User, tab: null, url: 'https://www.discountzar.com/marketplace', ext: true },
    { label: 'OTP Code', icon: Key, tab: 'otp' },
    { label: 'Reuse #', icon: RefreshCw, tab: 'reuse' },
    { label: 'eSIM', icon: Smartphone, tab: 'esim' },
    { label: 'SMM', icon: Share2, tab: 'smm' },
    { label: 'Orders', icon: ClipboardList, tab: 'orders' },
  ];

  /* ── Mobile Layout ── */
  if (isMobile) {
    return (
      <div className="animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Balance Hero Card */}
        <div
          onClick={() => setActiveTab('wallet')}
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
                onClick={() => setActiveTab(s.tab)}
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
                  onClick={() => ql.ext ? window.open(ql.url, '_blank') : setActiveTab(ql.tab)}
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
              onClick={() => setActiveTab('orders')}
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
            <div key={idx} className="glass-panel stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab(stat.tab)}>
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
                    onClick={() => ql.ext ? window.open(ql.url, '_blank') : setActiveTab(ql.tab)}>
                    <Icon size={24} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{ql.label === 'Accounts' ? 'Accounts Shop' : ql.label === 'OTP Code' ? 'Get OTP Code' : ql.label === 'Reuse #' ? 'Reuse Numbers' : ql.label === 'Orders' ? 'Order History' : ql.label === 'SMM' ? 'SMM Boost' : ql.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-panel">
            <h3 style={{ fontSize: 18, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={18} style={{ color: 'var(--color-violet)' }} />
              Active Assets
            </h3>
            {activeEsims.length === 0 ? (
              <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)', borderRadius: 12 }}>
                No active eSIM profiles configured yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {activeEsims.slice(0, 2).map(esim => (
                  <div key={esim.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Smartphone size={18} style={{ color: 'var(--color-turquoise)' }} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>eSIM - {esim.country}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Used: {esim.usedDataGb}GB / {esim.totalDataGb === 999 ? 'Unlimited' : esim.totalDataGb + 'GB'}</div>
                      </div>
                    </div>
                    <span className="badge badge-success">Active</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 18, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CreditCard size={18} style={{ color: 'var(--color-pink)' }} />
              Recent Transactions
            </h3>
            <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => setActiveTab('orders')}>
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
    </div>
  );
};

export default DashboardOverview;
