import React from 'react';
import { useNavigate } from 'react-router-dom';
import LandingNav from '../components/LandingNav';
import { Sparkles, ScrollText } from 'lucide-react';

const TermsOfService = () => {
  const navigate = useNavigate();
  return (
    <div className="landing-container animate-slide-in">
      {/* Navigation */}
      <LandingNav currentActive="terms" />

      {/* Hero Header */}
      <section className="landing-hero" style={{ paddingBottom: '40px' }}>
        <div className="hero-tag">
          <ScrollText size={14} style={{ marginRight: '6px' }} />
          Agreement
        </div>
        <h1 className="landing-title">
          Terms of Service<br />
          <span> starlog.ng Guidelines</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
          Last Updated: June 25, 2026
        </p>
      </section>

      {/* Terms Guidelines */}
      <section style={{ padding: '0 20px 80px', maxWidth: '800px', margin: '0 auto' }}>
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>1. Acceptance of Terms</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
              By creating a wallet account and utilizing the automated APIs on starlog.ng, you express complete consent to comply with our billing policies, support regulations, and usage parameters. If you disagree, please discontinue service deployment.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>2. Wallet Balances & Deposit Policies</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
              Deposits processed via PocketFi virtual bank accounts or Tether (USDT) block transfers represent prepaid utility allocations. These balances are non-withdrawable and strictly reserved for ordering shared profiles, virtual numbers, eSIM packages, or SMM reseller credits.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>3. Temporary SMS Verification Guarantee</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
              We operate a success-first policy for temp verification requests. If a post-allocated virtual number does not receive a verification text code within the 15-minute lease duration, the session is cancelled, and your wallet balance is immediately refunded.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>4. Shared Subscription Profiles Rules</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
              Credentials issued for shared accounts (such as Netflix, Claude, or ChatGPT family slots) are restricted to single-screen personal console use. Any attempt to modify passwords, distribute account details, or override screen profiles will trigger auto-ban sequences, revoking your access slot without billing refund.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>5. Travel eSIM Telemetry</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
              eSIM profiles are instantly generated. It is your responsibility to verify your smartphone is unlocked and compatible. Deleting an active profile from your setting registry is permanent; our system cannot issue a second activation code for the same provisioning package.
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
            <span onClick={() => navigate('/terms')} style={{ color: 'var(--color-turquoise)', fontWeight: '600' }}>Terms of Service</span>
            <span onClick={() => navigate('/privacy')}>Privacy Policy</span>
          </div>
        </div>
        <div className="landing-footer-copyright">
          © 2026 starlog.ng. Built as a premium high-fidelity service prototype. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default TermsOfService;
