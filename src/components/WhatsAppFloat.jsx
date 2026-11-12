import React from 'react';

const WHATSAPP_NUMBER = '2347079722993';
const WHATSAPP_MESSAGE = encodeURIComponent('Hello StarLog, I need help with your services.');

const WhatsAppIcon = ({ size = 27 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
    <path d="M19.11 17.37c-.28-.14-1.65-.81-1.9-.9-.26-.1-.45-.14-.64.14-.19.28-.73.9-.9 1.09-.16.19-.33.21-.61.07-.28-.14-1.18-.43-2.24-1.38-.83-.74-1.39-1.65-1.55-1.93-.17-.28-.02-.43.12-.57.13-.13.28-.33.42-.5.14-.16.19-.28.28-.47.09-.19.05-.35-.02-.5-.07-.14-.64-1.54-.87-2.11-.23-.55-.47-.48-.64-.49h-.54c-.19 0-.49.07-.75.35-.26.28-.99.97-.99 2.36s1.01 2.74 1.15 2.93c.14.19 1.99 3.04 4.82 4.26.67.29 1.2.46 1.61.59.68.21 1.29.18 1.78.11.54-.08 1.65-.68 1.88-1.33.23-.66.23-1.22.16-1.33-.07-.12-.26-.19-.54-.33Z" />
    <path d="M16.05 3C8.89 3 3.08 8.8 3.08 15.96c0 2.28.6 4.51 1.72 6.47L3 29l6.72-1.76a12.94 12.94 0 0 0 6.32 1.61h.01c7.15 0 12.97-5.81 12.97-12.96C29.02 8.8 23.2 3 16.05 3Zm0 23.67h-.01c-2 0-3.96-.54-5.67-1.55l-.41-.24-3.99 1.05 1.07-3.89-.27-.4a10.76 10.76 0 0 1-1.64-5.68c0-6.02 4.9-10.91 10.93-10.91 6.02 0 10.92 4.89 10.92 10.91 0 6.02-4.9 10.91-10.93 10.91Z" />
  </svg>
);

const WhatsAppFloat = () => (
  <a
    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
    target="_blank"
    rel="noreferrer"
    aria-label="Chat with StarLog support on WhatsApp"
    title="Chat with us on WhatsApp"
    style={{
      position: 'fixed',
      right: 'max(18px, env(safe-area-inset-right))',
      bottom: 'max(18px, env(safe-area-inset-bottom))',
      zIndex: 1200,
      width: 58,
      height: 58,
      borderRadius: '50%',
      display: 'grid',
      placeItems: 'center',
      color: '#fff',
      background: '#25D366',
      border: '2px solid rgba(255,255,255,0.88)',
      boxShadow: '0 10px 28px rgba(0,0,0,0.34), 0 0 0 5px rgba(37,211,102,0.13)',
      textDecoration: 'none',
      transition: 'transform 160ms ease, box-shadow 160ms ease',
    }}
    onMouseEnter={(event) => {
      event.currentTarget.style.transform = 'translateY(-3px) scale(1.04)';
      event.currentTarget.style.boxShadow = '0 14px 32px rgba(0,0,0,0.4), 0 0 0 7px rgba(37,211,102,0.17)';
    }}
    onMouseLeave={(event) => {
      event.currentTarget.style.transform = '';
      event.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,0.34), 0 0 0 5px rgba(37,211,102,0.13)';
    }}
  >
    <WhatsAppIcon />
  </a>
);

export default WhatsAppFloat;
