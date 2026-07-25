import React from 'react';
import { useNavigate } from 'react-router-dom';
import LandingNav from '../components/LandingNav';
import { Sparkles, Shield } from 'lucide-react';

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  return (
    <div className="landing-container animate-slide-in">
      {/* Navigation */}
      <LandingNav currentActive="privacy" />

      {/* Hero Header */}
      <section className="landing-hero" style={{ paddingBottom: '40px' }}>
        <div className="hero-tag">
          <Shield size={14} style={{ marginRight: '6px' }} />
          Security
        </div>
        <h1 className="landing-title">
          Privacy Policy<br />
          <span> starlog.ng Telemetry</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
          Last Updated: June 25, 2026
        </p>
      </section>

      {/* Privacy Guidelines */}
      <section style={{ padding: '0 20px 80px', maxWidth: '800px', margin: '0 auto' }}>
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>1. Data Collection & Purpose</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
              We record transaction logs, balance allocations, and dynamic eSIM byte counts to support your console telemetry views. Since our financial channels operate under payment simulation sandboxes, we do not store or collect real credit card numbers or banking secrets.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>2. SMS Telemetry Safeguards</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
              Temporary phone logs and incoming text messages are routed through custom software layers. Physical SMS verification records are purged periodically from the SIM gateway grids to enforce operator privacy.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>3. Browser State (Local Storage)</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
              We write local state keys (like theme configurations, workspace wallet deposits, and rental listings) into your browser's Local Storage. This maintains consistent presentation. You can erase these keys at any time by resetting your browser cookies.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>4. Credential Lockers</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
              Shared subscription credentials generated in AppContext are kept inside local lockers. We do not index these mock credentials on public search registries. Do not share password strings outside your screen access slot to maintain privacy.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-content">
          <div className="landing-footer-logo">
            <Sparkles size={28} style={{ color: 'var(--color-turquoise)' }} />
            <span style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>starlog.ng</span>
          </div>
          <div className="landing-footer-links">
            <span onClick={() => navigate('/about')}>About Us</span>
            <span onClick={() => navigate('/contact')}>Contact Us</span>
            <span onClick={() => navigate('/terms')}>Terms of Service</span>
            <span onClick={() => navigate('/privacy')} style={{ color: 'var(--color-turquoise)', fontWeight: '600' }}>Privacy Policy</span>
          </div>
        </div>
        <div className="landing-footer-copyright">
          © 2026 starlog.ng. Built as a premium high-fidelity service prototype. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
