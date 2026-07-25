import React, { useContext, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import {
  ClipboardList,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Smartphone,
  Phone,
  Key,
  Share2,
  CreditCard,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  Copy,
  AlertCircle
} from 'lucide-react';

/* ─── helpers ─────────────────────────────────────────────── */

const typeIcon = (type) => {
  const map = {
    Deposit: <ArrowDownLeft size={16} />,
    Purchase: <ArrowUpRight size={16} />,
    Refund: <RotateCcw size={16} />,
    OTP: <Key size={16} />,
    eSIM: <Smartphone size={16} />,
    Rental: <Phone size={16} />,
    SMM: <Share2 size={16} />,
    Subscription: <CreditCard size={16} />,
    'Social Log': <Share2 size={16} />,
  };
  return map[type] || <CreditCard size={16} />;
};

const typeBg = (type) => {
  const map = {
    Deposit: 'rgba(0,255,135,0.12)',
    Refund: 'rgba(0,255,135,0.12)',
    Purchase: 'rgba(0,242,254,0.10)',
    OTP: 'rgba(127,0,255,0.12)',
    eSIM: 'rgba(0,242,254,0.10)',
    Rental: 'rgba(255,185,0,0.12)',
    SMM: 'rgba(255,0,127,0.10)',
    Subscription: 'rgba(0,242,254,0.10)',
    'Social Log': 'rgba(171,71,252,0.12)',
  };
  return map[type] || 'rgba(255,255,255,0.05)';
};

const typeColor = (type) => {
  const map = {
    Deposit: 'var(--color-green)',
    Refund: 'var(--color-green)',
    Purchase: 'var(--color-turquoise)',
    OTP: 'var(--color-violet)',
    eSIM: 'var(--color-turquoise)',
    Rental: 'var(--color-amber)',
    SMM: 'var(--color-pink)',
    Subscription: 'var(--color-turquoise)',
    'Social Log': '#ab47fc',
  };
  return map[type] || 'var(--text-secondary)';
};

const statusBadge = (status) => {
  if (!status) return null;
  const s = String(status).toUpperCase();
  if (s === 'SUCCESS' || s === 'ACTIVE' || s === 'COMPLETED')
    return <span className="badge badge-success" style={{ gap: 4, display: 'inline-flex', alignItems: 'center' }}><CheckCircle2 size={10} /> {status}</span>;
  if (s === 'PENDING' || s === 'IN PROGRESS' || s === 'WAITING')
    return <span className="badge badge-warning" style={{ gap: 4, display: 'inline-flex', alignItems: 'center' }}><Clock size={10} /> {status}</span>;
  if (s === 'FAILED' || s === 'CANCELLED' || s === 'EXPIRED')
    return <span className="badge badge-danger" style={{ gap: 4, display: 'inline-flex', alignItems: 'center' }}><XCircle size={10} /> {status}</span>;
  return <span className="badge badge-info">{status}</span>;
};

const ALL_TYPES = ['All', 'Deposit', 'Purchase', 'Refund', 'OTP', 'eSIM', 'Rental', 'SMM', 'Social Log', 'Subscription'];
const SORT_OPTIONS = [
  { label: 'Newest First', value: 'date_desc' },
  { label: 'Oldest First', value: 'date_asc' },
  { label: 'Highest Amount', value: 'amount_desc' },
  { label: 'Lowest Amount', value: 'amount_asc' },
];

/* ─── main component ────────────────────────────────────────── */

const OrderHistory = () => {
  const {
    transactions = [],
    activeOtps = [],
    rentedNumbers = [],
    activeEsims = [],
    smmOrders = [],
    socialMediaOrders = [],
    formatCost = (v) => `₦${Number(v).toLocaleString()}`,
    reuseOtpNumber,
    checkSocialMediaLogStatus
  } = useContext(AppContext) || {};

  const navigate = useNavigate();

  const isMobile = useIsMobile();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [sortBy, setSortBy] = useState('date_desc');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [page, setPage] = useState(1);
  const [isRebuying, setIsRebuying] = useState(false);
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const PER_PAGE = isMobile ? 5 : 8;

  const handleRefreshSocialLogStatus = async (transId) => {
    setIsRefreshingStatus(true);
    setErrorMsg('');
    const res = await checkSocialMediaLogStatus(transId);
    setIsRefreshingStatus(false);
    if (res.success) {
      // Update selectedOrder details locally in state to reflect the refreshed details immediately
      setSelectedOrder(prev => {
        if (!prev || prev.raw.ologstore_order_id !== transId) return prev;
        return {
          ...prev,
          raw: {
            ...prev.raw,
            status: res.order.status,
            account_details: res.order.account_details
          }
        };
      });
    } else {
      setErrorMsg(res.msg || 'Failed to refresh order status');
    }
  };

  /* Build unified order list from all sources */
  const allOrders = useMemo(() => {
    const orders = [];

    // Wallet transactions (core)
    transactions.forEach(tx => {
      orders.push({
        id: tx.id,
        type: tx.type || 'Purchase',
        method: tx.method || '—',
        amountNgn: tx.amountNgn || 0,
        date: tx.date || '—',
        status: tx.status || 'SUCCESS',
        detail: null,
        rawDate: tx.rawDate || tx.date,
        raw: tx,
      });
    });

    // Active OTPs
    activeOtps.forEach(otp => {
      if (!transactions.find(t => t.id === otp.id)) {
        orders.push({
          id: otp.id || `otp-${Math.random()}`,
          type: 'OTP',
          method: `SMS OTP — ${otp.service || ''}${otp.country ? ` (${otp.country})` : ''}`,
          amountNgn: otp.costNgn || otp.priceNgn || 0,
          date: otp.purchasedAt || otp.date || '—',
          status: otp.status || 'PENDING',
          detail: (otp.number || otp.phoneNumber) ? `Number: ${otp.number || otp.phoneNumber}` : null,
          rawDate: otp.purchasedAt || otp.date,
          raw: otp,
        });
      }
    });

    // Rented Numbers
    rentedNumbers.forEach(rn => {
      orders.push({
        id: rn.id || `rent-${Math.random()}`,
        type: 'Rental',
        method: `Rent Number — ${rn.service || ''}${rn.country ? ` (${rn.country})` : ''}`,
        amountNgn: rn.costNgn || 0,
        date: rn.startDate || '—',
        status: rn.status || 'ACTIVE',
        detail: rn.phoneNumber ? `${rn.flag || ''} ${rn.phoneNumber}` : null,
        rawDate: rn.startDate,
        raw: rn,
      });
    });

    // Active eSIMs
    activeEsims.forEach(esim => {
      orders.push({
        id: esim.id || `esim-${Math.random()}`,
        type: 'eSIM',
        method: `eSIM — ${esim.country || 'Unknown'}`,
        amountNgn: esim.costNgn || 0,
        date: esim.purchasedAt || '—',
        status: esim.status || 'ACTIVE',
        detail: `${esim.usedDataGb ?? 0}GB / ${esim.totalDataGb === 999 ? 'Unlimited' : (esim.totalDataGb ?? '?') + 'GB'} used`,
        rawDate: esim.purchasedAt,
        raw: esim,
      });
    });

    // SMM Orders
    smmOrders.forEach(smm => {
      orders.push({
        id: smm.id || `smm-${Math.random()}`,
        type: 'SMM',
        method: `${smm.platform || 'SMM'} — ${smm.serviceName || ''}`,
        amountNgn: smm.totalCostNgn || 0,
        date: smm.placedAt || '—',
        status: smm.status || 'In Progress',
        detail: smm.targetUrl ? `Target: ${smm.targetUrl}` : null,
        rawDate: smm.placedAt,
        raw: smm,
      });
    });

    // Social Media Log Orders
    socialMediaOrders.forEach(slo => {
      orders.push({
        id: slo.id || `slo-${Math.random()}`,
        type: 'Social Log',
        method: `Social Log — ${slo.plan_name || 'Account'}`,
        amountNgn: slo.cost || 0,
        date: slo.date || '—',
        status: (slo.status || 'completed').toUpperCase(),
        detail: slo.ologstore_order_id ? `Ref: ${slo.ologstore_order_id}` : null,
        rawDate: slo.created_at || slo.date,
        raw: slo,
      });
    });

    return orders;
  }, [transactions, activeOtps, rentedNumbers, activeEsims, smmOrders, socialMediaOrders]);

  /* Filter + search + sort */
  const filtered = useMemo(() => {
    let list = allOrders;

    if (filterType !== 'All') {
      list = list.filter(o => o.type === filterType);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        (o.method || '').toLowerCase().includes(q) ||
        (o.type || '').toLowerCase().includes(q) ||
        (o.status || '').toLowerCase().includes(q) ||
        (o.id || '').toLowerCase().includes(q)
      );
    }

    list = [...list].sort((a, b) => {
      if (sortBy === 'date_asc') return new Date(a.rawDate) - new Date(b.rawDate);
      if (sortBy === 'amount_desc') return b.amountNgn - a.amountNgn;
      if (sortBy === 'amount_asc') return a.amountNgn - b.amountNgn;
      return new Date(b.rawDate) - new Date(a.rawDate); // date_desc default
    });

    return list;
  }, [allOrders, filterType, search, sortBy]);

  /* Pagination */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  /* Summary stats */
  const totalSpent = allOrders
    .filter(o => o.type !== 'Deposit' && o.type !== 'Refund')
    .reduce((s, o) => s + (o.amountNgn || 0), 0);
  const totalDeposited = allOrders
    .filter(o => o.type === 'Deposit')
    .reduce((s, o) => s + (o.amountNgn || 0), 0);
  const totalOrders = allOrders.length;

  /* Export CSV */
  const handleExport = () => {
    const rows = [
      ['ID', 'Type', 'Description', 'Amount (₦)', 'Status', 'Date'],
      ...filtered.map(o => [o.id, o.type, o.method, o.amountNgn, o.status, o.date])
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `starlog_orders_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: 'rgba(0,242,254,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-turquoise)' }}>
            <ClipboardList size={22} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 22 }}>Order History</h2>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>All your transactions and service orders in one place</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => navigate('/dashboard')}>
              Dashboard
            </button>
            <button
              onClick={handleExport}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}
            >
              <Download size={15} />
              Export CSV
            </button>
        </div>
      </div>

      {/* ── Summary Stats Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(auto-fit, minmax(160px, 1fr))', gap: isMobile ? 8 : 16 }}>
        {[
          { label: 'Orders', value: totalOrders, color: 'var(--color-turquoise)', bg: 'rgba(0,242,254,0.1)', icon: <ClipboardList size={isMobile ? 16 : 20} /> },
          { label: 'Deposited', value: formatCost(totalDeposited), color: 'var(--color-green)', bg: 'rgba(0,255,135,0.1)', icon: <ArrowDownLeft size={isMobile ? 16 : 20} /> },
          { label: 'Spent', value: formatCost(totalSpent), color: 'var(--color-pink)', bg: 'rgba(255,0,127,0.1)', icon: <ArrowUpRight size={isMobile ? 16 : 20} /> },
        ].map((s, i) => (
          <div key={i} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: isMobile ? 6 : 10, padding: isMobile ? '10px 10px' : 18, minWidth: 0 }}>
            <div style={{ width: isMobile ? 30 : 44, height: isMobile ? 30 : 44, borderRadius: isMobile ? 8 : 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
              {s.icon}
            </div>
            <div style={{ minWidth: 0, width: '100%' }}>
              <div style={{ fontSize: isMobile ? 10 : 12, color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</div>
              <div style={{ fontSize: isMobile ? 13 : 20, fontWeight: 800, fontFamily: 'var(--font-heading)', color: s.color, wordBreak: 'break-all' }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter & Search Bar ── */}
      <div className="glass-panel" style={{ padding: isMobile ? '12px' : '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Top row: Search + Sort */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              className="form-input"
              style={{ paddingLeft: 36, height: 40, width: '100%' }}
              placeholder="Search orders…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          {/* Sort dropdown */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setShowSortMenu(v => !v)}
              className="btn btn-secondary"
              style={{ fontSize: 12, padding: '5px 12px', height: 40, gap: 6, whiteSpace: 'nowrap' }}
            >
              <Filter size={14} />
              {!isMobile && SORT_OPTIONS.find(s => s.value === sortBy)?.label}
              {showSortMenu ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
            {showSortMenu && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 6px)', zIndex: 200,
                background: 'var(--bg-modal)', border: '1px solid var(--border-color)',
                borderRadius: 12, padding: 8, minWidth: 160,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
              }}>
                {SORT_OPTIONS.map(opt => (
                  <div
                    key={opt.value}
                    onClick={() => { setSortBy(opt.value); setShowSortMenu(false); }}
                    style={{
                      padding: '9px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                      color: sortBy === opt.value ? 'var(--color-turquoise)' : 'var(--text-secondary)',
                      background: sortBy === opt.value ? 'rgba(0,242,254,0.08)' : 'transparent',
                      fontWeight: sortBy === opt.value ? 700 : 500,
                      transition: 'background 0.15s',
                    }}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Type filter pills - always scrollable */}
        <div style={{ 
          display: 'flex', 
          gap: 6, 
          overflowX: 'auto', 
          paddingBottom: 2,
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}>
          {ALL_TYPES.map(t => (
            <button
              key={t}
              onClick={() => { setFilterType(t); setPage(1); }}
              style={{
                padding: '5px 10px',
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                border: filterType === t ? `1px solid ${typeColor(t)}` : '1px solid var(--border-color)',
                background: filterType === t ? typeBg(t) : 'transparent',
                color: filterType === t ? typeColor(t) : 'var(--text-secondary)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {t !== 'All' && typeIcon(t)}
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Order List ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

        {paginated.length === 0 ? (
          <div className="glass-panel" style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>
            <ClipboardList size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>No orders found</p>
            <p style={{ margin: '6px 0 0', fontSize: 13 }}>
              {filterType !== 'All' || search ? 'Try clearing your filters.' : 'Your orders will appear here once you make a purchase.'}
            </p>
          </div>
        ) : paginated.map((order) => {
          const isCredit = order.type === 'Deposit' || order.type === 'Refund';
          const color = typeColor(order.type);
          const bg = typeBg(order.type);

          return (
            <div
              key={order.id}
              className="glass-panel interactive"
              style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
              onClick={() => setSelectedOrder(order)}
            >
              {/* Main row */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 14, padding: isMobile ? '12px 14px' : '14px 20px',
                flexWrap: 'wrap'
              }}>

                {/* Type icon */}
                <div style={{
                  width: 40, height: 40, borderRadius: 12, background: bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color, flexShrink: 0
                }}>
                  {typeIcon(order.type)}
                </div>

                {/* Description */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {order.method}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {order.id} · {order.date}
                  </div>
                </div>

                {/* Status badge */}
                <div style={{ flexShrink: 0 }}>
                  {statusBadge(order.status)}
                </div>

                {/* Amount */}
                <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 90 }}>
                  <div style={{
                    fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-heading)',
                    color: isCredit ? 'var(--color-green)' : 'var(--text-primary)',
                  }}>
                    {isCredit ? '+' : order.amountNgn > 0 ? '−' : ''}{formatCost(order.amountNgn)}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    ≈ ${(order.amountNgn / 1350).toFixed(2)} USD
                  </div>
                </div>

                {/* Action details Chevron */}
                <div style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                  <ChevronRight size={16} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Pagination ── */}
      {filtered.length > PER_PAGE && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            style={{ padding: '6px 14px', fontSize: 13 }}
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              style={{
                width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 700,
                background: page === p ? 'var(--color-turquoise)' : 'rgba(255,255,255,0.05)',
                color: page === p ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.2s',
              }}
            >
              {p}
            </button>
          ))}
          <button
            className="btn btn-secondary"
            style={{ padding: '6px 14px', fontSize: 13 }}
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next →
          </button>
        </div>
      )}

      {/* Footer count */}
      <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
        Showing {paginated.length} of {filtered.length} orders
        {filterType !== 'All' || search ? ` (filtered from ${allOrders.length} total)` : ''}
      </div>

      {/* ── Order Detail Modal ── */}
      {selectedOrder && createPortal(
        <div className="modal-overlay" style={{ display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? 0 : '20px' }} onClick={() => setSelectedOrder(null)}>
          <div 
            className={`modal-content ${isMobile ? 'animate-slide-up-mobile' : 'animate-slide-in'}`}
            onClick={e => e.stopPropagation()} 
            style={{ 
              width: '100%',
              maxWidth: '480px', 
              border: `1px solid ${typeColor(selectedOrder.type)}`, 
              boxShadow: `0 20px 50px rgba(0,0,0,0.6), 0 0 30px ${typeBg(selectedOrder.type)}`,
              padding: isMobile ? '24px 16px 40px 16px' : '24px',
              maxHeight: isMobile ? '85vh' : '90vh',
              overflowY: 'auto',
              borderRadius: isMobile ? '24px 24px 0 0' : '20px',
              margin: isMobile ? '0' : 'auto'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: typeColor(selectedOrder.type) }}>
                {selectedOrder.type} Receipt
              </span>
              <button 
                onClick={() => setSelectedOrder(null)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold' }}
              >
                &times;
              </button>
            </div>

            {/* Receipt Body */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
              
              {/* Glowing Icon Wrapper */}
              <div style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '16px', 
                background: typeBg(selectedOrder.type), 
                color: typeColor(selectedOrder.type), 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: `0 0 20px ${typeBg(selectedOrder.type)}`
              }}>
                {React.cloneElement(typeIcon(selectedOrder.type), { size: 28 })}
              </div>

              {/* Amount Display */}
              <div>
                <h3 style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'var(--font-heading)', margin: '4px 0', color: 'var(--text-primary)' }}>
                  {formatCost(selectedOrder.amountNgn)}
                </h3>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  ≈ ${(selectedOrder.amountNgn / 1350).toFixed(2)} USD
                </span>
              </div>

              {/* Status Indicator */}
              <div style={{ margin: '4px 0' }}>
                {statusBadge(selectedOrder.status)}
              </div>

              {/* Digital Receipt Separation Line */}
              <div style={{ 
                width: '100%', 
                height: '1px', 
                borderTop: '2px dashed var(--border-color)', 
                margin: '12px 0',
                position: 'relative'
              }}>
                <div style={{ position: 'absolute', left: isMobile ? '-21px' : '-29px', top: '-6px', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--bg-modal)' }}></div>
                <div style={{ position: 'absolute', right: isMobile ? '-21px' : '-29px', top: '-6px', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--bg-modal)' }}></div>
              </div>

              {/* Structured Metadata Breakdown */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left', fontSize: '13px' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Transaction ID</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <code style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{selectedOrder.id}</code>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(selectedOrder.id);
                      }}
                      style={{ background: 'transparent', border: 'none', color: 'var(--color-turquoise)', cursor: 'pointer' }}
                      title="Copy Transaction ID"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Order Description</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600', textAlign: 'right' }}>{selectedOrder.method}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Created Date</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{selectedOrder.date}</span>
                </div>

                {/* Conditional Fields based on order type */}
                {selectedOrder.type === 'SMM' && selectedOrder.raw && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Social Platform</span>
                      <span style={{ color: 'var(--color-pink)', fontWeight: '700' }}>{selectedOrder.raw.platform}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Campaign Quantity</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{Number(selectedOrder.raw.quantity).toLocaleString()} Units</span>
                    </div>
                    {selectedOrder.raw.targetUrl && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Destination Link</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <a href={selectedOrder.raw.targetUrl} target="_blank" rel="noreferrer" style={{ wordBreak: 'break-all', fontSize: '12px', flex: 1 }}>
                            {selectedOrder.raw.targetUrl}
                          </a>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(selectedOrder.raw.targetUrl);
                            }}
                            style={{ background: 'transparent', border: 'none', color: 'var(--color-turquoise)', cursor: 'pointer' }}
                            title="Copy Target Link"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {selectedOrder.type === 'OTP' && selectedOrder.raw && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Phone Number</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{selectedOrder.raw.number || 'Pending Assignment'}</strong>
                        {selectedOrder.raw.number && (
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(selectedOrder.raw.number);
                            }}
                            style={{ background: 'transparent', border: 'none', color: 'var(--color-turquoise)', cursor: 'pointer' }}
                            title="Copy Phone Number"
                          >
                            <Copy size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Target App</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{selectedOrder.raw.service} ({selectedOrder.raw.country || 'Any'})</span>
                    </div>
                    {selectedOrder.raw.code && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(127,0,255,0.05)', border: '1px dashed var(--color-violet)', borderRadius: '10px', margin: '6px 0' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>SMS Verification Code</span>
                        <span style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'monospace', letterSpacing: '4px', color: 'var(--color-violet)', textShadow: '0 0 10px rgba(127,0,255,0.3)' }}>
                          {selectedOrder.raw.code}
                        </span>
                      </div>
                    )}
                    {selectedOrder.raw.smsMessage && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Raw Carrier SMS</span>
                        <div style={{ background: 'var(--bg-sms)', padding: '10px', borderRadius: '6px', fontSize: '12px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                          {selectedOrder.raw.smsMessage}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {selectedOrder.type === 'Rental' && selectedOrder.raw && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Rented Number</span>
                      <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{selectedOrder.raw.phoneNumber}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Duration Term</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{selectedOrder.raw.durationDays} Days</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Expiration Date</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{selectedOrder.raw.endDate}</span>
                    </div>
                  </>
                )}

                {selectedOrder.type === 'eSIM' && selectedOrder.raw && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Destination</span>
                      <span style={{ color: 'var(--color-turquoise)', fontWeight: '700' }}>{selectedOrder.raw.country}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>eSIM Profile ICCID</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <code style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{selectedOrder.raw.iccid || '8904903200001234567'}</code>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(selectedOrder.raw.iccid || '8904903200001234567');
                          }}
                          style={{ background: 'transparent', border: 'none', color: 'var(--color-turquoise)', cursor: 'pointer' }}
                          title="Copy ICCID"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    </div>
                    {/* Simulated QR Code Scan Interface */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '16px', background: '#fff', borderRadius: '12px', margin: '6px 0' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', padding: '10px', border: '2px solid #000', borderRadius: '8px' }}>
                        <div style={{ width: '120px', height: '120px', background: 'radial-gradient(circle, #000 20%, transparent 20%), radial-gradient(circle, #000 20%, transparent 20%)', backgroundSize: '16px 16px', backgroundPosition: '0 0, 8px 8px', opacity: 0.85 }}></div>
                      </div>
                      <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Scan to Install eSIM Profile</span>
                    </div>
                  </>
                )}

                {selectedOrder.type === 'Social Log' && selectedOrder.raw && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Product</span>
                      <span style={{ color: '#ab47fc', fontWeight: '700' }}>{selectedOrder.raw.plan_name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Quantity</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{selectedOrder.raw.quantity || 1} Account(s)</span>
                    </div>
                    {selectedOrder.raw.ologstore_order_id && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Provider Ref</span>
                        <code style={{ fontFamily: 'monospace', color: 'var(--text-primary)', fontSize: '12px' }}>{selectedOrder.raw.ologstore_order_id}</code>
                      </div>
                    )}
                    {selectedOrder.raw.account_details && (() => {
                      const details = selectedOrder.raw.account_details;
                      const renderKV = (obj) => Object.entries(obj).filter(([k]) => !['raw_response', 'status', 'item_number'].includes(k)).map(([key, value]) => (
                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                          <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <code style={{ fontFamily: 'monospace', color: 'var(--text-primary)', fontSize: '13px', wordBreak: 'break-all', textAlign: 'right', maxWidth: '200px' }}>{String(value || 'N/A')}</code>
                            <button 
                              onClick={() => { navigator.clipboard.writeText(String(value || '')); }}
                              style={{ background: 'transparent', border: 'none', color: 'var(--color-turquoise)', cursor: 'pointer', flexShrink: 0 }}
                              title={`Copy ${key}`}
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                        </div>
                      ));
                      if (Array.isArray(details)) {
                        return details.map((item, idx) => (
                          <div key={idx}>
                            {item.item_number && <div style={{ fontSize: '11px', color: '#ab47fc', fontWeight: 'bold', marginBottom: '4px', marginTop: idx > 0 ? '8px' : 0 }}>Item #{item.item_number}</div>}
                            {renderKV(item)}
                          </div>
                        ));
                      }
                      if (details.status && details.status !== 'completed') {
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px', background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: '8px', marginTop: '8px' }}>
                            <div style={{ fontSize: '13px', color: '#eab308', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Clock size={14} />
                              <span>Order status: {details.status}. Delivery pending.</span>
                            </div>
                            <button
                              onClick={() => handleRefreshSocialLogStatus(selectedOrder.raw.ologstore_order_id)}
                              disabled={isRefreshingStatus}
                              className="btn btn-secondary btn-sm"
                              style={{ width: '100%', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px' }}
                            >
                              {isRefreshingStatus ? (
                                <>
                                  <span className="spinner-loader" style={{ width: 12, height: 12 }}></span>
                                  <span>Refreshing status...</span>
                                </>
                              ) : (
                                <>
                                  <RefreshCw size={12} style={{ animation: 'spin 2s linear infinite' }} />
                                  <span>Check Delivery Status</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      }
                      const kvElements = renderKV(details);
                      if (kvElements.length === 0) {
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px', background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: '8px', marginTop: '8px' }}>
                            <div style={{ fontSize: '13px', color: '#eab308', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Clock size={14} />
                              <span>No credentials delivered yet. Click below to refresh.</span>
                            </div>
                            <button
                              onClick={() => handleRefreshSocialLogStatus(selectedOrder.raw.ologstore_order_id)}
                              disabled={isRefreshingStatus}
                              className="btn btn-secondary btn-sm"
                              style={{ width: '100%', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px' }}
                            >
                              {isRefreshingStatus ? (
                                <>
                                  <span className="spinner-loader" style={{ width: 12, height: 12 }}></span>
                                  <span>Checking status...</span>
                                </>
                              ) : (
                                <>
                                  <RefreshCw size={12} style={{ animation: 'spin 2s linear infinite' }} />
                                  <span>Check Delivery Status</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      }
                      return kvElements;
                    })()}
                  </>
                )}

              </div>
            </div>

            {selectedOrder.type === 'OTP' && selectedOrder.raw && selectedOrder.raw.server === 'server3' && (
              <button
                className="btn btn-accent"
                style={{ width: '100%', padding: '12px', fontSize: '14px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={async () => {
                  setErrorMsg('');
                  setIsRebuying(true);
                  const result = await reuseOtpNumber(selectedOrder.raw.number || selectedOrder.raw.phoneNumber, selectedOrder.raw.service, selectedOrder.raw.country, selectedOrder.raw.flag);
                  setIsRebuying(false);
                  if (result.success) {
                    setSelectedOrder(null);
                  } else {
                    setErrorMsg(result.msg);
                  }
                }}
                disabled={isRebuying}
              >
                {isRebuying ? (
                  <>
                    <span className="spinner-loader" style={{ width: 16, height: 16 }}></span>
                    <span>Rebuying number…</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={15} />
                    <span>Rebuy / Reuse Number</span>
                  </>
                )}
              </button>
            )}

            {errorMsg && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.3)', borderRadius: '8px', color: '#ff453a', fontSize: '12px', marginBottom: '12px', width: '100%', textAlign: 'left' }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button 
                onClick={() => {
                  window.print();
                }}
                className="btn btn-secondary" 
                style={{ flex: 1, padding: '10px', fontSize: '13px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Download size={14} />
                Print Invoice
              </button>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="btn btn-primary" 
                style={{ flex: 1, padding: '10px', fontSize: '13px' }}
              >
                Close Receipt
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default OrderHistory;
