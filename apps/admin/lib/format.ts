import { ADMIN_DATE_TIME_ZONE, getDateLocale, getNumberLocale, type AdminLocale } from "./locale";

/**
 * WHY:   Admin pages repeat the same operational value formatting across metrics, tables, and detail panels.
 * WHAT:  Exposes small formatting helpers for numbers, percentages, currency, and timestamps.
 * HOW:   Uses the browser internationalization APIs with stable defaults for the admin console.
 */
export function formatNumber(value: number | null | undefined, locale: AdminLocale = "ar") {
  return new Intl.NumberFormat(getNumberLocale(locale)).format(value ?? 0);
}

/**
 * WHY:   Price fields and summary cards should present Saudi-Riyal values consistently.
 * WHAT:  Formats a numeric amount as SAR currency.
 * HOW:   Delegates to `Intl.NumberFormat` with a fixed currency style.
 */
export function formatCurrency(value: number | null | undefined, locale: AdminLocale = "ar") {
  return new Intl.NumberFormat(getNumberLocale(locale), {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

/**
 * WHY:   Health widgets need a consistent percentage string for rates and error ratios.
 * WHAT:  Formats a decimal rate as a percentage with one fractional digit.
 * HOW:   Multiplies the input by 100 and appends `%`.
 */
export function formatPercent(rate: number | null | undefined, locale: AdminLocale = "ar") {
  return new Intl.NumberFormat(getNumberLocale(locale), {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(rate ?? 0);
}

/**
 * WHY:   Operational feeds and logs should present timestamps in a compact human-readable format.
 * WHAT:  Formats a unix-millisecond timestamp or returns a fallback for missing values.
 * HOW:   Pins the formatter to a Gregorian calendar and one admin timezone so SSR and hydration stay identical.
 */
export function formatDateTime(value: number | null | undefined, locale: AdminLocale = "ar") {
  if (!value) {
    return "غير متوفر";
  }

  return new Intl.DateTimeFormat(getDateLocale(locale), {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: ADMIN_DATE_TIME_ZONE,
  }).format(new Date(value));
}
