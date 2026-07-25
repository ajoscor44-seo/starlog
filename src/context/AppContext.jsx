import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

export const AppContext = createContext();

// Mock Catalogs
const initialSubscriptions = [
  { id: 'sub-netflix', name: 'Netflix Premium (Shared)', category: 'Entertainment', priceNgn: 3000, priceUsd: 4, features: ['Ultra HD 4K', '1 Device Access', 'Instant Delivery', '30 Days Validity'] },
  { id: 'sub-spotify', name: 'Spotify Premium Family (Shared)', category: 'Music', priceNgn: 1200, priceUsd: 1.6, features: ['Ad-free playback', 'Offline listening', 'Shared Playlists', '30 Days Validity'] },
  { id: 'sub-claude', name: 'Claude 3.5 Sonnet Pro (Shared)', category: 'AI Tools', priceNgn: 6500, priceUsd: 8.5, features: ['5x more usage', 'Early access features', 'High-speed processing', '30 Days Validity'] },
  { id: 'sub-chatgpt', name: 'ChatGPT Plus (Shared)', category: 'AI Tools', priceNgn: 5500, priceUsd: 7.2, features: ['GPT-4o Access', 'DALL-E Image Creation', 'Custom GPTs', '30 Days Validity'] },
  { id: 'sub-youtube', name: 'YouTube Premium (Shared)', category: 'Entertainment', priceNgn: 1500, priceUsd: 2, features: ['Background play', 'No Ads', 'YT Music Included', '30 Days Validity'] },
  { id: 'sub-surfshark', name: 'Surfshark VPN (Shared)', category: 'Security', priceNgn: 1800, priceUsd: 2.4, features: ['Unlimited devices', 'Strict no-logs policy', 'High speed servers', '30 Days Validity'] },
];

// Fallback country list shown before the dynamic fetch completes
const initialCountries = [
  { id: 'us', name: 'United States', flag: '🇺🇸', code: '+1', fivesimSlug: 'usa' },
  { id: 'gb', name: 'United Kingdom', flag: '🇬🇧', code: '+44', fivesimSlug: 'england' },
  { id: 'ng', name: 'Nigeria', flag: '🇳🇬', code: '+234', fivesimSlug: 'nigeria' },
  { id: 'ca', name: 'Canada', flag: '🇨🇦', code: '+1', fivesimSlug: 'canada' },
  { id: 'za', name: 'South Africa', flag: '🇿🇦', code: '+27', fivesimSlug: 'southafrica' },
  { id: 'de', name: 'Germany', flag: '🇩🇪', code: '+49', fivesimSlug: 'germany' },
  { id: 'fr', name: 'France', flag: '🇫🇷', code: '+33', fivesimSlug: 'france' },
  { id: 'in', name: 'India', flag: '🇮🇳', code: '+91', fivesimSlug: 'india' },
  { id: 'ru', name: 'Russia', flag: '🇷🇺', code: '+7', fivesimSlug: 'russia' },
  { id: 'br', name: 'Brazil', flag: '🇧🇷', code: '+55', fivesimSlug: 'brazil' },
];

// Maps ISO-2 codes to emoji flags
const ISO_FLAGS = {
  af:'🇦🇫',al:'🇦🇱',dz:'🇩🇿',ao:'🇦🇴',ag:'🇦🇬',ar:'🇦🇷',am:'🇦🇲',aw:'🇦🇼',au:'🇦🇺',at:'🇦🇹',
  az:'🇦🇿',bs:'🇧🇸',bh:'🇧🇭',bd:'🇧🇩',bb:'🇧🇧',be:'🇧🇪',bz:'🇧🇿',bj:'🇧🇯',bt:'🇧🇹',ba:'🇧🇦',
  bo:'🇧🇴',bw:'🇧🇼',br:'🇧🇷',bg:'🇧🇬',bf:'🇧🇫',bi:'🇧🇮',kh:'🇰🇭',cm:'🇨🇲',ca:'🇨🇦',cv:'🇨🇻',
  td:'🇹🇩',cl:'🇨🇱',co:'🇨🇴',km:'🇰🇲',cg:'🇨🇬',cr:'🇨🇷',hr:'🇭🇷',cy:'🇨🇾',cz:'🇨🇿',dk:'🇩🇰',
  dj:'🇩🇯',do:'🇩🇴',tl:'🇹🇱',ec:'🇪🇨',eg:'🇪🇬',gb:'🇬🇧',gq:'🇬🇶',ee:'🇪🇪',et:'🇪🇹',fi:'🇫🇮',
  fr:'🇫🇷',ga:'🇬🇦',gm:'🇬🇲',ge:'🇬🇪',de:'🇩🇪',gh:'🇬🇭',gr:'🇬🇷',gp:'🇬🇵',gt:'🇬🇹',gn:'🇬🇳',
  gw:'🇬🇼',gy:'🇬🇾',ht:'🇭🇹',hn:'🇭🇳',hk:'🇭🇰',hu:'🇭🇺',in:'🇮🇳',id:'🇮🇩',ie:'🇮🇪',il:'🇮🇱',
  it:'🇮🇹',ci:'🇨🇮',jm:'🇯🇲',jo:'🇯🇴',kz:'🇰🇿',ke:'🇰🇪',kw:'🇰🇼',kg:'🇰🇬',la:'🇱🇦',lv:'🇱🇻',
  ls:'🇱🇸',lr:'🇱🇷',lt:'🇱🇹',lu:'🇱🇺',mo:'🇲🇴',mg:'🇲🇬',mw:'🇲🇼',my:'🇲🇾',mv:'🇲🇻',mr:'🇲🇷',
  mu:'🇲🇺',mx:'🇲🇽',md:'🇲🇩',mn:'🇲🇳',me:'🇲🇪',ma:'🇲🇦',mz:'🇲🇿',na:'🇳🇦',np:'🇳🇵',nl:'🇳🇱',
  nc:'🇳🇨',ni:'🇳🇮',ng:'🇳🇬',mk:'🇲🇰',no:'🇳🇴',om:'🇴🇲',pk:'🇵🇰',pa:'🇵🇦',pg:'🇵🇬',py:'🇵🇾',
  pe:'🇵🇪',ph:'🇵🇭',pl:'🇵🇱',pt:'🇵🇹',pr:'🇵🇷',re:'🇷🇪',ro:'🇷🇴',ru:'🇷🇺',rw:'🇷🇼',kn:'🇰🇳',
  lc:'🇱🇨',vc:'🇻🇨',sv:'🇸🇻',ws:'🇼🇸',sa:'🇸🇦',sn:'🇸🇳',rs:'🇷🇸',sc:'🇸🇨',sl:'🇸🇱',sk:'🇸🇰',
  si:'🇸🇮',sb:'🇸🇧',za:'🇿🇦',es:'🇪🇸',lk:'🇱🇰',sr:'🇸🇷',sz:'🇸🇿',se:'🇸🇪',ch:'🇨🇭',tw:'🇹🇼',
  tj:'🇹🇯',tz:'🇹🇿',th:'🇹🇭',tt:'🇹🇹',tg:'🇹🇬',tn:'🇹🇳',tm:'🇹🇲',ug:'🇺🇬',uy:'🇺🇾',us:'🇺🇸',
  uz:'🇺🇿',ve:'🇻🇪',vn:'🇻🇳',zm:'🇿🇲'
};

const initialOtpServices = [
  { id: 'srv-whatsapp', name: 'WhatsApp', emoji: '💬', priceNgn: 800, priceUsd: 1.0 },
  { id: 'srv-telegram', name: 'Telegram', emoji: '✈️', priceNgn: 1200, priceUsd: 1.5 },
  { id: 'srv-google', name: 'Google / Gmail', emoji: '🔍', priceNgn: 500, priceUsd: 0.65 },
  { id: 'srv-openai', name: 'OpenAI / ChatGPT', emoji: '🤖', priceNgn: 600, priceUsd: 0.8 },
  { id: 'srv-facebook', name: 'Facebook', emoji: '📘', priceNgn: 400, priceUsd: 0.5 },
  { id: 'srv-instagram', name: 'Instagram', emoji: '📸', priceNgn: 400, priceUsd: 0.5 },
  { id: 'srv-tiktok', name: 'TikTok', emoji: '🎵', priceNgn: 300, priceUsd: 0.4 },
  { id: 'srv-netflix', name: 'Netflix OTP', emoji: '🎬', priceNgn: 500, priceUsd: 0.65 },
  { id: 'srv-discord', name: 'Discord', emoji: '👾', priceNgn: 450, priceUsd: 0.6 },
  { id: 'srv-twitter', name: 'X / Twitter', emoji: '🐦', priceNgn: 600, priceUsd: 0.8 },
  { id: 'srv-microsoft', name: 'Microsoft', emoji: '💻', priceNgn: 500, priceUsd: 0.65 },
  { id: 'srv-apple', name: 'Apple', emoji: '🍎', priceNgn: 700, priceUsd: 0.9 },
  { id: 'srv-yahoo', name: 'Yahoo', emoji: '📧', priceNgn: 400, priceUsd: 0.5 },
  { id: 'srv-steam', name: 'Steam', emoji: '🎮', priceNgn: 500, priceUsd: 0.65 },
  { id: 'srv-uber', name: 'Uber', emoji: '🚗', priceNgn: 400, priceUsd: 0.5 },
];

const initialEsimPackages = [
  { id: 'esim-us-5gb', country: 'United States', flag: '🇺🇸', region: 'North America', dataGb: 5, durationDays: 30, priceNgn: 7500, priceUsd: 10 },
  { id: 'esim-us-unl', country: 'United States', flag: '🇺🇸', region: 'North America', dataGb: 999, durationDays: 30, priceNgn: 18000, priceUsd: 24, isUnlimited: true },
  { id: 'esim-eu-10gb', country: 'Europe Regional', flag: '🇪🇺', region: 'Europe', dataGb: 10, durationDays: 30, priceNgn: 11000, priceUsd: 14.5 },
  { id: 'esim-uk-3gb', country: 'United Kingdom', flag: '🇬🇧', region: 'Europe', dataGb: 3, durationDays: 7, priceNgn: 3800, priceUsd: 5 },
  { id: 'esim-global-20gb', country: 'Global (85 Countries)', flag: '🌍', region: 'Global', dataGb: 20, durationDays: 365, priceNgn: 34000, priceUsd: 45 },
  { id: 'esim-ng-5gb', country: 'Nigeria', flag: '🇳🇬', region: 'Africa', dataGb: 5, durationDays: 14, priceNgn: 6000, priceUsd: 8 },
  { id: 'esim-asia-10gb', country: 'Asia Pacific Regional', flag: '🌏', region: 'Asia', dataGb: 10, durationDays: 30, priceNgn: 12500, priceUsd: 16 },
];

const SMM_SERVICE_MAPPING = {
  'smm-ig-fol-std': { apiServiceId: 7336, platform: 'Instagram', name: 'Instagram Followers [Standard - Safe - Fast]', pricePerThousandNgn: 2000 },
  'smm-ig-fol-hq': { apiServiceId: 6453, platform: 'Instagram', name: 'Instagram Followers [High Quality - Non-Drop - Stable]', pricePerThousandNgn: 3000 },
  'smm-ig-lik-hq': { apiServiceId: 6454, platform: 'Instagram', name: 'Instagram Likes [HQ - Instant Delivery]', pricePerThousandNgn: 600 },
  'smm-tt-fol-hq': { apiServiceId: 6517, platform: 'TikTok', name: 'TikTok Followers [Real Profiles - Stable]', pricePerThousandNgn: 10500 },
  'smm-tt-lik-fast': { apiServiceId: 6527, platform: 'TikTok', name: 'TikTok Likes [Fast Speed - High Quality]', pricePerThousandNgn: 800 },
  'smm-tg-mem-hq': { apiServiceId: 6172, platform: 'Telegram', name: 'Telegram Members [HQ - Zero Drop]', pricePerThousandNgn: 1800 },
  'smm-yt-sub-real': { apiServiceId: 7537, platform: 'YouTube', name: 'YouTube Subscribers [100% Real - Guaranteed]', pricePerThousandNgn: 65000 },
  'smm-yt-vw-ads': { apiServiceId: 6498, platform: 'YouTube', name: 'YouTube Views [Stable - No Drop]', pricePerThousandNgn: 5500 },
};

