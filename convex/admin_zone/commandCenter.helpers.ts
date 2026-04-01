const DAY_MS = 24 * 60 * 60 * 1000;

export type AdminDashboardRange = "30d" | "90d";

/**
 * WHY:   Dashboard read models need a shared notion of how many days each management range represents.
 * WHAT:  Maps a semantic admin range to a concrete day count.
 * HOW:   Supports the two approved dashboard windows: 30 and 90 days.
 */
export function getDashboardRangeDays(range: AdminDashboardRange) {
  return range === "90d" ? 90 : 30;
}

/**
 * WHY:   Windowed admin queries need millisecond lookbacks derived from the selected range.
 * WHAT:  Converts an admin dashboard range into its full millisecond duration.
 * HOW:   Multiplies the normalized day count by the UTC day constant.
 */
export function getDashboardRangeMs(range: AdminDashboardRange) {
  return getDashboardRangeDays(range) * DAY_MS;
}

/**
 * WHY:   Trend charts should bucket all events by stable UTC calendar days.
 * WHAT:  Normalizes an arbitrary timestamp to the start of its UTC day.
 * HOW:   Clears the hour, minute, second, and millisecond components on a cloned Date.
 */
function startOfDay(timestamp: number) {
  const date = new Date(timestamp);
  date.setUTCHours(0, 0, 0, 0);
  return date.getTime();
}

/**
 * WHY:   Shared chart components need compact labels for day-based admin series.
 * WHAT:  Formats a UTC timestamp into a `MM-DD` label.
 * HOW:   Reuses ISO formatting and slices the month/day section only.
 */
function formatDayLabel(timestamp: number) {
  return new Date(timestamp).toISOString().slice(5, 10);
}

/**
 * WHY:   Rebuilt dashboard views require dense daily series with zero-filled gaps for cleaner charts.
 * WHAT:  Converts sparse bucket maps into a continuous array covering the requested number of days.
 * HOW:   Walks the full day window from oldest to newest and merges real bucket values over empty defaults.
 */
export function buildDailySeries<T extends Record<string, number>>(args: {
  days: number;
  endAt?: number;
  buckets: Map<number, T>;
  createEmpty: () => T;
}) {
  const endDay = startOfDay(args.endAt ?? Date.now());
  const startDay = endDay - (args.days - 1) * DAY_MS;

  return Array.from({ length: args.days }, (_, index) => {
    const timestamp = startDay + index * DAY_MS;
    return {
      label: formatDayLabel(timestamp),
      ...args.createEmpty(),
      ...(args.buckets.get(timestamp) ?? {}),
    };
  });
}

/**
 * WHY:   KPI cards need a stable relative delta against the previous matching window.
 * WHAT:  Returns the percentage delta between the current and previous values.
 * HOW:   Uses `1` as the positive baseline when the previous period was zero to avoid division failures.
 */
export function calculateDelta(current: number, previous: number) {
  if (previous === 0) {
    return current > 0 ? 1 : 0;
  }

  return (current - previous) / previous;
}

/**
 * WHY:   Convex tables mix explicit timestamps and optional fields, while charts need numeric values only.
 * WHAT:  Normalizes a possibly missing timestamp into a safe number.
 * HOW:   Returns `0` for nullish or non-finite values.
 */
export function normalizeTimestamp(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

/**
 * WHY:   Multiple admin queries bucket daily totals and should share identical accumulation behavior.
 * WHAT:  Updates a typed daily bucket map for a single timestamped event.
 * HOW:   Rounds the timestamp to its UTC day, creates an empty bucket when missing, then mutates it through the provided updater.
 */
export function pushBucketValue<T extends Record<string, number>>(args: {
  buckets: Map<number, T>;
  timestamp: number;
  update: (bucket: T) => void;
  createEmpty: () => T;
}) {
  const key = startOfDay(args.timestamp);
  const bucket = args.buckets.get(key) ?? args.createEmpty();
  args.update(bucket);
  args.buckets.set(key, bucket);
}
