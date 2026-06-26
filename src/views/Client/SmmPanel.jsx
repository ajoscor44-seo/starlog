import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useMatch } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { AppContext } from '../../context/AppContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { 
  Share2, Link, Layers, AlertCircle, Sparkles, Send, Info, Zap, X, 
  Users, Heart, Play, TrendingUp, ChevronDown, ChevronUp, Check, 
  ChevronRight, CheckCircle2, Eye, ShieldAlert, Award
} from 'lucide-react';

// Platform color themes
const PLATFORM_THEMES = {
  Instagram: { color: '#E1306C', bg: 'rgba(225,48,108,0.12)', border: 'rgba(225,48,108,0.3)', glow: 'rgba(225,48,108,0.15)' },
  TikTok:    { color: '#ffffff', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.15)', glow: 'rgba(255,255,255,0.05)' },
  YouTube:   { color: '#FF0000', bg: 'rgba(255,0,0,0.1)',    border: 'rgba(255,0,0,0.25)', glow: 'rgba(255,0,0,0.15)' },
  Telegram:  { color: '#2AABEE', bg: 'rgba(42,171,238,0.1)', border: 'rgba(42,171,238,0.25)', glow: 'rgba(42,171,238,0.15)' },
  Spotify:   { color: '#1DB954', bg: 'rgba(29,185,84,0.1)',  border: 'rgba(29,185,84,0.25)', glow: 'rgba(29,185,84,0.15)' },
  Twitter:   { color: '#1DA1F2', bg: 'rgba(29,161,242,0.1)', border: 'rgba(29,161,242,0.25)', glow: 'rgba(29,161,242,0.15)' },
  Facebook:  { color: '#1877F2', bg: 'rgba(24,119,242,0.1)', border: 'rgba(24,119,242,0.25)', glow: 'rgba(24,119,242,0.15)' },
  Twitch:    { color: '#9146FF', bg: 'rgba(145,70,255,0.1)', border: 'rgba(145,70,255,0.25)', glow: 'rgba(145,70,255,0.15)' },
  Discord:   { color: '#5865F2', bg: 'rgba(88,101,242,0.1)', border: 'rgba(88,101,242,0.25)', glow: 'rgba(88,101,242,0.15)' },
  Google:    { color: '#4285F4', bg: 'rgba(66,133,244,0.1)', border: 'rgba(66,133,244,0.25)', glow: 'rgba(66,133,244,0.15)' },
};

