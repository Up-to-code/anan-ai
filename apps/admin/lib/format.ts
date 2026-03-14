/**
 * WHY:   Admin pages repeat the same operational value formatting across metrics, tables, and detail panels.
 * WHAT:  Exposes small formatting helpers for numbers, percentages, currency, and timestamps.
 * HOW:   Uses the browser internationalization APIs with stable defaults for the admin console.
 */
export function formatNumber(value: number | null | undefined) {
  return new Intl.NumberFormat("ar-SA").format(value ?? 0);
}

/**
 * WHY:   Price fields and summary cards should present Saudi-Riyal values consistently.
 * WHAT:  Formats a numeric amount as SAR currency.
 * HOW:   Delegates to `Intl.NumberFormat` with a fixed currency style.
 */
export function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat("en-SA", {
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
export function formatPercent(rate: number | null | undefined) {
  return new Intl.NumberFormat("ar-SA", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(rate ?? 0);
}

/**
 * WHY:   Operational feeds and logs should present timestamps in a compact human-readable format.
 * WHAT:  Formats a unix-millisecond timestamp or returns a fallback for missing values.
 * HOW:   Uses a short date-time formatter in the Cairo locale context.
 */
export function formatDateTime(value: number | null | undefined) {
  if (!value) {
    return "غير متوفر";
  }

  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
