import { internalQuery } from "../../../_generated/server";
import { v } from "convex/values";

import { buildMemorySummary, type LastSearchSummary } from "./shared";

async function loadActiveMemories(args: {
  ctx: any;
  userId: string;
  memoryType: "preference" | "constraint" | "interaction";
  now: number;
  limit: number;
}) {
  const records = await args.ctx.db
    .query("agentMemory")
    .withIndex("userId_and_memoryType", (q: any) =>
      q.eq("userId", args.userId).eq("memoryType", args.memoryType),
    )
    .collect();
  return records
    .filter((record: any) => !record.expiresAt || record.expiresAt > args.now)
    .slice(0, args.limit);
}

export const getRelevantMemoriesByQuery = internalQuery({
  args: {
    userId: v.string(),
    query: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    summary: v.string(),
    preferences: v.array(v.any()),
    constraints: v.array(v.any()),
    recentInteractions: v.array(v.any()),
    lastSearchSummary: v.union(v.null(), v.any()),
  }),
  handler: async (ctx, { userId, limit = 10 }) => {
    const now = Date.now();
    const [preferences, constraints, recentInteractions] = await Promise.all([
      loadActiveMemories({ ctx, userId, memoryType: "preference", now, limit }),
      loadActiveMemories({ ctx, userId, memoryType: "constraint", now, limit }),
      loadActiveMemories({ ctx, userId, memoryType: "interaction", now, limit: 5 }),
    ]);

    const lastSummaryRecord = await ctx.db
      .query("agentMemory")
      .withIndex("userId_and_key", (q) =>
        q.eq("userId", userId).eq("key", "last_search_summary")
      )
      .first();

    let lastSearchSummary: LastSearchSummary | null = null;
    if (lastSummaryRecord && (!lastSummaryRecord.expiresAt || lastSummaryRecord.expiresAt > now)) {
      try {
        lastSearchSummary = JSON.parse(lastSummaryRecord.value);
      } catch {
        lastSearchSummary = null;
      }
    }

    return {
      summary: buildMemorySummary(preferences, constraints, recentInteractions, lastSearchSummary),
      preferences,
      constraints,
      recentInteractions,
      lastSearchSummary,
    };
  },
});