// Platform SVG Icons
const PlatformIcon = ({ platform, logo, size = 18 }) => {
  const key = logo || platform;
  const icons = {
    Instagram: (
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <defs><radialGradient id="ig-smm" cx="20%" cy="100%" r="150%">
          <stop offset="0%" stopColor="#fdf497"/><stop offset="45%" stopColor="#fd5949"/>
          <stop offset="60%" stopColor="#d6249f"/><stop offset="90%" stopColor="#285AEB"/>
        </radialGradient></defs>
        <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig-smm)"/>
        <circle cx="12" cy="12" r="4.5" fill="none" stroke="#fff" strokeWidth="1.5"/>
        <circle cx="17" cy="7" r="1.2" fill="#fff"/>
      </svg>
    ),
    TikTok: (
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <rect x="2" y="2" width="20" height="20" rx="6" fill="#010101"/>
        <path d="M16.8 9.38a3.72 3.72 0 0 1-2.12-.68v4.86c0 2.31-1.87 4.2-4.18 4.2A4.19 4.19 0 0 1 6.3 13.56c0-2.31 1.88-4.2 4.19-4.2.24 0 .47.02.7.06v1.9c-.22-.05-.45-.08-.7-.08-1.27 0-2.3 1.03-2.3 2.3 0 1.28 1.03 2.3 2.3 2.3 1.28 0 2.3-1.03 2.3-2.3V5.5h1.9c.1 1.15.89 2.08 1.95 2.38v1.5Z" fill="#fff"/>
      </svg>
    ),
    YouTube: (
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <rect x="2" y="2" width="20" height="20" rx="6" fill="#FF0000"/>
        <path d="M19.5 8.5s-.2-1.3-.8-1.9c-.75-.8-1.6-.8-2-.85C14.42 5.6 12 5.6 12 5.6s-2.42 0-4.7.15c-.4.05-1.25.05-2 .85-.6.6-.8 1.9-.8 1.9S4.3 9.97 4.3 11.45v1.36c0 1.47.2 2.95.2 2.95s.2 1.3.8 1.9c.75.8 1.75.77 2.2.85 1.6.15 6.8.2 6.8.2s2.43 0 4.7-.15c.4-.05 1.25-.05 2-.85.6-.6.8-1.9.8-1.9s.2-1.47.2-2.95v-1.36C19.8 9.97 19.5 8.5 19.5 8.5ZM10.4 13.95V9.35l5.4 2.32-5.4 2.28Z" fill="#fff"/>
      </svg>
    ),
    Telegram: (
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <rect x="2" y="2" width="20" height="20" rx="6" fill="#2AABEE"/>
        <path d="M17.5 7.82l-2.27 10.7a.84.84 0 0 1-1.24.58l-3.3-2.43-1.57 1.51a.42.42 0 0 1-.72-.3v-2.91l6.11-5.52c.27-.24-.06-.38-.42-.14L6.56 14.1l-3.08-.96a.54.54 0 0 1-.03-.97l13.1-5.05a.55.55 0 0 1 .75.7z" fill="#fff"/>
      </svg>
    ),
    Spotify: (
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.207-2.377-1.454-5.37-1.783-8.893-1.007-.336.075-.67-.14-.744-.477-.074-.336.139-.67.477-.743 3.847-.85 7.143-.47 9.81 1.164.294.18.386.563.207.856zm1.224-2.724c-.226.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.076-1.182-.413.125-.85-.107-.975-.52-.125-.413.107-.85.52-.975 3.66-1.11 8.225-.563 11.346 1.353.367.227.487.708.26 1.074zm.106-2.833C14.385 8.71 8.56 8.52 5.174 9.548c-.54.164-1.11-.146-1.274-.687-.164-.54.146-1.11.687-1.274 3.885-1.18 10.31-.96 14.386 1.46.486.29.646.914.357 1.4-.29.487-.914.647-1.4.357z" fill="#1DB954"/>
      </svg>
    ),
    Twitter: (
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <rect x="2" y="2" width="20" height="20" rx="6" fill="#010101"/>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#fff"/>
      </svg>
    ),
    'X / Twitter': (
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <rect x="2" y="2" width="20" height="20" rx="6" fill="#010101"/>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#fff"/>
      </svg>
    ),
    Facebook: (
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <rect x="2" y="2" width="20" height="20" rx="6" fill="#1877F2"/>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#fff"/>
      </svg>
    ),
    Twitch: (
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <rect x="2" y="2" width="20" height="20" rx="6" fill="#9146FF"/>
        <path d="M11.571 4.714h1.715v5.143H11.57zm3.858 0H17.14v5.143h-1.714zM4.714 2.143L3 6.429v12.857h4.286v2.571h2.571l2.572-2.571h3.428l4.286-4.286V2.143H4.714zm13.715 12.857l-3 3H12l-2.571 2.571v-2.571H6.429V3.857H18.43v11.143z" fill="#fff"/>
      </svg>
    ),
    Discord: (
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <rect x="2" y="2" width="20" height="20" rx="6" fill="#5865F2"/>
        <path d="M18.966 6.012a14.67 14.67 0 00-3.62-1.12.083.083 0 00-.088.04c-.156.27-.328.63-.448.91a13.56 13.56 0 00-4.02 0c-.12-.28-.297-.64-.457-.91a.083.083 0 00-.088-.04 14.65 14.65 0 00-3.62 1.12.078.078 0 00-.033.03C3.606 10.375 2.8 14.62 3.14 18.824a.085.085 0 00.033.06c2.036 1.487 3.998 2.39 5.92 2.986a.085.085 0 00.09-.03c.456-.619.863-1.28 1.21-1.974a.083.083 0 00-.045-.115c-.645-.242-1.258-.54-1.84-.88a.083.083 0 01-.008-.137c.123-.092.247-.19.367-.288a.08.08 0 01.085-.011c3.87 1.765 8.06 1.765 11.89 0a.08.08 0 01.086.01c.12.1.244.197.368.29a.083.083 0 01-.006.136c-.58.34-1.196.638-1.84.88a.085.085 0 00-.044.116c.35.694.757 1.355 1.21 1.974a.084.084 0 00.09.03c1.927-.596 3.89-1.499 5.925-2.986a.082.082 0 00.031-.059c.402-4.83-.69-9.043-3.155-12.783a.066.066 0 00-.032-.031zM9.05 14.882c-1.16 0-2.12-1.06-2.12-2.36 0-1.3 0-2.36 2.12-2.36 1.17 0 2.13 1.06 2.12 2.36 0 1.3-.95 2.36-2.12 2.36zm5.9 0c-1.16 0-2.12-1.06-2.12-2.36 0-1.3.95-2.36 2.12-2.36 1.17 0 2.13 1.06 2.12 2.36.01 1.3-.95 2.36-2.12 2.36z" fill="#fff"/>
      </svg>
    ),
    Google: (
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <rect x="2" y="2" width="20" height="20" rx="6" fill="#fff"/>
        <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.473 0-6.291-2.818-6.291-6.29 0-3.473 2.818-6.291 6.29-6.291 1.583 0 3.02.589 4.126 1.554l3.125-3.125C19.262 2.502 15.932 1.25 12.24 1.25c-5.94 0-10.75 4.81-10.75 10.75s4.81 10.75 10.75 10.75c5.673 0 10.607-4.08 10.607-10.75 0-.726-.068-1.423-.197-2.1V10.285H12.24z" fill="#4285F4"/>
      </svg>
    ),
  };
  return icons[key] || icons[platform] || <Share2 size={size} />;
};

