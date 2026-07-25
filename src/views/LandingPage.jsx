import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingNav from '../components/LandingNav';
import { AppContext } from '../context/AppContext';
import { 
  Sparkles, 
  Key, 
  Zap, 
  ArrowRight,
  Sun,
  Moon,
  HelpCircle,
  Check,
  Layers,
  ShieldCheck
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const { formatCost, theme, toggleTheme, isLoggedIn, logoutUser, user, dbIsAdmin } = useContext(AppContext);

  const features = [
    {
      title: 'One-Time OTP Verifications',
      desc: 'Verify accounts with real physical non-VOIP SIMs. Instantly receive verification codes for WhatsApp, Google, Telegram, and more.',
      icon: Key,
      action: 'otp',
      color: 'var(--color-pink)'
    },
    {
      title: 'Social Media Logs',
      desc: 'Purchase secure credentials and access logs for social media profiles. Instantly retrieved with recovery details.',
      icon: ShieldCheck,
      action: 'social',
      color: 'var(--color-violet)'
    }
  ];

  return (
    <div className="landing-container">
      {/* Navigation */}
      <LandingNav />

      {/* Hero Section */}
      <section className="landing-hero animate-slide-in">
        <div className="hero-tag">
          <Zap size={14} style={{ marginRight: '6px' }} />
          All-In-One Digital Services Hub
        </div>
        <h1 className="landing-title">
          Stellar OTP Verifications, <br />
          <span>& Social Media Logs</span>
        </h1>
        <p className="landing-desc">
          StarLog matches top-tier telecom access, physical SIM verification, and premium social logs under a single automated dashboard. Fund in NGN/USD and deploy assets instantly.
        </p>
        <div className="hero-buttons">
          <button className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '16px' }} onClick={() => navigate('/dashboard')}>
            Enter Dashboard <ArrowRight size={18} style={{ marginLeft: '4px' }} />
          </button>
          <button className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '16px' }} onClick={() => navigate('/dashboard/otp')}>
            Get Free OTP Trial
          </button>
        </div>
      </section>

      {/* Core Features Grid */}
      <section style={{ padding: '0 20px 80px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '32px', marginBottom: '12px', fontFamily: 'var(--font-heading)' }}>
          Explore Our Suite of Digital Tools
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.6' }}>
          Instant setup, transparent pricing, and comprehensive APIs.
        </p>

        <div className="features-grid">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div 
                key={idx} 
                className="glass-panel interactive" 
                style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
              >
                <div className="feature-icon-box" style={{ background: `rgba(${feat.color === 'var(--color-pink)' ? '255, 0, 127' : feat.color === 'var(--color-turquoise)' ? '0, 242, 254' : '127, 0, 255'}, 0.1)` }}>
                  <Icon size={26} style={{ color: feat.color }} />
                </div>
                <h3 style={{ marginTop: '20px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {feat.title}
                  {feat.action === 'esim' && !dbIsAdmin && (
                    <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: '700' }}>
                      Coming Soon
                    </span>
                  )}
                </h3>
                <p>{feat.desc}</p>
                <div 
                  className="learn-more" 
                  style={{ color: feat.color, cursor: 'pointer' }}
                  onClick={() => {
                    if (feat.action === 'subs') {
                      navigate('/dashboard/subs');
                    } else {
                      navigate(`/dashboard/${feat.action}`);
                    }
                  }}
                >
                  Configure Service <ArrowRight size={14} />
                </div>
              </div>
            );
          })}
        </div>


      </section>

      {/* How It Works Section */}
      <section style={{ padding: '80px 20px', background: 'rgba(0,0,0,0.015)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '32px', marginBottom: '12px', fontFamily: 'var(--font-heading)' }}>
            Seamless 4-Step Process
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 50px', lineHeight: '1.6' }}>
            No physical complications or manual sign-off delays. Experience high-speed automated provisioning.
          </p>

          <div className="process-grid">
            <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '64px', fontWeight: '900', opacity: 0.05, fontFamily: 'var(--font-heading)' }}>01</div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(0, 242, 254, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Layers size={20} style={{ color: 'var(--color-turquoise)' }} />
              </div>
              <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>Fund Wallet</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                Deposit funds instantly using secure automated virtual bank transfers, or Tether (USDT) cryptocurrency (Binance / Bybit). Your balance updates instantly.
              </p>
            </div>

            <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '64px', fontWeight: '900', opacity: 0.05, fontFamily: 'var(--font-heading)' }}>02</div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(127, 0, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Layers size={20} style={{ color: 'var(--color-violet)' }} />
              </div>
              <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>Choose Service</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                Select from our core services: request a temporary one-time OTP verification number or order secure social media account logs.
              </p>
            </div>

            <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '64px', fontWeight: '900', opacity: 0.05, fontFamily: 'var(--font-heading)' }}>03</div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255, 0, 127, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Layers size={20} style={{ color: 'var(--color-pink)' }} />
              </div>
              <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>Instant Delivery</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                Our backend automates provisioning. Verification SMS arrives in real-time on our custom dashboard panels, and purchased social account logs are delivered instantly to your console.
              </p>
            </div>

            <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '64px', fontWeight: '900', opacity: 0.05, fontFamily: 'var(--font-heading)' }}>04</div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(0, 255, 135, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Layers size={20} style={{ color: 'var(--color-green)' }} />
              </div>
              <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>Manage Telemetry</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                Utilize the Client Console telemetry to read incoming verification messages or manage your purchased social logs. Everything is centralized in one simple premium dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Advantages */}
      <section style={{ padding: '80px 20px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '32px', marginBottom: '12px', fontFamily: 'var(--font-heading)' }}>
            Engineered For High-Performance
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 50px', lineHeight: '1.6' }}>
            A custom infrastructure built to replace legacy digital vending with high reliability.
          </p>

          <div className="advantages-grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={14} style={{ color: 'var(--color-green)' }} />
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', marginBottom: '6px' }}>Physical SIM Card Routing</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                    Unlike low-cost VOIP providers that get flagged by web platforms, our temporary OTP and number rental systems route traffic through physical SIM pools to ensure 100% verification success on services like Google, Telegram, and WhatsApp.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={14} style={{ color: 'var(--color-green)' }} />
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', marginBottom: '6px' }}>Reseller-Grade SMM Panel</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                    We plug directly into high-speed SMM reseller API backbones. Get standard-grade and high-quality non-drop followers, channel members, and video views with lifetime refill warranties at wholesale rates.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={14} style={{ color: 'var(--color-green)' }} />
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', marginBottom: '6px' }}>Zero-Roaming eSIM Travel Profiles</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                    Provision instant data profiles spanning 85+ countries. Scan the QR code or key in SM-DP+ activation codes to secure local connectivity. Avoid expensive roaming charges and maintain global high-speed data.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={14} style={{ color: 'var(--color-green)' }} />
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', marginBottom: '6px' }}>Instant Dual-Billing System</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                    Switch your entire client interface between Naira (₦) and US Dollars ($) on the fly. Check precise real-time conversions backed by simulated bank gateways and secure transaction ledgers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter & Info */}
      <section style={{ background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid var(--border-color)', padding: '60px 20px' }}>
        <div className="stats-grid">
          <div>
            <div style={{ fontSize: '48px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--color-turquoise)' }}>99.9%</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>SMS Gateway Uptime</div>
          </div>
          <div>
            <div style={{ fontSize: '48px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--color-pink)' }}>150+</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>Supported Countries</div>
          </div>
          <div>
            <div style={{ fontSize: '48px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--color-violet)' }}>3.2M+</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>Orders Processed</div>
          </div>
          <div>
            <div style={{ fontSize: '48px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--color-green)' }}>&lt; 5s</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>Average Delivery Speed</div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section style={{ padding: '80px 20px', background: 'rgba(0,0,0,0.01)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '32px', marginBottom: '12px', fontFamily: 'var(--font-heading)' }}>
            Frequently Asked Questions
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 50px', lineHeight: '1.6' }}>
            Have questions about billing, compatibility, or delivery? We have answers.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-panel">
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', marginBottom: '8px', margin: 0 }}>
                <HelpCircle size={18} style={{ color: 'var(--color-pink)', flexShrink: 0 }} />
                Are the shared premium accounts safe to use?
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '8px 0 0 0', lineHeight: '1.6' }}>
                Yes, absolutely. All accounts are family slots managed by our automated system. You receive a unique screen credential and password. To prevent disruptions, credentials must not be shared outside your allocated screen slot.
              </p>
            </div>

            <div className="glass-panel">
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', marginBottom: '8px', margin: 0 }}>
                <HelpCircle size={18} style={{ color: 'var(--color-pink)', flexShrink: 0 }} />
                What happens if a temporary number doesn't receive an OTP?
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '8px 0 0 0', lineHeight: '1.6' }}>
                Our system operates under a strict success-only guarantee. If a temporary number does not receive an SMS code within its 15-minute window, the system automatically cancels the request and issues a full refund directly to your wallet balance.
              </p>
            </div>

            <div className="glass-panel">
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', marginBottom: '8px', margin: 0 }}>
                <HelpCircle size={18} style={{ color: 'var(--color-pink)', flexShrink: 0 }} />
                How do I install my travel eSIM?
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '8px 0 0 0', lineHeight: '1.6' }}>
                Once purchased, your profile installation QR code and manual details (SM-DP+ Address & Activation Code) display in your dashboard under E-Sims. Scan the code in your phone settings under 'Add Cellular Plan' while connected to Wi-Fi.
              </p>
            </div>

            <div className="glass-panel">
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', marginBottom: '8px', margin: 0 }}>
                <HelpCircle size={18} style={{ color: 'var(--color-pink)', flexShrink: 0 }} />
                Are the SMM boost reseller services instant?
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '8px 0 0 0', lineHeight: '1.6' }}>
                Yes, most SMM reseller orders trigger instantly. High-volume requests queue and process progressively. You can monitor progress under the SMM panel order tracker.
              </p>
            </div>
          </div>
        </div>
      </section>

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

