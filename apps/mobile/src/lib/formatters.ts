/**
 * WHY:   Live mobile property, assistant, and finance surfaces all repeat money and percentage values.
 * WHAT:  Exports the buyer-facing formatting helpers without tying production UI to the MVP fallback module.
 * HOW:   Keeps the functions tiny and locale-stable so both live and fallback modes render consistently.
 */
export function formatCurrency(value: number) {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}