// Helper: Curated structured package options for each service
const getPackagesForService = (srv) => {
  const id = srv.id;
  
  if (id === 'smm-ig-fol-std') {
    return [
      { label: 'Starter Growth', qty: 1000, badge: 'Popular', desc: 'Build initial page authority', features: ['Real-Looking Profiles', 'Safe Organic Delivery', '30-Day Refill Guarantee'] },
      { label: 'Brand Boost', qty: 5000, badge: 'Best Value', desc: 'Expand your social footprint', features: ['High Retention Rate', 'Avatars & Active Posts', 'Refill Included'] }
    ];
  }
  if (id === 'smm-ig-fol-hq') {
    return [
      { label: 'Influencer Pro', qty: 2000, badge: 'High Quality', desc: 'Premium stable numbers', features: ['Established HQ Profiles', 'Zero-Drop Guarantee', 'Lifetime Refill Support'] },
      { label: 'Elite Growth', qty: 5000, badge: 'Best Seller', desc: 'Premium profile authority', features: ['Influencer-Grade Accounts', 'Natural Delivery Rate', 'Zero Risk, Safe'] },
      { label: 'Mega Presence', qty: 10000, badge: 'Ultimate', desc: 'Maximum brand credibility', features: ['Premium Worldwide Profiles', 'Fast Dynamic Provisioning', 'Monetization Eligible'] }
    ];
  }
  if (id === 'smm-ig-lik-hq') {
    return [
      { label: 'Viral Pulse', qty: 1000, badge: 'Instant', desc: 'Trigger the explore feed', features: ['Instant Start ≤ 5 min', 'Explore Algorithm Boost', 'Safe for All Accounts'] },
      { label: 'Power Likes', qty: 5000, badge: 'Hot', desc: 'Sustained engagement push', features: ['HQ Active Profiles', 'Natural Drip Options', 'Organic Growth Push'] }
    ];
  }
  if (id === 'smm-tt-fol-hq') {
    return [
      { label: 'Creator Starter', qty: 1000, badge: 'Live Unlocked', desc: 'Reach Live access threshold', features: ['Real Stable Profiles', 'High Engagement Rate', 'Live Broadcast Ready'] },
      { label: 'Creator Fund', qty: 5000, badge: 'Best Value', desc: 'Path to TikTok monetization', features: ['Permanent Retention', 'Monetization-Safe Accounts', 'Zero Risk'] }
    ];
  }
  if (id === 'smm-tt-lik-fast') {
    return [
      { label: 'For-You Boost', qty: 2000, badge: 'Viral Trigger', desc: 'Get on the FYP algorithm', features: ['Starts within Minutes', 'FYP Algorithm Trigger', 'No Account Password Needed'] },
      { label: 'Viral Surge', qty: 10000, badge: 'Trending', desc: 'Sustained viral velocity', features: ['Super Fast Delivery', 'Explosive Reach Booster', '100% Safe Execution'] }
    ];
  }
  if (id === 'smm-tg-mem-hq') {
    return [
      { label: 'Community Kickstart', qty: 1000, badge: 'Zero Drop', desc: 'Increase member count', features: ['Zero Drop Guarantee', 'HQ Profiles with Avatars', 'Channels & Groups Supported'] },
      { label: 'Channel Authority', qty: 5000, badge: 'Best Seller', desc: 'Sustain group credibility', features: ['Lifetime Member Refill', 'Avatars & Usernames Included', 'Permanent Members'] }
    ];
  }
  if (id === 'smm-yt-sub-real') {
    return [
      { label: 'Growth Starter', qty: 100, badge: 'Active Subs', desc: 'Initial subscriber base', features: ['100% Active Accounts', 'Audit-Safe Delivery', 'Monetization Eligible'] },
      { label: 'Monetize Assist', qty: 500, badge: 'Best Seller', desc: 'Partner program booster', features: ['High Retention Subscribers', 'Natural Safe Delivery', '30-Day Replacement'] },
      { label: 'Partner Milestone', qty: 1000, badge: 'Guaranteed', desc: 'Unlock Partner status', features: ['Monetization Threshold Met', 'Lifetime Refill Guarantee', 'Safe Organic Flow'] }
    ];
  }
  if (id === 'smm-yt-vw-ads') {
    return [
      { label: 'Starter Reach', qty: 2000, badge: 'Safe Views', desc: 'Organic duration retention', features: ['AdSense Safe Traffic', 'Realistic Watch Duration', 'Diverse Device Sources'] },
      { label: 'SEO Ranking', qty: 10000, badge: 'Best Value', desc: 'Boost video search metrics', features: ['High Retention Watch Time', 'Algorithmic Search Push', 'Refill Included'] }
    ];
  }
  if (id === 'smm-spot-streams-sim') {
    return [
      { label: 'Single Boost', qty: 5000, badge: 'Royalty Safe', desc: 'Premium eligible plays', features: ['Premium Account Plays', 'Royalty-Eligible Streams', 'High Retention (90s+)'] },
      { label: 'Playlist Surge', qty: 20000, badge: 'Best Seller', desc: 'Playlist placement trigger', features: ['Global Direct Streams', 'Safe for Artist Accounts', 'Natural Play Pattern'] }
    ];
  }
  if (id === 'smm-x-fol-sim') {
    return [
      { label: 'X Starter', qty: 1000, badge: 'Popular', desc: 'Build initial authority', features: ['Global Twitter Profiles', 'Safe Growth Speed', 'Zero Risk of Suspension'] },
      { label: 'X Authority', qty: 3000, badge: 'Best Value', desc: 'Achieve corporate clout', features: ['Premium Active Profiles', 'Organic Refill System', 'No Drop Guarantee'] }
    ];
  }
  if (id === 'smm-fb-fans-sim') {
    return [
      { label: 'Page Starter', qty: 2000, badge: 'Combine Likes', desc: 'Fans & Likes combo package', features: ['Page Likes + Followers', '100% Safe Delivery', 'Avatars & Bio Details'] }
    ];
  }
  if (id === 'smm-twitch-fol-sim') {
    return [
      { label: 'Affiliate Surge', qty: 1000, badge: 'Affiliate Ready', desc: 'Unlock affiliate status', features: ['Permanent Channel Followers', 'Fast provision ≤ 2h', '100% Audit Safe'] }
    ];
  }
  if (id === 'smm-disc-mem-sim') {
    return [
      { label: 'Server Populate', qty: 1000, badge: 'HQ Avatars', desc: 'Active status members', features: ['Avatars & Status Details', 'Anti-Kick Safe Protocol', 'Online/Offline Status Mix'] }
    ];
  }
  if (id === 'smm-seo-traffic-sim') {
    return [
      { label: 'SEO Campaign', qty: 10000, badge: 'AdSense Safe', desc: 'Organic google traffic', features: ['Google Search Referrers', 'AdSense Safe Visitors', 'Low Bounce, 1m+ Duration'] }
    ];
  }

  // Fallback default packages
  return [
    { label: 'Standard Boost', qty: 1000, badge: 'Verified', desc: 'Starter engagement push', features: ['100% Safe Execution', 'Refill Included', 'No Password Needed'] },
    { label: 'Mega Growth', qty: 5000, badge: 'Popular', desc: 'Accelerated channel authority', features: ['High Retention Rate', 'Organic Speed Drip', 'Refill Guarantee'] }
  ];
};

