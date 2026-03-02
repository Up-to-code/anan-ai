import { query } from "../_generated/server";
import { v } from "convex/values";
import { adminChecker } from "../shared_logic/lib/adminChecker";

type Range = "day" | "week" | "month";

function getBucketMs(range: Range): number {
  switch (range) {
    case "day":
      return 60 * 60 * 1000; // 1 hour
    case "week":
      return 24 * 60 * 60 * 1000; // 1 day
    case "month":
      return 24 * 60 * 60 * 1000; // 1 day
    default:
      return 24 * 60 * 60 * 1000;
  }
}

function getLookbackMs(range: Range): number {
  switch (range) {
    case "day":
      return 24 * 60 * 60 * 1000;
    case "week":
      return 7 * 24 * 60 * 60 * 1000;
    case "month":
      return 30 * 24 * 60 * 60 * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
}

export const searchActivityChart = query({
  args: {
    range: v.optional(v.union(v.literal("day"), v.literal("week"), v.literal("month"))),
  },
  handler: async (ctx, { range = "week" }) => {
    await adminChecker(ctx, "read");
    const logs = await ctx.db.query("searchLogs").collect();
    const bucketMs = getBucketMs(range);
    const lookbackMs = getLookbackMs(range);
    const now = Date.now();
    const start = now - lookbackMs;

    const buckets = new Map<
      number,
      { success: number; failed: number }
    >();
    for (const log of logs) {
      const t = (log._creationTime ?? 0) * 1000;
      if (t < start) continue;
      const bucket = Math.floor(t / bucketMs) * bucketMs;
      const prev = buckets.get(bucket) ?? { success: 0, failed: 0 };
      const isFailed =
        log.status === "failed" || (log.errorMessage && log.errorMessage.length > 0);
      if (isFailed) prev.failed += 1;
      else prev.success += 1;
      buckets.set(bucket, prev);
    }

    const sorted = Array.from(buckets.entries()).sort(([a], [b]) => a - b);
    const labels = sorted.map(([ts]) => new Date(ts).toISOString().slice(0, 16));
    const successSeries = sorted.map(([, v]) => v.success);
    const failedSeries = sorted.map(([, v]) => v.failed);
    return { labels, successSeries, failedSeries };
  },
});

export const errorHealthChart = query({
  args: {
    range: v.optional(v.union(v.literal("day"), v.literal("week"), v.literal("month"))),
  },
  handler: async (ctx, { range = "week" }) => {
    await adminChecker(ctx, "read");
    const logs = await ctx.db.query("searchLogs").collect();
    const lookbackMs = getLookbackMs(range);
    const now = Date.now();
    const start = (now - lookbackMs) / 1000;

    const byStatus = new Map<string, number>();
    const byStage = new Map<string, number>();
    for (const log of logs) {
      const t = log._creationTime ?? 0;
      if (t < start) continue;
      const isError =
        log.status === "failed" || (log.errorMessage && log.errorMessage.length > 0);
      if (!isError) continue;
      const status = log.status ?? "unknown";
      byStatus.set(status, (byStatus.get(status) ?? 0) + 1);
      const stage = log.stage ?? "unknown";
      byStage.set(stage, (byStage.get(stage) ?? 0) + 1);
    }

    return {
      labels: Array.from(new Set([...byStatus.keys(), ...byStage.keys()])),
      errorByStatus: Object.fromEntries(byStatus),
      errorByStage: Object.fromEntries(byStage),
    };
  },
});

export const channelDistribution = query({
  args: {},
  handler: async (ctx) => {
    await adminChecker(ctx, "read");
    const logs = await ctx.db.query("searchLogs").collect();
    let whatsapp = 0;
    let app = 0;
    let web = 0;
    for (const log of logs) {
      switch (log.channel) {
        case "whatsapp":
          whatsapp += 1;
          break;
        case "app":
          app += 1;
          break;
        case "web":
          web += 1;
          break;
        default:
          break;
      }
    }
    return { whatsapp, app, web };
  },
});
