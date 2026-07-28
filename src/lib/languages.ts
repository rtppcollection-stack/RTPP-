export type LangCode = "my" | "en" | "zh" | "vi" | "ru" | "es" | "tr" | "ar" | "id" | "hi";

export interface LangInfo {
  code: LangCode;
  name: string; // native
  flag: string;
  currency: string; // ISO code for CoinGecko (lowercase used in API)
  currencySymbol: string;
  currencyName: string;
  dir?: "rtl" | "ltr";
}

export const LANGUAGES: LangInfo[] = [
  {
    code: "my",
    name: "မြန်မာ",
    flag: "🇲🇲",
    currency: "MMK",
    currencySymbol: "K",
    currencyName: "Myanmar Kyat",
  },
  {
    code: "en",
    name: "English",
    flag: "🇺🇸",
    currency: "USD",
    currencySymbol: "$",
    currencyName: "US Dollar",
  },
  {
    code: "zh",
    name: "中文",
    flag: "🇨🇳",
    currency: "CNY",
    currencySymbol: "¥",
    currencyName: "Chinese Yuan",
  },
  {
    code: "vi",
    name: "Tiếng Việt",
    flag: "🇻🇳",
    currency: "VND",
    currencySymbol: "₫",
    currencyName: "Vietnamese Dong",
  },
  {
    code: "ru",
    name: "Русский",
    flag: "🇷🇺",
    currency: "RUB",
    currencySymbol: "₽",
    currencyName: "Russian Ruble",
  },
  {
    code: "es",
    name: "Español",
    flag: "🇪🇸",
    currency: "EUR",
    currencySymbol: "€",
    currencyName: "Euro",
  },
  {
    code: "tr",
    name: "Türkçe",
    flag: "🇹🇷",
    currency: "TRY",
    currencySymbol: "₺",
    currencyName: "Turkish Lira",
  },
  {
    code: "ar",
    name: "العربية",
    flag: "🇦🇪",
    currency: "AED",
    currencySymbol: "د.إ",
    currencyName: "UAE Dirham",
    dir: "rtl",
  },
  {
    code: "id",
    name: "Bahasa",
    flag: "🇮🇩",
    currency: "IDR",
    currencySymbol: "Rp",
    currencyName: "Indonesian Rupiah",
  },
  {
    code: "hi",
    name: "हिन्दी",
    flag: "🇮🇳",
    currency: "INR",
    currencySymbol: "₹",
    currencyName: "Indian Rupee",
  },
];

export const LANG_MAP: Record<LangCode, LangInfo> = Object.fromEntries(
  LANGUAGES.map((l) => [l.code, l]),
) as Record<LangCode, LangInfo>;

/** Approximate P2P premium over official FX rate (multiplier). MMK P2P is much higher than official. */
export const P2P_PREMIUM: Partial<Record<LangCode, number>> = {
  my: 1.35, // Myanmar P2P premium ~30-40%
  vi: 1.02,
  tr: 1.03,
  ar: 1.0,
  ru: 1.05,
  hi: 1.02,
  id: 1.02,
  zh: 1.02,
  es: 1.0,
  en: 1.0,
};
