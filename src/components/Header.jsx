import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { useIsMobile } from '../hooks/useIsMobile';
import { CreditCard, ShieldAlert, ShieldCheck, Sun, Moon, Menu } from 'lucide-react';

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const { walletBalance, currency, toggleCurrency, formatCost, isAdmin, setIsAdmin, dbIsAdmin, theme, toggleTheme, user, profile } = useContext(AppContext);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();

  const pathParts = location.pathname.split('/');
  const activeTab = pathParts.length > 2 ? pathParts[2] : 'overview';

  const getTitle = () => {
    switch (activeTab) {
      case 'overview': return isMobile ? 'Overview' : 'Dashboard Overview';
      case 'subs': return isMobile ? 'Accounts Shop' : 'Shared Accounts Shop';
      case 'otp': return isMobile ? 'SMS OTP' : 'SMS OTP Verification';
      case 'reuse': return isMobile ? 'Reuse Number' : 'Re-buy & Reuse OTP Number';
      case 'esim': return isMobile ? 'eSIM' : 'Global eSIM Connectivity';
      case 'smm': return isMobile ? 'SMM Boost' : 'SMM Boost Reseller';
      case 'wallet': return 'Fund Wallet';
      case 'orders': return isMobile ? 'Orders' : 'Order History';
      case 'api': return isMobile ? 'Developer API' : 'Developer API Portal';
      case 'support': return 'Support Desk';
      case 'admin': return isMobile ? 'Admin' : 'System Admin Sandbox';
      default: return 'StarLog Console';
    }
  };

  return (
    <header className="app-header glass-panel" style={{ 
      borderRadius: '12px', 
      padding: isMobile ? '0 12px' : '0 20px', 
      height: isMobile ? '60px' : '70px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: isMobile ? '16px' : '24px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button 
          onClick={() => setSidebarOpen(true)}
          className="mobile-sidebar-toggle"
          title="Open Navigation Menu"
        >
          <Menu size={20} />
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: isMobile ? '16px' : '20px', fontWeight: '800', fontFamily: 'var(--font-heading)', lineHeight: 1.2 }}>
            {getTitle()}
          </h2>
          {!isMobile && (
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Welcome back, {profile?.username || profile?.full_name?.split(' ')[0] || user?.email || 'Developer'}</span>
          )}
        </div>
      </div>

      <div className="app-header-actions" style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '12px' }}>
        
        {/* Theme Switcher */}
        <button 
          className="btn btn-secondary" 
          onClick={toggleTheme}
          style={{ 
            width: isMobile ? '32px' : '36px', 
            height: isMobile ? '32px' : '36px', 
            padding: 0, 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '1px solid var(--border-color)',
            background: 'rgba(255, 255, 255, 0.03)',
            flexShrink: 0
          }}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={isMobile ? 14 : 16} style={{ color: 'var(--color-pink)' }} /> : <Sun size={isMobile ? 14 : 16} style={{ color: 'var(--color-turquoise)' }} />}
        </button>

        {/* Currency Switcher */}
        <button 
          className="btn btn-secondary" 
          onClick={toggleCurrency}
          style={{ 
            width: isMobile ? '32px' : '36px', 
            height: isMobile ? '32px' : '36px', 
            padding: 0, 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: isMobile ? '13px' : '15px',
            fontWeight: '700',
            color: 'var(--color-turquoise)',
            border: '1px solid rgba(0, 242, 254, 0.2)',
            background: 'rgba(0, 242, 254, 0.03)',
            flexShrink: 0
          }}
          title="Toggle Currency"
        >
          {currency === 'NGN' ? '₦' : '$'}
        </button>



        {/* Wallet Balance Display */}
        <div 
          onClick={() => navigate('/dashboard/wallet')}
          className="glass-panel interactive" 
          style={{ 
            padding: isMobile ? '6px 10px' : '6px 14px', 
            borderRadius: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            cursor: 'pointer',
            border: '1px solid rgba(0, 242, 254, 0.25)',
            background: 'rgba(0, 242, 254, 0.05)',
            boxShadow: '0 0 10px rgba(0, 242, 254, 0.05)',
            flexShrink: 0
          }}
          title="Click to fund wallet"
        >
          <CreditCard size={isMobile ? 12 : 14} style={{ color: 'var(--color-turquoise)' }} />
          <span style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
            {formatCost(walletBalance)}
          </span>
        </div>

      </div>
    </header>
  );
};

export default Header;

