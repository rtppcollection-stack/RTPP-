import type { LangCode } from "./languages";

/**
 * Approximate USD → local currency P2P rates (editable at runtime via slider).
 * These are DEFAULTS; the user can tune per session with the adjust control.
 * MMK reflects real P2P premium (not official CBM rate).
 */
export const DEFAULT_P2P_RATES: Record<LangCode, number> = {
  en: 1,
  my: 4500, // Myanmar Kyat (P2P)
  zh: 7.25, // CNY
  vi: 25500, // VND
  ru: 92, // RUB
  es: 0.93, // EUR
  tr: 34, // TRY
  ar: 3.67, // AED (pegged)
  id: 16200, // IDR
  hi: 84, // INR
};

/** Official exchange rate (approx) — used to show "Exchange" vs "P2P" delta */
export const DEFAULT_EXCHANGE_RATES: Record<LangCode, number> = {
  en: 1,
  my: 2100,
  zh: 7.15,
  vi: 25200,
  ru: 90,
  es: 0.92,
  tr: 33.5,
  ar: 3.67,
  id: 16000,
  hi: 83.5,
};

export function formatCurrency(value: number, currency: string, locale = "en-US"): string {
  if (!isFinite(value)) return "-";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: value >= 100 ? 0 : value >= 1 ? 2 : 6,
      minimumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value.toLocaleString(locale, { maximumFractionDigits: 2 })} ${currency}`;
  }
}

export function formatNumber(value: number, digits = 2, locale = "en-US"): string {
  if (!isFinite(value)) return "-";
  return value.toLocaleString(locale, { maximumFractionDigits: digits });
}

export function formatCryptoPriceUsd(price: number): string {
  if (!isFinite(price) || price === 0) return "0.00";
  if (price >= 1) {
    return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  }
  if (price >= 0.01) {
    return price.toFixed(4);
  }
  if (price >= 0.0001) {
    return price.toFixed(6);
  }
  return price.toFixed(8);
}

export function formatCryptoPriceMmk(mmk: number): string {
  if (!isFinite(mmk) || mmk === 0) return "0";
  if (mmk >= 100) {
    return Math.round(mmk).toLocaleString("en-US");
  }
  if (mmk >= 1) {
    return mmk.toFixed(2);
  }
  return mmk.toFixed(4);
}

export function formatCompact(value: number, locale = "en-US"): string {
  if (!isFinite(value)) return "-";
  return new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 2 }).format(
    value,
  );
}
