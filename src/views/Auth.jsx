import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { supabase } from '../supabase';
import { Compass, Mail, Lock, User, Phone, CheckSquare, Square, AlertCircle, ArrowLeft } from 'lucide-react';

const Auth = ({ setActiveTab, fallbackTab = 'overview' }) => {
  const { loginUser } = useContext(AppContext);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    // Validations
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (!isLogin) {
      if (!name.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (!username.trim() || username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(username)) {
        setErrorMsg('Please enter a valid username (alphanumeric and underscores only, min 3 chars).');
        return;
      }
      if (!phoneNumber.trim()) {
        setErrorMsg('Please enter your phone number.');
        return;
      }
      if (!agreeTerms) {
        setErrorMsg('You must agree to the Terms of Service.');
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          setErrorMsg(error.message);
          setLoading(false);
          return;
        }

        setLoading(false);
        setActiveTab(fallbackTab);
      } else {
        // Normalize phone number to 11 digits (e.g. 08012345678)
        let normalizedPhone = phoneNumber.replace(/\D/g, '');
        if (normalizedPhone.startsWith('234') && normalizedPhone.length === 13) {
          normalizedPhone = '0' + normalizedPhone.substring(3);
        }
        if (normalizedPhone.length === 10 && !normalizedPhone.startsWith('0')) {
          normalizedPhone = '0' + normalizedPhone;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              username: username,
              phone: normalizedPhone
            }
          }
        });

        if (error) {
          setErrorMsg(error.message);
          setLoading(false);
          return;
        }

        setLoading(false);
        if (data?.session) {
          setActiveTab(fallbackTab);
        } else {
          setErrorMsg('Registration successful! Please check your email for the confirmation link.');
          // Switch to login tab so they can sign in after verifying
          setIsLogin(true);
        }
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred during authentication.');
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '24px',
      background: 'var(--bg-main)',
      position: 'relative'
    }}>
      {/* Back to Home Trigger */}
      <button 
        onClick={() => setActiveTab('landing')}
        style={{ 
          position: 'absolute', 
          top: '24px', 
          left: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600'
        }}
      >
        <ArrowLeft size={16} />
        Back to Home
      </button>

      {/* Auth Main Card */}
      <div className="glass-panel" style={{ 
        width: '100%', 
        maxWidth: '460px', 
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-glow)'
      }}>
        
        {/* Brand Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={32} style={{ color: 'var(--color-turquoise)' }} />
            <span style={{ fontSize: '26px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--color-turquoise)', letterSpacing: '-0.03em' }}>discountzar.ng</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
            {isLogin ? 'Access your digital services dashboard console' : 'Create an account to deploy instant digital assets'}
          </p>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', paddingBottom: '2px' }}>
          <button 
            onClick={() => { setIsLogin(true); setErrorMsg(''); }}
            style={{ 
              flex: 1, 
              padding: '12px 0', 
              background: 'none', 
              border: 'none', 
              borderBottom: isLogin ? '2px solid var(--color-turquoise)' : '2px solid transparent',
              color: isLogin ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '15px'
            }}
          >
            Log In
          </button>
          <button 
            onClick={() => { setIsLogin(false); setErrorMsg(''); }}
            style={{ 
              flex: 1, 
              padding: '12px 0', 
              background: 'none', 
              border: 'none', 
              borderBottom: !isLogin ? '2px solid var(--color-turquoise)' : '2px solid transparent',
              color: !isLogin ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '15px'
            }}
          >
            Register
          </button>
        </div>

        {/* Auth Error Banner */}
        {errorMsg && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '12px', 
            background: 'rgba(255, 59, 48, 0.15)', 
            border: '1px solid rgba(255, 59, 48, 0.3)', 
            borderRadius: '8px', 
            color: 'var(--color-danger)', 
            fontSize: '13px' 
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {!isLogin && (
            <>
              <div>
                <label className="form-label" htmlFor="auth-name">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-secondary)' }} />
                  <input
                    id="auth-name"
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '44px' }}
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label" htmlFor="auth-username">Username</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-secondary)' }} />
                  <input
                    id="auth-username"
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '44px' }}
                    placeholder="johndoe_99"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label" htmlFor="auth-phone">Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-secondary)' }} />
                  <input
                    id="auth-phone"
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '44px' }}
                    placeholder="+234 80 1234 5678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="form-label" htmlFor="auth-email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-secondary)' }} />
              <input
                id="auth-email"
                type="email"
                className="form-input"
                style={{ paddingLeft: '44px' }}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label" htmlFor="auth-pass">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-secondary)' }} />
              <input
                id="auth-pass"
                type="password"
                className="form-input"
                style={{ paddingLeft: '44px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Checkboxes */}
          {isLogin ? (
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}
              onClick={() => setRememberMe(!rememberMe)}
            >
              {rememberMe ? (
                <CheckSquare size={18} style={{ color: 'var(--color-turquoise)' }} />
              ) : (
                <Square size={18} style={{ color: 'var(--text-secondary)' }} />
              )}
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Remember my device</span>
            </div>
          ) : (
            <div 
              style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', userSelect: 'none' }}
              onClick={() => setAgreeTerms(!agreeTerms)}
            >
              {agreeTerms ? (
                <CheckSquare size={18} style={{ color: 'var(--color-turquoise)', flexShrink: 0, marginTop: '2px' }} />
              ) : (
                <Square size={18} style={{ color: 'var(--text-secondary)', flexShrink: 0, marginTop: '2px' }} />
              )}
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                I agree to the discountzar.ng Terms of Service and Privacy Policy parameters.
              </span>
            </div>
          )}

          {/* Submit */}
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ padding: '14px', width: '100%', display: 'flex', justifyContent: 'center', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : isLogin ? 'Log In' : 'Create Account'}
          </button>
        </form>

        {/* Toggle Option Link */}
        <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          {isLogin ? (
            <span>
              Don't have an account?{' '}
              <strong 
                onClick={() => { setIsLogin(false); setErrorMsg(''); }}
                style={{ color: 'var(--color-turquoise)', cursor: 'pointer' }}
              >
                Register here
              </strong>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <strong 
                onClick={() => { setIsLogin(true); setErrorMsg(''); }}
                style={{ color: 'var(--color-turquoise)', cursor: 'pointer' }}
              >
                Log In
              </strong>
            </span>
          )}
        </div>

      </div>
    </div>
  );
};

export default Auth;
