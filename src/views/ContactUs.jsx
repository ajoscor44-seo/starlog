import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingNav from '../components/LandingNav';
import { Sparkles, Mail, Phone, MapPin, Send, MessageSquare, CheckCircle } from 'lucide-react';

const ContactUs = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitting(true);
    
    // Simulate support ticket assignment
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setTicketId(`DK-${Math.floor(10000 + Math.random() * 90000)}`);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 1500);
  };

  return (
    <div className="landing-container animate-slide-in">
      {/* Navigation */}
      <LandingNav currentActive="contact" />

      {/* Hero Header */}
      <section className="landing-hero" style={{ paddingBottom: '40px' }}>
        <div className="hero-tag">
          <MessageSquare size={14} style={{ marginRight: '6px' }} />
          Get In Touch
        </div>
        <h1 className="landing-title">
          We Are Online <br />
          <span>And Ready To Assist You</span>
        </h1>
        <p className="landing-desc" style={{ margin: 0 }}>
          Have configuration questions or require custom bulk API rates? Our team provides around-the-clock supervision for physical SMS nodes and eSIM server slots.
        </p>
      </section>

      {/* Grid: Form and details */}
      <section style={{ padding: '0 20px 80px', maxWidth: '1000px', margin: '0 auto' }}>
        <div className="contact-grid">
          
          {/* Form */}
          <div className="glass-panel">
            <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Submit Support Inquiry</h3>
            
            {success && (
              <div style={{ padding: '16px', background: 'rgba(0, 255, 135, 0.1)', border: '1px solid rgba(0, 255, 135, 0.2)', borderRadius: '10px', color: 'var(--color-green)', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '12px', textAlign: 'left' }}>
                <CheckCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ margin: '0 0 4px', color: 'var(--color-green)' }}>Inquiry Dispatched Successfully!</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Your simulated support ticket ID is <strong>{ticketId}</strong>. A technical operator will evaluate your telemetry request.
                  </p>
                  <button className="btn btn-secondary" style={{ marginTop: '12px', padding: '4px 10px', fontSize: '11px' }} onClick={() => setSuccess(false)}>
                    Submit Another Inquiry
                  </button>
                </div>
              </div>
            )}

            {!success && (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="form-label" htmlFor="contact-name">Full Name</label>
                  <input
                    id="contact-name"
                    type="text"
                    className="form-input"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label" htmlFor="contact-email">Email Address</label>
                  <input
                    id="contact-email"
                    type="email"
                    className="form-input"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label" htmlFor="contact-sub">Subject (Optional)</label>
                  <input
                    id="contact-sub"
                    type="text"
                    className="form-input"
                    placeholder="How can we help?"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label" htmlFor="contact-msg">Message</label>
                  <textarea
                    id="contact-msg"
                    rows="4"
                    className="form-input"
                    style={{ resize: 'vertical' }}
                    placeholder="Type details of your API or billing request here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '14px', width: '100%', display: 'flex', justifyContent: 'center' }} disabled={submitting}>
                  <Send size={16} style={{ marginRight: '6px' }} />
                  {submitting ? 'Dispatching...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div className="glass-panel">
              <h3 style={{ fontSize: '18px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Contact Channels</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '14px' }}>
                  <Mail size={20} style={{ color: 'var(--color-turquoise)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>General Support</div>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '2px' }}>support@starlog.ng</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px' }}>
                  <Phone size={20} style={{ color: 'var(--color-turquoise)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>WhatsApp Helpline</div>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '2px' }}>+234 707 972 2993</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px' }}>
                  <MapPin size={20} style={{ color: 'var(--color-turquoise)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Head Office</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '2px', lineHeight: '1.4' }}>
                      Lagos Tech Zone, Yaba,<br />Lagos, Nigeria
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ background: 'rgba(55,173,209,0.05)', border: '1px solid rgba(55,173,209,0.15)' }}>
              <h4 style={{ margin: '0 0 8px' }}>Response Telemetry</h4>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Our systems check SMS gateway queues continuously. Technical messages generally receive feedback within 15 minutes. Billing simulations credit instantly on the wallet sandbox.
              </p>
            </div>

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
            <span onClick={() => navigate('/contact')} style={{ color: 'var(--color-turquoise)', fontWeight: '600' }}>Contact Us</span>
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

export default ContactUs;
