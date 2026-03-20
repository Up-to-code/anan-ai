/**
 * WHY:   Agent teams need persistent user memory and interaction summaries across conversations.
 * WHAT:  Stores structured memory, retrieves relevant context, and records interaction/history links.
 * HOW:   Uses internal Convex mutations and queries against `agentMemory` and `entityRelations`.
 */
import { internalMutation } from "../../_generated/server";
import { v } from "convex/values";
import { getRelevantContextInternal } from "./repository/getRelevantContextInternal";
import { getRelevantMemoriesByQuery } from "./repository/getRelevantMemoriesByQuery";
import { MEMORY_DEFAULT_TTL_MS } from "./repository/shared";

export { getRelevantContextInternal, getRelevantMemoriesByQuery };

export const storeInternal = internalMutation({
  args: {
    userId: v.string(),
    threadId: v.optional(v.string()),
    memoryType: v.union(
      v.literal("preference"),
      v.literal("fact"),
      v.literal("interaction"),
      v.literal("constraint"),
      v.literal("feedback")
    ),
    entityType: v.optional(
      v.union(
        v.literal("property"),
        v.literal("location"),
        v.literal("bank"),
        v.literal("product"),
        v.literal("neighborhood")
      )
    ),
    entityId: v.optional(v.string()),
    key: v.string(),
    value: v.string(),
    confidence: v.optional(v.number()),
    source: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    metadata: v.optional(v.any()),
  },
  returns: v.id("agentMemory"),
  handler: async (ctx, args) => {
    const now = Date.now();
    const confidence = args.confidence ?? 0.8;
    const expiresAt =
      args.expiresAt ?? now + MEMORY_DEFAULT_TTL_MS;
    const existing = await ctx.db
      .query("agentMemory")
      .withIndex("userId_and_key", (q) => q.eq("userId", args.userId).eq("key", args.key))
      .first();
    if (existing && existing.memoryType === args.memoryType) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        confidence: Math.max(existing.confidence ?? 0, confidence),
        expiresAt,
        metadata: args.metadata,
        threadId: args.threadId ?? existing.threadId,
      });
      return existing._id;
    }
    return ctx.db.insert("agentMemory", {
      ...args,
      confidence,
      expiresAt,
    });
  },
});

export const storeInteractionInternal = internalMutation({
  args: {
    userId: v.string(),
    threadId: v.optional(v.string()),
    entityType: v.optional(
      v.union(
        v.literal("property"),
        v.literal("location"),
        v.literal("bank"),
        v.literal("product"),
        v.literal("neighborhood")
      )
    ),
    entityId: v.optional(v.string()),
    action: v.string(),
    details: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  returns: v.id("agentMemory"),
  handler: async (ctx, args) => {
    const key = `interaction_${args.entityType ?? "general"}_${args.entityId ?? Date.now()}`;
    const value = JSON.stringify({
      action: args.action,
      details: args.details,
      timestamp: Date.now(),
    });
    return ctx.db.insert("agentMemory", {
      userId: args.userId,
      threadId: args.threadId,
      memoryType: "interaction",
      entityType: args.entityType,
      entityId: args.entityId,
      key,
      value,
      confidence: 1.0,
      source: "user_action",
      expiresAt: Date.now() + MEMORY_DEFAULT_TTL_MS,
      metadata: args.metadata,
    });
  },
});

export const storeEntityRelationInternal = internalMutation({
  args: {
    fromType: v.string(),
    fromId: v.string(),
    relationType: v.string(),
    toType: v.string(),
    toId: v.string(),
    userId: v.optional(v.string()),
    strength: v.optional(v.number()),
    metadata: v.optional(v.any()),
  },
  returns: v.id("entityRelations"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("entityRelations")
      .withIndex("from_to_relation", (q) =>
        q
          .eq("fromType", args.fromType)
          .eq("fromId", args.fromId)
          .eq("toId", args.toId)
          .eq("relationType", args.relationType)
      )
      .first();
    if (existing) return existing._id;
    return ctx.db.insert("entityRelations", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const storeSearchSummaryInternal = internalMutation({
  args: {
    userId: v.string(),
    threadId: v.optional(v.string()),
    query: v.string(),
    locationHint: v.optional(v.string()),
    budgetHint: v.optional(v.string()),
    findingsCount: v.number(),
  },
  returns: v.id("agentMemory"),
  handler: async (ctx, args) => {
    const value = JSON.stringify({
      query: args.query,
      location: args.locationHint ?? null,
      budgetHint: args.budgetHint ?? null,
      findingsCount: args.findingsCount,
      timestamp: Date.now(),
    });
    const expiresAt = Date.now() + MEMORY_DEFAULT_TTL_MS;
    const existing = await ctx.db
      .query("agentMemory")
      .withIndex("userId_and_key", (q) =>
        q.eq("userId", args.userId).eq("key", "last_search_summary")
      )
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        value,
        expiresAt,
        threadId: args.threadId ?? existing.threadId,
      });
      return existing._id;
    }
    return ctx.db.insert("agentMemory", {
      userId: args.userId,
      threadId: args.threadId,
      memoryType: "fact",
      key: "last_search_summary",
      value,
      confidence: 0.9,
      source: "property_search",
      expiresAt,
    });
  },
});
