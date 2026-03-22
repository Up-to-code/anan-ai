/**
 * WHY:   The mock assistant needs consistent Arabic-friendly formatting across cards and screens.
 * WHAT:  Exports lightweight helpers for prices, yields, and numeral parsing.
 * HOW:   Normalizes Arabic digits before parsing and uses one locale-aware currency formatter.
 */
export function normalizeArabicDigits(value: string) {
  return value.replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

/**
 * WHY:   Property and finance surfaces repeat price values throughout the buyer journey.
 * WHAT:  Formats a number into a compact Saudi Riyal label.
 * HOW:   Uses `Intl.NumberFormat` with zero fraction digits for stable UI copy.
 */
export function formatCurrency(value: number) {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * WHY:   ROI cards show small percentage differences that should stay readable at a glance.
 * WHAT:  Formats a ratio into an Arabic percentage string.
 * HOW:   Keeps a single fractional digit for quick scanning.
 */
export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

/**
 * WHY:   Search and finance prompts often mention budgets or salaries in free-form Arabic text.
 * WHAT:  Extracts a normalized numeric value from a prompt when present.
 * HOW:   Supports plain numbers plus common million and thousand suffixes.
 */
export function extractAmount(query: string) {
  const normalized = normalizeArabicDigits(query);
  const match = normalized.match(/(\d+(?:\.\d+)?)\s*(مليون|ملايين|الف|ألف|k|m)?/i);

  if (!match) return undefined;

  const rawValue = Number(match[1]);
  const suffix = match[2]?.toLowerCase();

  if (!suffix) return rawValue;
  if (suffix === "m" || suffix === "مليون" || suffix === "ملايين") return rawValue * 1_000_000;
  if (suffix === "k" || suffix === "الف" || suffix === "ألف") return rawValue * 1_000;
  return rawValue;
}