// Top best selling packages displayed on the "All" dashboard tab
const BEST_SELLERS = [
  { srvId: 'smm-ig-fol-hq', qty: 5000, label: 'Instagram Elite Followers', badge: 'Best Seller', desc: 'Premium profile authority boost' },
  { srvId: 'smm-ig-lik-hq', qty: 1000, label: 'Instagram Viral Likes', badge: 'Instant Start', desc: 'Trigger explore feed algorithms' },
  { srvId: 'smm-tg-mem-hq', qty: 5000, label: 'Telegram Channel Authority', badge: 'Zero Drop', desc: 'High member retention permanently' },
  { srvId: 'smm-tt-fol-hq', qty: 1000, label: 'TikTok Live-Ready Followers', badge: 'Live Unlocked', desc: 'Unlock live streaming access' },
  { srvId: 'smm-yt-sub-real', qty: 500, label: 'YouTube Monetize Assist', badge: 'Guaranteed', desc: 'Sustain safe channel subscribers' },
  { srvId: 'smm-seo-traffic-sim', qty: 10000, label: 'Google SEO Organic Traffic', badge: 'AdSense Safe', desc: 'High duration Google organic hits' }
];

const SmmPanel = () => {
  const { smmServices, smmOrders, submitSmmOrder, formatCost } = useContext(AppContext);
  const isMobile = useIsMobile();
  const [smmPage, setSmmPage] = useState(1);
  const SMM_PER_PAGE = 10;

  // Active navigation platform filter
  const [activeTab, setActiveTab] = useState('Instagram'); // Defaulting to Instagram (high value) instead of messy 'All'
  
  // Custom Campaign toggle
  const [customExpanded, setCustomExpanded] = useState(false);
  const [customSelectedServiceId, setCustomSelectedServiceId] = useState('');

  const navigate = useNavigate();
  const buyMatch = useMatch('/dashboard/smm/buy/:id');
  const selectedServiceId = buyMatch?.params?.id;
  const selectedService = selectedServiceId ? smmServices.find(s => String(s.id) === String(selectedServiceId)) : null;

  // Checkout Modal inputs
  const [targetUrl, setTargetUrl] = useState('');
  const [quantity, setQuantity] = useState(1000);
  const [errorMsg, setErrorMsg] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  // Tracks pre-filled quantity selected from card boosts
  const [prefilledQty, setPrefilledQty] = useState(null);

  // Tab Categories list
  const tabs = ['All', 'Instagram', 'TikTok', 'YouTube', 'Telegram', 'Spotify', 'X / Twitter', 'Others'];

  // Other Platforms category holds Facebook, Twitch, Discord, and Google SEO
  const otherPlatforms = ['Facebook', 'Twitch', 'Discord', 'SEO & Traffic', 'Google'];

  const filteredServices = smmServices.filter(s => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Others') {
      return otherPlatforms.includes(s.platform);
    }
    return s.platform.toLowerCase() === activeTab.toLowerCase() || 
           (activeTab === 'X / Twitter' && (s.platform.toLowerCase().includes('twitter') || s.platform.toLowerCase().includes('x ')));
  });

  // Automatically sync/set quantity when selecting a service in the modal
  useEffect(() => {
    if (selectedService) {
      setQuantity(prefilledQty !== null ? prefilledQty : (selectedService.min || 1000));
      setTargetUrl('');
      setErrorMsg('');
      setOrderSuccess(false);
    }
  }, [selectedService, prefilledQty]);

  // Set initial custom service dropdown default when tab changes
  useEffect(() => {
    if (filteredServices.length > 0) {
      setCustomSelectedServiceId(filteredServices[0].id);
    }
  }, [activeTab, smmServices]);

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setOrderSuccess(false);

    if (!selectedService) return;
    if (!targetUrl.trim()) { setErrorMsg('Please enter a destination URL.'); return; }
    
    const minLimit = selectedService.min || 100;
    const maxLimit = selectedService.max || 100000;
    if (quantity < minLimit) { setErrorMsg(`Minimum quantity is ${minLimit.toLocaleString()} units.`); return; }
    if (quantity > maxLimit) { setErrorMsg(`Maximum quantity is ${maxLimit.toLocaleString()} units.`); return; }

    setIsLaunching(true);
    const result = await submitSmmOrder(selectedService.id, targetUrl, quantity);
    setIsLaunching(false);

    if (result.success) {
      setOrderSuccess(true);
      setTimeout(() => {
        setOrderSuccess(false);
        setPrefilledQty(null);
        navigate('/dashboard/smm'); // Close modal
      }, 2500);
    } else {
      setErrorMsg(result.msg);
    }
  };

  const getPlaceholderForPlatform = (platform) => {
    const plat = platform.toLowerCase();
    if (plat.includes('spotify')) return 'https://open.spotify.com/track/...';
    if (plat.includes('youtube')) return 'https://youtube.com/watch?v=... or channel URL';
    if (plat.includes('telegram')) return 'https://t.me/channel_name';
    if (plat.includes('instagram')) return 'https://instagram.com/profile_or_post';
    if (plat.includes('tiktok')) return 'https://tiktok.com/@username/video/...';
    if (plat.includes('seo') || plat.includes('traffic') || plat.includes('google')) return 'https://mywebsite.com';
    return 'Destination profile or campaign link';
  };

  const getGlowStyle = (platform) => {
    const theme = PLATFORM_THEMES[platform] || PLATFORM_THEMES.Instagram;
    return {
      '--color-glow': theme.glow,
      border: `1px solid ${theme.border}`,
      boxShadow: `0 8px 32px 0 rgba(0,0,0,0.37)`
    };
  };

  // Launch pre-configured package boost
  const handleLaunchPackage = (srv, qty) => {
    setPrefilledQty(qty);
    navigate(`/dashboard/smm/buy/${srv.id}`);
  };

  return (
    <div className="animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : 24 }}>

      {/* Intro Banner */}
      <div className="glass-panel intro-banner" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h3 style={{ fontSize: isMobile ? 16 : 20, marginBottom: 0, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-heading)' }}>
          <Share2 size={18} style={{ color: 'var(--color-turquoise)' }} />
          SMM Growth Panel Shop
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: isMobile ? 12 : 14, lineHeight: 1.6, margin: 0 }}>
          Boost your online visibility with curated social media packages at reseller wholesale rates. Select a platform, launch instant engagement boosts, and track campaigns live.
        </p>
      </div>

      {/* ── TABS FILTERS ── */}
      <div 
        className="hide-scrollbar smm-tab-strip"
        style={{ 
          display: 'flex', 
          gap: 8, 
          overflowX: 'auto', 
          paddingBottom: 8,
          width: '100%',
          maxWidth: '100%',
          flexWrap: 'nowrap',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {tabs.map(tab => {
          const active = activeTab === tab;
          const platKey = tab === 'X / Twitter' ? 'Twitter' : tab === 'Others' ? 'Google' : tab;
          const theme = PLATFORM_THEMES[platKey] || { color: 'var(--color-turquoise)', bg: 'rgba(0, 242, 254, 0.1)', border: 'rgba(0, 242, 254, 0.25)' };
          
          return (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab);
                setCustomExpanded(false); // Collapse custom campaign builder on tab change
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: isMobile ? '8px 14px' : '10px 18px',
                borderRadius: 10,
                border: `1px solid ${active ? theme.border : 'var(--border-color)'}`,
                background: active ? theme.bg : 'var(--bg-btn-secondary)',
                color: active ? theme.color : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: isMobile ? 12 : 13,
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {tab !== 'All' && tab !== 'Others' && <PlatformIcon platform={platKey} size={14} />}
              {tab === 'Others' && <Sparkles size={13} style={{ color: 'var(--color-amber)' }} />}
              {tab}
            </button>
          );
        })}
      </div>

      {/* ── PORTAL VIEW: CURATED STRUCTURED PACKAGES ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        
        {activeTab === 'All' ? (
          /* "All" Tab displays the curated hot best-sellers */
          <div>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} style={{ color: 'var(--color-pink)' }} />
              Top Growth Best Sellers
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(310px, 100%), 1fr))',
              gap: isMobile ? 12 : 18,
            }}>
              {BEST_SELLERS.map((best, idx) => {
                const srv = smmServices.find(s => s.id === best.srvId);
                if (!srv) return null;
                const theme = PLATFORM_THEMES[srv.logo || srv.platform] || PLATFORM_THEMES.Instagram;
                const totalCost = Math.round(srv.pricePerThousandNgn * (best.qty / 1000));
                
                return (
                  <div
                    key={idx}
                    className="glass-panel interactive"
                    style={{
                      padding: '20px',
                      borderRadius: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: `1px solid ${theme.border}`,
                      minHeight: '260px',
                      background: 'rgba(255, 255, 255, 0.01)',
                      position: 'relative',
                      overflow: 'hidden',
                      ...getGlowStyle(srv.logo || srv.platform)
                    }}
                  >
                    {/* Background glow spot */}
                    <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '120px', height: '120px', background: `radial-gradient(circle, ${theme.glow} 0%, rgba(0,0,0,0) 70%)`, pointerEvents: 'none' }} />

                    <div>
                      {/* Card Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: 8, background: 'var(--bg-input)',
                            border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            <PlatformIcon platform={srv.logo || srv.platform} size={16} />
                          </div>
                          <div>
                            <span style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.05em' }}>{srv.platform}</span>
                            <h5 style={{ margin: 0, fontSize: 13, fontWeight: '800', color: 'var(--text-primary)' }}>{best.label}</h5>
                          </div>
                        </div>
                        <span style={{
                          fontSize: 9, fontWeight: 900, padding: '2px 8px', borderRadius: 4,
                          background: theme.bg, color: theme.color, border: `1px solid ${theme.border}`,
                          textTransform: 'uppercase', letterSpacing: '0.03em'
                        }}>
                          {best.badge}
                        </span>
                      </div>

                      {/* Package Target Quantity */}
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
                        <span style={{ fontSize: 26, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-heading)' }}>
                          {best.qty.toLocaleString()}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Units</span>
                      </div>

                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 14px 0', lineHeight: 1.4 }}>
                        {best.desc || srv.description}
                      </p>

                      {/* Features bullets */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                        {(getPackagesForService(srv).find(p => p.qty === best.qty)?.features || srv.features || []).slice(0, 3).map((feat, fidx) => (
                          <div key={fidx} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-secondary)' }}>
                            <CheckCircle2 size={13} style={{ color: 'var(--color-turquoise)', flexShrink: 0 }} />
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Pricing & Launch */}
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 16, fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--color-green)' }}>
                          {formatCost(totalCost)}
                        </span>
                        <span style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Full Package Budget</span>
                      </div>
                      <button
                        className="btn btn-primary"
                        style={{
                          padding: '6px 12px', fontSize: 12,
                          background: theme.color === '#ffffff' ? '#ffffff' : theme.bg,
                          border: `1px solid ${theme.border}`,
                          color: theme.color === '#ffffff' ? '#000' : theme.color,
                          fontWeight: 700, whiteSpace: 'nowrap'
                        }}
                        onClick={() => handleLaunchPackage(srv, best.qty)}
                      >
                        Boost Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Platform Specific View: Curated Packages grouped by Service */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {filteredServices.length === 0 ? (
              <div className="glass-panel" style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
                No services available for this platform yet.
              </div>
            ) : (
              filteredServices.map(srv => {
                const theme = PLATFORM_THEMES[srv.logo || srv.platform] || PLATFORM_THEMES.Instagram;
                const pkgs = getPackagesForService(srv);
                
                return (
                  <div key={srv.id} className="glass-panel" style={{ padding: '20px', border: '1px solid var(--border-color)', borderRadius: '16px', background: 'var(--bg-card)' }}>
                    
                    {/* Service Header Info */}
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--border-color)', paddingBottom: 14 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 8, background: 'var(--bg-input)',
                        border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <PlatformIcon platform={srv.logo || srv.platform} size={20} />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: 15, fontWeight: '800', color: 'var(--text-primary)' }}>
                          {srv.name.replace(/\(Standard\)|\(High Quality\)|\(Instant\)|\(Stable\)|\(Fast\)|\(Active\)|\(Active Followers\)|\(Active Profiles\)/, '').trim()}
                        </h4>
                        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{srv.platform} · {srv.category}</span>
                      </div>
                    </div>

                    {/* Preconfigured Packages Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(min(270px, 100%), 1fr))',
                      gap: 14
                    }}>
                      {pkgs.map((pkg, pidx) => {
                        const totalCost = Math.round(srv.pricePerThousandNgn * (pkg.qty / 1000));
                        
                        return (
                          <div 
                            key={pidx} 
                            style={{ 
                              border: '1px solid var(--border-color)', 
                              borderRadius: '12px', 
                              padding: '16px', 
                              display: 'flex', 
                              flexDirection: 'column', 
                              justifyContent: 'space-between',
                              background: 'rgba(255, 255, 255, 0.015)',
                              minHeight: '210px',
                              transition: 'all 0.2s',
                              position: 'relative'
                            }}
                            className="glass-panel interactive"
                          >
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <span style={{ fontSize: 11, fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{pkg.label}</span>
                                <span style={{ fontSize: 9, fontWeight: '900', padding: '1px 6px', borderRadius: 4, background: theme.bg, color: theme.color, border: `1px solid ${theme.border}` }}>
                                  {pkg.badge}
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                                <span style={{ fontSize: 22, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-heading)' }}>{pkg.qty.toLocaleString()}</span>
                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{srv.category}</span>
                              </div>

                              <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                                {pkg.desc}
                              </p>

                              {/* Features bullets */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
                                {pkg.features.map((feat, fidx) => (
                                  <div key={fidx} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--text-muted)' }}>
                                    <CheckCircle2 size={11} style={{ color: 'var(--color-turquoise)' }} />
                                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{feat}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--border-color)' }}>
                              <div>
                                <span style={{ display: 'block', fontSize: 14, fontWeight: '800', color: 'var(--color-green)' }}>{formatCost(totalCost)}</span>
                                <span style={{ fontSize: 8, color: 'var(--text-muted)' }}>Budget</span>
                              </div>
                              <button 
                                className="btn btn-primary"
                                style={{
                                  padding: '4px 10px', fontSize: 11,
                                  background: theme.color === '#ffffff' ? '#ffffff' : theme.bg,
                                  border: `1px solid ${theme.border}`,
                                  color: theme.color === '#ffffff' ? '#000' : theme.color,
                                  fontWeight: 700
                                }}
                                onClick={() => handleLaunchPackage(srv, pkg.qty)}
                              >
                                Boost
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ── DEVELOPER/BULK CUSTOM CAMPAIGN CONSOLE ── */}
      {activeTab !== 'All' && filteredServices.length > 0 && (
        <div 
          className="glass-panel" 
          style={{ 
            padding: 0, 
            overflow: 'hidden', 
            border: '1px solid var(--border-color)',
            background: 'rgba(255,255,255,0.01)',
            borderRadius: '12px',
            marginTop: '8px'
          }}
        >
          {/* Custom Campaign Header */}
          <div 
            onClick={() => setCustomExpanded(!customExpanded)}
            style={{ 
              padding: '14px 20px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              cursor: 'pointer',
              userSelect: 'none',
              background: 'rgba(255,255,255,0.01)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={15} style={{ color: 'var(--color-turquoise)' }} />
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                Custom Campaign Builder (Developer / Bulk Orders)
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{customExpanded ? 'Collapse' : 'Expand'}</span>
              {customExpanded ? <ChevronUp size={16} style={{ color: 'var(--text-secondary)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-secondary)' }} />}
            </div>
          </div>

          {/* Custom Campaign Form */}
          {customExpanded && (
            <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.15)' }} className="animate-slide-down">
              {(() => {
                const srv = smmServices.find(s => s.id === customSelectedServiceId) || filteredServices[0];
                const totalCost = srv ? Math.round(srv.pricePerThousandNgn * (quantity / 1000)) : 0;
                
                return (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      setPrefilledQty(quantity);
                      navigate(`/dashboard/smm/buy/${srv.id}`);
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
                      
                      {/* Select Service */}
                      <div>
                        <label className="form-label">Select Growth Service</label>
                        <select 
                          className="form-input" 
                          style={{ background: 'var(--bg-input)', color: '#fff', fontSize: '13px', padding: '10px' }}
                          value={customSelectedServiceId}
                          onChange={(e) => {
                            setCustomSelectedServiceId(e.target.value);
                            const matched = smmServices.find(s => s.id === e.target.value);
                            if (matched) setQuantity(matched.min || 1000);
                          }}
                        >
                          {filteredServices.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({formatCost(s.pricePerThousandNgn)}/1K)
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Input Quantity */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <label className="form-label" style={{ margin: 0 }}>Custom Quantity</label>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            Min: {srv?.min?.toLocaleString()} - Max: {srv?.max?.toLocaleString()}
                          </span>
                        </div>
                        <input 
                          type="number"
                          className="form-input"
                          min={srv?.min || 100}
                          max={srv?.max || 100000}
                          value={quantity}
                          onChange={e => setQuantity(Number(e.target.value))}
                          required
                        />
                      </div>

                    </div>

                    {/* Price Calculator display */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Estimated Custom Cost:</span>
                      <strong style={{ color: 'var(--color-green)', fontSize: '18px', fontFamily: 'var(--font-heading)' }}>
                        {formatCost(totalCost)}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', fontSize: '12px' }}>
                        <span>Proceed to Launch</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>

                  </form>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* ── CAMPAIGN CONFIGURATION CHECKOUT MODAL ── */}
      {selectedService && createPortal(
        <div className="modal-overlay" style={{ display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? 0 : '20px' }}>
          <div className={`modal-content ${isMobile ? 'animate-slide-up-mobile' : 'animate-slide-in'}`} style={{ width: '100%', maxWidth: '480px', padding: isMobile ? '24px 16px 40px 16px' : '28px', borderRadius: isMobile ? '24px 24px 0 0' : '20px', margin: isMobile ? 0 : 'auto', maxHeight: isMobile ? '85vh' : '90vh', overflowY: 'auto' }}>
            
            <button className="modal-close" onClick={() => {
              setPrefilledQty(null);
              navigate('/dashboard/smm');
            }}>
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PlatformIcon platform={selectedService.logo || selectedService.platform} size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 16 }}>Configure Campaign</h3>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  {selectedService.platform} · {selectedService.category || 'Package Boost'}
                </div>
              </div>
            </div>

            <form onSubmit={handleOrderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              {/* Product Info Description */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '10px 14px',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                lineHeight: '1.5'
              }}>
                {selectedService.description}
              </div>

              {/* Input URL */}
              <div>
                <label className="form-label">Destination Link / Target URL</label>
                <div style={{ position: 'relative' }}>
                  <Link size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                  <input
                    type="text" 
                    className="form-input"
                    style={{ paddingLeft: 40, fontSize: '13px' }}
                    placeholder={getPlaceholderForPlatform(selectedService.logo || selectedService.platform)}
                    value={targetUrl}
                    onChange={e => setTargetUrl(e.target.value)}
                    required
                  />
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Ensure the target account/page status is set to public.
                </div>
              </div>

              {/* Quantity */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label className="form-label" style={{ margin: 0 }}>Campaign Quantity (Units)</label>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Min: {selectedService.min?.toLocaleString()} - Max: {selectedService.max?.toLocaleString()}
                  </span>
                </div>
                <input
                  type="number" 
                  className="form-input"
                  min={selectedService.min || 100}
                  max={selectedService.max || 100000}
                  step="10"
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                  required
                />
              </div>

              {/* Dynamic Price Summary */}
              <div style={{
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '14px 16px', 
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)', 
                borderRadius: 10
              }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Calculated Price:</span>
                <strong style={{ color: 'var(--color-green)', fontFamily: 'var(--font-heading)', fontSize: 20 }}>
                  {formatCost(Math.round(selectedService.pricePerThousandNgn * (quantity / 1000)))}
                </strong>
              </div>

              {errorMsg && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'rgba(255,59,48,0.12)', border: '1px solid rgba(255,59,48,0.25)', borderRadius: 8, color: '#ff453a', fontSize: 12 }}>
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {orderSuccess ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.2)', borderRadius: 8, color: 'var(--color-green)', fontSize: 13, justifyContent: 'center' }}>
                  <Check size={16} />
                  <span>Campaign initiated! Dispatching units...</span>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setPrefilledQty(null);
                      navigate('/dashboard/smm');
                    }} 
                    disabled={isLaunching}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isLaunching}>
                    {isLaunching ? (
                      <><span className="spinner-loader" style={{ width: 14, height: 14 }} /><span>Launching Campaign...</span></>
                    ) : (
                      <><span>Deduct & Launch</span></>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ── ORDER LOGS TABLE ── */}
      <div className="glass-panel" style={{ padding: isMobile ? 14 : 24 }}>
        <h3 style={{ fontSize: isMobile ? 15 : 18, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-heading)' }}>
          <Layers size={16} style={{ color: 'var(--color-turquoise)' }} />
          Growth Campaign Ledger
        </h3>
        {smmOrders.length === 0 ? (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)', borderRadius: 10, fontSize: 13 }}>
            No growth campaigns deployed. Select a growth card package above to boost.
          </div>
        ) : (
          <div className="smm-orders-table-wrap custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th className="smm-col-id">Campaign ID</th>
                  <th className="smm-col-date">Launched</th>
                  <th>Platform</th>
                  <th>Growth Slot</th>
                  <th>Quantity</th>
                  <th className="smm-col-dest">Target Destination</th>
                  <th>Budget</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const totalSmmPages = Math.max(1, Math.ceil(smmOrders.length / SMM_PER_PAGE));
                  const paginatedSmm = smmOrders.slice((smmPage - 1) * SMM_PER_PAGE, smmPage * SMM_PER_PAGE);
                  return (
                    <>
                      {paginatedSmm.map(ord => (
                        <tr key={ord.id}>
                          <td className="smm-col-id" style={{ fontFamily: 'var(--font-heading)', fontSize: 11, color: 'var(--text-muted)' }}>{ord.id}</td>
                          <td className="smm-col-date" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{ord.date}</td>
                          <td>
                            <span className="badge" style={{ 
                              fontSize: 9, 
                              background: PLATFORM_THEMES[ord.platform]?.bg || 'rgba(0,242,254,0.08)',
                              color: PLATFORM_THEMES[ord.platform]?.color || 'var(--color-turquoise)',
                              border: `1px solid ${PLATFORM_THEMES[ord.platform]?.border || 'rgba(0,242,254,0.18)'}`
                            }}>
                              {ord.platform}
                            </span>
                          </td>
                          <td style={{ fontSize: 12, fontWeight: 600, minWidth: 120 }}>{ord.serviceName}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>{ord.quantity.toLocaleString()}</td>
                          <td className="smm-col-dest">
                            <a href={ord.targetUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, display: 'inline-block', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ord.targetUrl}</a>
                          </td>
                          <td style={{ whiteSpace: 'nowrap', color: 'var(--color-green)', fontWeight: 700 }}>{formatCost(ord.costNgn)}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span className={`badge ${ord.status === 'Completed' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: 10 }}>{ord.status}</span>
                              {ord.status === 'In Progress' && (
                                <div style={{ width: 28, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
                                  <div style={{ width: '55%', height: '100%', background: 'var(--color-amber)', borderRadius: 99, animation: 'blink 1s infinite' }} />
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {smmOrders.length > SMM_PER_PAGE && (
                        <tr>
                          <td colSpan="8">
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '10px 0' }}>
                              <button type="button" className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} disabled={smmPage === 1} onClick={() => setSmmPage(p => p - 1)}>Prev</button>
                              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Page {smmPage} of {totalSmmPages}</span>
                              <button type="button" className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} disabled={smmPage === totalSmmPages} onClick={() => setSmmPage(p => p + 1)}>Next</button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })()}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmmPanel;
