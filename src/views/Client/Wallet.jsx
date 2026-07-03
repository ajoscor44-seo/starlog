import React, { useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { AppContext } from '../../context/AppContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { CreditCard, Landmark, Coins, AlertCircle, Check, Copy, Wallet2, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

const Wallet = () => {
  const { 
    walletBalance, 
    currency, 
    transactions, 
    depositWallet, 
    formatCost,
    virtualWallet,
    generatePocketFiWallet,
    simulatePocketFiDeposit
  } = useContext(AppContext);

  const isMobile = useIsMobile();
  const [txPage, setTxPage] = useState(1);
  const TX_PER_PAGE = 10;

  const [depositTab, setDepositTab] = useState('pocketfi'); // pocketfi, crypto
  const [selectedBank, setSelectedBank] = useState('paga');
  const [isGenerating, setIsGenerating] = useState(false);
  const [simulationAmount, setSimulationAmount] = useState(2250);
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [simulationSuccess, setSimulationSuccess] = useState(false);

  const [cryptoAmount, setCryptoAmount] = useState(10);
  const [selectedCryptoChannel, setSelectedCryptoChannel] = useState('binance'); // binance, bybit
  const [showCryptoModal, setShowCryptoModal] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const [generationError, setGenerationError] = useState('');

  const handleGenerateWallet = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setGenerationError('');
    const result = await generatePocketFiWallet(selectedBank);
    setIsGenerating(false);
    if (result && !result.success) {
      setGenerationError(result.msg || "Failed to generate virtual wallet account.");
    }
  };

  const handleSimulateDeposit = async (e) => {
    e.preventDefault();
    if (simulationAmount < 2250) {
      alert("Minimum simulated bank transfer is ₦2,250 ($3 equivalent).");
      return;
    }
    setSimulationLoading(true);
    const result = await simulatePocketFiDeposit(simulationAmount);
    setSimulationLoading(false);
    if (result.success) {
      setSimulationSuccess(true);
      setTimeout(() => setSimulationSuccess(false), 5000);
    }
  };

  const handleCryptoDepositSubmit = (e) => {
    e.preventDefault();
    if (cryptoAmount < 3) {
      alert("Minimum deposit is 3 USDT ($3 equivalent).");
      return;
    }
    setShowCryptoModal(true);
  };

  const confirmCryptoPayment = async () => {
    const isNgn = currency === 'NGN';
    const finalAmount = isNgn ? cryptoAmount * 1350 : cryptoAmount;
    const channelName = selectedCryptoChannel === 'binance' ? 'Binance Pay' : 'Bybit UID Transfer';
    await depositWallet(finalAmount, `Crypto (${channelName})`);
    setShowCryptoModal(false);
    setCryptoAmount(10);
  };

  const copyAddress = (address) => {
    navigator.clipboard.writeText(address);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Wallet Card */}
      <div className="glass-panel pulse-glow-cyan" style={{ 
        background: 'linear-gradient(135deg, rgba(8,6,15,0.9) 0%, rgba(14,11,24,0.9) 100%)',
        border: '1px solid rgba(0, 242, 254, 0.25)', 
        padding: isMobile ? '24px 20px' : '32px', 
        borderRadius: '16px',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: isMobile ? 16 : 0,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold' }}>
            Available Wallet Account
          </div>
          <h1 style={{ margin: 0, fontSize: isMobile ? '36px' : '48px', fontFamily: 'var(--font-heading)', background: 'linear-gradient(90deg, #ffffff 0%, var(--color-turquoise) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800' }}>
            {formatCost(walletBalance)}
          </h1>
          <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.45)' }}>Secure payment processor ledger active</span>
        </div>
        <div style={{ background: 'rgba(0, 242, 254, 0.05)', border: '1px solid rgba(0, 242, 254, 0.2)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Wallet2 size={32} style={{ color: 'var(--color-turquoise)' }} />
        </div>
      </div>

      <div className="wallet-grid">
        
        {/* Deposit Interface */}
        <div className="glass-panel">
          <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Fund Your Account</h3>
          
          {/* Deposit Tabs */}
          <div className="tabs-container" style={{ marginBottom: '20px', flexWrap: isMobile ? 'wrap' : 'wrap', gap: isMobile ? '8px' : '12px', borderBottom: 'none', paddingBottom: 0 }}>
            <button 
              className={`tab-btn ${depositTab === 'pocketfi' ? 'active' : ''}`}
              onClick={() => setDepositTab('pocketfi')}
              style={{ flex: isMobile ? '1 1 auto' : 'initial', borderRadius: '10px', border: `1px solid ${depositTab === 'pocketfi' ? 'var(--color-turquoise)' : 'var(--border-color)'}`, background: depositTab === 'pocketfi' ? 'rgba(0,242,254,0.08)' : 'transparent', whiteSpace: 'nowrap' }}
            >
              🏦 Bank Account (Auto)
            </button>
            {/*
            <button 
              className={`tab-btn ${depositTab === 'crypto' ? 'active' : ''}`}
              onClick={() => setDepositTab('crypto')}
              style={{ flex: isMobile ? '1 1 auto' : 'initial', borderRadius: '10px', border: `1px solid ${depositTab === 'crypto' ? 'var(--color-turquoise)' : 'var(--border-color)'}`, background: depositTab === 'crypto' ? 'rgba(0,242,254,0.08)' : 'transparent', whiteSpace: 'nowrap' }}
            >
              💎 USDT (Crypto)
            </button>
            */}
          </div>


          {/* Tab: PocketFi Virtual Wallet */}
          {depositTab === 'pocketfi' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {!virtualWallet ? (
                /* Generate virtual wallet form */
                <form onSubmit={handleGenerateWallet} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '16px', background: 'rgba(0, 242, 254, 0.05)', border: '1px solid rgba(0, 242, 254, 0.15)', borderRadius: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <AlertCircle size={16} style={{ color: 'var(--color-turquoise)', marginBottom: '8px', display: 'block' }} />
                    Generate a dedicated virtual bank account to top up your wallet instantly. Any bank transfer made to this account will credit your balance automatically in under 30 seconds.
                  </div>

                  {generationError && (
                    <div style={{ padding: '12px 16px', background: 'rgba(255, 75, 75, 0.08)', border: '1px solid rgba(255, 75, 75, 0.25)', borderRadius: '10px', fontSize: '13px', color: 'var(--color-red)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <AlertCircle size={16} style={{ color: 'var(--color-red)', flexShrink: 0 }} />
                      <span>{generationError}</span>
                    </div>
                  )}

                  <div>
                    <label className="form-label" htmlFor="pocketfi-bank-select">Select Funding Bank Partner</label>
                    <select 
                      id="pocketfi-bank-select"
                      className="form-select" 
                      value={selectedBank} 
                      onChange={(e) => setSelectedBank(e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <option value="paga">Paga Bank (Recommended)</option>
                      <option value="kuda">Kuda Bank</option>
                      <option value="saveheaven">SafeHaven</option>
                      <option value="9psb">9PSB</option>
                      <option value="palmpay">PalmPay</option>
                    </select>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={isGenerating} 
                    style={{ padding: '14px', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    {isGenerating ? (
                      <>
                        <span className="spinner-loader" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }}></span>
                        Generating Dedicated Account...
                      </>
                    ) : (
                      "Generate My Virtual Bank Wallet"
                    )}
                  </button>
                </form>
              ) : (
                /* Display virtual account details */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="glass-panel" style={{ 
                    background: 'linear-gradient(135deg, rgba(8,6,15,0.95) 0%, rgba(20,15,35,0.95) 100%)', 
                    border: '1px solid var(--color-turquoise)', 
                    padding: isMobile ? '16px' : '24px', 
                    borderRadius: '12px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {/* Decorative bank stamp */}
                    <div style={{ position: 'absolute', right: '-15px', bottom: '-15px', opacity: 0.05, color: '#fff', fontSize: '120px', fontWeight: '800', pointerEvents: 'none' }}>
                      {virtualWallet.bank_name}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: isMobile ? '16px' : '24px' }}>
                      <div>
                        <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Virtual Account Provider</span>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-turquoise)', marginTop: '2px' }}>
                          {virtualWallet.bank_name}
                        </div>
                      </div>
                      <span className="badge badge-success" style={{ fontSize: '10px' }}>Active</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Account Number</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                          <span style={{ fontSize: isMobile ? '20px' : '26px', fontFamily: 'var(--mono)', fontWeight: '700', color: '#fff', letterSpacing: isMobile ? '1px' : '2px', wordBreak: 'break-all' }}>
                            {virtualWallet.account_number}
                          </span>
                          <button 
                            type="button"
                            onClick={() => copyAddress(virtualWallet.account_number)}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: copiedText ? 'var(--color-green)' : 'var(--color-turquoise)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Copy Account Number"
                          >
                            {copiedText ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Account Name</span>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginTop: '2px', wordBreak: 'break-all' }}>
                          {(virtualWallet.account_name || '')
                            .replace(/\s*-\s*ZAR\s*\(Pocketfi\)/gi, '')
                            .replace(/\s*\(Pocketfi\)/gi, '')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '12px', background: 'rgba(0, 242, 254, 0.05)', border: '1px solid rgba(0, 242, 254, 0.15)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <AlertCircle size={16} style={{ color: 'var(--color-turquoise)', flexShrink: 0, marginTop: '2px' }} />
                    <span>Send any bank transfer (minimum ₦2,250) to this account to top-up. Funds are instantly detected via PocketFi and credited to your wallet balance.</span>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* Tab 3: Crypto */}
          {depositTab === 'crypto' && (
            <form onSubmit={handleCryptoDepositSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label" htmlFor="deposit-crypto-val">Amount to Deposit (USDT)</label>
                <input 
                  id="deposit-crypto-val"
                  type="number" 
                  className="form-input" 
                  min="3"
                  value={cryptoAmount}
                  onChange={(e) => setCryptoAmount(Number(e.target.value))}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '6px' }}>
                  Min deposit: 3 USDT. We support internal exchange transfers (Binance / Bybit) & network transfers.
                </span>
              </div>

              <div>
                <label className="form-label">Select Crypto Channel</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div 
                    onClick={() => setSelectedCryptoChannel('binance')}
                    className="glass-panel interactive" 
                    style={{ flex: 1, padding: '14px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', border: selectedCryptoChannel === 'binance' ? '1px solid var(--color-turquoise)' : '1px solid var(--border-color)', background: selectedCryptoChannel === 'binance' ? 'rgba(0, 242, 254, 0.05)' : '' }}
                  >
                    <Coins size={20} style={{ color: selectedCryptoChannel === 'binance' ? 'var(--color-turquoise)' : 'var(--text-muted)' }} />
                    <span style={{ fontSize: '13px', fontWeight: '600' }}>Binance</span>
                  </div>
                  <div 
                    onClick={() => setSelectedCryptoChannel('bybit')}
                    className="glass-panel interactive" 
                    style={{ flex: 1, padding: '14px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', border: selectedCryptoChannel === 'bybit' ? '1px solid var(--color-turquoise)' : '1px solid var(--border-color)', background: selectedCryptoChannel === 'bybit' ? 'rgba(0, 242, 254, 0.05)' : '' }}
                  >
                    <Coins size={20} style={{ color: selectedCryptoChannel === 'bybit' ? 'var(--color-turquoise)' : 'var(--text-muted)' }} />
                    <span style={{ fontSize: '13px', fontWeight: '600' }}>Bybit</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(0, 242, 254, 0.05)', border: '1px solid rgba(0, 242, 254, 0.15)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <Coins size={16} style={{ color: 'var(--color-turquoise)', flexShrink: 0 }} />
                <span>USDT deposits are calculated automatically using current rates (₦1350 / $1).</span>
              </div>

              <button type="submit" className="btn btn-accent" style={{ padding: '14px', marginTop: '10px' }}>
                Generate {selectedCryptoChannel === 'binance' ? 'Binance' : 'Bybit'} Details
              </button>
            </form>
          )}

        </div>

        {/* Payment Policy Info */}
        <div className="glass-panel" style={{ height: 'fit-content', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', margin: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            Deposit Guidelines
          </h3>
          
          <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-secondary)' }}>
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Virtual Bank Accounts:</strong> Powered by PocketFi. Dedicated account generation defaults to Paga Bank. Top-up deposits credit automatically within seconds.
            </div>
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Crypto Payments:</strong> Powered by Binance or Bybit. Support both internal UID/Pay ID transfers (no fees) and network transfers.
            </div>
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Refunds:</strong> Wallet funds are strictly reserved for service purchases and cannot be withdrawn back to banking channels once deposited.
            </div>
          </div>
        </div>

      </div>

      {/* Transaction Logs */}
      <div className="glass-panel">
        <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Landmark size={18} style={{ color: 'var(--color-turquoise)' }} />
          Transaction Logs
        </h3>

        {transactions.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
            No transaction records.
          </div>
        ) : isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {transactions.map((tx) => (
              <div key={tx.id} className="glass-panel" style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge ${
                      tx.type === 'Deposit' ? 'badge-success' : 
                      tx.type === 'Refund' ? 'badge-info' : 'badge-danger'
                    }`} style={{ fontSize: '9px' }}>
                      {tx.type}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
                      #{tx.id.startsWith('tx-') ? tx.id.substring(3) : tx.id.substring(0, 8)}...
                    </span>
                  </div>
                  <div style={{ 
                    fontFamily: 'var(--font-heading)', 
                    fontWeight: '700',
                    fontSize: '15px',
                    color: tx.type === 'Deposit' || tx.type === 'Refund' ? 'var(--color-green)' : '#ff453a'
                  }}>
                    {tx.type === 'Deposit' || tx.type === 'Refund' ? '+' : '-'}{formatCost(tx.amountNgn)}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ fontWeight: '500', color: 'var(--text-secondary)' }}>{tx.method}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{tx.date}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Timestamp</th>
                  <th>Type</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const totalTxPages = Math.max(1, Math.ceil(transactions.length / TX_PER_PAGE));
                  const paginatedTx = transactions.slice((txPage - 1) * TX_PER_PAGE, txPage * TX_PER_PAGE);

                  return (
                    <>
                      {paginatedTx.map((tx) => (
                        <tr key={tx.id}>
                          <td style={{ fontFamily: 'var(--mono)', fontSize: '13px' }}>{tx.id}</td>
                          <td>{tx.date}</td>
                          <td>
                            <span className={`badge ${
                              tx.type === 'Deposit' ? 'badge-success' : 
                              tx.type === 'Refund' ? 'badge-info' : 'badge-danger'
                            }`} style={{ fontSize: '9px' }}>
                              {tx.type}
                            </span>
                          </td>
                          <td style={{ fontWeight: '500' }}>{tx.method}</td>
                          <td style={{ 
                            fontFamily: 'var(--font-heading)', 
                            fontWeight: '700',
                            color: tx.type === 'Deposit' || tx.type === 'Refund' ? 'var(--color-green)' : '#ff453a'
                          }}>
                            {tx.type === 'Deposit' || tx.type === 'Refund' ? '+' : '-'}{formatCost(tx.amountNgn)}
                          </td>
                          <td>
                            <span className="badge badge-success" style={{ fontSize: '10px' }}>{tx.status}</span>
                          </td>
                        </tr>
                      ))}
                      {transactions.length > TX_PER_PAGE && (
                        <tr>
                          <td colSpan="6">
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
        )}
      </div>

      {/* Crypto Checkout Popup Overlay */}
      {showCryptoModal && createPortal(
        <div className="modal-overlay" style={{ zIndex: 1100, display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? 0 : '20px' }}>
          <div className={`modal-content ${isMobile ? 'animate-slide-up-mobile' : 'animate-slide-in'}`} style={{ width: '100%', maxWidth: '440px', padding: isMobile ? '24px 16px 40px 16px' : '24px', borderRadius: isMobile ? '24px 24px 0 0' : '12px', margin: isMobile ? 0 : 'auto', maxHeight: isMobile ? '85vh' : '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>
              {selectedCryptoChannel === 'binance' ? 'Binance USDT Deposit' : 'Bybit USDT Deposit'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
              Send exactly <strong>{cryptoAmount} USDT</strong> using internal transfer (zero fee) or via the network address.
            </p>

            {/* Address copy and ID details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px' }}>
              {selectedCryptoChannel === 'binance' ? (
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Binance Pay ID</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <code style={{ fontSize: '15px', color: '#fff', fontWeight: 'bold', fontFamily: 'var(--mono)' }}>83902175</code>
                    <button 
                      type="button"
                      onClick={() => copyAddress('83902175')}
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: copiedText ? 'var(--color-green)' : 'var(--color-turquoise)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      {copiedText ? <Check size={12} /> : <Copy size={12} />}
                      {copiedText ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bybit UID</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <code style={{ fontSize: '15px', color: '#fff', fontWeight: 'bold', fontFamily: 'var(--mono)' }}>80476914</code>
                    <button 
                      type="button"
                      onClick={() => copyAddress('80476914')}
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: copiedText ? 'var(--color-green)' : 'var(--color-turquoise)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      {copiedText ? <Check size={12} /> : <Copy size={12} />}
                      {copiedText ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}

              <hr style={{ border: '0', borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />

              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deposit Network</div>
                <div style={{ fontWeight: '700', color: 'var(--color-turquoise)', marginTop: '2px' }}>Tron (TRC-20)</div>
              </div>
              
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>USDT Address</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <code style={{ fontSize: '11px', color: '#fff', wordBreak: 'break-all', fontFamily: 'var(--mono)' }}>
                    {selectedCryptoChannel === 'binance' 
                      ? 'TBinanceUSDT769f3M2NfE8fH53ksJp23J8ds1S' 
                      : 'TBybitUSDT769f3M2NfE8fH53ksJp23J8ds1S'}
                  </code>
                  <button 
                    type="button"
                    onClick={() => copyAddress(selectedCryptoChannel === 'binance' ? 'TBinanceUSDT769f3M2NfE8fH53ksJp23J8ds1S' : 'TBybitUSDT769f3M2NfE8fH53ksJp23J8ds1S')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedText ? 'var(--color-green)' : 'var(--text-secondary)', flexShrink: 0, paddingLeft: '8px' }}
                  >
                    {copiedText ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Mock QR */}
            <div style={{ background: '#fff', padding: '12px', borderRadius: '10px', width: '160px', height: '160px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${
                  selectedCryptoChannel === 'binance' 
                    ? 'TBinanceUSDT769f3M2NfE8fH53ksJp23J8ds1S' 
                    : 'TBybitUSDT769f3M2NfE8fH53ksJp23J8ds1S'
                }`}
                alt="Crypto Address QR Code"
                style={{ width: '100%', height: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowCryptoModal(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={confirmCryptoPayment}>I have sent the funds</button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default Wallet;
