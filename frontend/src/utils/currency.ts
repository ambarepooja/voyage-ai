export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  rateFromINR: number; // 1 INR = X units of foreign currency (live market multiplier)
  flag: string;
  country: string;
}

export const DEFAULT_INR: CurrencyInfo = {
  code: 'INR',
  symbol: '₹',
  name: 'Indian Rupee',
  rateFromINR: 1.0,
  flag: '🇮🇳',
  country: 'India'
};

// Calibrated baseline market rates (1 INR = X foreign currency units)
export const COUNTRY_CURRENCY_MAP: Record<string, CurrencyInfo> = {
  // --- North Africa & Middle East ---
  morocco: { code: 'MAD', symbol: 'DH', name: 'Moroccan Dirham', rateFromINR: 0.0978, flag: '🇲🇦', country: 'Morocco' },
  casablanca: { code: 'MAD', symbol: 'DH', name: 'Moroccan Dirham', rateFromINR: 0.0978, flag: '🇲🇦', country: 'Morocco' },
  marrakech: { code: 'MAD', symbol: 'DH', name: 'Moroccan Dirham', rateFromINR: 0.0978, flag: '🇲🇦', country: 'Morocco' },
  rabat: { code: 'MAD', symbol: 'DH', name: 'Moroccan Dirham', rateFromINR: 0.0978, flag: '🇲🇦', country: 'Morocco' },
  fes: { code: 'MAD', symbol: 'DH', name: 'Moroccan Dirham', rateFromINR: 0.0978, flag: '🇲🇦', country: 'Morocco' },
  tangier: { code: 'MAD', symbol: 'DH', name: 'Moroccan Dirham', rateFromINR: 0.0978, flag: '🇲🇦', country: 'Morocco' },
  agadir: { code: 'MAD', symbol: 'DH', name: 'Moroccan Dirham', rateFromINR: 0.0978, flag: '🇲🇦', country: 'Morocco' },
  chefchaouen: { code: 'MAD', symbol: 'DH', name: 'Moroccan Dirham', rateFromINR: 0.0978, flag: '🇲🇦', country: 'Morocco' },
  essaouira: { code: 'MAD', symbol: 'DH', name: 'Moroccan Dirham', rateFromINR: 0.0978, flag: '🇲🇦', country: 'Morocco' },

  egypt: { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', rateFromINR: 0.568, flag: '🇪🇬', country: 'Egypt' },
  cairo: { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', rateFromINR: 0.568, flag: '🇪🇬', country: 'Egypt' },
  alexandria: { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', rateFromINR: 0.568, flag: '🇪🇬', country: 'Egypt' },
  giza: { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', rateFromINR: 0.568, flag: '🇪🇬', country: 'Egypt' },
  luxor: { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', rateFromINR: 0.568, flag: '🇪🇬', country: 'Egypt' },
  sharm: { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', rateFromINR: 0.568, flag: '🇪🇬', country: 'Egypt' },
  hurghada: { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', rateFromINR: 0.568, flag: '🇪🇬', country: 'Egypt' },

  turkey: { code: 'TRY', symbol: '₺', name: 'Turkish Lira', rateFromINR: 0.420, flag: '🇹🇷', country: 'Turkey' },
  istanbul: { code: 'TRY', symbol: '₺', name: 'Turkish Lira', rateFromINR: 0.420, flag: '🇹🇷', country: 'Turkey' },
  cappadocia: { code: 'TRY', symbol: '₺', name: 'Turkish Lira', rateFromINR: 0.420, flag: '🇹🇷', country: 'Turkey' },
  antalya: { code: 'TRY', symbol: '₺', name: 'Turkish Lira', rateFromINR: 0.420, flag: '🇹🇷', country: 'Turkey' },
  ankara: { code: 'TRY', symbol: '₺', name: 'Turkish Lira', rateFromINR: 0.420, flag: '🇹🇷', country: 'Turkey' },
  izmir: { code: 'TRY', symbol: '₺', name: 'Turkish Lira', rateFromINR: 0.420, flag: '🇹🇷', country: 'Turkey' },

  uae: { code: 'AED', symbol: 'AED', name: 'UAE Dirham', rateFromINR: 0.03856, flag: '🇦🇪', country: 'UAE' },
  dubai: { code: 'AED', symbol: 'AED', name: 'UAE Dirham', rateFromINR: 0.03856, flag: '🇦🇪', country: 'UAE' },
  'abu dhabi': { code: 'AED', symbol: 'AED', name: 'UAE Dirham', rateFromINR: 0.03856, flag: '🇦🇪', country: 'UAE' },
  sharjah: { code: 'AED', symbol: 'AED', name: 'UAE Dirham', rateFromINR: 0.03856, flag: '🇦🇪', country: 'UAE' },
  qatar: { code: 'QAR', symbol: 'QR', name: 'Qatari Riyal', rateFromINR: 0.0421, flag: '🇶🇦', country: 'Qatar' },
  doha: { code: 'QAR', symbol: 'QR', name: 'Qatari Riyal', rateFromINR: 0.0421, flag: '🇶🇦', country: 'Qatar' },
  saudi: { code: 'SAR', symbol: 'SR', name: 'Saudi Riyal', rateFromINR: 0.0394, flag: '🇸🇦', country: 'Saudi Arabia' },
  riyadh: { code: 'SAR', symbol: 'SR', name: 'Saudi Riyal', rateFromINR: 0.0394, flag: '🇸🇦', country: 'Saudi Arabia' },
  jeddah: { code: 'SAR', symbol: 'SR', name: 'Saudi Riyal', rateFromINR: 0.0394, flag: '🇸🇦', country: 'Saudi Arabia' },
  oman: { code: 'OMR', symbol: 'OMR', name: 'Omani Rial', rateFromINR: 0.00445, flag: '🇴🇲', country: 'Oman' },
  muscat: { code: 'OMR', symbol: 'OMR', name: 'Omani Rial', rateFromINR: 0.00445, flag: '🇴🇲', country: 'Oman' },
  kuwait: { code: 'KWD', symbol: 'KD', name: 'Kuwaiti Dinar', rateFromINR: 0.00355, flag: '🇰🇼', country: 'Kuwait' },
  bahrain: { code: 'BHD', symbol: 'BD', name: 'Bahraini Dinar', rateFromINR: 0.00436, flag: '🇧🇭', country: 'Bahrain' },
  jordan: { code: 'JOD', symbol: 'JD', name: 'Jordanian Dinar', rateFromINR: 0.0082, flag: '🇯🇴', country: 'Jordan' },
  petra: { code: 'JOD', symbol: 'JD', name: 'Jordanian Dinar', rateFromINR: 0.0082, flag: '🇯🇴', country: 'Jordan' },

  // --- East & Southeast Asia ---
  japan: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateFromINR: 1.6579, flag: '🇯🇵', country: 'Japan' },
  tokyo: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateFromINR: 1.6579, flag: '🇯🇵', country: 'Japan' },
  kyoto: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateFromINR: 1.6579, flag: '🇯🇵', country: 'Japan' },
  osaka: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateFromINR: 1.6579, flag: '🇯🇵', country: 'Japan' },
  korea: { code: 'KRW', symbol: '₩', name: 'South Korean Won', rateFromINR: 16.39, flag: '🇰🇷', country: 'South Korea' },
  seoul: { code: 'KRW', symbol: '₩', name: 'South Korean Won', rateFromINR: 16.39, flag: '🇰🇷', country: 'South Korea' },
  busan: { code: 'KRW', symbol: '₩', name: 'South Korean Won', rateFromINR: 16.39, flag: '🇰🇷', country: 'South Korea' },
  singapore: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rateFromINR: 0.0153, flag: '🇸🇬', country: 'Singapore' },
  thailand: { code: 'THB', symbol: '฿', name: 'Thai Baht', rateFromINR: 0.408, flag: '🇹🇭', country: 'Thailand' },
  bangkok: { code: 'THB', symbol: '฿', name: 'Thai Baht', rateFromINR: 0.408, flag: '🇹🇭', country: 'Thailand' },
  phuket: { code: 'THB', symbol: '฿', name: 'Thai Baht', rateFromINR: 0.408, flag: '🇹🇭', country: 'Thailand' },
  indonesia: { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', rateFromINR: 181.82, flag: '🇮🇩', country: 'Indonesia' },
  bali: { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', rateFromINR: 181.82, flag: '🇮🇩', country: 'Indonesia' },
  jakarta: { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', rateFromINR: 181.82, flag: '🇮🇩', country: 'Indonesia' },
  vietnam: { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', rateFromINR: 294.12, flag: '🇻🇳', country: 'Vietnam' },
  hanoi: { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', rateFromINR: 294.12, flag: '🇻🇳', country: 'Vietnam' },
  malaysia: { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', rateFromINR: 0.0505, flag: '🇲🇾', country: 'Malaysia' },
  kuala: { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', rateFromINR: 0.0505, flag: '🇲🇾', country: 'Malaysia' },
  china: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rateFromINR: 0.0837, flag: '🇨🇳', country: 'China' },
  beijing: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rateFromINR: 0.0837, flag: '🇨🇳', country: 'China' },
  shanghai: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rateFromINR: 0.0837, flag: '🇨🇳', country: 'China' },
  hong: { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', rateFromINR: 0.0901, flag: '🇭🇰', country: 'Hong Kong' },
  maldives: { code: 'MVR', symbol: 'Rf', name: 'Maldivian Rufiyaa', rateFromINR: 0.178, flag: '🇲🇻', country: 'Maldives' },
  male: { code: 'MVR', symbol: 'Rf', name: 'Maldivian Rufiyaa', rateFromINR: 0.178, flag: '🇲🇻', country: 'Maldives' },
  lanka: { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee', rateFromINR: 3.45, flag: '🇱🇰', country: 'Sri Lanka' },
  colombo: { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee', rateFromINR: 3.45, flag: '🇱🇰', country: 'Sri Lanka' },
  nepal: { code: 'NPR', symbol: 'Rs', name: 'Nepalese Rupee', rateFromINR: 1.60, flag: '🇳🇵', country: 'Nepal' },

  // --- Europe & UK ---
  france: { code: 'EUR', symbol: '€', name: 'Euro', rateFromINR: 0.009093, flag: '🇫🇷', country: 'France' },
  paris: { code: 'EUR', symbol: '€', name: 'Euro', rateFromINR: 0.009093, flag: '🇫🇷', country: 'France' },
  greece: { code: 'EUR', symbol: '€', name: 'Euro', rateFromINR: 0.009093, flag: '🇬🇷', country: 'Greece' },
  santorini: { code: 'EUR', symbol: '€', name: 'Euro', rateFromINR: 0.009093, flag: '🇬🇷', country: 'Greece' },
  italy: { code: 'EUR', symbol: '€', name: 'Euro', rateFromINR: 0.009093, flag: '🇮🇹', country: 'Italy' },
  rome: { code: 'EUR', symbol: '€', name: 'Euro', rateFromINR: 0.009093, flag: '🇮🇹', country: 'Italy' },
  venice: { code: 'EUR', symbol: '€', name: 'Euro', rateFromINR: 0.009093, flag: '🇮🇹', country: 'Italy' },
  milan: { code: 'EUR', symbol: '€', name: 'Euro', rateFromINR: 0.009093, flag: '🇮🇹', country: 'Italy' },
  germany: { code: 'EUR', symbol: '€', name: 'Euro', rateFromINR: 0.009093, flag: '🇩🇪', country: 'Germany' },
  berlin: { code: 'EUR', symbol: '€', name: 'Euro', rateFromINR: 0.009093, flag: '🇩🇪', country: 'Germany' },
  spain: { code: 'EUR', symbol: '€', name: 'Euro', rateFromINR: 0.009093, flag: '🇪🇸', country: 'Spain' },
  barcelona: { code: 'EUR', symbol: '€', name: 'Euro', rateFromINR: 0.009093, flag: '🇪🇸', country: 'Spain' },
  madrid: { code: 'EUR', symbol: '€', name: 'Euro', rateFromINR: 0.009093, flag: '🇪🇸', country: 'Spain' },
  netherlands: { code: 'EUR', symbol: '€', name: 'Euro', rateFromINR: 0.009093, flag: '🇳🇱', country: 'Netherlands' },
  amsterdam: { code: 'EUR', symbol: '€', name: 'Euro', rateFromINR: 0.009093, flag: '🇳🇱', country: 'Netherlands' },
  switzerland: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', rateFromINR: 0.008493, flag: '🇨🇭', country: 'Switzerland' },
  zurich: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', rateFromINR: 0.008493, flag: '🇨🇭', country: 'Switzerland' },
  geneva: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', rateFromINR: 0.008493, flag: '🇨🇭', country: 'Switzerland' },
  uk: { code: 'GBP', symbol: '£', name: 'British Pound', rateFromINR: 0.007792, flag: '🇬🇧', country: 'UK' },
  'united kingdom': { code: 'GBP', symbol: '£', name: 'British Pound', rateFromINR: 0.007792, flag: '🇬🇧', country: 'UK' },
  london: { code: 'GBP', symbol: '£', name: 'British Pound', rateFromINR: 0.007792, flag: '🇬🇧', country: 'UK' },
  scotland: { code: 'GBP', symbol: '£', name: 'British Pound', rateFromINR: 0.007792, flag: '🇬🇧', country: 'UK' },
  czech: { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', rateFromINR: 0.267, flag: '🇨🇿', country: 'Czech Republic' },
  prague: { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', rateFromINR: 0.267, flag: '🇨🇿', country: 'Czech Republic' },
  hungary: { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', rateFromINR: 4.35, flag: '🇭🇺', country: 'Hungary' },
  budapest: { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', rateFromINR: 4.35, flag: '🇭🇺', country: 'Hungary' },
  poland: { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', rateFromINR: 0.0452, flag: '🇵🇱', country: 'Poland' },
  norway: { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', rateFromINR: 0.123, flag: '🇳🇴', country: 'Norway' },
  sweden: { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', rateFromINR: 0.119, flag: '🇸🇪', country: 'Sweden' },
  denmark: { code: 'DKK', symbol: 'kr', name: 'Danish Krone', rateFromINR: 0.080, flag: '🇩🇰', country: 'Denmark' },

  // --- Americas & Africa ---
  usa: { code: 'USD', symbol: '$', name: 'US Dollar', rateFromINR: 0.0105, flag: '🇺🇸', country: 'USA' },
  'united states': { code: 'USD', symbol: '$', name: 'US Dollar', rateFromINR: 0.0105, flag: '🇺🇸', country: 'USA' },
  'new york': { code: 'USD', symbol: '$', name: 'US Dollar', rateFromINR: 0.0105, flag: '🇺🇸', country: 'USA' },
  california: { code: 'USD', symbol: '$', name: 'US Dollar', rateFromINR: 0.0105, flag: '🇺🇸', country: 'USA' },
  miami: { code: 'USD', symbol: '$', name: 'US Dollar', rateFromINR: 0.0105, flag: '🇺🇸', country: 'USA' },
  hawaii: { code: 'USD', symbol: '$', name: 'US Dollar', rateFromINR: 0.0105, flag: '🇺🇸', country: 'USA' },
  canada: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rateFromINR: 0.0160, flag: '🇨🇦', country: 'Canada' },
  toronto: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rateFromINR: 0.0160, flag: '🇨🇦', country: 'Canada' },
  vancouver: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rateFromINR: 0.0160, flag: '🇨🇦', country: 'Canada' },
  mexico: { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso', rateFromINR: 0.215, flag: '🇲🇽', country: 'Mexico' },
  cancun: { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso', rateFromINR: 0.215, flag: '🇲🇽', country: 'Mexico' },
  brazil: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', rateFromINR: 0.0658, flag: '🇧🇷', country: 'Brazil' },
  rio: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', rateFromINR: 0.0658, flag: '🇧🇷', country: 'Brazil' },
  australia: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateFromINR: 0.0177, flag: '🇦🇺', country: 'Australia' },
  sydney: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateFromINR: 0.0177, flag: '🇦🇺', country: 'Australia' },
  'new zealand': { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', rateFromINR: 0.0195, flag: '🇳🇿', country: 'New Zealand' },
  'south africa': { code: 'ZAR', symbol: 'R', name: 'South African Rand', rateFromINR: 0.206, flag: '🇿🇦', country: 'South Africa' },
  'cape town': { code: 'ZAR', symbol: 'R', name: 'South African Rand', rateFromINR: 0.206, flag: '🇿🇦', country: 'South Africa' },
  kenya: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', rateFromINR: 1.49, flag: '🇰🇪', country: 'Kenya' },
  tanzania: { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling', rateFromINR: 30.3, flag: '🇹🇿', country: 'Tanzania' },
  mauritius: { code: 'MUR', symbol: 'Rs', name: 'Mauritian Rupee', rateFromINR: 0.532, flag: '🇲🇺', country: 'Mauritius' },

  // --- India & Domestic ---
  india: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateFromINR: 1.0, flag: '🇮🇳', country: 'India' },
  goa: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateFromINR: 1.0, flag: '🇮🇳', country: 'India' },
  mumbai: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateFromINR: 1.0, flag: '🇮🇳', country: 'India' },
  delhi: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateFromINR: 1.0, flag: '🇮🇳', country: 'India' },
  jaipur: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateFromINR: 1.0, flag: '🇮🇳', country: 'India' },
  kerala: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateFromINR: 1.0, flag: '🇮🇳', country: 'India' },
  shimla: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateFromINR: 1.0, flag: '🇮🇳', country: 'India' },
  manali: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateFromINR: 1.0, flag: '🇮🇳', country: 'India' },
  udaipur: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateFromINR: 1.0, flag: '🇮🇳', country: 'India' },
  agra: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateFromINR: 1.0, flag: '🇮🇳', country: 'India' },
  ladakh: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateFromINR: 1.0, flag: '🇮🇳', country: 'India' },
  bom: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateFromINR: 1.0, flag: '🇮🇳', country: 'India' },
  del: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateFromINR: 1.0, flag: '🇮🇳', country: 'India' },
  blr: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateFromINR: 1.0, flag: '🇮🇳', country: 'India' },
  goi: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateFromINR: 1.0, flag: '🇮🇳', country: 'India' },
  cok: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateFromINR: 1.0, flag: '🇮🇳', country: 'India' },
  jai: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateFromINR: 1.0, flag: '🇮🇳', country: 'India' },

  // --- Airport & Regional Code Helpers ---
  cdg: { code: 'EUR', symbol: '€', name: 'Euro', rateFromINR: 0.009093, flag: '🇫🇷', country: 'France' },
  gre: { code: 'EUR', symbol: '€', name: 'Euro', rateFromINR: 0.009093, flag: '🇬🇷', country: 'Greece' },
  ath: { code: 'EUR', symbol: '€', name: 'Euro', rateFromINR: 0.009093, flag: '🇬🇷', country: 'Greece' },
  jtr: { code: 'EUR', symbol: '€', name: 'Euro', rateFromINR: 0.009093, flag: '🇬🇷', country: 'Greece' },
  jmk: { code: 'EUR', symbol: '€', name: 'Euro', rateFromINR: 0.009093, flag: '🇬🇷', country: 'Greece' },
  dxb: { code: 'AED', symbol: 'AED', name: 'UAE Dirham', rateFromINR: 0.03856, flag: '🇦🇪', country: 'UAE' },
  auh: { code: 'AED', symbol: 'AED', name: 'UAE Dirham', rateFromINR: 0.03856, flag: '🇦🇪', country: 'UAE' },
  hnd: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateFromINR: 1.6579, flag: '🇯🇵', country: 'Japan' },
  nrt: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateFromINR: 1.6579, flag: '🇯🇵', country: 'Japan' },
  kix: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateFromINR: 1.6579, flag: '🇯🇵', country: 'Japan' },
  zrh: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', rateFromINR: 0.008493, flag: '🇨🇭', country: 'Switzerland' },
  gva: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', rateFromINR: 0.008493, flag: '🇨🇭', country: 'Switzerland' },
  lhr: { code: 'GBP', symbol: '£', name: 'British Pound', rateFromINR: 0.007792, flag: '🇬🇧', country: 'UK' },
  fra: { code: 'EUR', symbol: '€', name: 'Euro', rateFromINR: 0.009093, flag: '🇩🇪', country: 'Germany' },
  fco: { code: 'EUR', symbol: '€', name: 'Euro', rateFromINR: 0.009093, flag: '🇮🇹', country: 'Italy' },
  mad: { code: 'EUR', symbol: '€', name: 'Euro', rateFromINR: 0.009093, flag: '🇪🇸', country: 'Spain' },
  bcn: { code: 'EUR', symbol: '€', name: 'Euro', rateFromINR: 0.009093, flag: '🇪🇸', country: 'Spain' },
  jfk: { code: 'USD', symbol: '$', name: 'US Dollar', rateFromINR: 0.0105, flag: '🇺🇸', country: 'USA' },
  sfo: { code: 'USD', symbol: '$', name: 'US Dollar', rateFromINR: 0.0105, flag: '🇺🇸', country: 'USA' },
  lax: { code: 'USD', symbol: '$', name: 'US Dollar', rateFromINR: 0.0105, flag: '🇺🇸', country: 'USA' },
  dps: { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', rateFromINR: 181.82, flag: '🇮🇩', country: 'Indonesia' },
  mle: { code: 'MVR', symbol: 'Rf', name: 'Maldivian Rufiyaa', rateFromINR: 0.178, flag: '🇲🇻', country: 'Maldives' },
  bkk: { code: 'THB', symbol: '฿', name: 'Thai Baht', rateFromINR: 0.408, flag: '🇹🇭', country: 'Thailand' },
  hkt: { code: 'THB', symbol: '฿', name: 'Thai Baht', rateFromINR: 0.408, flag: '🇹🇭', country: 'Thailand' },
  sin: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rateFromINR: 0.0153, flag: '🇸🇬', country: 'Singapore' },
  cmn: { code: 'MAD', symbol: 'DH', name: 'Moroccan Dirham', rateFromINR: 0.0978, flag: '🇲🇦', country: 'Morocco' },
  cai: { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', rateFromINR: 0.568, flag: '🇪🇬', country: 'Egypt' },
  ist: { code: 'TRY', symbol: '₺', name: 'Turkish Lira', rateFromINR: 0.420, flag: '🇹🇷', country: 'Turkey' },
  ruh: { code: 'SAR', symbol: 'SR', name: 'Saudi Riyal', rateFromINR: 0.0394, flag: '🇸🇦', country: 'Saudi Arabia' },
  doh: { code: 'QAR', symbol: 'QR', name: 'Qatari Riyal', rateFromINR: 0.0421, flag: '🇶🇦', country: 'Qatar' },
  icn: { code: 'KRW', symbol: '₩', name: 'South Korean Won', rateFromINR: 16.39, flag: '🇰🇷', country: 'South Korea' },
  han: { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', rateFromINR: 294.12, flag: '🇻🇳', country: 'Vietnam' },
  kul: { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', rateFromINR: 0.0505, flag: '🇲🇾', country: 'Malaysia' },
  syd: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateFromINR: 0.0177, flag: '🇦🇺', country: 'Australia' },
  akl: { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', rateFromINR: 0.0195, flag: '🇳🇿', country: 'New Zealand' },
  yyz: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rateFromINR: 0.0160, flag: '🇨🇦', country: 'Canada' },
  jnb: { code: 'ZAR', symbol: 'R', name: 'South African Rand', rateFromINR: 0.206, flag: '🇿🇦', country: 'South Africa' },
  cpt: { code: 'ZAR', symbol: 'R', name: 'South African Rand', rateFromINR: 0.206, flag: '🇿🇦', country: 'South Africa' },
  nbo: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', rateFromINR: 1.49, flag: '🇰🇪', country: 'Kenya' },
  znz: { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling', rateFromINR: 30.3, flag: '🇹🇿', country: 'Tanzania' },
  mru: { code: 'MUR', symbol: 'Rs', name: 'Mauritian Rupee', rateFromINR: 0.532, flag: '🇲🇺', country: 'Mauritius' }
};

// In-memory live exchange rate cache
let liveForexCache: Record<string, number> = {};

// Fetch live exchange rates from open Forex API
export async function syncLiveForexRates(): Promise<Record<string, number>> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/INR');
    if (res.ok) {
      const data = await res.json();
      if (data && data.rates) {
        liveForexCache = data.rates;
        try {
          localStorage.setItem('voyage_live_forex_inr', JSON.stringify(data.rates));
        } catch {}
        return data.rates;
      }
    }
  } catch (err) {
    console.warn("Live forex sync fallback to calibrated rates", err);
  }

  // Load from localStorage if available
  try {
    const saved = localStorage.getItem('voyage_live_forex_inr');
    if (saved) {
      liveForexCache = JSON.parse(saved);
      return liveForexCache;
    }
  } catch {}

  return {};
}

