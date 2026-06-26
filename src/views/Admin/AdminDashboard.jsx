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
    exchangeRate,
    setExchangeRate,
    adminFetchAllTransactions,
    adminFetchAllProfiles,
    adminUpdateSystemConfig,
    adminUpdateProfile
  } = useContext(AppContext);

  const isMobile = useIsMobile();

  // Dashboard Sub-navigation Tabs: 'overview', 'users', 'transactions', 'sms', 'pricing'
  const [adminTab, setAdminTab] = useState('overview');

  // Pagination states
  const [usersPage, setUsersPage] = useState(1);
  const USERS_PER_PAGE = 10;
  const [txPage, setTxPage] = useState(1);
  const TX_PER_PAGE = 20;

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
  const allUsers = (dbProfiles || []).length > 0
    ? (dbProfiles || []).map(p => ({
        id: p.id,
        full_name: p.id === user?.id ? `${p.username || p.full_name || 'Admin'} (You / Admin)` : p.username || p.full_name || 'Unnamed Client',
        phone: p.phone || 'N/A',
        email: p.email || 'N/A',
        wallet_balance: Number(p.wallet_balance),
        created_at: p.created_at || new Date().toISOString(),
        isReal: true
      }))
    : (profile && profile.full_name ? [{
        id: user?.id || 'real-admin',
        full_name: `${profile.username || profile.full_name} (You / Admin)`,
        phone: profile.phone || 'N/A',
        email: user?.email || 'N/A',
        wallet_balance: walletBalance,
        created_at: new Date().toISOString(),
        isReal: true
      }] : []);

  const [userSearchQuery, setUserSearchQuery] = useState('');

  const filteredUsers = allUsers.filter(u => 
    (u.full_name || '').toLowerCase().includes(userSearchQuery.toLowerCase()) || 
    (u.phone || '').includes(userSearchQuery) ||
    (u.email || '').toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.id.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  // Reset pagination on search
  useEffect(() => { setUsersPage(1); }, [userSearchQuery]);

  const paginatedUsers = filteredUsers.slice((usersPage - 1) * USERS_PER_PAGE, usersPage * USERS_PER_PAGE);
  const totalUserPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));

  // User Management State
  const [selectedUser, setSelectedUser] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState('set'); // set, add, deduct
  const [adjustResult, setAdjustResult] = useState('');
  const [simDepositAmount, setSimDepositAmount] = useState(5000);
  const [simDepositSuccess, setSimDepositSuccess] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [editProfileResult, setEditProfileResult] = useState('');

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

  useEffect(() => { setTxPage(1); }, [searchTx, filterTxType]);

  const allTransactions = [
    ...(dbTransactions || []).map(t => ({
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
  }, [allUsers, walletBalance, dbProfiles]);

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
      const res = await adminUpdateProfile(selectedUser.id, { newBalance: targetNewBalance });
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
      setAdjustResult(`Mock client wallet adjustment is not supported.`);
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
      setAdjustResult(`Mock client webhook deposit is not supported.`);
    }
  };

  const handleOpenEditModal = (u) => {
    setSelectedUser(u);
    const dbProf = (dbProfiles || []).find(p => p.id === u.id) || {};
    setEditFullName(u.full_name.replace(' (You / Admin)', ''));
    setEditUsername(dbProf.username || '');
    setEditPhone(u.phone === 'N/A' ? '' : u.phone);
    setEditIsAdmin(dbProf.is_admin === true);
    setEditProfileResult('');
    setAdjustResult('');
    setSimDepositSuccess(false);
    setIsUserModalOpen(true);
  };

  const handleSaveProfileDetails = async (e) => {
    e.preventDefault();
    setEditProfileResult('');
    if (!selectedUser) return;

    if (selectedUser.isReal) {
      const res = await adminUpdateProfile(selectedUser.id, {
        fullName: editFullName,
        username: editUsername,
        phone: editPhone,
        isAdmin: editIsAdmin
      });
      if (res.success) {
        setEditProfileResult('Profile updated successfully!');
        await fetchAdminData();
      } else {
        setEditProfileResult(`Update failed: ${res.msg}`);
      }
    } else {
      setEditProfileResult('Editing mock profiles is not supported.');
    }
  };

  // Stats Computations
  const totalClientCash = allUsers.reduce((sum, u) => sum + u.wallet_balance, 0);
  const totalLedgerTransactions = (dbTransactions || []).length;
  
  // Detailed Database Stats
  const liveUserCount = (dbProfiles || []).length;
  const livePurchaseCount = (dbTransactions || []).filter(t => t.type === 'Purchase').length;
  const liveDepositCount = (dbTransactions || []).filter(t => t.type === 'Deposit').length;
  const totalDepositedReal = (dbTransactions || [])
    .filter(t => t.type === 'Deposit')
    .reduce((sum, t) => sum + Number(t.amountNgn || 0), 0);

  // Compute estimated platform profit from live database transactions
  const estimatedProfit = (dbTransactions || []).reduce((acc, tx) => {
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
        <button className={`tab-btn ${adminTab === 'rates' ? 'active' : ''}`} onClick={() => setAdminTab('rates')}>
          <Settings size={16} style={{ marginRight: '6px' }} /> Rates & Config
        </button>
        <button className={`tab-btn ${adminTab === 'sms' ? 'active' : ''}`} onClick={() => setAdminTab('sms')}>
          <MessageSquare size={16} style={{ marginRight: '6px' }} /> SMS Tools
        </button>
        <button className={`tab-btn ${adminTab === 'profile' ? 'active' : ''}`} onClick={() => setAdminTab('profile')}>
          <ShieldCheck size={16} style={{ marginRight: '6px' }} /> Profile
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
          
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
            {filteredUsers.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No users found matching query.
              </div>
            ) : paginatedUsers.map((u) => {
              const dbProf = (dbProfiles || []).find(p => p.id === u.id) || {};
              const isAdminUser = dbProf.is_admin === true;
              return (
                <div 
                  key={u.id}
                  onClick={() => handleOpenEditModal(u)}
                  className="glass-panel interactive"
                  style={{ 
                    padding: '16px', 
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                    border: '1px solid var(--border-color)',
                    background: 'rgba(255, 255, 255, 0.01)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {u.full_name}
                        {isAdminUser && (
                          <span style={{ fontSize: '10px', background: 'rgba(255, 0, 127, 0.1)', color: 'var(--color-pink)', border: '1px solid rgba(255, 0, 127, 0.2)', padding: '2px 6px', borderRadius: '4px' }}>
                            Admin
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Email: {u.email}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Phone: {u.phone}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '800', fontSize: '18px', color: 'var(--color-turquoise)' }}>{formatCost(u.wallet_balance)}</div>
                      {u.isReal && <div style={{ fontSize: '10px', color: 'var(--color-green)', marginTop: '4px' }}>Real Profile</div>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>Joined: {new Date(u.created_at).toLocaleDateString()}</span>
                    <span style={{ color: 'var(--color-turquoise)', fontWeight: '600' }}>Manage Account &rarr;</span>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Pagination UI for Users */}
          {filteredUsers.length > USERS_PER_PAGE && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
              <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} disabled={usersPage === 1} onClick={() => setUsersPage(p => p - 1)}>Prev</button>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Page {usersPage} of {totalUserPages}</span>
              <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} disabled={usersPage === totalUserPages} onClick={() => setUsersPage(p => p + 1)}>Next</button>
            </div>
          )}
        </div>
      )}

      {/* Modal Popup for Managing User */}
      {isUserModalOpen && selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => setIsUserModalOpen(false)}>
          <div className="glass-panel animate-zoom-in" style={{
            width: '100%',
            maxWidth: '550px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            background: 'var(--bg-modal)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            borderRadius: '16px',
            position: 'relative'
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '18px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} style={{ color: 'var(--color-turquoise)' }} />
                Manage Account
              </h3>
              <button 
                onClick={() => setIsUserModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '20px',
                  lineHeight: 1,
                  padding: '4px'
                }}
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Account Quick Status */}
              <div style={{ padding: '16px', background: 'var(--bg-recent-tx)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Current Balance</div>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-turquoise)', marginTop: '4px' }}>{formatCost(selectedUser.wallet_balance)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Joined Date</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '4px' }}>{new Date(selectedUser.created_at).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Form 1: Edit Profile Details */}
              <div>
                <h4 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Profile Info</h4>
                <form onSubmit={handleSaveProfileDetails} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="form-label">Full Name</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={editFullName} 
                        onChange={(e) => setEditFullName(e.target.value)} 
                        required 
                      />
                    </div>
                    <div>
                      <label className="form-label">Username</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={editUsername} 
                        onChange={(e) => setEditUsername(e.target.value)} 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Phone Number</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={editPhone} 
                      onChange={(e) => setEditPhone(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="form-label">Email Address (Read-only)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={selectedUser.email} 
                      disabled 
                      style={{ opacity: 0.6, cursor: 'not-allowed' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                    <input 
                      id="is-admin-checkbox"
                      type="checkbox" 
                      checked={editIsAdmin} 
                      onChange={(e) => setEditIsAdmin(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--color-turquoise)' }}
                    />
                    <label htmlFor="is-admin-checkbox" style={{ fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                      Grant System Administrator Privileges
                    </label>
                  </div>
                  
                  {editProfileResult && (
                    <div style={{ fontSize: '12px', color: editProfileResult.includes('success') ? 'var(--color-green)' : '#ff453a', fontWeight: '600' }}>
                      {editProfileResult}
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary" style={{ padding: '10px', fontSize: '13px' }}>
                    Save Profile Changes
                  </button>
                </form>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 0 }} />

              {/* Form 2: Adjust Balance */}
              <div>
                <h4 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Adjust Wallet Balance</h4>
                <form onSubmit={handleUserBalanceAdjust} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label className="form-label">Adjustment Type</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[['set', 'Set'], ['add', 'Add'], ['deduct', 'Deduct']].map(([type, label]) => (
                        <button
                          key={type}
                          type="button"
                          className={`btn ${adjustType === type ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ flex: 1, padding: '6px 4px', fontSize: '12px' }}
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
                      required
                    />
                  </div>

                  {adjustResult && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px', background: 'rgba(0,242,254,0.08)', border: '1px solid rgba(0,242,254,0.15)', borderRadius: '8px', color: 'var(--color-turquoise)', fontSize: '12px' }}>
                      <CheckCircle size={14} />
                      <span>{adjustResult}</span>
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary" style={{ background: 'var(--color-pink)', border: 'none', padding: '10px', fontSize: '13px' }}>
                    Save Wallet Change
                  </button>
                </form>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 0 }} />

              {/* Form 3: Webhook Deposit Simulator */}
              <div>
                <h4 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PocketFi Webhook Simulator</h4>
                <form onSubmit={handleSimulateWebhookDeposit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label className="form-label" htmlFor="webhook-sim-val">Simulated Transfer Amount (₦)</label>
                    <input 
                      id="webhook-sim-val"
                      type="number" 
                      className="form-input" 
                      value={simDepositAmount}
                      onChange={(e) => setSimDepositAmount(Number(e.target.value))}
                      required
                    />
                  </div>

                  {simDepositSuccess && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px', background: 'rgba(59, 183, 94, 0.1)', border: '1px solid rgba(59, 183, 94, 0.25)', borderRadius: '8px', color: 'var(--color-green)', fontSize: '12px' }}>
                      <CheckCircle size={14} />
                      <span>Simulated webhook successfully processed!</span>
                    </div>
                  )}

                  <button type="submit" className="btn btn-accent" style={{ padding: '10px', fontSize: '13px' }} onClick={() => setSimDepositSuccess(false)}>
                    Trigger Webhook Deposit
                  </button>
                </form>
              </div>

            </div>
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
                {(() => {
                  const filteredTx = allTransactions
                    .filter(tx => filterTxType === 'ALL' || tx.type === filterTxType)
                    .filter(tx => tx.user_name.toLowerCase().includes(searchTx.toLowerCase()) || tx.id.toLowerCase().includes(searchTx.toLowerCase()));
                  
                  const totalTxPages = Math.max(1, Math.ceil(filteredTx.length / TX_PER_PAGE));
                  const paginatedTx = filteredTx.slice((txPage - 1) * TX_PER_PAGE, txPage * TX_PER_PAGE);
                  
                  return (
                    <>
                      {paginatedTx.map((tx) => (
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
                    {filteredTx.length > TX_PER_PAGE && (
                      <tr>
                        <td colSpan="7">
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '10px 0' }}>
                            <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} disabled={txPage === 1} onClick={() => setTxPage(p => p - 1)}>Prev</button>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Page {txPage} of {totalTxPages}</span>
                            <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} disabled={txPage === totalTxPages} onClick={() => setTxPage(p => p + 1)}>Next</button>
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

      {/* Tab Panel: RATES & CONFIG */}
      {adminTab === 'rates' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Global Exchange Rate */}
          <div className="glass-panel" style={{ 
            background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.03) 0%, rgba(255, 0, 127, 0.03) 100%)', 
            border: '1px solid rgba(0, 242, 254, 0.15)',
            padding: '20px',
            borderRadius: '12px'
          }}>
            <h3 style={{ fontSize: '16px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RefreshCw size={18} style={{ color: 'var(--color-green)' }} /> Global Dollar to Naira Exchange Rate
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ flex: 1, maxWidth: '300px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Current System Rate (1 USD = NGN)</span>
                <input 
                  type="number" 
                  className="form-input" 
                  value={exchangeRate}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val > 0) setExchangeRate(val);
                  }}
                />
              </div>
              <button 
                className="btn btn-primary" 
                style={{ marginTop: '22px' }}
                onClick={async () => {
                  const res = await adminUpdateSystemConfig('exchange_rate', exchangeRate);
                  if (res.success) {
                    alert('Exchange rate updated across the system.');
                  } else {
                    alert('Failed to update exchange rate: ' + res.msg);
                  }
                }}
              >
                Save Rate
              </button>
            </div>
          </div>

          {/* Sliders for Profit markup percentage */}
          <div className="glass-panel" style={{ 
            background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.03) 0%, rgba(255, 0, 127, 0.03) 100%)', 
            border: '1px solid rgba(0, 242, 254, 0.15)',
            padding: '20px',
            borderRadius: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '16px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} style={{ color: 'var(--color-turquoise)' }} /> Category-specific Profit Markup (%)
              </h3>
              <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={async () => {
                const res = await adminUpdateSystemConfig('profit_markup', JSON.stringify(profitMarkup));
                if (res.success) alert('Profit markup updated globally');
              }}>
                Save Global Config
              </button>
            </div>
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

      {/* Tab Panel: ADMIN PROFILE */}
      {adminTab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.05) 0%, rgba(255, 0, 127, 0.05) 100%)' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} style={{ color: 'var(--color-turquoise)' }} /> Administrator Profile
            </h3>
            
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '30px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Full Name</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px' }}>{profile?.full_name || 'Admin'}</div>
                </div>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Email Address</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px' }}>{user?.email || 'N/A'}</div>
                </div>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Registered Phone Number</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px' }}>{profile?.phone || 'N/A'}</div>
                </div>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Admin Access Level</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--color-green)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={16} /> Super Administrator
                  </div>
                </div>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Personal Wallet Balance</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-turquoise)', marginTop: '4px' }}>
                    {formatCost(walletBalance)}
                  </div>
                </div>
                <div style={{ padding: '16px', background: 'rgba(255, 0, 127, 0.05)', borderRadius: '12px', border: '1px solid rgba(255, 0, 127, 0.2)' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={16} style={{ color: 'var(--color-pink)' }} /> System Support Contact
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    Email: Support@discountzar.com<br/>
                    WhatsApp: +234 707 972 2993
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
