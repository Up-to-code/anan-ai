import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireAdminAccess } from "../_core/security/accessPolicy";

/** Recent search logs with errors. Developer-only. */
export const devLogs = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 50 }) => {
    await requireAdminAccess(ctx);
    const logs = await ctx.db.query("searchLogs").collect();
    const withErrors = logs.filter(
      (l) => l.status === "failed" || (l.errorMessage && l.errorMessage.length > 0),
    );
    return withErrors
      .sort((a, b) => (b._creationTime ?? 0) - (a._creationTime ?? 0))
      .slice(0, limit);
  },
});

/** Error rate by time bucket. Developer-only. */
export const devErrorRate = query({
  args: { range: v.optional(v.union(v.literal("day"), v.literal("week"), v.literal("month"))) },
  handler: async (ctx, { range = "week" }) => {
    await requireAdminAccess(ctx);
    const lookbackMs =
      range === "day"
        ? 24 * 60 * 60 * 1000
        : range === "week"
          ? 7 * 24 * 60 * 60 * 1000
          : 30 * 24 * 60 * 60 * 1000;
    const since = (Date.now() - lookbackMs) / 1000;
    const logs = await ctx.db.query("searchLogs").collect();
    const recent = logs.filter((l) => (l._creationTime ?? 0) >= since);
    const total = recent.length;
    const errors = recent.filter(
      (l) => l.status === "failed" || (l.errorMessage && l.errorMessage.length > 0),
    );
    return { total, errors: errors.length, rate: total > 0 ? errors.length / total : 0 };
  },
});
