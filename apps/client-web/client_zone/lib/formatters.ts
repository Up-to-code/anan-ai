import type { Locale } from "./types";

/**
 * WHY:   Property cards, assistant summaries, and history views repeat the same financial values.
 * WHAT:  Formats SAR currency in Arabic or English depending on the active locale.
 * HOW:   Uses locale-aware `Intl.NumberFormat` with zero fraction digits for property pricing.
 */
export function formatCurrency(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(value);
}