// Auto-trigger sync on load
syncLiveForexRates();

/**
 * Detects the local currency of a destination or trip title.
 */
export function getCurrencyForDestination(destination?: string, title?: string): CurrencyInfo {
  const combined = `${destination || ''} ${title || ''}`.toLowerCase().trim();
  if (!combined) return DEFAULT_INR;

  // 1. Direct match in dictionary
  for (const [key, currency] of Object.entries(COUNTRY_CURRENCY_MAP)) {
    if (combined.includes(key)) {
      // If live forex rate is available, update multiplier
      const liveRate = liveForexCache[currency.code];
      if (liveRate && liveRate > 0) {
        return { ...currency, rateFromINR: liveRate };
      }
      return currency;
    }
  }

  // 2. Regional and continent fallbacks
  if (combined.includes('europe') || combined.includes('eu')) {
    return COUNTRY_CURRENCY_MAP['france'];
  }
  if (combined.includes('africa') && (combined.includes('north') || combined.includes('sahara'))) {
    return COUNTRY_CURRENCY_MAP['morocco'];
  }
  if (combined.includes('emirates') || combined.includes('gulf')) {
    return COUNTRY_CURRENCY_MAP['uae'];
  }
  if (combined.includes('america') || combined.includes('us')) {
    return COUNTRY_CURRENCY_MAP['usa'];
  }

  return DEFAULT_INR;
}

