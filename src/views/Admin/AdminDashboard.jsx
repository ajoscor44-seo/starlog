import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { supabase } from '../../supabase';
import { 
  ShieldCheck, MessageSquare, Plus, Save, DollarSign, Wallet, 
  CheckCircle, AlertCircle, Users, List, BarChart3, Settings, 
  TrendingUp, RefreshCw, Send, ArrowUpRight, Search, FileText 
} from 'lucide-react';

const AdminDashboard = () => {
  const { 
    walletBalance, 
    activeOtps, 
    rentedNumbers, 
    subscriptions, 
    otpServices, 
    esimPackages, 
    smmServices,
    transactions,
    activeEsims,
    smmOrders,
    accountSubscriptions,
    simulateSmsDelivery,
    updatePrices,
    setManualWallet,
    simulatePocketFiDeposit,
    user,
    profile,
    formatCost,
    profitMarkup,
    updateProfitMarkup,
    adminFetchAllTransactions,
    adminFetchAllProfiles,
    adminUpdateProfileBalance
  } = useContext(AppContext);

  const isMobile = useIsMobile();

  // Dashboard Sub-navigation Tabs: 'overview', 'users', 'transactions', 'sms', 'pricing'
  const [adminTab, setAdminTab] = useState('overview');

  // Database-synced states
  const [dbProfiles, setDbProfiles] = useState([]);
  const [dbTransactions, setDbTransactions] = useState([]);
  const [isLoadingDb, setIsLoadingDb] = useState(false);

  const fetchAdminData = async () => {
    setIsLoadingDb(true);
    try {
      const profilesRes = await adminFetchAllProfiles();
      if (profilesRes.success) {
        setDbProfiles(profilesRes.data);
      }
      const txRes = await adminFetchAllTransactions();
      if (txRes.success) {
        setDbTransactions(txRes.data);
      }
    } catch (e) {
      console.error("Failed to load admin db data:", e);
    } finally {
      setIsLoadingDb(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [adminTab]);

  // Combine real database-linked profiles
  const allUsers = dbProfiles.length > 0
    ? dbProfiles.map(p => ({
        id: p.id,
        full_name: p.id === user?.id ? `${p.username || p.full_name || 'Admin'} (You / Admin)` : p.username || p.full_name || 'Unnamed Client',
        phone: p.phone || 'N/A',
        email: p.email || 'N/A',
        wallet_balance: Number(p.wallet_balance),
        isReal: true
      }))
    : (profile && profile.full_name ? [{
        id: user?.id || 'real-admin',
        full_name: `${profile.username || profile.full_name} (You / Admin)`,
        phone: profile.phone || 'N/A',
        email: user?.email || 'N/A',
        wallet_balance: walletBalance,
        isReal: true
      }] : []);

  const [userSearchQuery, setUserSearchQuery] = useState('');

  const filteredUsers = allUsers.filter(u => 
    (u.full_name || '').toLowerCase().includes(userSearchQuery.toLowerCase()) || 
    (u.phone || '').includes(userSearchQuery) ||
    (u.email || '').toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.id.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  // User Management State
  const [selectedUser, setSelectedUser] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState('set'); // set, add, deduct
  const [adjustResult, setAdjustResult] = useState('');
  const [simDepositAmount, setSimDepositAmount] = useState(5000);
  const [simDepositSuccess, setSimDepositSuccess] = useState(false);

  // SMS Simulator Form State
  const activeOtpTargets = activeOtps.filter(o => o.status === 'WAITING');
  const activeRentalTargets = rentedNumbers.filter(r => r.status === 'ACTIVE');
  const allTargets = [
    ...activeOtpTargets.map(o => ({ type: 'OTP Session', number: o.phoneNumber, label: `${o.service} Temp OTP - ${o.phoneNumber}` })),
    ...activeRentalTargets.map(r => ({ type: 'Rental line', number: r.phoneNumber, label: `${r.flag} Rented Line (${r.service}) - ${r.phoneNumber}` }))
  ];

  const [selectedNumber, setSelectedNumber] = useState(allTargets[0]?.number || '');
  const [smsText, setSmsText] = useState('Your verification code is: 582910');
  const [simResult, setSimResult] = useState({ success: null, msg: '' });

  // Price Editors state
  const [pricesList, setPricesList] = useState({});
  const [pricingCategory, setPricingCategory] = useState('subs'); // subs, otp, esim, smm
  const [savePriceResult, setSavePriceResult] = useState('');

  // Transaction Logs state
  const [searchTx, setSearchTx] = useState('');
  const [filterTxType, setFilterTxType] = useState('ALL');

  const allTransactions = [
    ...dbTransactions.map(t => ({
      ...t,
      isReal: true
    }))
  ];

  // Auto-select first number if target list changes
  useEffect(() => {
    if (allTargets.length > 0 && !selectedNumber) {
      setSelectedNumber(allTargets[0].number);
    }
  }, [allTargets, selectedNumber]);

  // Keep selected user state synced when balances or user list change
  useEffect(() => {
    if (allUsers.length > 0) {
      if (!selectedUser) {
        setSelectedUser(allUsers[0]);
      } else {
        const updated = allUsers.find(u => u.id === selectedUser.id);
        if (updated) {
          setSelectedUser(updated);
        } else {
          setSelectedUser(allUsers[0]);
        }
      }
    }
  }, [allUsers, walletBalance, mockUsers, dbProfiles]);

  const handleSimulateSms = (e) => {
    e.preventDefault();
    setSimResult({ success: null, msg: '' });
    if (!selectedNumber) {
      setSimResult({ success: false, msg: 'No active numbers selected' });
      return;
    }
    if (!smsText.trim()) {
      setSimResult({ success: false, msg: 'SMS text cannot be empty' });
      return;
    }

    const result = simulateSmsDelivery(selectedNumber, smsText);
    if (result.success) {
      setSimResult({ success: true, msg: result.msg });
      setSmsText('Your verification code is: ');
    } else {
      setSimResult({ success: false, msg: result.msg });
    }
  };

  const handlePriceChange = (category, id, val) => {
    setPricesList(prev => ({
      ...prev,
      [`${category}-${id}`]: val
    }));
  };

  const handleSavePrice = (category, id) => {
    const val = pricesList[`${category}-${id}`];
    if (val === undefined || isNaN(val) || val === '') return;
    updatePrices(category, id, Number(val));
    setSavePriceResult(`Updated rate for ${id} successfully!`);
    setTimeout(() => setSavePriceResult(''), 3000);
  };

  const handleUserBalanceAdjust = async (e) => {
    e.preventDefault();
    setAdjustResult('');
    if (!selectedUser) return;
    const amountVal = Number(adjustAmount);
    if (isNaN(amountVal) || amountVal < 0) {
      setAdjustResult('Invalid amount entered.');
      return;
    }

    let targetNewBalance = amountVal;
    if (adjustType === 'add') targetNewBalance = selectedUser.wallet_balance + amountVal;
    else if (adjustType === 'deduct') targetNewBalance = Math.max(0, selectedUser.wallet_balance - amountVal);

    if (selectedUser.isReal) {
      // Sync real user balance to Database & AppContext
      const res = await adminUpdateProfileBalance(selectedUser.id, targetNewBalance);
      if (!res.success) {
        setAdjustResult(`Database update failed: ${res.msg}`);
        return;
      }
      if (selectedUser.id === user?.id) {
        setManualWallet(targetNewBalance);
      }
      setAdjustResult(`Database wallet updated: ${formatCost(targetNewBalance)}`);
      await fetchAdminData();
    } else {
      // Update local mock user list state
      setMockUsers(curr => curr.map(u => u.id === selectedUser.id ? { ...u, wallet_balance: targetNewBalance } : u));
      setAdjustResult(`Mock client wallet adjusted: ${formatCost(targetNewBalance)}`);
    }
    setAdjustAmount('');
  };

  const handleSimulateWebhookDeposit = async (e) => {
    e.preventDefault();
    setSimDepositSuccess(false);
    if (!selectedUser) return;
    
    if (selectedUser.isReal) {
      const ref = `dep-sim-${Math.floor(100000 + Math.random() * 900000)}`;
      const { data, error } = await supabase.rpc('process_deposit', {
        p_tx_id: ref,
        p_user_id: selectedUser.id,
        p_amount: Number(simDepositAmount),
        p_method: 'PocketFi Webhook (Simulated)'
      });
      if (error) {
        setAdjustResult(`Simulation failed: ${error.message}`);
      } else {
        setSimDepositSuccess(true);
        await fetchAdminData();
      }
    } else {
      // Simulate locally for mock account
      const ref = `sim-tx-${Math.floor(100000 + Math.random() * 900000)}`;
      setMockUsers(curr => curr.map(u => u.id === selectedUser.id ? { ...u, wallet_balance: u.wallet_balance + simDepositAmount } : u));
      
      const newTx = {
        id: ref,
        user_name: selectedUser.full_name,
        amountNgn: simDepositAmount,
        type: 'Deposit',
        method: 'PocketFi Webhook (Simulated)',
        date: new Date().toLocaleString(),
        status: 'SUCCESS'
      };
      setSimulatedTxLogs(prev => [newTx, ...prev]);
      setSimDepositSuccess(true);
    }
  };

  // Stats Computations
  const totalClientCash = allUsers.reduce((sum, u) => sum + u.wallet_balance, 0);
  const totalLedgerTransactions = dbTransactions.length;
  
  // Detailed Database Stats
  const liveUserCount = dbProfiles.length;
  const livePurchaseCount = dbTransactions.filter(t => t.type === 'Purchase').length;
  const liveDepositCount = dbTransactions.filter(t => t.type === 'Deposit').length;
  const totalDepositedReal = dbTransactions
    .filter(t => t.type === 'Deposit')
    .reduce((sum, t) => sum + Number(t.amountNgn || 0), 0);

  // Compute estimated platform profit from live database transactions
  const estimatedProfit = dbTransactions.reduce((acc, tx) => {
    if (tx.type !== 'Purchase') return acc;
    const methodLower = (tx.method || '').toLowerCase();
    const amt = Number(tx.amountNgn || tx.amount || 0);
    let markup = 30; // default subscription profit markup
    if (methodLower.includes('otp')) markup = profitMarkup.otp || 50;
    else if (methodLower.includes('esim')) markup = profitMarkup.esim || 40;
    else if (methodLower.includes('smm')) markup = profitMarkup.smm || 50;
    else markup = profitMarkup.subs || 30;
    
    const profit = amt - (amt / (1 + markup / 100));
    return acc + profit;
  }, 0);

  return (
    <div className="animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Dashboard Top Header */}
      <div className="glass-panel" style={{ 
        background: 'linear-gradient(135deg, rgba(255, 0, 127, 0.08) 0%, rgba(0, 242, 254, 0.08) 100%)', 
        border: '1px solid rgba(255, 0, 127, 0.25)',
        padding: '24px',
        borderRadius: '16px'
      }}>
        <h3 style={{ fontSize: '22px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={26} style={{ color: 'var(--color-pink)' }} />
          Admin System Terminal
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
          Manage global settings, adjust client account values, search transaction history, and dispatch incoming SMS codes.
        </p>
      </div>

      {/* Admin Tab Menu */}
      <div className="tabs-container" style={{ margin: 0, overflowX: isMobile ? 'auto' : 'visible' }}>
        <button className={`tab-btn ${adminTab === 'overview' ? 'active' : ''}`} onClick={() => setAdminTab('overview')}>
          <BarChart3 size={16} style={{ marginRight: '6px' }} /> Overview
        </button>
        <button className={`tab-btn ${adminTab === 'users' ? 'active' : ''}`} onClick={() => setAdminTab('users')}>
          <Users size={16} style={{ marginRight: '6px' }} /> Users Panel
        </button>
        <button className={`tab-btn ${adminTab === 'transactions' ? 'active' : ''}`} onClick={() => setAdminTab('transactions')}>
          <List size={16} style={{ marginRight: '6px' }} /> Transaction Logs
        </button>
        <button className={`tab-btn ${adminTab === 'sms' ? 'active' : ''}`} onClick={() => setAdminTab('sms')}>
          <MessageSquare size={16} style={{ marginRight: '6px' }} /> SMS Carrier
        </button>
        <button className={`tab-btn ${adminTab === 'pricing' ? 'active' : ''}`} onClick={() => setAdminTab('pricing')}>
          <Settings size={16} style={{ marginRight: '6px' }} /> Pricing Catalogs
        </button>
      </div>

      {/* Tab Panel: OVERVIEW */}
      {adminTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Card Grid */}
          <div className="stat-grid" style={{ gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '20px' }}>
            <div className="glass-panel stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(59, 183, 94, 0.1)' }}>
                <DollarSign size={24} style={{ color: 'var(--color-green)' }} />
              </div>
              <div>
                <div className="stat-lbl">System Cash Pool</div>
                <div className="stat-val">{formatCost(totalClientCash)}</div>
              </div>
            </div>

            <div className="glass-panel stat-card" style={{ background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.05) 0%, rgba(0,0,0,0) 100%)' }}>
              <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(0, 242, 254, 0.1)' }}>
                <TrendingUp size={24} style={{ color: 'var(--color-turquoise)' }} />
              </div>
              <div>
                <div className="stat-lbl">Est. Platform Profit</div>
                <div className="stat-val" style={{ color: 'var(--color-turquoise)' }}>{formatCost(estimatedProfit)}</div>
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(255, 0, 127, 0.1)' }}>
                <Users size={24} style={{ color: 'var(--color-pink)' }} />
              </div>
              <div>
                <div className="stat-lbl">Live DB Clients</div>
                <div className="stat-val">{liveUserCount} Users</div>
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(127, 0, 255, 0.1)' }}>
                <ArrowUpRight size={24} style={{ color: 'var(--color-violet)' }} />
              </div>
              <div>
                <div className="stat-lbl">System Orders</div>
                <div className="stat-val">{totalLedgerTransactions} total</div>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="glass-panel">
            <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Active System Services Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '24px' }}>
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>eSIM Travel Packages</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-turquoise)', marginTop: '8px' }}>{activeEsims?.length || 0} active profiles</div>
              </div>
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>SMM Reseller Tasks</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-pink)', marginTop: '8px' }}>{smmOrders?.length || 0} pending API jobs</div>
              </div>
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Shared Premium Accounts</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-violet)', marginTop: '8px' }}>{accountSubscriptions?.length || 0} leased screens</div>
              </div>
            </div>
          </div>

          {/* Detailed Ledger Stats */}
          <div className="glass-panel">
            <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Database Ledger Detailed Breakdown</h3>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '24px' }}>
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Live Purchases Volume</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#ff453a', marginTop: '8px' }}>{livePurchaseCount} transactions</div>
              </div>
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Live Deposits Volume</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-green)', marginTop: '8px' }}>{liveDepositCount} transactions</div>
              </div>
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total Cash Deposited (Live)</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-green)', marginTop: '8px' }}>{formatCost(totalDepositedReal)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Panel: USERS */}
      {adminTab === 'users' && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.3fr 1fr', gap: '24px' }}>
          {/* User selector list */}
          <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px', flexDirection: isMobile ? 'column' : 'row' }}>
              <h3 style={{ fontSize: '18px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} style={{ color: 'var(--color-turquoise)' }} /> Registered Clients
              </h3>
              
              <div style={{ display: 'flex', gap: '8px', width: isMobile ? '100%' : 'auto', alignItems: 'center' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px', height: '34px' }} 
                  onClick={fetchAdminData}
                  disabled={isLoadingDb}
                >
                  <RefreshCw size={14} className={isLoadingDb ? 'spin-slow' : ''} />
                  {isMobile ? '' : 'Refresh'}
                </button>
                <div style={{ position: 'relative', width: isMobile ? '100%' : '180px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Search client..." 
                    style={{ paddingLeft: '28px', fontSize: '13px', height: '34px' }} 
                    value={userSearchQuery} 
                    onChange={(e) => setUserSearchQuery(e.target.value)} 
                  />
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredUsers.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No users found matching query.
                </div>
              ) : filteredUsers.map((u) => (
                <div 
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className={`glass-panel interactive ${selectedUser?.id === u.id ? 'active' : ''}`}
                  style={{ 
                    padding: '14px', 
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: selectedUser?.id === u.id ? '1px solid var(--color-turquoise)' : '1px solid var(--border-color)',
                    background: selectedUser?.id === u.id ? 'rgba(0, 242, 254, 0.04)' : 'rgba(255, 255, 255, 0.01)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)' }}>{u.full_name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Email: {u.email} • Phone: {u.phone} • ID: {u.id.substring(0, 8)}...</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '800', fontSize: '16px', color: 'var(--color-turquoise)' }}>{formatCost(u.wallet_balance)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User management tools */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Wallet editor */}
            {selectedUser && (
              <div className="glass-panel">
                <h3 style={{ fontSize: '16px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Wallet size={16} style={{ color: 'var(--color-pink)' }} />
                  Adjust Balance: {selectedUser.full_name.split(' ')[0]}
                </h3>

                <form onSubmit={handleUserBalanceAdjust} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label className="form-label">Adjustment Type</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[['set', 'Set Absolute'], ['add', 'Add Credit'], ['deduct', 'Deduct Credit']].map(([type, label]) => (
                        <button
                          key={type}
                          type="button"
                          className={`btn ${adjustType === type ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ flex: 1, padding: '8px 4px', fontSize: '12px' }}
                          onClick={() => setAdjustType(type)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="form-label" htmlFor="adjust-val">Amount (₦)</label>
                    <input 
                      id="adjust-val"
                      type="number" 
                      className="form-input" 
                      placeholder="e.g. 5000"
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(e.target.value)}
                    />
                  </div>

                  {adjustResult && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px', background: 'rgba(0,242,254,0.08)', border: '1px solid rgba(0,242,254,0.15)', borderRadius: '8px', color: 'var(--color-turquoise)', fontSize: '12px' }}>
                      <CheckCircle size={14} />
                      <span>{adjustResult}</span>
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary" style={{ background: 'var(--color-pink)', border: 'none' }}>
                    Save Wallet Change
                  </button>
                </form>
              </div>
            )}

            {/* Bank Deposit Webhook simulator */}
            {selectedUser && (
              <div className="glass-panel">
                <h3 style={{ fontSize: '16px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <TrendingUp size={16} style={{ color: 'var(--color-green)' }} />
                  PocketFi Webhook Simulator
                </h3>

                <form onSubmit={handleSimulateWebhookDeposit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label className="form-label" htmlFor="webhook-sim-val">Simulated Transfer Amount (₦)</label>
                    <input 
                      id="webhook-sim-val"
                      type="number" 
                      className="form-input" 
                      value={simDepositAmount}
                      onChange={(e) => setSimDepositAmount(Number(e.target.value))}
                    />
                  </div>

                  {simDepositSuccess && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px', background: 'rgba(59, 183, 94, 0.1)', border: '1px solid rgba(59, 183, 94, 0.25)', borderRadius: '8px', color: 'var(--color-green)', fontSize: '12px' }}>
                      <CheckCircle size={14} />
                      <span>Simulated webhook successfully processed!</span>
                    </div>
                  )}

                  <button type="submit" className="btn btn-accent" onClick={() => setSimDepositSuccess(false)}>
                    Trigger Webhook Deposit
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Tab Panel: TRANSACTIONS */}
      {adminTab === 'transactions' && (
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '16px', flexDirection: isMobile ? 'column' : 'row' }}>
            <h3 style={{ fontSize: '18px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} style={{ color: 'var(--color-turquoise)' }} /> Global Audit Transaction Ledger
            </h3>

            {/* Filter controls */}
            <div style={{ display: 'flex', gap: '8px', width: isMobile ? '100%' : 'auto' }}>
              <select className="form-select" style={{ fontSize: '13px', padding: '6px 12px' }} value={filterTxType} onChange={(e) => setFilterTxType(e.target.value)}>
                <option value="ALL">All Types</option>
                <option value="Deposit">Deposits</option>
                <option value="Purchase">Purchases</option>
                <option value="Refund">Refunds</option>
              </select>
              
              <div style={{ position: 'relative', width: isMobile ? '100%' : '180px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search user..." 
                  style={{ paddingLeft: '28px', fontSize: '13px', height: '34px' }} 
                  value={searchTx} 
                  onChange={(e) => setSearchTx(e.target.value)} 
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>TX Reference</th>
                  <th>Client Name</th>
                  <th>Timestamp</th>
                  <th>Type</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {allTransactions
                  .filter(tx => filterTxType === 'ALL' || tx.type === filterTxType)
                  .filter(tx => tx.user_name.toLowerCase().includes(searchTx.toLowerCase()) || tx.id.toLowerCase().includes(searchTx.toLowerCase()))
                  .map((tx) => (
                    <tr key={tx.id}>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: '12px' }}>{tx.id}</td>
                      <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{tx.user_name}</td>
                      <td style={{ fontSize: '12px' }}>{tx.date || new Date(tx.created_at).toLocaleString()}</td>
                      <td>
                        <span className={`badge ${
                          tx.type === 'Deposit' ? 'badge-success' : 
                          tx.type === 'Refund' ? 'badge-info' : 'badge-danger'
                        }`} style={{ fontSize: '9px' }}>
                          {tx.type}
                        </span>
                      </td>
                      <td style={{ fontSize: '13px' }}>{tx.method}</td>
                      <td style={{ 
                        fontFamily: 'var(--font-heading)', 
                        fontWeight: '700', 
                        color: tx.type === 'Deposit' || tx.type === 'Refund' ? 'var(--color-green)' : '#ff453a'
                      }}>
                        {tx.type === 'Deposit' || tx.type === 'Refund' ? '+' : '-'}{formatCost(tx.amountNgn || tx.amount)}
                      </td>
                      <td>
                        <span className="badge badge-success" style={{ fontSize: '9px' }}>{tx.status}</span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Panel: SMS CARRIER SIMULATOR */}
      {adminTab === 'sms' && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.3fr 1fr', gap: '24px' }}>
          <div className="glass-panel">
            <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} style={{ color: 'var(--color-pink)' }} /> Admin SMS Carrier Simulator
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
              Dispatch simulated SMS codes directly to users who are waiting for temporary OTP verification numbers or rented numbers.
            </p>

            {allTargets.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)', borderRadius: '10px', fontSize: '13px' }}>
                No active mobile numbers (OTP waiting lines or Rented numbers) are currently provisioned. Open OTP or Rental view as a client to order a number first!
              </div>
            ) : (
              <form onSubmit={handleSimulateSms} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="form-label">Target Mobile Line</label>
                  <select 
                    className="form-select" 
                    value={selectedNumber}
                    onChange={(e) => setSelectedNumber(e.target.value)}
                  >
                    {allTargets.map((t, idx) => (
                      <option key={idx} value={t.number}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label" htmlFor="sms-body">SMS Body Message</label>
                  <textarea 
                    id="sms-body"
                    className="form-textarea" 
                    rows="3"
                    placeholder="Enter verification text (e.g. Your verification code is: 582910)"
                    value={smsText}
                    onChange={(e) => setSmsText(e.target.value)}
                  />
                </div>

                {simResult.success !== null && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    padding: '10px', 
                    background: simResult.success ? 'rgba(0, 255, 135, 0.1)' : 'rgba(255, 59, 48, 0.15)',
                    border: simResult.success ? '1px solid rgba(0, 255, 135, 0.2)' : '1px solid rgba(255, 59, 48, 0.2)',
                    borderRadius: '8px', 
                    color: simResult.success ? 'var(--color-green)' : '#ff453a',
                    fontSize: '13px'
                  }}>
                    {simResult.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    <span>{simResult.msg}</span>
                  </div>
                )}

                <button type="submit" className="btn btn-primary" style={{ background: 'var(--color-pink)', border: 'none', width: '100%' }}>
                  Simulate SMS Delivery
                </button>
              </form>
            )}
          </div>

          <div className="glass-panel" style={{ height: 'fit-content' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Carrier Routing Rules</h3>
            <ul style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px', margin: 0 }}>
              <li>Simulator checks both temporary OTP lists and active long-term rental lines.</li>
              <li>A 4 to 8 digit code matching <code>\b\d{'{4,8}'}\b</code> will be automatically parsed and extracted to trigger instant OTP resolution on the client UI.</li>
              <li>If no numbers show up in the simulator, go to <strong>SMS OTP (Temp)</strong> or <strong>Rent Number</strong> page to buy one first.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab Panel: PRICING CATALOGS */}
      {adminTab === 'pricing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Sliders for Profit markup percentage */}
          <div className="glass-panel" style={{ 
            background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.03) 0%, rgba(255, 0, 127, 0.03) 100%)', 
            border: '1px solid rgba(0, 242, 254, 0.15)',
            padding: '20px',
            borderRadius: '12px'
          }}>
            <h3 style={{ fontSize: '16px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} style={{ color: 'var(--color-turquoise)' }} /> Category-specific Profit Markup (%)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '20px' }}>
              {[
                ['subs', 'Shared Subscriptions', 'subs'],
                ['otp', 'SMS Verification', 'otp'],
                ['esim', 'eSIM Packages', 'esim'],
                ['smm', 'SMM Booster Tasks', 'smm']
              ].map(([key, label, cat]) => (
                <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{label} Markup</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input 
                      type="range" 
                      min="5" 
                      max="150" 
                      step="5"
                      value={profitMarkup[cat] || 0}
                      onChange={(e) => updateProfitMarkup(cat, Number(e.target.value))}
                      style={{ flex: 1, accentColor: 'var(--color-turquoise)' }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: '800', minWidth: '40px', textAlign: 'right', color: 'var(--color-turquoise)' }}>
                      {profitMarkup[cat]}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 3fr', gap: '24px' }}>
            {/* Category Selectors */}
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: 'fit-content' }}>
              <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Catalogs</h3>
              {[
                ['subs', 'Subscriptions'],
                ['otp', 'OTP verifications'],
                ['esim', 'eSIM Regions'],
                ['smm', 'SMM Refillers']
              ].map(([cat, label]) => (
                <button
                  key={cat}
                  type="button"
                  className={`btn ${pricingCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ justifyContent: 'flex-start', textAlign: 'left', padding: '10px 14px' }}
                  onClick={() => setPricingCategory(cat)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Pricing Manager details */}
            <div className="glass-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', margin: 0 }}>Adjust {pricingCategory === 'subs' ? 'Subscriptions' : pricingCategory === 'otp' ? 'OTP Services' : pricingCategory === 'esim' ? 'eSIM Packages' : 'SMM Booster'} Rates</h3>
                {savePriceResult && (
                  <span style={{ fontSize: '12px', color: 'var(--color-green)', fontWeight: 'bold' }}>{savePriceResult}</span>
                )}
              </div>

              {/* Subscriptions Rate Manager */}
              {pricingCategory === 'subs' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {subscriptions.map((sub) => {
                    const mapKey = `subs-${sub.id}`;
                    const val = pricesList[mapKey] !== undefined ? pricesList[mapKey] : sub.priceNgn;
                    const markupVal = profitMarkup.subs || 0;
                    const baseCost = Math.round(sub.priceNgn / (1 + markupVal / 100));
                    return (
                      <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{sub.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Base Cost: {formatCost(baseCost)} (+{markupVal}% profit)</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>₦</span>
                          <input 
                            type="number" 
                            className="form-input" 
                            style={{ width: '100px', padding: '6px 10px', fontSize: '13px' }}
                            value={val}
                            onChange={(e) => handlePriceChange('subs', sub.id, e.target.value)}
                          />
                          <button className="btn btn-secondary" style={{ padding: '6px' }} onClick={() => handleSavePrice('subs', sub.id)} title="Save Override Rate">
                            <Save size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* OTP Services Rate Manager */}
              {pricingCategory === 'otp' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {otpServices.map((otp) => {
                    const mapKey = `otp-${otp.id}`;
                    const val = pricesList[mapKey] !== undefined ? pricesList[mapKey] : otp.priceNgn;
                    const markupVal = profitMarkup.otp || 0;
                    const baseCost = Math.round(otp.priceNgn / (1 + markupVal / 100));
                    return (
                      <div key={otp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{otp.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Base Cost: {formatCost(baseCost)} (+{markupVal}% profit)</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>₦</span>
                          <input 
                            type="number" 
                            className="form-input" 
                            style={{ width: '100px', padding: '6px 10px', fontSize: '13px' }}
                            value={val}
                            onChange={(e) => handlePriceChange('otp', otp.id, e.target.value)}
                          />
                          <button className="btn btn-secondary" style={{ padding: '6px' }} onClick={() => handleSavePrice('otp', otp.id)} title="Save Override Rate">
                            <Save size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* eSIM Packages Rate Manager */}
              {pricingCategory === 'esim' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {esimPackages.map((pkg) => {
                    const mapKey = `esim-${pkg.id}`;
                    const val = pricesList[mapKey] !== undefined ? pricesList[mapKey] : pkg.priceNgn;
                    const markupVal = profitMarkup.esim || 0;
                    const baseCost = Math.round(pkg.priceNgn / (1 + markupVal / 100));
                    return (
                      <div key={pkg.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{pkg.country} ({pkg.dataGb === 999 ? 'Unlimited' : `${pkg.dataGb}GB`})</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Base Cost: {formatCost(baseCost)} (+{markupVal}% profit)</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>₦</span>
                          <input 
                            type="number" 
                            className="form-input" 
                            style={{ width: '100px', padding: '6px 10px', fontSize: '13px' }}
                            value={val}
                            onChange={(e) => handlePriceChange('esim', pkg.id, e.target.value)}
                          />
                          <button className="btn btn-secondary" style={{ padding: '6px' }} onClick={() => handleSavePrice('esim', pkg.id)} title="Save Override Rate">
                            <Save size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* SMM Booster Rate Manager */}
              {pricingCategory === 'smm' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {smmServices.map((smm) => {
                    const mapKey = `smm-${smm.id}`;
                    const val = pricesList[mapKey] !== undefined ? pricesList[mapKey] : smm.pricePerThousandNgn;
                    const markupVal = profitMarkup.smm || 0;
                    const baseCost = Math.round(smm.pricePerThousandNgn / (1 + markupVal / 100));
                    return (
                      <div key={smm.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: isMobile ? '150px' : '350px' }} title={smm.name}>{smm.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Base API Cost: {formatCost(baseCost)}/k (+{markupVal}% profit)</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>₦</span>
                          <input 
                            type="number" 
                            className="form-input" 
                            style={{ width: '100px', padding: '6px 10px', fontSize: '13px' }}
                            value={val}
                            onChange={(e) => handlePriceChange('smm', smm.id, e.target.value)}
                          />
                          <button className="btn btn-secondary" style={{ padding: '6px' }} onClick={() => handleSavePrice('smm', smm.id)} title="Save Override Rate">
                            <Save size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
