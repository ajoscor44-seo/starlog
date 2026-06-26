import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Compass, Menu, X, Sun, Moon, LogOut } from 'lucide-react';

const LandingNav = ({ setActiveTab, currentActive }) => {
  const { isLoggedIn, logoutUser, user, theme, toggleTheme, dbIsAdmin } = useContext(AppContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logoutUser();
    handleNavClick('landing');
  };

  return (
    <nav className="landing-nav">
      <div className="landing-nav-left">
        <div className="landing-brand" onClick={() => handleNavClick('landing')}>
          <Compass size={28} style={{ color: 'var(--color-turquoise)' }} className="pulse-glow-cyan" />
          <span className="landing-brand-text">discountzar.ng</span>
        </div>
        <div className="landing-nav-links" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span 
            onClick={() => handleNavClick('otp')} 
            style={{ color: 'var(--text-secondary)', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}
          >
            OTP Verification
          </span>
          <span 
            onClick={() => handleNavClick('esim')} 
            style={{ color: 'var(--text-secondary)', fontWeight: '600', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            eSIM Travel
            {!dbIsAdmin && (
              <span style={{ fontSize: '8px', background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '4px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Coming Soon</span>
            )}
          </span>
          <span 
            onClick={() => handleNavClick('smm')} 
            style={{ color: 'var(--text-secondary)', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}
          >
            SMM Reseller
          </span>
          <span 
            onClick={() => window.open('https://www.discountzar.com/marketplace', '_blank')} 
            style={{ color: 'var(--color-pink)', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            Premium Accounts ↗
          </span>
          <div style={{ width: '1px', height: '16px', background: 'var(--border-color)', margin: '0 4px' }} />
          <span 
            onClick={() => handleNavClick('about')} 
            style={{ color: currentActive === 'about' ? 'var(--color-turquoise)' : 'var(--text-secondary)', fontSize: '14px' }}
          >
            About
          </span>
          <span 
            onClick={() => handleNavClick('contact')} 
            style={{ color: currentActive === 'contact' ? 'var(--color-turquoise)' : 'var(--text-secondary)', fontSize: '14px' }}
          >
            Contact
          </span>
        </div>
      </div>

      <div className="landing-nav-right">
        {/* Theme Toggle Button */}
        <button 
          className="btn btn-secondary" 
          onClick={toggleTheme}
          style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={18} style={{ color: 'var(--color-pink)' }} /> : <Sun size={18} style={{ color: 'var(--color-turquoise)' }} />}
        </button>

        {isLoggedIn ? (
          <>
            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              Hi, {user ? (user.email ? user.email.split('@')[0] : 'User') : 'User'}
            </span>
            <button className="btn btn-secondary" onClick={() => handleNavClick('overview')}>Go to Console</button>
            <button className="btn btn-primary" onClick={handleLogout}>Log Out</button>
          </>
        ) : (
          <>
            <button className="btn btn-secondary" onClick={() => handleNavClick('overview')}>Client Console</button>
            <button className="btn btn-primary" onClick={() => handleNavClick('auth')}>Log In / Register</button>
          </>
        )}
      </div>

      {/* Hamburger Toggle Button (visible <= 768px) */}
      <button 
        className="mobile-menu-btn" 
        onClick={() => setMenuOpen(!menuOpen)}
        title="Toggle Menu"
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Dropdown Menu Card */}
      {menuOpen && (
        <div className="landing-mobile-menu">
          <div className="landing-mobile-menu-links">
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Services</div>
            <span onClick={() => handleNavClick('otp')} style={{ color: 'var(--text-primary)', fontWeight: '600' }}>💬 SMS OTP Verification</span>
            <span onClick={() => handleNavClick('esim')} style={{ color: 'var(--text-primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📶 eSIM Travel Profiles
              {!dbIsAdmin && (
                <span style={{ fontSize: '9px', background: 'var(--border-color)', color: 'var(--text-secondary)', padding: '2px 4px', borderRadius: '4px', textTransform: 'uppercase' }}>Coming Soon</span>
              )}
            </span>
            <span onClick={() => handleNavClick('smm')} style={{ color: 'var(--text-primary)', fontWeight: '600' }}>📈 SMM Panel Reseller</span>
            <span onClick={() => window.open('https://www.discountzar.com/marketplace', '_blank')} style={{ color: 'var(--color-pink)', fontWeight: '700' }}>⭐ Premium Accounts Shop ↗</span>
          </div>

          <div className="landing-mobile-menu-actions">
            {/* Theme Toggle Button */}
            <button 
              className="btn btn-secondary" 
              onClick={toggleTheme}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}
            >
              {theme === 'light' ? (
                <>
                  <Moon size={16} style={{ color: 'var(--color-pink)' }} />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun size={16} style={{ color: 'var(--color-turquoise)' }} />
                  <span>Light Mode</span>
                </>
              )}
            </button>

            {isLoggedIn ? (
              <>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', margin: '4px 0' }}>
                  Logged in as: <strong style={{ color: 'var(--text-primary)' }}>{user?.email}</strong>
                </div>
                <button className="btn btn-secondary" style={{ width: '100%', padding: '12px' }} onClick={() => handleNavClick('overview')}>
                  Go to Console
                </button>
                <button className="btn btn-primary" style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-secondary" style={{ width: '100%', padding: '12px' }} onClick={() => handleNavClick('overview')}>
                  Client Console
                </button>
                <button className="btn btn-primary" style={{ width: '100%', padding: '12px' }} onClick={() => handleNavClick('auth')}>
                  Log In / Register
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default LandingNav;
