import { getNumberLocale, type MobileLocale } from "./locale";

/**
 * WHY:   Live mobile property, assistant, and finance surfaces all repeat money and percentage values.
 * WHAT:  Exports buyer-facing formatting helpers without tying runtime UI to legacy mock modules.
 * HOW:   Keeps the functions tiny and locale-stable so live mobile surfaces render consistently.
 */
export function formatCurrency(value: number, locale: MobileLocale = "ar") {
  return new Intl.NumberFormat(getNumberLocale(locale), {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}