/**
 * Converts an INR amount to the destination country's local currency.
 * Formula: amountInINR * rateFromINR (e.g. 50,000 INR * 0.0978 = 4,890.25 MAD)
 */
export function convertINRToLocal(amountInINR: number, currency: CurrencyInfo): number {
  if (!currency || currency.code === 'INR') return amountInINR;
  const liveRate = liveForexCache[currency.code] || currency.rateFromINR;
  return amountInINR * liveRate;
}

/**
 * Converts foreign local currency into base INR.
 * Formula: amountInLocal / rateFromINR (e.g. 4,890.25 MAD / 0.0978 = 50,000 INR)
 */
export function convertLocalToINR(amountInLocal: number, currency: CurrencyInfo): number {
  if (!currency || currency.code === 'INR') return amountInLocal;
  const liveRate = liveForexCache[currency.code] || currency.rateFromINR;
  if (!liveRate || liveRate <= 0) return amountInLocal;
  return amountInLocal / liveRate;
}

/**
 * Formats an amount in INR into both destination currency and INR.
 */
export function formatTripCurrency(
  amountInINR: number, 
  currency: CurrencyInfo = DEFAULT_INR, 
  options: { showINRSubtext?: boolean; compact?: boolean } = { showINRSubtext: true, compact: false }
): { localFormatted: string; inrFormatted: string; combined: string } {
  const inrFormatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amountInINR);

  if (currency.code === 'INR') {
    return {
      localFormatted: inrFormatted,
      inrFormatted: inrFormatted,
      combined: inrFormatted
    };
  }

  const localVal = convertINRToLocal(amountInINR, currency);
  const fractionDigits = (currency.code === 'JPY' || currency.code === 'IDR' || currency.code === 'VND' || currency.code === 'KRW') ? 0 : 2;

  let localFormatted = `${currency.symbol} ${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits
  }).format(localVal)} ${currency.code}`;

  if (options.compact) {
    localFormatted = `${currency.symbol}${new Intl.NumberFormat('en-US', { maximumFractionDigits: fractionDigits }).format(localVal)}`;
  }

  const combined = options.showINRSubtext 
    ? `${localFormatted} (≈ ${inrFormatted})`
    : localFormatted;

  return {
    localFormatted,
    inrFormatted,
    combined
  };
}
