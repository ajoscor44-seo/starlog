import React from 'react';
import { useNavigate } from 'react-router-dom';
import LandingNav from '../components/LandingNav';
import { Sparkles, Users, Target, ShieldCheck } from 'lucide-react';

const AboutUs = () => {
  const navigate = useNavigate();
  return (
    <div className="landing-container animate-slide-in">
      {/* Navigation */}
      <LandingNav currentActive="about" />

      {/* Hero Header */}
      <section className="landing-hero" style={{ paddingBottom: '40px' }}>
        <div className="hero-tag">
          <Users size={14} style={{ marginRight: '6px' }} />
          Who We Are
        </div>
        <h1 className="landing-title">
          Empowering Seamless Access <br />
          <span>to Global Digital Assets</span>
        </h1>
        <p className="landing-desc" style={{ margin: 0 }}>
          At starlog.ng, we believe international subscription billing, travel cellular profiles, and OTP verification gateway routes should be accessible, affordable, and fully automated in local currencies.
        </p>
      </section>

      {/* Corporate Mission and values */}
      <section style={{ padding: '0 20px 80px', maxWidth: '1000px', margin: '0 auto' }}>
        <div className="about-mission-grid">
          
          <div className="glass-panel">
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(55,173,209,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Target size={24} style={{ color: 'var(--color-turquoise)' }} />
            </div>
            <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Our Mission</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
              To democratize premium digital access across Africa by engineering high-speed automated checkout simulation, virtual hardware SMS routing, and instant billing conversions. We clear physical delivery delays.
            </p>
          </div>

          <div className="glass-panel">
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(55,173,209,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <ShieldCheck size={24} style={{ color: 'var(--color-turquoise)' }} />
            </div>
            <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Core Philosophy</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
              We design software layers that guarantee transactional success. Our verification gateways operate under success-only checks: if you don't receive your verification credentials or telemetry signals, you pay nothing.
            </p>
          </div>

        </div>

        {/* Detailed Copy Section */}
        <div className="glass-panel" style={{ marginTop: '40px', padding: '40px' }}>
          <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Our Infrastructure Journey</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.7', marginBottom: '20px' }}>
            Established in 2026, starlog.ng was conceptualized to address two major hurdles: international credit card spending caps and high cellular data roaming tariffs. By grouping wholesale shared slots for top media and AI channels, and developing SMS routing grids linked directly with real physical SIM providers, we created a single dashboard platform.
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.7', margin: 0 }}>
            Every eSIM package, SMM campaign queue, and temp verification session operates on real-time telemetry pipelines. We continue to expand our regional networks to verify logins on any website.
          </p>
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
            <span onClick={() => navigate('/about')} style={{ color: 'var(--color-turquoise)', fontWeight: '600' }}>About Us</span>
            <span onClick={() => navigate('/contact')}>Contact Us</span>
            <span onClick={() => navigate('/terms')}>Terms of Service</span>
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

export default AboutUs;
