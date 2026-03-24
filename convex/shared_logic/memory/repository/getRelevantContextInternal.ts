import { internalQuery } from "../../../_generated/server";
import { v } from "convex/values";

import { buildMemorySummary } from "./shared";

export const getRelevantContextInternal = internalQuery({
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
  }),
  handler: async (ctx, { userId, limit = 10 }) => {
    const now = Date.now();

    const preferences = await ctx.db
      .query("agentMemory")
      .withIndex("userId_and_memoryType", (q) =>
        q.eq("userId", userId).eq("memoryType", "preference")
      )
      .collect()
      .then((records) =>
        records.filter((record) => !record.expiresAt || record.expiresAt > now).slice(0, limit)
      );

    const constraints = await ctx.db
      .query("agentMemory")
      .withIndex("userId_and_memoryType", (q) =>
        q.eq("userId", userId).eq("memoryType", "constraint")
      )
      .collect()
      .then((records) =>
        records.filter((record) => !record.expiresAt || record.expiresAt > now).slice(0, limit)
      );

    const recentInteractions = await ctx.db
      .query("agentMemory")
      .withIndex("userId_and_memoryType", (q) =>
        q.eq("userId", userId).eq("memoryType", "interaction")
      )
      .collect()
      .then((records) =>
        records.filter((record) => !record.expiresAt || record.expiresAt > now).slice(0, 5)
      );

    return {
      summary: buildMemorySummary(preferences, constraints, recentInteractions),
      preferences,
      constraints,
      recentInteractions,
    };
  },
});