const initialSmmServices = [
  // ── Instagram (Real API) ──
  {
    id: 'smm-ig-fol-std', apiServiceId: 7336, platform: 'Instagram', category: 'Followers',
    name: 'Instagram Followers (Standard)',
    pricePerThousandNgn: 2000, pricePerThousandUsd: 2.6, min: 100, max: 50000,
    description: 'Real-looking standard followers delivered at a safe organic drip-feed rate. Ideal for growing a new account without triggering algorithmic penalties.',
    features: ['Drip-feed delivery', 'Profile photos & posts', '30-day refill guarantee'],
    logo: 'Instagram'
  },
  {
    id: 'smm-ig-fol-hq', apiServiceId: 6453, platform: 'Instagram', category: 'Followers',
    name: 'Instagram Followers (High Quality)',
    pricePerThousandNgn: 3000, pricePerThousandUsd: 4.0, min: 50, max: 20000,
    description: 'Premium high-retention followers from established accounts. Best for influencers and brands who need stable numbers that sustain long-term.',
    features: ['Zero-drop guarantee', 'Premium account profiles', 'Lifetime refill'],
    logo: 'Instagram'
  },
  {
    id: 'smm-ig-lik-hq', apiServiceId: 6454, platform: 'Instagram', category: 'Likes',
    name: 'Instagram Likes (Instant)',
    pricePerThousandNgn: 600, pricePerThousandUsd: 0.8, min: 50, max: 100000,
    description: 'High-quality instant likes from active Instagram profiles. Boosts your post into the explore feed algorithm and increases organic reach.',
    features: ['Instant start ≤ 5 min', 'Explore algorithm boost', 'Safe for all accounts'],
    logo: 'Instagram'
  },
  // ── TikTok (Real API) ──
  {
    id: 'smm-tt-fol-hq', apiServiceId: 6517, platform: 'TikTok', category: 'Followers',
    name: 'TikTok Followers (Stable)',
    pricePerThousandNgn: 10500, pricePerThousandUsd: 14.0, min: 50, max: 10000,
    description: 'High-retention TikTok followers from real profiles. Excellent for reaching the 1K follower milestone for TikTok Live access and monetization.',
    features: ['Real account profiles', 'Stable retention', 'Monetization-safe'],
    logo: 'TikTok'
  },
  {
    id: 'smm-tt-lik-fast', apiServiceId: 6527, platform: 'TikTok', category: 'Likes',
    name: 'TikTok Video Likes (Fast)',
    pricePerThousandNgn: 800, pricePerThousandUsd: 1.0, min: 100, max: 500000,
    description: 'Fast-delivery TikTok likes that trigger the "For You Page" algorithm for viral momentum.',
    features: ['FYP algorithm trigger', 'Starts within minutes', 'No password needed'],
    logo: 'TikTok'
  },
  // ── Telegram (Real API) ──
  {
    id: 'smm-tg-mem-hq', apiServiceId: 6172, platform: 'Telegram', category: 'Members',
    name: 'Telegram Channel Members',
    pricePerThousandNgn: 1800, pricePerThousandUsd: 2.4, min: 100, max: 100000,
    description: 'Genuine-looking Telegram channel members with profile photos and usernames. Zero-drop guarantee.',
    features: ['Zero-drop for life', 'Profile photos included', 'Group & channel support'],
    logo: 'Telegram'
  },
  // ── YouTube (Real API) ──
  {
    id: 'smm-yt-sub-real', apiServiceId: 7537, platform: 'YouTube', category: 'Subscribers',
    name: 'YouTube Subscribers (Active)',
    pricePerThousandNgn: 65000, pricePerThousandUsd: 86.0, min: 10, max: 5000,
    description: 'YouTube subscribers from active accounts. Helps cross the 1,000 sub threshold for partner program onboarding.',
    features: ['Monetization-eligible', 'Audit-safe accounts', '30-day replacement guarantee'],
    logo: 'YouTube'
  },
  {
    id: 'smm-yt-vw-ads', apiServiceId: 6498, platform: 'YouTube', category: 'Views',
    name: 'YouTube High-Retention Views',
    pricePerThousandNgn: 5500, pricePerThousandUsd: 7.3, min: 1000, max: 500000,
    description: 'Ad-safe YouTube views delivered from diverse IPs and devices with realistic watch time patterns.',
    features: ['Ad-revenue safe', 'Watch time included', 'SEO ranking boost'],
    logo: 'YouTube'
  },
  // ── Spotify (Simulated) ──
  {
    id: 'smm-spot-streams-sim', platform: 'Spotify', category: 'Streams',
    name: 'Spotify Premium Music Plays',
    pricePerThousandNgn: 1200, pricePerThousandUsd: 1.6, min: 1000, max: 1000000,
    description: 'Premium royalty-eligible Spotify plays from active user slots. 100% safe for artist distribution accounts.',
    features: ['Royalties eligible', 'Premium account streams', 'High retention (90s+)'],
    logo: 'Spotify', isSimulated: true
  },
  // ── X / Twitter (Simulated) ──
  {
    id: 'smm-x-fol-sim', platform: 'X / Twitter', category: 'Followers',
    name: 'X (Twitter) Active Followers',
    pricePerThousandNgn: 9000, pricePerThousandUsd: 12.0, min: 100, max: 20000,
    description: 'Real-looking global profiles to boost credibility. Safe delivery speed to prevent flag bans.',
    features: ['Global profiles', 'Safe organic growth', 'No drop guarantee'],
    logo: 'Twitter', isSimulated: true
  },
  // ── Facebook (Simulated) ──
  {
    id: 'smm-fb-fans-sim', platform: 'Facebook', category: 'Fans',
    name: 'Facebook Page Likes & Fans',
    pricePerThousandNgn: 3500, pricePerThousandUsd: 4.6, min: 100, max: 50000,
    description: 'High-quality page followers and likes to expand your brand authority. Increases organic post reach.',
    features: ['Likes + Followers combined', '100% safe execution', 'Real profiles'],
    logo: 'Facebook', isSimulated: true
  },
  // ── Twitch (Simulated) ──
  {
    id: 'smm-twitch-fol-sim', platform: 'Twitch', category: 'Followers',
    name: 'Twitch Channel Followers',
    pricePerThousandNgn: 4000, pricePerThousandUsd: 5.3, min: 100, max: 10000,
    description: 'Instant followers to meet Twitch Affiliate requirements. Helps you grow your live stream presence.',
    features: ['Affiliate ready', 'Fast provisioning', 'Permanent followers'],
    logo: 'Twitch', isSimulated: true
  },
  // ── Discord (Simulated) ──
  {
    id: 'smm-disc-mem-sim', platform: 'Discord', category: 'Members',
    name: 'Discord Server Members',
    pricePerThousandNgn: 7600, pricePerThousandUsd: 10.0, min: 100, max: 5000,
    description: 'High-quality server members with custom avatars, nicknames, and active statuses to populate servers.',
    features: ['Avatars & Status included', 'Anti-kick safe', 'Online/Offline mix'],
    logo: 'Discord', isSimulated: true
  },
  // ── SEO & Web Traffic (Simulated) ──
  {
    id: 'smm-seo-traffic-sim', platform: 'SEO & Traffic', category: 'Web Traffic',
    name: 'Google Organic SEO Visitors',
    pricePerThousandNgn: 500, pricePerThousandUsd: 0.66, min: 1000, max: 500000,
    description: 'Direct organic search keyword traffic. Safe for AdSense websites. Low bounce rate with 1m+ duration.',
    features: ['Google search source', 'AdSense safe views', 'Custom keyword tracking'],
    logo: 'Google', isSimulated: true
  }
];


const WHOLESALE_BASE_PRICES = {
  // Subscriptions
  'sub-netflix': 2000,
  'sub-spotify': 800,
  'sub-claude': 4500,
  'sub-chatgpt': 3800,
  'sub-youtube': 1000,
  'sub-surfshark': 1200,

  // eSIM
  'esim-us-5gb': 5000,
  'esim-us-unl': 12000,
  'esim-eu-10gb': 7500,
  'esim-uk-3gb': 2500,
  'esim-global-20gb': 22000,
  'esim-ng-5gb': 4000,
  'esim-asia-10gb': 8000,

  // Static OTP
  'srv-whatsapp': 500,
  'srv-telegram': 800,
  'srv-google': 330,
  'srv-openai': 400,
  'srv-facebook': 250,
  'srv-instagram': 250,
  'srv-tiktok': 200,
  'srv-netflix': 330,
  'srv-discord': 300,
  'srv-twitter': 400,
  'srv-microsoft': 330,
  'srv-apple': 450,
  'srv-yahoo': 250,
  'srv-steam': 330,
  'srv-uber': 250
};


