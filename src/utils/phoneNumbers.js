// Calling codes for the countries our SMS providers allocate numbers in.
const COUNTRY_DIAL_CODES = [
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
].sort((a, b) => b.code.length - a.code.length);

const digitsOf = (value) => String(value ?? '').replace(/\D/g, '');

export const getCountryFromNumber = (phone) => {
  const cleanPhone = digitsOf(phone);
  if (!cleanPhone) return null;
  return COUNTRY_DIAL_CODES.find(p => cleanPhone.startsWith(p.code)) || null;
};

// SMSPool appends qualifiers such as "United States (Virtual)".
const NANP_COUNTRIES = ['united states', 'usa', 'canada', 'anguilla', 'puerto rico', 'jamaica', 'bahamas', 'barbados', 'trinidad and tobago', 'dominican republic'];
const COUNTRY_ALIASES = {
  us: 'United States',
  usa: 'United States',
  gb: 'United Kingdom',
  uk: 'United Kingdom',
  ng: 'Nigeria',
};
export const dialCodeForCountry = (countryName) => {
  const rawName = String(countryName || '').replace(/\(.*?\)/g, '').trim().toLowerCase();
  const name = String(COUNTRY_ALIASES[rawName] || rawName).toLowerCase();
  if (!name) return null;
  if (NANP_COUNTRIES.includes(name)) return '1';
  return COUNTRY_DIAL_CODES.find(p => p.name.toLowerCase() === name)?.code || null;
};

// Builds "+<country code><number>" from a provider's local number. Numbers
// that already start with "+" are trusted as international.
export const withCountryCode = (number, dialCode) => {
  const raw = String(number ?? '').trim();
  if (raw.startsWith('+')) return '+' + digitsOf(raw);
  const local = digitsOf(raw).replace(/^0+/, '');
  const code = digitsOf(dialCode) || dialCodeForCountry(dialCode) || '';
  if (!code) return '+' + local;
  // Some provider endpoints return an international number without the plus.
  // Do not turn a US 1XXXXXXXXXX response into +11XXXXXXXXXX.
  if (local.startsWith(code) && local.length >= code.length + 10) return '+' + local;
  return '+' + code + local;
};

// Textverified only issues US numbers, usually as 10 digits without the "1".
export const toUsNumber = (number) => {
  const d = digitsOf(number);
  return d.length === 10 ? '+1' + d : '+' + d;
};
