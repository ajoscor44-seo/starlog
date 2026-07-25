import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Sparkles, Menu, X, Sun, Moon, LogOut } from 'lucide-react';

const LandingNav = () => {
  const { isLoggedIn, logoutUser, user, theme, toggleTheme, dbIsAdmin } = useContext(AppContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavClick = (tab) => {
    if (tab === 'landing') navigate('/');
    else if (tab === 'auth') navigate('/login');
    else if (tab === 'overview') navigate('/dashboard');
    else navigate(`/dashboard/${tab}`);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <nav className="landing-nav">
      <div className="landing-nav-left">
        <div className="landing-brand" onClick={() => handleNavClick('landing')}>
          <Sparkles size={28} style={{ color: 'var(--color-turquoise)' }} className="pulse-glow-cyan" />
          <span className="landing-brand-text">starlog.ng</span>
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
            <button className="btn btn-secondary" onClick={() => handleNavClick('overview')}>Go to Dashboard</button>
            <button className="btn btn-primary" onClick={handleLogout}>Log Out</button>
          </>
        ) : (
          <>
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
            <span onClick={() => handleNavClick('social')} style={{ color: 'var(--text-primary)', fontWeight: '600' }}>🛡️ Social Media Logs</span>
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
                  Go to Dashboard
                </button>
                <button className="btn btn-primary" style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <>
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