const LiveDemoSimulator = () => {
  const [activeTab, setActiveTab] = useState('otp');
  const [step, setStep] = useState(0);
  const [followerCount, setFollowerCount] = useState(14250);

  // Handle step increments based on activeTab
  useEffect(() => {
    setStep(0);
    setFollowerCount(14250);
  }, [activeTab]);

  useEffect(() => {
    let interval = null;
    
    if (activeTab === 'otp') {
      interval = setInterval(() => {
        setStep(curr => {
          if (curr >= 5) return 0;
          return curr + 1;
        });
      }, 2500);
    } else if (activeTab === 'esim') {
      interval = setInterval(() => {
        setStep(curr => {
          if (curr >= 3) return 0;
          return curr + 1;
        });
      }, 3000);
    } else if (activeTab === 'smm') {
      interval = setInterval(() => {
        setStep(curr => {
          if (curr >= 3) return 0;
          return curr + 1;
        });
      }, 3500);
    }

    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'smm' && step === 2) {
      let count = 14250;
      const target = 15250;
      const countInterval = setInterval(() => {
        count += 50;
        if (count >= target) {
          setFollowerCount(target);
          clearInterval(countInterval);
        } else {
          setFollowerCount(count);
        }
      }, 100);
      return () => clearInterval(countInterval);
    } else {
      setFollowerCount(14250);
    }
  }, [activeTab, step]);

  const tabs = [
    { id: 'otp', label: 'OTP Verifications', desc: 'Secure real SIM routing', icon: Key, color: 'var(--color-pink)' },
    { id: 'esim', label: 'eSIM Setup', desc: 'QR code profile scanning', icon: Smartphone, color: 'var(--color-turquoise)' },
    { id: 'smm', label: 'SMM Campaign', desc: 'Real-time metrics delivery', icon: Share2, color: 'var(--color-green)' }
  ];

  return (
    <div className="glass-panel animate-slide-in" style={{
      padding: '24px',
      marginTop: '40px',
      border: '1px solid var(--border-color)',
      background: 'var(--bg-card)',
      boxShadow: 'var(--shadow-glow)'
    }}>
      <h3 style={{
        fontSize: '22px',
        marginBottom: '6px',
        fontFamily: 'var(--font-heading)',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}>
        <Zap size={18} style={{ color: 'var(--color-turquoise)' }} />
        See It in Action
      </h3>
      <p style={{
        color: 'var(--text-secondary)',
        fontSize: '14px',
        textAlign: 'center',
        maxWidth: '500px',
        margin: '0 auto 28px',
        lineHeight: '1.5'
      }}>
        Select a tool below to watch a simulated micro-animation of our automated delivery loops.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        alignItems: 'center'
      }}>
        {/* Left: Tab Selectors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tabs.map(t => {
            const active = activeTab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => { setActiveTab(t.id); setStep(0); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '16px',
                  borderRadius: '12px',
                  border: `1px solid ${active ? t.color : 'var(--border-color)'}`,
                  background: active ? `rgba(${t.id === 'otp' ? '255, 0, 127' : t.id === 'esim' ? '0, 242, 254' : '0, 255, 135'}, 0.06)` : 'var(--bg-btn-secondary)',
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
              >
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  background: `rgba(${t.id === 'otp' ? '255, 0, 127' : t.id === 'esim' ? '0, 242, 254' : '0, 255, 135'}, 0.1)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: t.color
                }}>
                  <Icon size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '15px' }}>{t.label}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Device Viewport Mockup */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid var(--border-color)',
          borderRadius: '20px',
          height: '280px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
        }}>
          {/* Glowing background highlights */}
          <div style={{
            position: 'absolute',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            filter: 'blur(50px)',
            opacity: 0.12,
            background: activeTab === 'otp' ? 'var(--color-pink)' : activeTab === 'esim' ? 'var(--color-turquoise)' : 'var(--color-green)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none'
          }} />

          {/* OTP SIMULATION */}
          {activeTab === 'otp' && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
              {step === 0 && (
                <>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Service: WhatsApp (US Number)</div>
                  <div style={{ width: '80%', padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px dashed var(--border-color)', borderRadius: '8px', textAlign: 'center', fontSize: '13px' }}>
                    Click button to query SIM pool
                  </div>
                  <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px', background: 'var(--color-pink)' }}>
                    Acquire Virtual SIM
                  </button>
                </>
              )}

              {step === 1 && (
                <>
                  <div className="spinner-loader" style={{ width: '32px', height: '32px', border: '3px solid rgba(255, 0, 127, 0.2)', borderTopColor: 'var(--color-pink)' }} />
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Connecting SMS Gateway...</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Searching for available physical US numbers</div>
                </>
              )}

              {step === 2 && (
                <>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Allocated: <strong style={{ color: 'var(--text-primary)' }}>+1 (312) 584-9021</strong></div>
                  <div style={{ width: '90%', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', textAlign: 'center', fontSize: '12px' }}>
                    <div className="blink-loader" style={{ color: 'var(--color-amber)', fontWeight: '600' }}>Waiting for SMS Code...</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px' }}>Timeout in: 14m 58s</div>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>SIM Inbox: +1 (312) 584-9021</div>
                  <div className="animate-slide-in" style={{
                    width: '95%',
                    padding: '12px',
                    background: 'rgba(255, 0, 127, 0.08)',
                    border: '1px solid rgba(255, 0, 127, 0.2)',
                    borderRadius: '10px',
                    fontSize: '12px',
                    lineHeight: '1.45',
                    position: 'relative'
                  }}>
                    <strong style={{ color: 'var(--color-pink)' }}>WhatsApp Code Received!</strong>
                    <div style={{ color: 'var(--text-primary)', marginTop: '4px' }}>Your verification code: <strong style={{ color: 'var(--color-green)', fontSize: '14px' }}>482-905</strong>. Do not share.</div>
                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Autofilling verification boxes...</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['4', '8', '2', '9', '0', '5'].map((char, i) => (
                      <div key={i} style={{
                        width: '32px',
                        height: '36px',
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid var(--color-turquoise)',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        color: 'var(--color-turquoise)',
                        fontSize: '16px'
                      }}>
                        {char}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {step === 5 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }} className="animate-slide-in">
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'rgba(0, 255, 135, 0.1)',
                    border: '2px solid var(--color-green)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-green)'
                  }}>
                    <Check size={24} />
                  </div>
                  <div style={{ fontWeight: '700', color: 'var(--color-green)', fontSize: '15px' }}>Verification Successful!</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>WhatsApp activated on US number.</div>
                </div>
              )}
            </div>
          )}

          {/* ESIM SIMULATION */}
          {activeTab === 'esim' && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
              {step === 0 && (
                <>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Global eSIM (Europe 10GB Plan)</div>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: '#fff',
                    padding: '6px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border-color)'
                  }}>
                    <svg viewBox="0 0 24 24" width="68" height="68">
                      <path d="M0 0h9v9H0V0zm1 1v7h7V1H1zm11 11h9v9h-9v-9zm1 1v7h7v-7h-7zM0 15h9v9H0v-9zm1 1v7h7v-7H1zm14-15h9v9h-9V0zm1 1v7h7V1h-7zm0 11h2v2h-2v-2zm2 2h2v2h-2v-2zm-2 2h2v2h-2v-2zm4-4h2v2h-2v-2zm0 4h2v2h-2v-2zm2-2h2v2h-2v-2z" fill="#06040b" />
                    </svg>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Scan QR with phone cellular settings</div>
                </>
              )}

              {step === 1 && (
                <div style={{ position: 'relative', width: '90px', height: '90px' }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: '#fff',
                    padding: '8px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg viewBox="0 0 24 24" width="74" height="74">
                      <path d="M0 0h9v9H0V0zm1 1v7h7V1H1zm11 11h9v9h-9v-9zm1 1v7h7v-7h-7zM0 15h9v9H0v-9zm1 1v7h7v-7H1zm14-15h9v9h-9V0zm1 1v7h7V1h-7zm0 11h2v2h-2v-2zm2 2h2v2h-2v-2zm-2 2h2v2h-2v-2zm4-4h2v2h-2v-2zm0 4h2v2h-2v-2zm2-2h2v2h-2v-2z" fill="#06040b" />
                    </svg>
                  </div>
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'var(--color-turquoise)',
                    boxShadow: '0 0 8px var(--color-turquoise)',
                    top: '20%',
                    animation: 'scanLaser 1.5s infinite ease-in-out'
                  }} />
                  <style>{`
                    @keyframes scanLaser {
                      0%, 100% { top: 10%; }
                      50% { top: 90%; }
                    }
                  `}</style>
                </div>
              )}

              {step === 2 && (
                <>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>eSIM Profile Installation...</div>
                  <div style={{ width: '80%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <div style={{ height: '100%', background: 'var(--color-turquoise)', borderRadius: '99px', animation: 'loadProgress 2s forwards' }} />
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Provisioning 10GB Data Plan (EU network)</div>
                  <style>{`
                    @keyframes loadProgress {
                      0% { width: 0%; }
                      100% { width: 100%; }
                    }
                  `}</style>
                </>
              )}

              {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }} className="animate-slide-in">
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'rgba(0, 242, 254, 0.1)',
                    border: '2px solid var(--color-turquoise)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-turquoise)'
                  }}>
                    <Check size={24} />
                  </div>
                  <div style={{ fontWeight: '700', color: 'var(--color-turquoise)', fontSize: '15px' }}>eSIM Installed!</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-green)' }}>
                    <span>Global carrier active</span>
                    <strong>5G [|||||]</strong>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SMM SIMULATION */}
          {activeTab === 'smm' && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
              {step === 0 && (
                <>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Boost: Instagram Followers</div>
                  <div style={{
                    width: '90%',
                    padding: '12px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    fontSize: '12px'
                  }}>
                    <div>Link: <strong style={{ color: 'var(--text-primary)' }}>instagram.com/mybrand</strong></div>
                    <div>Quantity: <strong style={{ color: 'var(--text-primary)' }}>1,000</strong></div>
                  </div>
                  <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '12px', background: 'var(--color-green)', color: '#000', fontWeight: '700' }}>
                    Launch Boost Campaign
                  </button>
                </>
              )}

              {step === 1 && (
                <>
                  <div className="spinner-loader" style={{ width: '32px', height: '32px', border: '3px solid rgba(0, 255, 135, 0.2)', borderTopColor: 'var(--color-green)' }} />
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Initializing campaign queue...</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Wallet deduction: -₦3,000.00</div>
                </>
              )}

              {step === 2 && (
                <>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>SMM Campaign In Progress</div>
                  <div style={{
                    width: '95%',
                    padding: '14px 16px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Target Page</div>
                      <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>@mybrand</strong>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Live Followers</div>
                      <strong style={{ fontSize: '18px', color: 'var(--color-green)', fontFamily: 'var(--font-heading)' }}>
                        {followerCount.toLocaleString()}
                      </strong>
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Drip-feeding at standard algorithm-safe rate</div>
                </>
              )}

              {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }} className="animate-slide-in">
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'rgba(0, 255, 135, 0.1)',
                    border: '2px solid var(--color-green)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-green)'
                  }}>
                    <Check size={22} />
                  </div>
                  <div style={{ fontWeight: '700', color: 'var(--color-green)', fontSize: '15px' }}>Campaign Finalized!</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total: <strong style={{ color: 'var(--text-primary)' }}>1,000 followers</strong> successfully provisioned.</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