export const AppProvider = ({ children }) => {
  // Profit Markup rate state
  const [profitMarkup, setProfitMarkup] = useState(() => {
    const saved = localStorage.getItem('zp_profit_markup');
    return saved ? JSON.parse(saved) : { subs: 30, otp: 40, esim: 40, smm: 50 };
  });

  const [exchangeRate, setExchangeRate] = useState(() => {
    const saved = localStorage.getItem('zp_exchange_rate');
    return saved ? Number(saved) : 1350;
  });

  // Fetch config from DB
  const loadSystemConfig = async () => {
    try {
      const { data, error } = await supabase.from('system_config').select('*');
      if (!error && data) {
        const rateRow = data.find(c => c.id === 'exchange_rate');
        if (rateRow) {
          setExchangeRate(Number(rateRow.value));
          localStorage.setItem('zp_exchange_rate', Number(rateRow.value));
        }
        const markupRow = data.find(c => c.id === 'profit_markup');
        if (markupRow && markupRow.value) {
           // For now we still use the local category based markup if possible, or override.
           // If we just have one global markup, we could use it. The DB has 'profit_markup' 1.00.
           // Let's keep the object structure if we update it.
           try {
              const parsed = typeof markupRow.value === 'string' ? JSON.parse(markupRow.value) : markupRow.value;
              if (typeof parsed === 'object') {
                setProfitMarkup(parsed);
                localStorage.setItem('zp_profit_markup', JSON.stringify(parsed));
              }
           } catch(e) {}
        }
      }
    } catch (err) {
      console.error("Failed to load system config", err);
    }
  };

  useEffect(() => {
    loadSystemConfig();
  }, []);

  // One-time migration: wipe old global (non-user-scoped) localStorage keys
  // so stale data from previous users no longer leaks to new logins.
  useEffect(() => {
    const migrated = localStorage.getItem('zp_migrated_user_scoped_v1');
    if (!migrated) {
      localStorage.removeItem('zp_activeOtps');
      localStorage.removeItem('zp_rentedNumbers');
      localStorage.removeItem('zp_activeEsims');
      localStorage.removeItem('zp_smmOrders');
      localStorage.removeItem('zp_accountSubs');
      localStorage.removeItem('zp_transactions');
      localStorage.setItem('zp_migrated_user_scoped_v1', 'true');
    }
  }, []);

  const [triggerRecalc, setTriggerRecalc] = useState(0);

  const updateProfitMarkup = (category, value) => {
    setProfitMarkup(prev => {
      const updated = { ...prev, [category]: Number(value) };
      localStorage.setItem('zp_profit_markup', JSON.stringify(updated));
      return updated;
    });
  };

  // Authentication states
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // SMSPool state
  const [smsPoolRentals, setSmsPoolRentals] = useState([]);
  const [smsPoolShortTermCountries, setSmsPoolShortTermCountries] = useState([]);
  const [smsPoolShortTermServices, setSmsPoolShortTermServices] = useState([]);
  const [textVerifiedServices, setTextVerifiedServices] = useState([]);
  const [heroSmsCountries, setHeroSmsCountries] = useState([]);
  const [profile, setProfile] = useState({ full_name: '', phone: '', username: '', api_key: '' });

  // Routing and active session states
  const [activeSession, setActiveSession] = useState(null);

  // Virtual Wallet details from PocketFi / Database
  const [virtualWallet, setVirtualWallet] = useState(null);

  const [walletBalance, setWalletBalance] = useState(0);

  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('zp_currency') || 'NGN';
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [dbIsAdmin, setDbIsAdmin] = useState(false);  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('zp_theme');
    if (saved) return saved;
    // Use device preference; default to dark if no preference detected
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  const toggleTheme = () => {
    setTheme(curr => curr === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    document.body.className = theme === 'light' ? 'light-theme' : 'dark-theme';
    localStorage.setItem('zp_theme', theme);
  }, [theme]);

  const [subscriptions, setSubscriptions] = useState(() => {
    const saved = localStorage.getItem('zp_catalog_subs');
    return saved ? JSON.parse(saved) : initialSubscriptions;
  });

  const [countries, setCountries] = useState(initialCountries);

  const [otpServices, setOtpServices] = useState(() => {
    const saved = localStorage.getItem('zp_catalog_otp');
    return saved ? JSON.parse(saved) : initialOtpServices;
  });

  const [esimPackages, setEsimPackages] = useState(() => {
    const saved = localStorage.getItem('zp_catalog_esim');
    return saved ? JSON.parse(saved) : initialEsimPackages;
  });

  const [smmServices, setSmmServices] = useState(() => {
    const saved = localStorage.getItem('zp_catalog_smm');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map(item => {
          const initial = initialSmmServices.find(i => i.id === item.id);
          if (initial && initial.apiServiceId && !item.apiServiceId) {
            return { ...item, apiServiceId: initial.apiServiceId };
          }
          return item;
        });
      } catch (e) {
        return initialSmmServices;
      }
    }
    return initialSmmServices;
  });

  const calculatePrice = (id, defaultPrice, category) => {
    const overrides = JSON.parse(localStorage.getItem('zp_price_overrides') || '{}');
    if (overrides[id] !== undefined) {
      return Number(overrides[id]);
    }
    const basePrice = WHOLESALE_BASE_PRICES[id];
    if (basePrice !== undefined) {
      const markup = profitMarkup[category] || 0;
      return Math.round(basePrice * (1 + markup / 100));
    }
    return defaultPrice;
  };

  useEffect(() => {
    // Recalculate Subscriptions
    setSubscriptions(curr => {
      const updated = curr.map(sub => {
        const priceNgn = calculatePrice(sub.id, sub.priceNgn, 'subs');
        return {
          ...sub,
          priceNgn,
          priceUsd: priceNgn / exchangeRate
        };
      });
      localStorage.setItem('zp_catalog_subs', JSON.stringify(updated));
      return updated;
    });

    // Recalculate OTP
    setOtpServices(curr => {
      const updated = curr.map(otp => {
        const priceNgn = calculatePrice(otp.id, otp.priceNgn, 'otp');
        return {
          ...otp,
          priceNgn,
          priceUsd: priceNgn / exchangeRate
        };
      });
      localStorage.setItem('zp_catalog_otp', JSON.stringify(updated));
      return updated;
    });

    // Recalculate eSIM
    setEsimPackages(curr => {
      const updated = curr.map(pkg => {
        const priceNgn = calculatePrice(pkg.id, pkg.priceNgn, 'esim');
        return {
          ...pkg,
          priceNgn,
          priceUsd: priceNgn / exchangeRate
        };
      });
      localStorage.setItem('zp_catalog_esim', JSON.stringify(updated));
      return updated;
    });

    // Recalculate SMM
    setSmmServices(curr => {
      const updated = curr.map(smm => {
        const overrides = JSON.parse(localStorage.getItem('zp_price_overrides') || '{}');
        if (overrides[smm.id] !== undefined) {
          const priceNgn = Number(overrides[smm.id]);
          return {
            ...smm,
            pricePerThousandNgn: priceNgn,
            pricePerThousandUsd: priceNgn / exchangeRate
          };
        }
        const wholesaleCosts = {
          'smm-ig-fol-std': 1300,
          'smm-ig-fol-hq': 2000,
          'smm-ig-lik-hq': 400,
          'smm-tt-fol-hq': 7000,
          'smm-tt-lik-fast': 500,
          'smm-tg-mem-hq': 1200,
          'smm-yt-sub-real': 43000,
          'smm-yt-vw-ads': 3600
        };
        const basePrice = wholesaleCosts[smm.id] || smm.pricePerThousandNgn / 1.5;
        const priceNgn = Math.round(basePrice * (1 + profitMarkup.smm / 100));
        return {
          ...smm,
          pricePerThousandNgn: priceNgn,
          pricePerThousandUsd: priceNgn / exchangeRate
        };
      });
      localStorage.setItem('zp_catalog_smm', JSON.stringify(updated));
      return updated;
    });
  }, [profitMarkup, triggerRecalc]);

  // User orders and transactions
  const [transactions, setTransactions] = useState([
    { id: 'tx-001', type: 'Deposit', amountNgn: 5000, amountUsd: 6.6, method: 'Virtual Bank Transfer', date: new Date(Date.now() - 3600000 * 24).toLocaleString(), status: 'SUCCESS' },
    { id: 'tx-002', type: 'Purchase', amountNgn: 1500, amountUsd: 2.0, method: 'Wallet (YouTube Premium)', date: new Date(Date.now() - 3600000 * 12).toLocaleString(), status: 'SUCCESS' }
  ]);

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsLoggedIn(true);
        setUser(session.user);
      } else {
        setIsLoggedIn(false);
        setUser(null);
        setIsAuthLoading(false);
      }
    });

    // 2. Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsLoggedIn(true);
        setUser(session.user);
      } else {
        setIsLoggedIn(false);
        setUser(null);
        setIsAuthLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch and sync SMM reseller services dynamically from the API
  useEffect(() => {
    const fetchSmmServices = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('smm-gateway', {
          body: { action: 'services' }
        });

        if (!error && data && data.status) {
          const apiServices = data.data;
          
          setSmmServices(curr => {
            const updated = curr.map(item => {
              if (item.apiServiceId) {
                const apiSrv = apiServices.find(s => Number(s.service) === Number(item.apiServiceId));
                if (apiSrv) {
                  const resellerRate = Number(apiSrv.rate);
                  const userPricePerThousand = Math.round(resellerRate * (1 + profitMarkup.smm / 100)); // Dynamic profit markup margin
                  return {
                    ...item,
                    pricePerThousandNgn: userPricePerThousand,
                    pricePerThousandUsd: userPricePerThousand / exchangeRate,
                    min: Number(apiSrv.min || item.min || 100),
                    max: Number(apiSrv.max || item.max || 100000)
                  };
                }
              }
              return item;
            });
            localStorage.setItem('zp_catalog_smm', JSON.stringify(updated));
            return updated;
          });
        }
      } catch (err) {
        console.error('Error fetching SMM services:', err);
      }
    };

    if (isLoggedIn) {
      fetchSmmServices();
    }
  }, [isLoggedIn, profitMarkup.smm]);

  // Server 1 (5SIM) is currently disabled.


  // Sync state with Supabase in Realtime when user logs in
  useEffect(() => {
    if (!user) {
      // Clear/Reset to defaults when logged out
      setWalletBalance(0);
      setTransactions([]);
      setVirtualWallet(null);
      setProfile({ full_name: '', phone: '' });
      setIsAdmin(false);
      setDbIsAdmin(false);
      // Clear user-scoped local data so the next user starts fresh
      setActiveOtps([]);
      setRentedNumbers([]);
      setActiveEsims([]);
      setSmmOrders([]);
      setAccountSubscriptions([]);
      setSocialMediaOrders([]);
      setIsAuthLoading(false);
      return;
    }

    // Ensure loader spinner remains active during initial DB sync
    setIsAuthLoading(true);

    // A. Fetch initial profile data (balance, full_name, phone)
    const fetchProfileData = async () => {
      let { data: dbProfile, error } = await supabase
        .from('profiles')
        .select('wallet_balance, full_name, username, phone, is_admin, api_key')
        .eq('id', user.id)
        .single();
        
      // Fallback if columns don't exist yet
      if (error && error.message.includes('does not exist')) {
        const fallback = await supabase
          .from('profiles')
          .select('wallet_balance, full_name, phone')
          .eq('id', user.id)
          .single();
        dbProfile = fallback.data;
      }

      if (dbProfile) {
        setWalletBalance(Number(dbProfile.wallet_balance));
        setProfile({
          full_name: dbProfile.full_name || '',
          username: dbProfile.username || '',
          phone: dbProfile.phone || '',
          api_key: dbProfile.api_key || ''
        });
        setDbIsAdmin(dbProfile.is_admin === true);
        setIsAdmin(dbProfile.is_admin === true);
      }
    };

    // B. Fetch initial transactions list
    const fetchTransactions = async () => {
      const { data: txs } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (txs && txs.length > 0) {
        setTransactions(txs.map(tx => ({
          id: tx.id,
          type: tx.type,
          amountNgn: Number(tx.amount),
          amountUsd: Number(tx.amount) / exchangeRate,
          method: tx.method,
          date: new Date(tx.created_at).toLocaleString(),
          status: tx.status
        })));
      } else if (txs && txs.length === 0) {
        setTransactions([]);
      }
    };

    // C. Fetch virtual wallet details
    const fetchVirtualWallet = async () => {
      const { data: wallet } = await supabase
        .from('virtual_wallets')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (wallet) {
        setVirtualWallet(wallet);
      }
    };

    // D2. Fetch social media orders from DB
    const fetchSocialMediaOrdersFromDB = async () => {
      try {
        const { data: orders, error } = await supabase
          .from('social_media_orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (orders && !error) {
          setSocialMediaOrders(orders.map(o => ({
            id: o.id,
            plan_id: o.plan_id,
            plan_name: o.plan_name,
            quantity: o.quantity,
            cost: Number(o.cost),
            status: o.status,
            account_details: o.account_details,
            ologstore_order_id: o.ologstore_order_id,
            created_at: o.created_at,
            date: new Date(o.created_at).toLocaleString()
          })));
        }
      } catch (e) {
        console.error('Failed to fetch social media orders:', e);
      }
    };

    const loadAllUserData = async () => {
      try {
        await fetchProfileData();
        await Promise.all([
          fetchTransactions(),
          fetchVirtualWallet(),
          fetchSocialMediaOrdersFromDB()
        ]);
      } catch (e) {
        console.error("Error fetching user data:", e);
      } finally {
        setIsAuthLoading(false);
      }
    };

    loadAllUserData();

    // D. Listen to realtime DB notifications
    // Listen for updates on Profiles
    const profileChannel = supabase
      .channel(`public:profiles:id=eq.${user.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${user.id}`
      }, (payload) => {
        if (payload.new) {
          setWalletBalance(Number(payload.new.wallet_balance));
          setProfile({
            full_name: payload.new.full_name || '',
            username: payload.new.username || '',
            phone: payload.new.phone || '',
            api_key: payload.new.api_key || ''
          });
        }
      })
      .subscribe();

    // Listen for new transactions
    const txChannel = supabase
      .channel(`public:transactions:user_id=eq.${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'transactions',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        if (payload.new) {
          const tx = payload.new;
          setTransactions(prev => [
            {
              id: tx.id,
              type: tx.type,
              amountNgn: Number(tx.amount),
              amountUsd: Number(tx.amount) / exchangeRate,
              method: tx.method,
              date: new Date(tx.created_at).toLocaleString(),
              status: tx.status
            },
            ...prev.filter(t => t.id !== tx.id) // avoid duplicates if already prepended
          ]);
        }
      })
      .subscribe();

    // Listen for virtual wallet updates
    const walletChannel = supabase
      .channel(`public:virtual_wallets:user_id=eq.${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'virtual_wallets',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setVirtualWallet(null);
        } else if (payload.new) {
          setVirtualWallet(payload.new);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(txChannel);
      supabase.removeChannel(walletChannel);
    };
  }, [user]);

  const loginUser = (email) => {
    setIsLoggedIn(true);
    setUser({ email });
  };

  const logoutUser = async () => {
    await supabase.auth.signOut();
  };

  const [activeOtps, setActiveOtps] = useState([]);

  const [rentedNumbers, setRentedNumbers] = useState([]);

  const [activeEsims, setActiveEsims] = useState([]);

  const [smmOrders, setSmmOrders] = useState([]);

  const [socialMediaOrders, setSocialMediaOrders] = useState([]);

  const [accountSubscriptions, setAccountSubscriptions] = useState(() => {
    const saved = localStorage.getItem('zp_accountSubs');
    return saved ? JSON.parse(saved) : [
      { id: 'as-001', name: 'YouTube Premium (Shared)', email: 'starlog.yt82@gmail.com', pass: 'StarLogPass45!', screen: 'Screen 2', expiry: new Date(Date.now() + 3600000 * 24 * 18).toLocaleDateString(), status: 'ACTIVE' }
    ];
  });

  // Sync to local storage on change
  useEffect(() => {
    localStorage.setItem('zp_walletBalance', walletBalance);
  }, [walletBalance]);

  useEffect(() => {
    localStorage.setItem('zp_currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('zp_isAdmin', isAdmin);
  }, [isAdmin]);

  useEffect(() => {
    localStorage.setItem('zp_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const getCountryFromNumber = (phone) => {
    if (!phone) return null;
    const cleanPhone = phone.replace('+', '').trim();
    const prefixes = [
      { code: '234', name: 'Nigeria', flag: '🇳🇬' },
      { code: '1', name: 'United States', flag: '🇺🇸' },
      { code: '44', name: 'United Kingdom', flag: '🇬🇧' },
      { code: '7', name: 'Russia', flag: '🇷🇺' },
      { code: '27', name: 'South Africa', flag: '🇿🇦' },
      { code: '49', name: 'Germany', flag: '🇩🇪' },
      { code: '33', name: 'France', flag: '🇫🇷' },
      { code: '91', name: 'India', flag: '🇮🇳' },
      { code: '55', name: 'Brazil', flag: '🇧🇷' },
      { code: '380', name: 'Ukraine', flag: '🇺🇦' },
      { code: '62', name: 'Indonesia', flag: '🇮🇩' },
      { code: '60', name: 'Malaysia', flag: '🇲🇾' },
      { code: '63', name: 'Philippines', flag: '🇵🇭' },
      { code: '95', name: 'Myanmar', flag: '🇲🇲' },
      { code: '84', name: 'Vietnam', flag: '🇻🇳' },
      { code: '996', name: 'Kyrgyzstan', flag: '🇰🇬' },
      { code: '20', name: 'Egypt', flag: '🇪🇬' },
      { code: '212', name: 'Morocco', flag: '🇲🇦' },
      { code: '90', name: 'Turkey', flag: '🇹🇷' },
      { code: '57', name: 'Colombia', flag: '🇨🇴' },
      { code: '52', name: 'Mexico', flag: '🇲🇽' },
      { code: '54', name: 'Argentina', flag: '🇦🇷' },
      { code: '40', name: 'Romania', flag: '🇷🇴' },
      { code: '92', name: 'Pakistan', flag: '🇵🇰' },
      { code: '880', name: 'Bangladesh', flag: '🇧🇩' },
      { code: '66', name: 'Thailand', flag: '🇹🇭' },
      { code: '998', name: 'Uzbekistan', flag: '🇺🇿' },
      { code: '992', name: 'Tajikistan', flag: '🇹🇯' },
      { code: '993', name: 'Turkmenistan', flag: '🇹🇲' },
      { code: '994', name: 'Azerbaijan', flag: '🇦🇿' },
      { code: '374', name: 'Armenia', flag: '🇦🇲' },
      { code: '995', name: 'Georgia', flag: '🇬🇪' },
      { code: '375', name: 'Belarus', flag: '🇧🇾' },
      { code: '373', name: 'Moldova', flag: '🇲🇩' },
      { code: '371', name: 'Latvia', flag: '🇱🇻' },
      { code: '370', name: 'Lithuania', flag: '🇱🇹' },
      { code: '372', name: 'Estonia', flag: '🇪🇪' },
      { code: '34', name: 'Spain', flag: '🇪🇸' },
      { code: '39', name: 'Italy', flag: '🇮🇹' },
      { code: '31', name: 'Netherlands', flag: '🇳🇱' },
      { code: '32', name: 'Belgium', flag: '🇧🇪' },
      { code: '41', name: 'Switzerland', flag: '🇨🇭' },
      { code: '46', name: 'Sweden', flag: '🇸🇪' },
      { code: '47', name: 'Norway', flag: '🇳🇴' },
      { code: '358', name: 'Finland', flag: '🇫🇮' },
      { code: '45', name: 'Denmark', flag: '🇩🇰' },
      { code: '43', name: 'Austria', flag: '🇦🇹' },
      { code: '351', name: 'Portugal', flag: '🇵🇹' },
      { code: '30', name: 'Greece', flag: '🇬🇷' },
      { code: '353', name: 'Ireland', flag: '🇮🇪' },
      { code: '420', name: 'Czech Republic', flag: '🇨🇿' },
      { code: '421', name: 'Slovakia', flag: '🇸🇰' },
      { code: '36', name: 'Hungary', flag: '🇭🇺' },
      { code: '359', name: 'Bulgaria', flag: '🇧🇬' },
      { code: '385', name: 'Croatia', flag: '🇭🇷' },
      { code: '386', name: 'Slovenia', flag: '🇸🇮' },
      { code: '381', name: 'Serbia', flag: '🇷🇸' },
      { code: '81', name: 'Japan', flag: '🇯🇵' },
      { code: '82', name: 'South Korea', flag: '🇰🇷' },
      { code: '886', name: 'Taiwan', flag: '🇹🇼' },
      { code: '852', name: 'Hong Kong', flag: '🇭🇰' },
      { code: '65', name: 'Singapore', flag: '🇸🇬' },
      { code: '61', name: 'Australia', flag: '🇦🇺' },
      { code: '64', name: 'New Zealand', flag: '🇳🇿' },
      { code: '972', name: 'Israel', flag: '🇮🇱' },
      { code: '966', name: 'Saudi Arabia', flag: '🇸🇦' },
      { code: '971', name: 'UAE', flag: '🇦🇪' },
      { code: '233', name: 'Ghana', flag: '🇬🇭' },
      { code: '221', name: 'Senegal', flag: '🇸🇳' },
      { code: '256', name: 'Uganda', flag: '🇺🇬' },
      { code: '255', name: 'Tanzania', flag: '🇹🇿' },
      { code: '237', name: 'Cameroon', flag: '🇨🇲' },
      { code: '225', name: 'Ivory Coast', flag: '🇨🇮' }
    ];
    prefixes.sort((a, b) => b.code.length - a.code.length);
    for (const p of prefixes) {
      if (cleanPhone.startsWith(p.code)) {
        return p;
      }
    }
    return null;
  };

  const syncOtpOrdersFromDB = async (uid) => {
    try {
      const { data, error } = await supabase
        .from('otp_orders')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        const mapped = data.map(dbOtp => {
          const createdTime = new Date(dbOtp.created_at).getTime();
          
          let cleanOrderId = dbOtp.id;
          if (dbOtp.server === 'server1' && typeof dbOtp.id === 'string') {
            cleanOrderId = dbOtp.id.replace('otp-', '');
          } else if (dbOtp.server === 'server2' && typeof dbOtp.id === 'string') {
            cleanOrderId = dbOtp.id.replace('sp-', '');
          } else if (dbOtp.server === 'server3' && typeof dbOtp.id === 'string') {
            cleanOrderId = dbOtp.id.replace('tv-', '');
          } else if (dbOtp.server === 'server4' && typeof dbOtp.id === 'string') {
            cleanOrderId = dbOtp.id.replace('hero-', '');
          }

          const autoCountry = getCountryFromNumber(dbOtp.phone_number);

          return {
            id: dbOtp.id,
            phoneNumber: dbOtp.phone_number,
            server: dbOtp.server,
            service: dbOtp.service,
            priceNgn: Number(dbOtp.price_ngn),
            status: dbOtp.status,
            otpCode: dbOtp.otp_code,
            smsText: dbOtp.sms_text,
            created_at: dbOtp.created_at,
            country: autoCountry ? autoCountry.name : 'Unknown',
            flag: autoCountry ? autoCountry.flag : '🏳️',
            fivesimOrderId: dbOtp.server === 'server1' ? Number(cleanOrderId) : null,
            orderId: cleanOrderId,
            expiresAt: createdTime + 15 * 60 * 1000
          };
        });
        setActiveOtps(mapped);
      }
    } catch (e) {
      console.error("Failed to sync OTP orders from database:", e);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    // Load user-scoped data from localStorage when user logs in
    const uid = user.id;
    const savedOtps = localStorage.getItem(`zp_activeOtps_${uid}`);
    if (savedOtps) {
      try {
        setActiveOtps(JSON.parse(savedOtps));
      } catch (e) {}
    }
    
    // Sync live from database so numbers don't disappear
    syncOtpOrdersFromDB(uid);

    const savedRented = localStorage.getItem(`zp_rentedNumbers_${uid}`);
    if (savedRented) setRentedNumbers(JSON.parse(savedRented));
    const savedEsims = localStorage.getItem(`zp_activeEsims_${uid}`);
    if (savedEsims) setActiveEsims(JSON.parse(savedEsims));
    const savedSmm = localStorage.getItem(`zp_smmOrders_${uid}`);
    if (savedSmm) setSmmOrders(JSON.parse(savedSmm));
    const savedSubs = localStorage.getItem(`zp_accountSubs_${uid}`);
    if (savedSubs) setAccountSubscriptions(JSON.parse(savedSubs));
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    localStorage.setItem(`zp_activeOtps_${user.id}`, JSON.stringify(activeOtps));
  }, [activeOtps, user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    localStorage.setItem(`zp_rentedNumbers_${user.id}`, JSON.stringify(rentedNumbers));
  }, [rentedNumbers, user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    localStorage.setItem(`zp_activeEsims_${user.id}`, JSON.stringify(activeEsims));
  }, [activeEsims, user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    localStorage.setItem(`zp_smmOrders_${user.id}`, JSON.stringify(smmOrders));
  }, [smmOrders, user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    localStorage.setItem(`zp_accountSubs_${user.id}`, JSON.stringify(accountSubscriptions));
  }, [accountSubscriptions, user?.id]);

  useEffect(() => {
    localStorage.setItem('zp_catalog_subs', JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem('zp_catalog_otp', JSON.stringify(otpServices));
  }, [otpServices]);

  useEffect(() => {
    localStorage.setItem('zp_catalog_esim', JSON.stringify(esimPackages));
  }, [esimPackages]);

  useEffect(() => {
    localStorage.setItem('zp_catalog_smm', JSON.stringify(smmServices));
  }, [smmServices]);

  // Helper conversions
  const formatCost = (costNgn) => {
    const value = Number(costNgn || 0);
    if (currency === 'NGN') {
      return `₦${value.toLocaleString()}`;
    } else {
      // Approximate conversion rate N1000 = $1.3
      const converted = (value / exchangeRate).toFixed(2);
      return `$${converted}`;
    }
  };

  const getPrice = (item) => {
    return currency === 'NGN' ? item.priceNgn : item.priceUsd;
  };

  // Actions
  const toggleCurrency = () => {
    setCurrency(curr => curr === 'NGN' ? 'USD' : 'NGN');
  };

  const executePurchase = async (amount, type, method) => {
    if (!user) return { success: false, msg: 'Please log in to make purchases' };
    
    const { data, error } = await supabase.rpc('process_purchase', {
      p_user_id: user.id,
      p_amount: amount,
      p_type: type,
      p_method: method
    });

    if (error) {
      return { success: false, msg: error.message };
    }
    return { success: true };
  };

  const depositWallet = async (amount, method) => {
    const isNgn = currency === 'NGN';
    const amountNgn = isNgn ? Number(amount) : Number(amount) * exchangeRate;
    const amountUsd = isNgn ? Number(amount) / exchangeRate : Number(amount);

    if (user) {
      const ref = `tx-${Math.floor(100000 + Math.random() * 900000)}`;
      const { error } = await supabase.rpc('process_deposit', {
        p_tx_id: ref,
        p_user_id: user.id,
        p_amount: amountNgn,
        p_method: method
      });
      if (error) {
        console.error("Deposit failed in database:", error);
        return { success: false, msg: error.message };
      }
      return { success: true, reference: ref };
    } else {
      setWalletBalance(prev => prev + amountNgn);
      setTransactions(prev => [
        {
          id: `tx-${Math.floor(100000 + Math.random() * 900000)}`,
          type: 'Deposit',
          amountNgn,
          amountUsd,
          method,
          date: new Date().toLocaleString(),
          status: 'SUCCESS'
        },
        ...prev
      ]);
      return { success: true };
    }
  };

  const generatePocketFiWallet = async (bank = 'paga') => {
    if (!user) return { success: false, msg: 'Please log in first' };

    try {
      // Fetch user profile to verify phone normalization
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', user.id)
        .single();

      if (profileErr) throw new Error("Could not load user profile: " + profileErr.message);

      let currentPhone = profile.phone || '';
      let normalizedPhone = currentPhone.replace(/\D/g, '');
      if (normalizedPhone.startsWith('234') && normalizedPhone.length === 13) {
        normalizedPhone = '0' + normalizedPhone.substring(3);
      }
      if (normalizedPhone.length === 10 && !normalizedPhone.startsWith('0')) {
        normalizedPhone = '0' + normalizedPhone;
      }

      if (normalizedPhone !== currentPhone) {
        const { error: updateErr } = await supabase
          .from('profiles')
          .update({ phone: normalizedPhone })
          .eq('id', user.id);
        if (updateErr) throw new Error("Could not update profile phone: " + updateErr.message);
      }

      const { data, error } = await supabase.functions.invoke('pocketfi-create-wallet', {
        body: { bank }
      });

      if (!error && data && data.status) {
        setVirtualWallet(data.wallet);
        return { success: true, wallet: data.wallet };
      }
      
      if (error) throw error;
      
    } catch (e) {
      console.error("PocketFi API Error:", e);
      return { success: false, msg: e.message };
    }
  };

  const simulatePocketFiDeposit = async (amount) => {
    if (!user) return { success: false, msg: 'Please log in first' };
    
    const ref = `sim-${Math.floor(100000 + Math.random() * 900000)}`;
    const depositRes = await supabase.rpc('process_deposit', {
      p_tx_id: ref,
      p_user_id: user.id,
      p_amount: Number(amount),
      p_method: 'PocketFi Bank Transfer (Simulated)'
    });

    if (depositRes.error) {
      return { success: false, msg: depositRes.error.message };
    }
    return { success: true, reference: ref };
  };

  const buySharedSubscription = async (subId) => {
    const sub = subscriptions.find(s => s.id === subId);
    if (!sub) return { success: false, msg: 'Subscription not found' };

    const price = sub.priceNgn;
    const purchaseRes = await executePurchase(price, 'Purchase', `Wallet (${sub.name})`);
    if (!purchaseRes.success) {
      return purchaseRes;
    }
    
    const serviceNick = sub.name.split(' ')[0].toLowerCase();
    const mockEmail = `starlog.${serviceNick}${Math.floor(10 + Math.random() * 89)}@starlog.ng`;
    const mockPass = `StarLog$${Math.floor(1000 + Math.random() * 8999)}`;
    const mockScreen = `Profile Screen ${Math.floor(1 + Math.random() * 4)}`;

    const newSub = {
      id: `as-${Math.floor(100000 + Math.random() * 900000)}`,
      name: sub.name,
      email: mockEmail,
      pass: mockPass,
      screen: mockScreen,
      expiry: new Date(Date.now() + 3600000 * 24 * 30).toLocaleDateString(),
      status: 'ACTIVE'
    };

    setAccountSubscriptions(prev => [newSub, ...prev]);
    return { success: true, sub: newSub };
  };

  const customizeGatewayError = (errorStr, server) => {
    const err = String(errorStr || '').toLowerCase();
    
    // 1. Check for insufficient balance / no funds on the API provider
    if (
      err.includes('no money') ||
      err.includes('no_money') ||
      err.includes('no balance') ||
      err.includes('no_balance') ||
      err.includes('insufficient balance') ||
      err.includes('insufficient funds') ||
      err.includes('not enough balance') ||
      err.includes('not enough user balance') ||
      err.includes('not enough money') ||
      err.includes('out of funds') ||
      err.includes('insufficient_funds') ||
      err.includes('low balance') ||
      err.includes('low_balance') ||
      err.includes('balance is too low') ||
      err.includes('balance too low')
    ) {
      return 'This service is currently unavailable on this server. Please try using another server.';
    }

    // 2. Check for out of numbers / stock
    if (
      err.includes('no free phones') ||
      err.includes('no numbers') ||
      err.includes('no_numbers') ||
      err.includes('out of stock') ||
      err.includes('no phone numbers') ||
      err.includes('no number available') ||
      err.includes('numbers unavailable')
    ) {
      const serverLabel = server ? (server.startsWith('server') ? server.replace('server', 'Server ') : server) : 'this server';
      return `No numbers are currently available for this service on ${serverLabel}. Please try another country or server.`;
    }

    // 3. Check for auth/api key config errors (usually developer error but user shouldn't see raw secrets/config errors)
    if (
      err.includes('api key') ||
      err.includes('apikey') ||
      err.includes('unauthorized') ||
      err.includes('forbidden') ||
      err.includes('not configured') ||
      err.includes('invalid credentials')
    ) {
      return 'Gateway configuration error. Please try another server or contact support if the issue persists.';
    }

    // 4. Default customized fallback
    if (err.trim() === '') {
      return 'Failed to request verification number. Please try another server.';
    }

    // Otherwise, return a capitalized, cleaned version of the error message to make it look premium
    let cleanMsg = errorStr
      .replace(/_/g, ' ')
      .replace(/access/gi, '')
      .trim();
    
    if (cleanMsg.length > 0) {
      return cleanMsg.charAt(0).toUpperCase() + cleanMsg.slice(1);
    }
    
    return 'An unexpected error occurred. Please try again or use another server.';
  };

  const fetchTextVerifiedPrice = async (serviceName) => {
    try {
      const res = await supabase.functions.invoke('textverified-gateway', {
        body: { action: 'get_price', serviceName }
      });
      if (!res.error && res.data?.status) {
        const priceCredits = Number(res.data.data.price);
        const markupMultiplier = 1 + (profitMarkup.otp / 100);
        const priceNgn = priceCredits > 0 ? Math.max(300, Math.round(priceCredits * exchangeRate * markupMultiplier)) : 0;
        return { success: true, priceNgn, priceCredits };
      } else {
        return { success: false, msg: customizeGatewayError(res.error || 'Failed to fetch price', 'server3') };
      }
    } catch (e) {
      console.error("fetchTextVerifiedPrice Error:", e);
      return { success: false, msg: customizeGatewayError(e.message, 'server3') };
    }
  };

  const createOtpOrderInDB = async (newOtp) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('otp_orders').insert({
        id: newOtp.id,
        user_id: user.id,
        phone_number: newOtp.phoneNumber,
        server: newOtp.server,
        service: newOtp.service,
        price_ngn: newOtp.priceNgn,
        status: newOtp.status,
        created_at: new Date().toISOString()
      });
      if (error) console.error("Error inserting OTP order in DB:", error);
    } catch (e) {
      console.error("Failed to insert OTP order:", e);
    }
  };

  const updateOtpOrderStatusInDB = async (otpId, status, otpCode = null, smsText = null) => {
    try {
      const updateData = { status };
      if (otpCode !== null) updateData.otp_code = otpCode;
      if (smsText !== null) updateData.sms_text = smsText;
      
      const { error } = await supabase
        .from('otp_orders')
        .update(updateData)
        .eq('id', otpId);
      if (error) console.error("Error updating OTP order in DB:", error);
    } catch (e) {
      console.error("Failed to update OTP order in DB:", e);
    }
  };

  const requestOtpNumber = async (countryId, serviceId, dynamicServiceObj = null, server = 'server2') => {
    if (server === 'server3') {
      const priceRes = await fetchTextVerifiedPrice(serviceId);
      if (!priceRes.success) {
        return { success: false, msg: priceRes.msg };
      }

      const priceNgn = priceRes.priceNgn;
      const purchaseRes = await executePurchase(priceNgn, 'Purchase', `OTP Verification (Textverified - ${serviceId})`);
      if (!purchaseRes.success) {
        return purchaseRes;
      }

      try {
        const { data, error } = await supabase.functions.invoke('textverified-gateway', {
          body: { action: 'buy', serviceName: serviceId }
        });

        if (error || !data || !data.status) {
          throw new Error(error ? error.message : (data ? data.error : 'Failed to retrieve verification number from Server 3'));
        }

        const detail = data.data;
        const phone = detail.number;
        const formattedPhone = String(phone).startsWith('+') ? String(phone) : '+' + phone;

        const autoCountry = getCountryFromNumber(formattedPhone);

        const newOtp = {
          id: `tv-${detail.id}`,
          orderId: detail.id,
          phoneNumber: formattedPhone,
          country: autoCountry ? autoCountry.name : 'United States',
          flag: autoCountry ? autoCountry.flag : '🇺🇸',
          service: serviceId,
          priceNgn,
          status: 'PENDING',
          date: new Date().toLocaleString(),
          expiresAt: new Date(detail.endsAt).getTime(),
          smsText: null,
          otpCode: null,
          server: 'server3'
        };

        setActiveOtps(prev => [newOtp, ...prev]);
        createOtpOrderInDB(newOtp);
        return { success: true, otp: newOtp };

      } catch (e) {
        console.error("Textverified API Order Error:", e);
        const ref = `ref-otp-fail-${Math.floor(100000 + Math.random() * 900000)}`;
        await supabase.rpc('process_deposit', {
          p_tx_id: ref, p_user_id: user.id, p_amount: priceNgn, p_method: `OTP Failed Refund (Textverified - ${serviceId})`
        });
        return { success: false, msg: customizeGatewayError(e.message, 'server3') };
      }
    }

    if (server === 'server4') {
      const priceNgn = dynamicServiceObj?.priceNgn;
      if (!priceNgn) return { success: false, msg: 'Pricing information not loaded' };

      const purchaseRes = await executePurchase(priceNgn, 'Purchase', `OTP Verification (HeroSMS - ${dynamicServiceObj.name})`);
      if (!purchaseRes.success) {
        return purchaseRes;
      }

      try {
        const { data, error } = await supabase.functions.invoke('herosms-gateway', {
          body: { action: 'buy', country: countryId, service: serviceId }
        });

        if (error || !data || !data.status) {
          throw new Error(error ? error.message : (data ? data.error : 'No numbers available on Server 4'));
        }

        const detail = data.data;
        const phone = detail.number;
        const formattedPhone = String(phone).startsWith('+') ? String(phone) : '+' + phone;

        const autoCountry = getCountryFromNumber(formattedPhone);
        const country = heroSmsCountries.find(c => Number(c.id) === Number(countryId));
        const countryName = autoCountry ? autoCountry.name : (country ? country.name : 'Unknown Country');
        const countryFlag = autoCountry ? autoCountry.flag : (country ? country.flag : '🏳️');

        const newOtp = {
          id: `hero-${detail.id}`,
          orderId: detail.id,
          phoneNumber: formattedPhone,
          country: countryName,
          flag: countryFlag,
          service: dynamicServiceObj.name,
          priceNgn,
          status: 'PENDING',
          date: new Date().toLocaleString(),
          expiresAt: Date.now() + 15 * 60 * 1000,
          smsText: null,
          otpCode: null,
          server: 'server4'
        };

        setActiveOtps(prev => [newOtp, ...prev]);
        createOtpOrderInDB(newOtp);
        return { success: true, otp: newOtp };

      } catch (e) {
        console.error("HeroSMS API Order Error:", e);
        const ref = `ref-otp-fail-${Math.floor(100000 + Math.random() * 900000)}`;
        await supabase.rpc('process_deposit', {
          p_tx_id: ref, p_user_id: user.id, p_amount: priceNgn, p_method: `OTP Failed Refund (HeroSMS - ${dynamicServiceObj.name})`
        });
        return { success: false, msg: customizeGatewayError(e.message, 'server4') };
      }
    }

    if (server === 'server2') {
      const country = smsPoolShortTermCountries.find(c => c.ID == countryId);
      const service = smsPoolShortTermServices.find(s => s.ID == serviceId);
      if (!country || !service) return { success: false, msg: 'Invalid parameters selected for Server 2' };
      if ((service.name || '').toLowerCase().includes('whatsapp')) {
        return { success: false, msg: 'WhatsApp is not supported on Server 2. Please select Server 3 or Server 4.' };
      }

      // SMSPool prices are in USD. 
      // Since SMSPool short term price isn't explicitly given in /service/retrieve_all (we only get ID and name usually),
      // Actually we'll need to set a base price or maybe max_price? Wait! SMSPool short term prices are returned?
      // For now let's set a flat rate if not provided, or dynamicServiceObj has priceNgn.
      const priceNgn = dynamicServiceObj?.priceNgn || 1500; 

      const purchaseRes = await executePurchase(priceNgn, 'Purchase', `OTP Verification (${service.name} - ${country.name})`);
      if (!purchaseRes.success) return purchaseRes;

      try {
        const { data, error } = await supabase.functions.invoke('smspool-gateway', {
          body: { action: 'order_sms', country: countryId, service: serviceId }
        });

        if (error || !data || !data.status || data.data.success === 0) {
          throw new Error(error ? error.message : (data?.data?.message || 'Failed to order from Server 2'));
        }

        // data.data has { order_id, phonenumber, number, ... }
        const orderData = data.data;
        const phone = orderData.phonenumber || orderData.number || orderData.cc_and_number;
        const formattedPhone = String(phone).startsWith('+') ? String(phone) : '+' + phone;

        const autoCountry = getCountryFromNumber(formattedPhone);
        const countryName = autoCountry ? autoCountry.name : country.name;
        const countryFlag = autoCountry ? autoCountry.flag : (country.flag || '🏳️');

        const newOtp = {
          id: `sp-${orderData.order_id}`,
          orderId: orderData.order_id,
          phoneNumber: formattedPhone,
          country: countryName,
          flag: countryFlag,
          service: service.name,
          priceNgn,
          status: 'PENDING',
          date: new Date().toLocaleString(),
          expiresAt: Date.now() + 15 * 60 * 1000,
          smsText: null,
          otpCode: null,
          server: 'server2'
        };

        setActiveOtps(prev => [newOtp, ...prev]);
        createOtpOrderInDB(newOtp);
        return { success: true, otp: newOtp };

      } catch (e) {
        console.error("SMSPool API Order Error:", e);
        const ref = `ref-otp-fail-${Math.floor(100000 + Math.random() * 900000)}`;
        await supabase.rpc('process_deposit', {
          p_tx_id: ref, p_user_id: user.id, p_amount: priceNgn, p_method: `OTP Failed Refund (${service.name})`
        });
        return { success: false, msg: customizeGatewayError(e.message, 'server2') };
      }
    }

    return { success: false, msg: 'Server 1 is currently disabled. Please select Server 2, 3, or 4.' };
  };

  const cancelOtp = async (otpId) => {
    const otp = activeOtps.find(o => o.id === otpId);
    if (!otp) return { success: false, msg: 'OTP request not found' };
    if (otp.status !== 'PENDING') return { success: false, msg: 'OTP session already finished' };

    try {
      if (otp.fivesimOrderId) {
        await supabase.functions.invoke('sms-gateway', {
          body: { action: 'cancel', orderId: otp.fivesimOrderId }
        });
      }
      if (otp.server === 'server3' && otp.orderId) {
        await supabase.functions.invoke('textverified-gateway', {
          body: { action: 'cancel', id: otp.orderId }
        });
      }
      if (otp.server === 'server4' && otp.orderId) {
        await supabase.functions.invoke('herosms-gateway', {
          body: { action: 'cancel', id: otp.orderId }
        });
      }
    } catch (e) {
      console.error("Failed to cancel order:", e);
    }

    const ref = `ref-${Math.floor(100000 + Math.random() * 900000)}`;
    const refundRes = await supabase.rpc('process_deposit', {
      p_tx_id: ref,
      p_user_id: user.id,
      p_amount: otp.priceNgn,
      p_method: `OTP Refund (${otp.service})`
    });

    if (refundRes.error) {
      return { success: false, msg: refundRes.error.message };
    }

    updateOtpOrderStatusInDB(otpId, 'REFUNDED');
    setActiveOtps(prev => prev.map(o => o.id === otpId ? { ...o, status: 'REFUNDED' } : o));
    return { success: true };
  };

  const fetchOtpServicesForCountry = async (countryId) => {
    // Use the fivesimSlug stored on the country object (populated from the live API)
    const countryObj = countries.find(c => c.id === countryId);
    const cleanCountry = countryObj?.fivesimSlug || countryId || 'usa';

    try {
      const cacheKey = `zp_otp_services_${cleanCountry}`;
      const timeKey = `zp_otp_services_time_${cleanCountry}`;
      const cached = sessionStorage.getItem(cacheKey);
      const cacheTime = sessionStorage.getItem(timeKey);
      
      if (cached && cacheTime && Date.now() - Number(cacheTime) < 5 * 60 * 1000) {
        return { success: true, services: JSON.parse(cached) };
      }

      const { data, error } = await supabase.functions.invoke('sms-gateway', {
        body: { action: 'products', country: cleanCountry }
      });

      if (error || !data || !data.status) {
        throw new Error(error ? error.message : (data ? data.error : 'Failed to fetch services'));
      }

      const products = data.data;
      const parsed = Object.entries(products)
        .filter(([key, val]) => val.Category === 'activation' && val.Qty > 0)
        .map(([key, val]) => {
          const displayName = key.charAt(0).toUpperCase() + key.slice(1);
          // Convert RUB to NGN using dynamic OTP profit markup (base rate ~ 16.67 NGN/RUB)
          const baseExchangeRate = 16.67;
          const markupMultiplier = 1 + (profitMarkup.otp / 100);
          const priceNgn = Math.max(300, Math.round(val.Price * baseExchangeRate * markupMultiplier));

          const emojis = {
            whatsapp: '💬',
            telegram: '✈️',
            google: '🔍',
            openai: '🤖',
            facebook: '📘',
            instagram: '📸',
            tiktok: '🎵',
            netflix: '🎬',
            discord: '👾',
            twitter: '🐦',
            microsoft: '💻',
            apple: '🍎',
            yahoo: '📧',
            steam: '🎮',
            uber: '🚗',
            lyft: '🚙',
            airbnb: '🏡'
          };

          return {
            id: `srv-${key}`,
            name: displayName,
            emoji: emojis[key] || '📱',
            priceNgn,
            priceUsd: priceNgn / exchangeRate,
            qty: val.Qty
          };
        })
        .sort((a, b) => b.qty - a.qty);

      sessionStorage.setItem(cacheKey, JSON.stringify(parsed));
      sessionStorage.setItem(timeKey, Date.now().toString());

      return { success: true, services: parsed };
    } catch (e) {
      console.error("Error fetching dynamic 5sim services:", e);
      return { success: false, msg: e.message };
    }
  };

  const reuseOtpNumber = async (number, serviceName, countryName, flag) => {
    const service = otpServices.find(s => s.name.toLowerCase() === serviceName.toLowerCase() || s.id === serviceName);
    if (!service) return { success: false, msg: 'Invalid service selected' };

    const cleanNum = number.replace(/\+/g, '').trim();

    // 1. Locate original order and verification ID
    let targetServer = null;
    let originalOrderId = null;

    // Find in activeOtps memory state first
    const originalOrder = activeOtps.find(otp => otp.phoneNumber && otp.phoneNumber.replace(/\+/g, '').trim() === cleanNum);
    if (originalOrder) {
      targetServer = originalOrder.server;
      originalOrderId = originalOrder.orderId;
    } else {
      // Find in DB history
      const formattedNumWithPlus = '+' + cleanNum;
      try {
        const { data: dbOrders } = await supabase
          .from('otp_orders')
          .select('*')
          .or(`phone_number.eq.${formattedNumWithPlus},phone_number.eq.${cleanNum}`)
          .order('created_at', { ascending: false })
          .limit(1);

        if (dbOrders && dbOrders.length > 0) {
          const dbOtp = dbOrders[0];
          targetServer = dbOtp.server;
          
          let cleanOrderId = dbOtp.id;
          if (dbOtp.server === 'server3' && typeof dbOtp.id === 'string') {
            cleanOrderId = dbOtp.id.replace('tv-', '');
          } else if (dbOtp.server === 'server1' && typeof dbOtp.id === 'string') {
            cleanOrderId = dbOtp.id.replace('otp-', '');
          } else if (dbOtp.server === 'server2' && typeof dbOtp.id === 'string') {
            cleanOrderId = dbOtp.id.replace('sp-', '');
          } else if (dbOtp.server === 'server4' && typeof dbOtp.id === 'string') {
            cleanOrderId = dbOtp.id.replace('hero-', '');
          }
          originalOrderId = cleanOrderId;
        }
      } catch (dbErr) {
        console.error("Failed to query DB for reuse: ", dbErr);
      }
    }

    if (!originalOrderId || targetServer !== 'server3') {
      return { success: false, msg: 'Only Server 3 (Textverified) numbers previously purchased can be reused.' };
    }

    // 2. Charge the wallet
    const price = service.priceNgn;
    const purchaseRes = await executePurchase(price, 'Purchase', `OTP Reuse (${service.name} - ${number})`);
    if (!purchaseRes.success) {
      return purchaseRes;
    }

    try {
      // Invoke textverified-gateway for reuse
      const { data, error } = await supabase.functions.invoke('textverified-gateway', {
        body: { action: 'reuse', id: originalOrderId }
      });

      if (error || !data || !data.status) {
        // Refund if fail
        const ref = `dep-ref-${Math.floor(100000 + Math.random() * 900000)}`;
        await supabase.rpc('process_deposit', {
          p_tx_id: ref, p_user_id: user.id, p_amount: price, p_method: `OTP Reuse Failed Refund (${service.name} - ${number})`
        });
        return { success: false, msg: data?.error || error?.message || 'Number is no longer available for reuse on Server 3.' };
      }

      const resData = data.data; // Textverified verification object
      const formattedPhone = String(resData.number).startsWith('+') ? String(resData.number) : '+' + resData.number;
      const autoCountry = getCountryFromNumber(formattedPhone);

      const newOtp = {
        id: `tv-${resData.id}`,
        orderId: resData.id,
        phoneNumber: formattedPhone,
        server: 'server3',
        service: service.name,
        priceNgn: price,
        status: 'PENDING',
        otpCode: null,
        smsText: null,
        created_at: new Date().toISOString(),
        country: autoCountry ? autoCountry.name : (countryName || 'United States'),
        flag: autoCountry ? autoCountry.flag : (flag || '🇺🇸'),
        expiresAt: new Date(resData.endsAt).getTime(),
        date: new Date().toLocaleString()
      };

      // Save to DB
      await supabase.from('otp_orders').insert({
        id: newOtp.id,
        user_id: user.id,
        phone_number: newOtp.phoneNumber,
        server: 'server3',
        service: newOtp.service,
        price_ngn: newOtp.priceNgn,
        status: 'PENDING',
        created_at: new Date().toISOString(),
        otp_code: null,
        sms_text: null
      });

      setActiveOtps(prev => [newOtp, ...prev]);
      setActiveSession(newOtp); // Show the code polling panel immediately
      return { success: true };
    } catch (e) {
      // Refund if error
      const ref = `dep-ref-${Math.floor(100000 + Math.random() * 900000)}`;
      await supabase.rpc('process_deposit', {
        p_tx_id: ref, p_user_id: user.id, p_amount: price, p_method: `OTP Reuse Error Refund (${service.name} - ${number})`
      });
      return { success: false, msg: e.message };
    }
  };


  const rentNumber = async (countryId, serviceName, durationDays, server = 'server2') => {
    if (server === 'server2') {
      // SMS Pool logic
      const rentalInfo = smsPoolRentals.find(r => r.ID === countryId);
      if (!rentalInfo) return { success: false, msg: 'Rental not found' };

      const costUsd = rentalInfo.pricing[durationDays];
      if (!costUsd) return { success: false, msg: 'Duration not available' };

      const NGN_RATE = 1500; // Exchange rate + markup
      const costNgn = Math.round(costUsd * NGN_RATE * (1 + (profitMarkup.otp / 100)));

      const purchaseRes = await executePurchase(costNgn, 'Purchase', `Number Rental (${durationDays} Days - ${rentalInfo.name})`);
      if (!purchaseRes.success) return purchaseRes;

      try {
        const { data, error } = await supabase.functions.invoke('smspool-gateway', {
          body: { action: 'order', id: countryId, days: durationDays }
        });
        
        if (error || !data || !data.status || data.data.success === 0) {
          throw new Error(error ? error.message : (data?.data?.message || 'Failed to rent number from Server 2'));
        }

        const orderData = data.data; // sms pool response
        const rawNum = orderData.phonenumber || orderData.number;
        const formattedPhone = String(rawNum).startsWith('+') ? String(rawNum) : '+' + rawNum;

        const newRental = {
          id: `rent-sp-${orderData.rental_code || Math.floor(100000 + Math.random() * 900000)}`,
          rental_code: orderData.rental_code, // from SMS Pool
          phoneNumber: formattedPhone, 
          country: rentalInfo.name,
          flag: '📱', // Need a flag mapper, fallback to emoji
          service: serviceName,
          durationDays,
          expiryDate: new Date(Date.now() + 3600000 * 24 * durationDays).toLocaleDateString(),
          priceNgn: costNgn,
          messages: [],
          status: 'ACTIVE',
          server: 'server2'
        };

        setRentedNumbers(prev => [newRental, ...prev]);
        return { success: true, rental: newRental };

      } catch (e) {
        console.error("SMSPool API Rent Error:", e);
        const ref = `ref-rent-fail-${Math.floor(100000 + Math.random() * 900000)}`;
        await supabase.rpc('process_deposit', {
          p_tx_id: ref, p_user_id: user.id, p_amount: costNgn, p_method: `Rental Failed Refund`
        });
        return { success: false, msg: 'This service is currently unavailable on this server. Please try using another server.' };
      }
    }

    return { success: false, msg: 'Server 1 rentals are currently disabled. Please select Server 2.' };
  };

  const buyEsim = async (packageId) => {
    const pkg = esimPackages.find(p => p.id === packageId);
    if (!pkg) return { success: false, msg: 'eSIM Package not found' };

    const price = pkg.priceNgn;
    const purchaseRes = await executePurchase(price, 'Purchase', `eSIM Setup (${pkg.country} - ${pkg.dataGb}GB)`);
    if (!purchaseRes.success) {
      return purchaseRes;
    }

    try {
      // Map country to ISO3
      const countryIso3Map = {
        'United States': 'USA',
        'United Kingdom': 'GBR',
        'Europe Regional': 'EUR',
        'Global (85 Countries)': 'USA', // Sotel plans fallback
        'Nigeria': 'NGA',
        'Asia Pacific Regional': 'USA'
      };
      
      const iso3 = countryIso3Map[pkg.country] || 'USA';

      // Invoke Supabase Edge Function to buy eSIM from Sotel
      const { data, error } = await supabase.functions.invoke('esim-gateway', {
        body: { 
          action: 'buy', 
          iso3: iso3,
          dataGb: pkg.dataGb
        }
      });

      if (error || !data || !data.status) {
        throw new Error(error ? error.message : (data ? data.error : 'Failed to provision eSIM'));
      }

      const sim = data.data; // contains iccid, activationCode, smdp
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent('LPA:1$' + sim.smdp + '$' + sim.activationCode)}`;

      const newEsim = {
        id: `esim-${sim.id || Math.floor(100000 + Math.random() * 900000)}`,
        country: pkg.country,
        planName: `${pkg.isUnlimited ? 'Unlimited Data' : pkg.dataGb + ' GB'} - ${pkg.durationDays} Days`,
        iccid: sim.iccid,
        smdppa: sim.smdp,
        activationCode: sim.activationCode,
        qrCodeUrl: qrUrl,
        totalDataGb: pkg.dataGb,
        usedDataGb: 0,
        expiryDate: new Date(Date.now() + 3600000 * 24 * pkg.durationDays).toLocaleDateString(),
        status: 'ACTIVE'
      };

      setActiveEsims(prev => [newEsim, ...prev]);
      return { success: true, esim: newEsim };

    } catch (e) {
      console.error("Termii eSIM Buy Error:", e);
      
      // Auto-refund since buy failed
      const ref = `ref-esim-fail-${Math.floor(100000 + Math.random() * 900000)}`;
      await supabase.rpc('process_deposit', {
        p_tx_id: ref,
        p_user_id: user.id,
        p_amount: price,
        p_method: `eSIM Setup Failed Refund (${pkg.country})`
      });

      return { success: false, msg: customizeGatewayError(e.message, 'eSIM Provisioner') };
    }
  };

  const submitSmmOrder = async (serviceId, targetUrl, quantity) => {
    const service = smmServices.find(s => s.id === serviceId);
    if (!service) return { success: false, msg: 'SMM Service not found' };

    const qty = Number(quantity);
    const minLimit = service.min || 100;
    const maxLimit = service.max || 100000;
    if (qty < minLimit) return { success: false, msg: `Minimum order quantity is ${minLimit}` };
    if (qty > maxLimit) return { success: false, msg: `Maximum order quantity is ${maxLimit}` };

    const costNgn = Math.round(service.pricePerThousandNgn * (qty / 1000));
    const purchaseRes = await executePurchase(costNgn, 'Purchase', `SMM Order (${service.platform} ${qty} Units)`);
    if (!purchaseRes.success) {
      return purchaseRes;
    }

    if (service.isSimulated || serviceId.endsWith('-sim')) {
      const smmOrderId = Math.floor(100000 + Math.random() * 900000);
      const newOrder = {
        id: `smm-${smmOrderId}`,
        owletOrderId: smmOrderId,
        platform: service.platform,
        serviceName: service.name,
        targetUrl,
        quantity: qty,
        costNgn,
        date: new Date().toLocaleString(),
        status: 'In Progress'
      };

      setSmmOrders(prev => [newOrder, ...prev]);

      // Automatically complete simulated order in 20 seconds
      setTimeout(() => {
        setSmmOrders(current =>
          current.map(o => o.id === `smm-${smmOrderId}` ? { ...o, status: 'Completed' } : o)
        );
      }, 20000);

      return { success: true, order: newOrder };
    }

    try {
      const { data, error } = await supabase.functions.invoke('smm-gateway', {
        body: {
          action: 'add',
          service: service.apiServiceId || SMM_SERVICE_MAPPING[service.id]?.apiServiceId,
          link: targetUrl,
          quantity: qty
        }
      });

      if (error || !data || !data.status) {
        const ref = `ref-smm-${Math.floor(100000 + Math.random() * 900000)}`;
        await supabase.rpc('process_deposit', {
          p_tx_id: ref,
          p_user_id: user.id,
          p_amount: costNgn,
          p_method: `SMM Order Failed Refund`
        });
        return { success: false, msg: customizeGatewayError(error?.message || data?.error || 'SMM Gateway Error', 'SMM Panel') };
      }

      const smmOrderId = data.data.order;
      
      const newOrder = {
        id: `smm-${smmOrderId}`,
        owletOrderId: smmOrderId,
        platform: service.platform,
        serviceName: service.name,
        targetUrl,
        quantity: qty,
        costNgn,
        date: new Date().toLocaleString(),
        status: 'In Progress'
      };

      setSmmOrders(prev => [newOrder, ...prev]);
      return { success: true, order: newOrder };

    } catch (err) {
      const ref = `ref-smm-${Math.floor(100000 + Math.random() * 900000)}`;
      await supabase.rpc('process_deposit', {
        p_tx_id: ref,
        p_user_id: user.id,
        p_amount: costNgn,
        p_method: `SMM Order Failed Refund`
      });
      return { success: false, msg: customizeGatewayError(err.message || 'SMM Order Execution Failed', 'SMM Panel') };
    }
  };


  // Real-time Admin SMS Simulation
  const simulateSmsDelivery = (phoneNumber, smsText) => {
    // 1. Search in Active OTPs
    const matchingOtp = activeOtps.find(o => o.phoneNumber === phoneNumber && o.status === 'PENDING');
    
    if (matchingOtp) {
      // Extract numeric OTP if found (usually 4-8 digits)
      const matches = smsText.match(/\b\d{4,8}\b/);
      const extractedCode = matches ? matches[0] : 'OTP-Code';

      setActiveOtps(current => 
        current.map(o => o.id === matchingOtp.id ? { 
          ...o, 
          status: 'COMPLETED', 
          otpCode: extractedCode, 
          smsText: smsText 
        } : o)
      );
      return { success: true, msg: 'SMS dispatched to verification session successfully.' };
    }

    // 2. Search in Rented Numbers
    const matchingRental = rentedNumbers.find(r => r.phoneNumber === phoneNumber && r.status === 'ACTIVE');
    if (matchingRental) {
      const newMsg = {
        id: `msg-${Date.now()}`,
        text: smsText,
        timestamp: new Date().toLocaleTimeString()
      };

      setRentedNumbers(current => 
        current.map(r => r.id === matchingRental.id ? { 
          ...r, 
          messages: [newMsg, ...r.messages] 
        } : r)
      );
      return { success: true, msg: 'SMS dispatched to rented inbox successfully.' };
    }

    return { success: false, msg: 'Number not active or session expired.' };
  };

  const updatePrices = (type, id, val) => {
    const overrides = JSON.parse(localStorage.getItem('zp_price_overrides') || '{}');
    overrides[id] = Number(val);
    localStorage.setItem('zp_price_overrides', JSON.stringify(overrides));
    setTriggerRecalc(prev => prev + 1);
  };

  const setManualWallet = (amount) => {
    setWalletBalance(Number(amount));
  };

  const fetchSmsPoolRentals = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('smspool-gateway', {
        body: { action: 'retrieve_all', type: 1 }
      });
      if (!error && data?.status && data?.data?.success !== 0) {
        setSmsPoolRentals(data.data.data || []);
      } else {
        console.error("Failed to fetch SMS Pool rentals", data);
      }
    } catch (e) {
      console.error("fetchSmsPoolRentals Error:", e);
    }
  };

  const fetchSmsPoolShortTermData = async () => {
    try {
      const getFlagEmoji = (countryCode) => {
        if (!countryCode) return '🏳️';
        const codePoints = countryCode
          .toUpperCase()
          .split('')
          .map(char => 127397 + char.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
      };

      // Fetch Countries
      const cRes = await supabase.functions.invoke('smspool-gateway', { body: { action: 'get_countries' } });
      if (!cRes.error && cRes.data?.status) {
        const countries = cRes.data.data || [];
        const countriesWithFlags = countries.map(c => ({
          ...c,
          flag: getFlagEmoji(c.short_name)
        }));
        setSmsPoolShortTermCountries(countriesWithFlags);
      }
      // Fetch Services
      const sRes = await supabase.functions.invoke('smspool-gateway', { body: { action: 'get_services' } });
      if (!sRes.error && sRes.data?.status) {
        const services = sRes.data.data || [];
        setSmsPoolShortTermServices(services);
      }
    } catch (e) {
      console.error("fetchSmsPoolShortTermData Error:", e);
    }
  };

  const fetchTextVerifiedServices = async () => {
    try {
      const res = await supabase.functions.invoke('textverified-gateway', { body: { action: 'get_services' } });
      if (!res.error && res.data?.status) {
        setTextVerifiedServices(res.data.data || []);
      }
    } catch (e) {
      console.error("fetchTextVerifiedServices Error:", e);
    }
  };

  const fetchHeroSmsCountries = async () => {
    try {
      const COUNTRY_NAME_TO_ISO = {
        'ukraine': 'ua', 'kazakhstan': 'kz', 'china': 'cn', 'philippines': 'ph',
        'myanmar': 'mm', 'indonesia': 'id', 'malaysia': 'my', 'kenya': 'ke',
        'vietnam': 'vn', 'kyrgyzstan': 'kg', 'usa': 'us', 'united states': 'us',
        'united kingdom': 'gb', 'england': 'gb', 'russia': 'ru', 'nigeria': 'ng',
        'canada': 'ca', 'south africa': 'za', 'germany': 'de', 'france': 'fr',
        'india': 'in', 'brazil': 'br', 'poland': 'pl', 'egypt': 'eg',
        'morocco': 'ma', 'turkey': 'tr', 'colombia': 'co', 'mexico': 'mx',
        'argentina': 'ar', 'romania': 'ro', 'pakistan': 'pk', 'bangladesh': 'bd',
        'thailand': 'th', 'uzbekistan': 'uz', 'tajikistan': 'tj', 'turkmenistan': 'tm',
        'azerbaijan': 'az', 'armenia': 'am', 'georgia': 'ge', 'belarus': 'by',
        'moldova': 'md', 'latvia': 'lv', 'lithuania': 'lt', 'estonia': 'ee',
        'spain': 'es', 'italy': 'it', 'netherlands': 'nl', 'belgium': 'be',
        'switzerland': 'ch', 'sweden': 'se', 'norway': 'no', 'finland': 'fi',
        'denmark': 'dk', 'austria': 'at', 'portugal': 'pt', 'greece': 'gr',
        'ireland': 'ie', 'czech republic': 'cz', 'slovakia': 'sk', 'hungary': 'hu',
        'bulgaria': 'bg', 'croatia': 'hr', 'slovenia': 'si', 'serbia': 'rs',
        'japan': 'jp', 'south korea': 'kr', 'taiwan': 'tw', 'hong kong': 'hk',
        'singapore': 'sg', 'australia': 'au', 'new zealand': 'nz', 'israel': 'il',
        'saudi arabia': 'sa', 'uae': 'ae', 'united arab emirates': 'ae',
        'ghana': 'gh', 'senegal': 'sn', 'uganda': 'ug', 'tanzania': 'tz',
        'cameroon': 'cm', 'ivory coast': 'ci', 'cote d\'ivoire': 'ci',
        'chile': 'cl', 'peru': 'pe', 'venezuela': 've', 'ecuador': 'ec',
        'bolivia': 'bo', 'paraguay': 'py', 'uruguay': 'uy', 'nepal': 'np',
        'sri lanka': 'lk', 'algeria': 'dz', 'tunisia': 'tn', 'jordan': 'jo',
        'iraq': 'iq', 'yemen': 'ye', 'oman': 'om', 'qatar': 'qa', 'kuwait': 'kw',
        'bahrain': 'bh', 'lebanon': 'lb', 'afghanistan': 'af', 'angola': 'ao',
        'benin': 'bj', 'botswana': 'bw', 'burkina faso': 'bf', 'burundi': 'bi',
        'cambodia': 'kh', 'cape verde': 'cv', 'chad': 'td', 'comoros': 'km',
        'congo': 'cg', 'costa rica': 'cr', 'cyprus': 'cy', 'djibouti': 'dj',
        'dominican republic': 'do', 'east timor': 'tl', 'el salvador': 'sv',
        'equatorial guinea': 'gq', 'ethiopia': 'et', 'gabon': 'ga', 'gambia': 'gm',
        'guatemala': 'gt', 'guinea': 'gn', 'guinea-bissau': 'gw', 'guyana': 'gy',
        'haiti': 'ht', 'honduras': 'hn', 'laos': 'la', 'lesotho': 'ls',
        'liberia': 'lr', 'luxembourg': 'lu', 'macau': 'mo', 'madagascar': 'mg',
        'malawi': 'mw', 'maldives': 'mv', 'mauritania': 'mr', 'mauritius': 'mu',
        'montenegro': 'me', 'mozambique': 'mz', 'namibia': 'na', 'nicaragua': 'ni',
        'macedonia': 'mk', 'panama': 'pa', 'papua new guinea': 'pg', 'puerto rico': 'pr',
        'rwanda': 'rw', 'seychelles': 'sc', 'sierra leone': 'sl', 'suriname': 'sr',
        'swaziland': 'sz', 'togo': 'tg', 'zambia': 'zm'
      };

      const res = await supabase.functions.invoke('herosms-gateway', { body: { action: 'get_countries' } });
      if (!res.error && res.data?.status && res.data.data) {
        const rawCountries = res.data.data;
        const mapped = Object.entries(rawCountries).map(([id, details]) => {
          const nameLower = (details.eng || '').toLowerCase().trim();
          const iso = COUNTRY_NAME_TO_ISO[nameLower] || '';
          const flag = ISO_FLAGS[iso] || '🌐';
          return {
            id: Number(id),
            ID: Number(id),
            name: details.eng,
            flag
          };
        });
        setHeroSmsCountries(mapped);
      }
    } catch (e) {
      console.error("fetchHeroSmsCountries Error:", e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSmsPoolRentals();
      fetchSmsPoolShortTermData();
      fetchTextVerifiedServices();
      fetchHeroSmsCountries();
    }
  }, [user]);

  const refundOtpSession = async (otp) => {
    if (!user || otp.refunded) return;
    otp.refunded = true;
    const ref = `ref-exp-${Math.floor(100000 + Math.random() * 900000)}`;
    try {
      const { error } = await supabase.rpc('process_deposit', {
        p_tx_id: ref,
        p_user_id: user.id,
        p_amount: otp.priceNgn,
        p_method: `OTP Refund (${otp.service} - ${otp.phoneNumber})`
      });
      if (!error) {
        setWalletBalance(prev => prev + otp.priceNgn);
        console.log(`Successfully refunded OTP session: ${otp.id}`);
      }
    } catch (e) {
      console.error("Failed to execute refund RPC:", e);
    }
  };

  // Handle active OTP countdown expirations and poll APIs for SMS
  useEffect(() => {
    if (!user) return;
    
    const timer = setInterval(() => {
      // 1. Process expirations for all servers
      setActiveOtps(current => current.map(otp => {
        if (otp.status === 'PENDING' && Date.now() > otp.expiresAt) {
          refundOtpSession(otp);
          updateOtpOrderStatusInDB(otp.id, 'EXPIRED');
          return { ...otp, status: 'EXPIRED' };
        }
        return otp;
      }));

      // 2. Poll Server 1 (5SIM) active orders
      const pendingFiveSim = activeOtps.filter(o => o.status === 'PENDING' && o.server === 'server1' && o.fivesimOrderId);
      pendingFiveSim.forEach(async (otp) => {
        if (Date.now() < otp.expiresAt) {
          try {
            const { data, error } = await supabase.functions.invoke('sms-gateway', {
              body: { action: 'check', order_id: otp.fivesimOrderId }
            });
            if (!error && data?.status && data?.data) {
              const smsData = data.data;
              if (smsData.sms && smsData.sms.length > 0) {
                const latestSms = smsData.sms[0];
                updateOtpOrderStatusInDB(otp.id, 'COMPLETED', latestSms.code, latestSms.text);
                setActiveOtps(current => current.map(o => o.id === otp.id ? { 
                  ...o, 
                  status: 'COMPLETED', 
                  smsText: latestSms.text, 
                  otpCode: latestSms.code 
                } : o));
              } else if (smsData.status === 'CANCELED' || smsData.status === 'TIMEOUT' || smsData.status === 'BANNED') {
                refundOtpSession(otp);
                updateOtpOrderStatusInDB(otp.id, 'EXPIRED');
                setActiveOtps(current => current.map(o => o.id === otp.id ? { ...o, status: 'EXPIRED' } : o));
              }
            }
          } catch (err) {
            console.error("Error polling 5sim order:", otp.fivesimOrderId, err);
          }
        }
      });

      // 3. Poll Server 2 (SMSPool) active orders
      const pendingSmsPool = activeOtps.filter(o => o.status === 'PENDING' && o.server === 'server2' && o.orderId);
      pendingSmsPool.forEach(async (otp) => {
        if (Date.now() < otp.expiresAt) {
          try {
            const { data, error } = await supabase.functions.invoke('smspool-gateway', {
              body: { action: 'check_sms', orderid: otp.orderId }
            });
            if (!error && data?.status && data?.data) {
              const resData = data.data;
              if (resData.status === 3 && resData.sms) { // Status 3 means SMS received in SMSPool
                updateOtpOrderStatusInDB(otp.id, 'COMPLETED', resData.sms, resData.full_sms || resData.sms);
                setActiveOtps(current => current.map(o => o.id === otp.id ? { 
                  ...o, 
                  status: 'COMPLETED', 
                  smsText: resData.full_sms || resData.sms, 
                  otpCode: resData.sms 
                } : o));
              } else if (resData.status === 6) { // Order Cancelled/Refunded by SMSPool
                 refundOtpSession(otp);
                 updateOtpOrderStatusInDB(otp.id, 'EXPIRED');
                 setActiveOtps(current => current.map(o => o.id === otp.id ? { ...o, status: 'EXPIRED' } : o));
              }
            }
          } catch (err) {
            console.error("Error polling SMSPool order:", otp.orderId, err);
          }
        }
      });

      // 4. Poll Server 3 (Textverified) active orders
      const pendingTextverified = activeOtps.filter(o => o.status === 'PENDING' && o.server === 'server3' && o.orderId);
      pendingTextverified.forEach(async (otp) => {
        if (Date.now() < otp.expiresAt) {
          try {
            const { data, error } = await supabase.functions.invoke('textverified-gateway', {
              body: { action: 'check', id: otp.orderId }
            });
            if (!error && data?.status && data?.data) {
              const resData = data.data;
              if (resData.status === 'COMPLETED' && resData.otpCode) {
                updateOtpOrderStatusInDB(otp.id, 'COMPLETED', resData.otpCode, resData.smsText);
                setActiveOtps(current => current.map(o => o.id === otp.id ? { 
                  ...o, 
                  status: 'COMPLETED', 
                  smsText: resData.smsText, 
                  otpCode: resData.otpCode 
                } : o));
              } else if (resData.status === 'FAILED') {
                refundOtpSession(otp);
                updateOtpOrderStatusInDB(otp.id, 'EXPIRED');
                setActiveOtps(current => current.map(o => o.id === otp.id ? { ...o, status: 'EXPIRED' } : o));
              }
            }
          } catch (err) {
            console.error("Error polling Textverified order:", otp.orderId, err);
          }
        }
      });

      // 5. Poll Server 4 (HeroSMS) active orders
      const pendingHeroSms = activeOtps.filter(o => o.status === 'PENDING' && o.server === 'server4' && o.orderId);
      pendingHeroSms.forEach(async (otp) => {
        if (Date.now() < otp.expiresAt) {
          try {
            const { data, error } = await supabase.functions.invoke('herosms-gateway', {
              body: { action: 'check', id: otp.orderId }
            });
            if (!error && data?.status && data?.data) {
              const resData = data.data;
              if (resData.status === 'COMPLETED' && resData.otpCode) {
                updateOtpOrderStatusInDB(otp.id, 'COMPLETED', resData.otpCode, resData.smsText);
                setActiveOtps(current => current.map(o => o.id === otp.id ? { 
                  ...o, 
                  status: 'COMPLETED', 
                  smsText: resData.smsText, 
                  otpCode: resData.otpCode 
                } : o));
              } else if (resData.status === 'FAILED') {
                refundOtpSession(otp);
                updateOtpOrderStatusInDB(otp.id, 'EXPIRED');
                setActiveOtps(current => current.map(o => o.id === otp.id ? { ...o, status: 'EXPIRED' } : o));
              }
            }
          } catch (err) {
            console.error("Error polling HeroSMS order:", otp.orderId, err);
          }
        }
      });

      // Poll SMSPool rentals for messages
      const activeSmsPoolRentals = rentedNumbers.filter(r => r.status === 'ACTIVE' && r.server === 'server2' && r.rental_code);
      activeSmsPoolRentals.forEach(async (rental) => {
        try {
          const { data, error } = await supabase.functions.invoke('smspool-gateway', {
            body: { action: 'retrieve_messages', rental_code: rental.rental_code }
          });
          if (!error && data?.status && data?.data) {
            const msgs = Array.isArray(data.data) ? data.data : (data.data.messages || []);
            
            if (msgs.length > rental.messages.length) {
              const formattedMsgs = msgs.map((m, i) => ({
                id: `msg-${rental.rental_code}-${i}`,
                text: typeof m === 'string' ? m : (m.message || m.sms || JSON.stringify(m)),
                timestamp: m.date || new Date().toLocaleTimeString()
              }));
              
              setRentedNumbers(current => 
                current.map(r => r.id === rental.id ? { ...r, messages: formattedMsgs } : r)
              );
            }
          }
        } catch (e) {
          console.error("Error polling SMSPool messages:", e);
        }
      });
    }, 15000); 

    return () => clearInterval(timer);
  }, [activeOtps, user, rentedNumbers]);

  // Simulate data usage progression for active eSIMs to show dynamic telemetry
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveEsims(current => {
        let changed = false;
        const next = current.map(esim => {
          if (esim.status === 'ACTIVE' && esim.usedDataGb < esim.totalDataGb) {
            changed = true;
            const inc = esim.totalDataGb === 999 ? 0.05 : esim.totalDataGb * 0.01; // slow increase
            const nextUsed = Math.min(esim.totalDataGb, Number((esim.usedDataGb + inc).toFixed(2)));
            return { ...esim, usedDataGb: nextUsed };
          }
          return esim;
        });
        return changed ? next : current;
      });
    }, 12000);

  }, [activeEsims]);

  // Handle SMM Campaign status polling
  useEffect(() => {
    if (!user || smmOrders.length === 0) return;

    const timer = setInterval(() => {
      const activeSmm = smmOrders.filter(o => o.status === 'In Progress' && o.owletOrderId);

      activeSmm.forEach(async (order) => {
        try {
          const { data, error } = await supabase.functions.invoke('smm-gateway', {
            body: { action: 'status', order: order.owletOrderId }
          });

          if (!error && data && data.status) {
            const apiStatus = data.data.status; // Pending, In progress, Completed, Partial, Canceled

            if (apiStatus === 'Completed') {
              setSmmOrders(current =>
                current.map(o => o.id === order.id ? { ...o, status: 'Completed' } : o)
              );
            } else if (apiStatus === 'Canceled') {
              const ref = `ref-smm-cancel-${Math.floor(100000 + Math.random() * 900000)}`;
              await supabase.rpc('process_deposit', {
                p_tx_id: ref,
                p_user_id: user.id,
                p_amount: order.costNgn,
                p_method: `SMM Campaign Canceled Refund`
              });

              setSmmOrders(current =>
                current.map(o => o.id === order.id ? { ...o, status: 'Canceled' } : o)
              );
            } else if (apiStatus === 'Partial') {
              const remains = Number(data.data.remains || 0);
              const quantity = Number(order.quantity);
              if (remains > 0 && quantity > 0) {
                const ratio = remains / quantity;
                const refundAmount = Math.round(order.costNgn * ratio);
                
                if (refundAmount > 0) {
                  const ref = `ref-smm-part-${Math.floor(100000 + Math.random() * 900000)}`;
                  await supabase.rpc('process_deposit', {
                    p_tx_id: ref,
                    p_user_id: user.id,
                    p_amount: refundAmount,
                    p_method: `SMM Campaign Partial Refund (${remains} units)`
                  });
                }
              }

              setSmmOrders(current =>
                current.map(o => o.id === order.id ? { ...o, status: 'Partial' } : o)
              );
            }
          }
        } catch (err) {
          console.error("Error polling SMM order status:", order.owletOrderId, err);
        }
      });
    }, 12000);

    return () => clearInterval(timer);
  }, [smmOrders, user]);

  const updateProfile = async (full_name, phone) => {
    if (!user) return { success: false, msg: 'User session not found' };
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name, phone, updated_at: new Date() })
        .eq('id', user.id);
      if (error) throw error;
      setProfile(prev => ({ ...prev, full_name, phone }));
      return { success: true };
    } catch (err) {
      console.error("Error updating profile:", err);
      return { success: false, msg: err.message };
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error("Error updating password:", err);
      return { success: false, msg: err.message };
    }
  };

  const regenerateApiKey = async () => {
    if (!user) return { success: false, msg: 'User session not found' };
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 24; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newKey = `dz_live_${token}`;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ api_key: newKey, updated_at: new Date() })
        .eq('id', user.id);
      if (error) throw error;
      setProfile(prev => ({ ...prev, api_key: newKey }));
      return { success: true, api_key: newKey };
    } catch (err) {
      console.error("Error regenerating API key:", err);
      return { success: false, msg: err.message };
    }
  };


  const adminFetchAllTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('id, amount, type, method, status, created_at, user_id, profiles(full_name, phone)')
        .order('created_at', { ascending: false });
      if (error) throw error;

      // If RLS filtered the select query, we might only see own transactions
      const onlyHasOwnTxs = data.every(tx => tx.user_id === user?.id);
      if (data && (data.length === 0 || onlyHasOwnTxs)) {
        console.warn("Direct transactions query was filtered by RLS. Attempting Edge Function bypass...");
        const fallback = await supabase.functions.invoke('sms-gateway', {
          body: { action: 'admin-get-transactions' }
        });
        if (!fallback.error && fallback.data?.status && fallback.data?.data) {
          return { success: true, data: fallback.data.data };
        }
      }
      
      const formatted = data.map(tx => ({
        id: tx.id,
        user_id: tx.user_id,
        amountNgn: Number(tx.amount),
        amountUsd: Number(tx.amount) / 750,
        type: tx.type,
        method: tx.method,
        status: tx.status,
        date: new Date(tx.created_at).toLocaleString(),
        user_name: tx.profiles?.full_name || 'N/A',
        user_phone: tx.profiles?.phone || 'N/A'
      }));
      return { success: true, data: formatted };
    } catch (e) {
      console.warn("Direct transactions fetch failed, attempting Edge Function fallback...", e.message);
      try {
        const { data, error } = await supabase.functions.invoke('sms-gateway', {
          body: { action: 'admin-get-transactions' }
        });
        if (error || !data || !data.status) {
          throw new Error(error ? error.message : (data ? data.error : 'Failed to fetch transactions'));
        }
        return { success: true, data: data.data };
      } catch (err) {
        return { success: false, msg: err.message };
      }
    }
  };

  const adminFetchAllProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, email, phone, wallet_balance, is_admin, updated_at, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;

      // If RLS filtered the select query, we might only see own profile row
      if (data && data.length <= 1) {
        console.warn("Direct profiles query was filtered by RLS. Attempting Edge Function bypass...");
        const fallback = await supabase.functions.invoke('sms-gateway', {
          body: { action: 'admin-get-profiles' }
        });
        if (!fallback.error && fallback.data?.status && fallback.data?.data) {
          return { success: true, data: fallback.data.data };
        }
      }
      
      return { success: true, data };
    } catch (e) {
      console.warn("Direct profiles fetch failed, attempting Edge Function fallback...", e.message);
      try {
        const { data, error } = await supabase.functions.invoke('sms-gateway', {
          body: { action: 'admin-get-profiles' }
        });
        if (error) throw error;
        return { success: true, data: data.data };
      } catch (err) {
        return { success: false, msg: err.message };
      }
    }
  };

  const adminFetchAllOtpOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('otp_orders')
        .select('id, phone_number, server, service, price_ngn, status, otp_code, sms_text, created_at, user_id, profiles(full_name, phone)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return { success: true, data };
    } catch (e) {
      console.error("Failed to fetch OTP orders directly:", e);
      return { success: false, msg: e.message };
    }
  };

  const adminUpdateSystemConfig = async (id, value) => {
    try {
      const { data, error } = await supabase.functions.invoke('sms-gateway', {
        body: { action: 'admin-update-config', id, value }
      });
      if (error) throw error;
      return { success: true, data: data.data };
    } catch (err) {
      return { success: false, msg: err.message };
    }
  };

  const adminUpdateProfile = async (targetUserId, fields) => {
    try {
      const { data, error } = await supabase.functions.invoke('sms-gateway', {
        body: { action: 'admin-update-profile', targetUserId, ...fields }
      });
      if (error || !data || !data.status) {
        throw new Error(error ? error.message : (data ? data.error : 'Failed to update profile'));
      }
      return { success: true, data: data.data };
    } catch (e) {
      console.error("Admin Update Profile Error:", e);
      return { success: false, msg: e.message };
    }
  };

  const fetchSocialMediaLogs = async () => {
    try {
      let ologProducts = [];
      try {
        const { data, error } = await supabase.functions.invoke('ologstore-gateway', {
          body: { action: 'products' }
        });
        if (!error && data && data.success) {
          const markup = profitMarkup.subs || 30;
          ologProducts = data.products.map(p => {
            const basePriceUsd = p.price / 25400;
            const priceNgn = Math.max(500, Math.round(basePriceUsd * exchangeRate * (1 + markup / 100)));
            const priceUsd = priceNgn / exchangeRate;
            return { ...p, priceNgn, priceUsd, isLocal: false };
          });
        }
      } catch (e) {
        console.warn("Failed to fetch ologstore products:", e);
      }

      // Fetch local custom logs
      let localProducts = [];
      try {
        const { data: localLogs, error: localError } = await supabase
          .from('local_social_logs')
          .select('*, items:local_social_log_items(id, is_sold)');
        if (!localError && localLogs) {
          localProducts = localLogs.map(p => ({
            id: p.id,
            category: p.category,
            name: p.name,
            slug: `local-${p.id}`,
            image: p.image || "https://upload.wikimedia.org/wikipedia/commons/4/44/Question_mark_civ.svg",
            price: Number(p.price),
            priceNgn: Number(p.price),
            priceUsd: Number(p.price) / exchangeRate,
            stock: (p.items || []).filter(item => !item.is_sold).length,
            description: p.description || "",
            isLocal: true
          }));
        }
      } catch (e) {
        console.warn("Failed to fetch local social logs:", e);
      }

      const combined = [...localProducts, ...ologProducts];
      return { success: true, data: combined };
    } catch (e) {
      console.error("Fetch Social Media Logs Error:", e);
      return { success: false, msg: e.message };
    }
  };

  const buySocialMediaLog = async (plan_id, plan_name, quantity, cost) => {
    try {
      // Check if this is a local product (UUID is a string length of 36)
      const isLocal = typeof plan_id === 'string' && plan_id.length > 20;
      if (isLocal) {
        const { data, error } = await supabase.rpc('buy_local_social_log', {
          p_user_id: user.id,
          p_product_id: plan_id,
          p_cost: cost,
          p_plan_name: plan_name
        });
        if (error || !data || !data.success) {
          throw new Error(error ? error.message : (data ? data.error : 'Failed to purchase local log'));
        }

        // Retrieve profile balance update
        const { data: updatedProfile } = await supabase.from('profiles').select('wallet_balance').eq('id', user.id).single();
        if (updatedProfile) {
          setWalletBalance(Number(updatedProfile.wallet_balance));
        }

        const mockOrder = {
          id: data.order_id,
          plan_id,
          plan_name,
          quantity: 1,
          cost,
          status: 'completed',
          account_details: { Credentials: data.credentials },
          ologstore_order_id: `local_order_${Date.now()}`,
          created_at: new Date().toISOString(),
          date: new Date().toLocaleString()
        };
        setSocialMediaOrders(prev => [mockOrder, ...prev]);

        return { success: true, order: mockOrder };
      }

      // OlogStore fallback purchase
      const { data, error } = await supabase.functions.invoke('ologstore-gateway', {
        body: { action: 'buy', payload: { plan_id, plan_name, quantity, cost } }
      });
      if (error || !data || !data.success) {
        throw new Error(error ? error.message : (data ? data.error : 'Failed to purchase log'));
      }
      setWalletBalance(data.newBalance);
      // Add the new order to socialMediaOrders state so it appears in Order History
      if (data.order) {
        setSocialMediaOrders(prev => [{
          id: data.order.id,
          plan_id: data.order.plan_id,
          plan_name: data.order.plan_name,
          quantity: data.order.quantity,
          cost: Number(data.order.cost),
          status: data.order.status,
          account_details: data.order.account_details,
          ologstore_order_id: data.order.ologstore_order_id,
          created_at: data.order.created_at,
          date: new Date(data.order.created_at).toLocaleString()
        }, ...prev]);
      }
      return { success: true, order: data.order };
    } catch (e) {
      console.error("Buy Social Media Log Error:", e);
      return { success: false, msg: customizeGatewayError(e.message, 'Log Server') };
    }
  };

  const checkSocialMediaLogStatus = async (trans_id) => {
    try {
      const { data, error } = await supabase.functions.invoke('ologstore-gateway', {
        body: { action: 'status', payload: { trans_id } }
      });
      if (error || !data || !data.success) {
        throw new Error(error ? error.message : (data ? data.error : 'Failed to check order status'));
      }
      // Update local state
      if (data.order) {
        setSocialMediaOrders(prev => prev.map(o => o.ologstore_order_id === trans_id ? {
          ...o,
          status: data.order.status,
          account_details: data.order.account_details
        } : o));
      }
      return { success: true, order: data.order };
    } catch (e) {
      console.error("Check Social Media Log Status Error:", e);
      return { success: false, msg: e.message };
    }
  };


  const adminFetchLocalSocialLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('local_social_logs')
        .select('*, items:local_social_log_items(id, is_sold)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return { success: true, data };
    } catch (e) {
      console.error("adminFetchLocalSocialLogs Error:", e);
      return { success: false, msg: e.message };
    }
  };

  const adminCreateLocalSocialLog = async (log) => {
    try {
      const { data, error } = await supabase
        .from('local_social_logs')
        .insert(log)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data };
    } catch (e) {
      console.error("adminCreateLocalSocialLog Error:", e);
      return { success: false, msg: e.message };
    }
  };

  const adminDeleteLocalSocialLog = async (id) => {
    try {
      const { error } = await supabase
        .from('local_social_logs')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (e) {
      console.error("adminDeleteLocalSocialLog Error:", e);
      return { success: false, msg: e.message };
    }
  };

  const adminFetchLocalSocialLogItems = async (productId) => {
    try {
      const { data, error } = await supabase
        .from('local_social_log_items')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return { success: true, data };
    } catch (e) {
      console.error("adminFetchLocalSocialLogItems Error:", e);
      return { success: false, msg: e.message };
    }
  };

  const adminCreateLocalSocialLogItems = async (productId, lines) => {
    try {
      const itemsToInsert = lines.map(line => ({
        product_id: productId,
        account_data: line.trim(),
        is_sold: false
      })).filter(item => item.account_data.length > 0);

      if (itemsToInsert.length === 0) {
        throw new Error("No valid credential lines found.");
      }

      const { data, error } = await supabase
        .from('local_social_log_items')
        .insert(itemsToInsert)
        .select();
      if (error) throw error;
      return { success: true, data };
    } catch (e) {
      console.error("adminCreateLocalSocialLogItems Error:", e);
      return { success: false, msg: e.message };
    }
  };

  const adminDeleteLocalSocialLogItem = async (id) => {
    try {
      const { error } = await supabase
        .from('local_social_log_items')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (e) {
      console.error("adminDeleteLocalSocialLogItem Error:", e);
      return { success: false, msg: e.message };
    }
  };

  return (
    <AppContext.Provider value={{
      isAuthLoading,
      isLoggedIn,
      user,
      profile,
      updateProfile,
      updatePassword,
      regenerateApiKey,
      loginUser,
      logoutUser,
      virtualWallet,
      walletBalance,
      currency,
      setCurrency,
      theme,
      toggleTheme,
      isAdmin,
      setIsAdmin,
      dbIsAdmin,
      subscriptions,
      countries,
      otpServices,
      esimPackages,
      smmServices,
      transactions,
      activeOtps,
      rentedNumbers,
      activeEsims,
      smmOrders,
      accountSubscriptions,
      formatCost,
      getPrice,
      toggleCurrency,
      depositWallet,
      buySharedSubscription,
      requestOtpNumber,
      cancelOtp,
      rentNumber,
      buyEsim,
      submitSmmOrder,
      simulateSmsDelivery,
      updatePrices,
      setManualWallet,
      theme,
      toggleTheme,
      virtualWallet,
      generatePocketFiWallet,
      simulatePocketFiDeposit,
      activeSession,
      setActiveSession,
      reuseOtpNumber,
      fetchOtpServicesForCountry,
      smsPoolRentals,
      smsPoolShortTermCountries,
      smsPoolShortTermServices,
      textVerifiedServices,
      fetchTextVerifiedPrice,
      heroSmsCountries,
      profitMarkup,
      updateProfitMarkup,
      exchangeRate,
      setExchangeRate,
      adminFetchAllTransactions,
      adminFetchAllProfiles,
      adminUpdateSystemConfig,
      adminUpdateProfile,
      adminFetchAllOtpOrders,
      fetchSocialMediaLogs,
      buySocialMediaLog,
      checkSocialMediaLogStatus,
      socialMediaOrders,
      adminFetchLocalSocialLogs,
      adminCreateLocalSocialLog,
      adminDeleteLocalSocialLog,
      adminFetchLocalSocialLogItems,
      adminCreateLocalSocialLogItems,
      adminDeleteLocalSocialLogItem
    }}>
      {children}
    </AppContext.Provider>
  );
};
