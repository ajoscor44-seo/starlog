import React from 'react';
import { MessageCircle, Send, ShieldCheck } from 'lucide-react';
import { useIsMobile } from '../../hooks/useIsMobile';

const TELEGRAM_URL = 'https://t.me/Starlogadmin';

const Support = () => {
  const isMobile = useIsMobile();

  return (
    <div className="animate-slide-in" style={{ maxWidth: '760px', margin: '0 auto', padding: isMobile ? '12px 0 40px' : '32px 0 60px' }}>
      <div className="glass-panel" style={{ padding: isMobile ? '28px 20px' : '48px', textAlign: 'center', border: '1px solid rgba(0, 136, 204, 0.35)' }}>
        <div style={{ width: '68px', height: '68px', margin: '0 auto 20px', borderRadius: '20px', display: 'grid', placeItems: 'center', background: 'rgba(0, 136, 204, 0.16)', color: '#29a9e8' }}>
          <MessageCircle size={34} />
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '6px 10px', marginBottom: '14px', borderRadius: '999px', background: 'rgba(0, 136, 204, 0.12)', color: '#29a9e8', fontSize: '12px', fontWeight: 700 }}>
          <ShieldCheck size={14} /> Official support channel
        </div>
        <h1 style={{ margin: '0 0 12px', fontSize: isMobile ? '28px' : '36px' }}>Support on Telegram</h1>
        <p style={{ margin: '0 auto 26px', maxWidth: '500px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
          Our support team now handles questions, billing issues, and order assistance directly on Telegram for faster replies.
        </p>
        <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', padding: '14px 22px', textDecoration: 'none', background: '#0088cc', border: 'none' }}>
          <Send size={18} /> Message @Starlogadmin
        </a>
        <p style={{ margin: '18px 0 0', color: 'var(--text-muted)', fontSize: '13px' }}>Telegram username: <strong style={{ color: 'var(--text-primary)' }}>@Starlogadmin</strong></p>
      </div>
    </div>
  );
};

export default Support;
