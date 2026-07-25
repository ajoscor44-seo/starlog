import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle, ChevronDown, ChevronUp, Copy, Check, Shield } from 'lucide-react';
import { supabase } from '../../supabase';

const Support = () => {
  const { user, profile } = useContext(AppContext);
  const isMobile = useIsMobile();

  // Contact Form states
  const [name, setName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(profile?.email || user?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);

  // FAQ accordion open states
  const [openFaq, setOpenFaq] = useState({});

  // User tickets list states
  const [userTickets, setUserTickets] = useState([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);

  const fetchUserTickets = async () => {
    if (!user?.id) return;
    setIsLoadingTickets(true);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!error && data) {
        setUserTickets(data);
      }
    } catch (err) {
      console.error("Error fetching user tickets:", err);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchUserTickets();
  }, [user]);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('support@starlog.ng');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleToggleFaq = (index) => {
    setOpenFaq(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitting(true);
    
    const genTicketId = `DZ-${Math.floor(10000 + Math.random() * 90000)}`;
    
    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          id: genTicketId,
          user_id: user?.id || null,
          name,
          email,
          subject: subject || 'No Subject',
          message,
          status: 'PENDING'
        });
        
      if (error) {
        alert(`Failed to submit ticket: ${error.message}`);
      } else {
        setSuccess(true);
        setTicketId(genTicketId);
        setSubject('');
        setMessage('');
        fetchUserTickets();
      }
    } catch (err) {
      console.error(err);
      alert('An unexpected error occurred while submitting your ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  const faqs = [
    {
      q: "How do I fund my wallet?",
      a: "You can fund your wallet via automated bank transfers or cryptocurrency (USDT). For bank transfers, navigate to the Wallet page, copy your dedicated PocketFi account details, and send any amount (minimum ₦100). The deposit will credit automatically within seconds. For USDT, use the Bybit or Binance Pay integration options."
    },
    {
      q: "Why did my SMS OTP verification fail?",
      a: "Our SMS verifications route through physical, non-VOIP SIM pools. Occasionally, a number might expire or a carrier network might experience latency. If you do not receive the verification code within the 15-minute window, the request cancels automatically and your wallet balance is immediately refunded in full. No code, no charge."
    },
    {
      q: "What is your refund policy?",
      a: "All failed SMS verification codes, failed eSIM requests, or cancelled SMM panel orders are automatically refunded to your wallet balance. Wallet deposits themselves are non-withdrawable and must be spent on services inside the StarLog Plus console."
    },
    {
      q: "How do eSIM travel packages work?",
      a: "Upon purchasing an eSIM package, you will receive a QR setup code and profile details straight to your dashboard. Simply connect your unlocked device to Wi-Fi, scan the QR code in your cellular settings, and toggle data roaming on when you arrive at your destination. Do not delete the eSIM profile once added, as it cannot be scanned twice."
    },
    {
      q: "How do I check the delivery status of a Social Log order?",
      a: "To check a social media account order, navigate to Order History. Select your order to open the receipt sheet. If it is still processing, you can press the 'Check Delivery Status' button to query the API. Delivered accounts display username, password, and recovery details instantly."
    }
  ];

  return (
    <div className="animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : 24 }}>
      
      {/* Hero Intro Banner */}
      <div className="glass-panel" style={{
        background: 'linear-gradient(135deg, rgba(171,71,252,0.1) 0%, rgba(0,242,254,0.08) 100%)',
        border: '1px solid rgba(171,71,252,0.2)',
        padding: isMobile ? '20px 16px' : '28px 24px',
      }}>
        <h3 style={{ fontSize: isMobile ? 18 : 22, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-heading)', fontWeight: '800' }}>
          <MessageSquare size={22} style={{ color: 'var(--color-turquoise)' }} />
          Support Desk & Telemetry Helpline
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: isMobile ? 12 : 14, lineHeight: 1.6, margin: 0 }}>
          Welcome to the StarLog support center. Pre-populate a technical inquiry ticket below, review our comprehensive API status guide, or contact us directly.
        </p>
      </div>

      {/* Main Grid: Form, Info, FAQs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '3fr 2fr',
        gap: isMobile ? 16 : 24,
        alignItems: 'flex-start'
      }}>
        
        {/* Left Side: Submit Ticket & FAQs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : 24 }}>
          
          {/* Ticket Form */}
          <div className="glass-panel" style={{ padding: isMobile ? '20px 16px' : '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '20px', fontFamily: 'var(--font-heading)' }}>Submit Support Ticket</h3>
            
            {success && (
              <div style={{ 
                padding: '16px', 
                background: 'rgba(0, 255, 135, 0.08)', 
                border: '1px solid rgba(0, 255, 135, 0.2)', 
                borderRadius: '10px', 
                color: 'var(--color-green)', 
                marginBottom: '20px', 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '12px' 
              }}>
                <CheckCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ margin: '0 0 4px', color: 'var(--color-green)', fontWeight: '700' }}>Ticket Created Successfully!</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    Your ticket ID is <strong>{ticketId}</strong>. A support engineer has been assigned to evaluate your request.
                  </p>
                  <button 
                    className="btn btn-secondary" 
                    style={{ marginTop: '12px', padding: '6px 12px', fontSize: '12px' }} 
                    onClick={() => setSuccess(false)}
                  >
                    Open Another Ticket
                  </button>
                </div>
              </div>
            )}

            {!success && (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="form-label" htmlFor="support-name">Your Name</label>
                    <input
                      id="support-name"
                      type="text"
                      className="form-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label" htmlFor="support-email">Email Address</label>
                    <input
                      id="support-email"
                      type="email"
                      className="form-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label" htmlFor="support-sub">Subject</label>
                  <input
                    id="support-sub"
                    type="text"
                    className="form-input"
                    placeholder="e.g., Wallet Deposit Delay, eSIM issue"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label" htmlFor="support-msg">Detailed Message</label>
                  <textarea
                    id="support-msg"
                    rows="5"
                    className="form-input"
                    style={{ resize: 'vertical' }}
                    placeholder="Provide details about your query. Include transaction IDs, numbers, or plans where applicable..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', width: '100%' }} 
                  disabled={submitting}
                >
                  <Send size={16} />
                  {submitting ? 'Creating Ticket...' : 'Create Ticket'}
                </button>
              </form>
            )}
          </div>

          {/* User's Opened Tickets */}
          {user && (
            <div className="glass-panel" style={{ padding: isMobile ? '20px 16px' : '24px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '16px', fontFamily: 'var(--font-heading)' }}>My Support Tickets</h3>
              {isLoadingTickets ? (
                <div style={{ padding: '20px', color: 'var(--text-secondary)', textAlign: 'center', fontSize: '13px' }}>Loading tickets...</div>
              ) : userTickets.length === 0 ? (
                <div style={{ padding: '20px', color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center' }}>You have not opened any support tickets yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {userTickets.map((t) => {
                    const isPending = t.status === 'PENDING';
                    const isResolved = t.status === 'RESOLVED';
                    return (
                      <div 
                        key={t.id} 
                        style={{ 
                          border: '1px solid var(--border-color)', 
                          borderRadius: '10px', 
                          padding: '14px 16px', 
                          background: 'rgba(255, 255, 255, 0.01)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-turquoise)', fontFamily: 'monospace' }}>{t.id}</span>
                          <span 
                            style={{ 
                              fontSize: '10px', 
                              fontWeight: 'bold', 
                              padding: '2px 6px', 
                              borderRadius: '4px',
                              background: isPending ? 'rgba(219, 166, 23, 0.2)' : isResolved ? 'rgba(0, 163, 42, 0.2)' : 'rgba(214, 54, 56, 0.2)',
                              color: isPending ? '#dba617' : isResolved ? '#00a32a' : '#d63638'
                            }}
                          >
                            {t.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>{t.subject}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '8px', wordBreak: 'break-word' }}>{t.message}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Opened on: {new Date(t.created_at).toLocaleString()}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* FAQs Accordion */}
          <div className="glass-panel" style={{ padding: isMobile ? '20px 16px' : '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', fontFamily: 'var(--font-heading)' }}>Frequently Asked Questions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {faqs.map((faq, index) => {
                const isOpen = !!openFaq[index];
                return (
                  <div 
                    key={index} 
                    style={{ 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '10px', 
                      overflow: 'hidden',
                      background: 'rgba(255, 255, 255, 0.01)'
                    }}
                  >
                    <div 
                      onClick={() => handleToggleFaq(index)}
                      style={{ 
                        padding: '14px 16px', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        cursor: 'pointer',
                        userSelect: 'none',
                        background: isOpen ? 'rgba(255,255,255,0.02)' : 'transparent'
                      }}
                    >
                      <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{faq.q}</span>
                      {isOpen ? <ChevronUp size={16} style={{ color: 'var(--color-turquoise)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-secondary)' }} />}
                    </div>
                    {isOpen && (
                      <div style={{ 
                        padding: '14px 16px', 
                        fontSize: '13px', 
                        color: 'var(--text-secondary)', 
                        lineHeight: '1.5',
                        borderTop: '1px solid var(--border-color)',
                        background: 'rgba(0,0,0,0.1)'
                      }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Side: Contact Channels Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : 24 }}>
          
          {/* Quick Contact Panel */}
          <div className="glass-panel" style={{ padding: isMobile ? '20px 16px' : '24px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', fontFamily: 'var(--font-heading)' }}>
              Direct Channels
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Email Address */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ 
                  width: '36px', height: '36px', borderRadius: '8px', 
                  background: 'rgba(171,71,252,0.08)', border: '1px solid rgba(171,71,252,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
                }}>
                  <Mail size={18} style={{ color: '#ab47fc' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Support</div>
                  <a 
                    href="mailto:support@starlog.ng" 
                    style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}
                  >
                    support@starlog.ng
                  </a>
                  <button 
                    onClick={handleCopyEmail}
                    style={{ 
                      background: 'none', border: 'none', color: 'var(--color-turquoise)', fontSize: '11px', 
                      display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', cursor: 'pointer', padding: 0, fontWeight: '600'
                    }}
                  >
                    {copiedEmail ? <Check size={12} /> : <Copy size={12} />}
                    {copiedEmail ? 'Copied' : 'Copy Address'}
                  </button>
                </div>
              </div>

              {/* WhatsApp Helpline */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ 
                  width: '36px', height: '36px', borderRadius: '8px', 
                  background: 'rgba(0, 242, 254, 0.08)', border: '1px solid rgba(0, 242, 254, 0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
                }}>
                  <Phone size={18} style={{ color: 'var(--color-turquoise)' }} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>WhatsApp Helpline</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>
                    +234 707 972 2993
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Available 09:00 - 18:00 WAT
                  </div>
                </div>
              </div>

              {/* Office Address */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ 
                  width: '36px', height: '36px', borderRadius: '8px', 
                  background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
                }}>
                  <MapPin size={18} style={{ color: 'var(--text-secondary)' }} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Office Address</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '2px', lineHeight: '1.4' }}>
                    Lagos Tech Zone, Yaba,<br />Lagos, Nigeria
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Telemetry Status info */}
          <div className="glass-panel" style={{ 
            background: 'rgba(0,242,254,0.02)', 
            border: '1px solid rgba(0,242,254,0.1)',
            padding: isMobile ? '20px 16px' : '24px' 
          }}>
            <h4 style={{ margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
              <Shield size={16} style={{ color: 'var(--color-turquoise)' }} />
              API Server Telemetry
            </h4>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Our servers check OTP queue carrier signals every 30 seconds. Inquiries submitted via this portal trigger automated support logs which help identify carrier outages in real-time.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Support;
