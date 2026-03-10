/**
 * WHY:   Agent teams need persistent user memory and interaction summaries across conversations.
 * WHAT:  Stores structured memory, retrieves relevant context, and records interaction/history links.
 * HOW:   Uses internal Convex mutations and queries against `agentMemory` and `entityRelations`.
 */
import { internalMutation, internalQuery } from "../../_generated/server";
import { v } from "convex/values";

const MEMORY_DEFAULT_TTL_MS = 1000 * 60 * 60 * 24 * 30;

function buildMemorySummary(
  preferences: unknown[],
  constraints: unknown[],
  interactions: unknown[],
  lastSearchSummary?: {
    query: string;
    location: string | null;
    budgetHint: string | null;
    findingsCount: number;
  } | null
): string {
  const parts: string[] = [];
  if (preferences.length > 0) {
    const prefStrings = preferences.map((p: unknown) => {
      const o = p as { key?: string; value?: string };
      return `${o.key ?? ""}: ${o.value ?? ""}`.trim();
    });
    parts.push(`User preferences: ${prefStrings.join(", ")}`);
  }
  if (constraints.length > 0) {
    const cstr = constraints.map((c: unknown) => {
      const o = c as { key?: string; value?: string };
      return `${o.key ?? ""}: ${o.value ?? ""}`.trim();
    });
    parts.push(`Constraints: ${cstr.join(", ")}`);
  }
  if (lastSearchSummary) {
    const loc = lastSearchSummary.location ? ` in ${lastSearchSummary.location}` : "";
    const budget = lastSearchSummary.budgetHint ? ` (${lastSearchSummary.budgetHint})` : "";
    parts.push(
      `Last search: "${lastSearchSummary.query}"${loc}${budget}, ${lastSearchSummary.findingsCount} results`
    );
  }
  if (interactions.length > 0) {
    parts.push(`Recent activity: ${interactions.length} interactions tracked`);
  }
  return parts.join(". ") || "No specific preferences or constraints recorded yet.";
}

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
    const preferences = await ctx.db
      .query("agentMemory")
      .withIndex("userId_and_memoryType", (q) =>
        q.eq("userId", userId).eq("memoryType", "preference")
      )
      .collect()
      .then((r) => r.filter((x) => !x.expiresAt || x.expiresAt > now).slice(0, limit));
    const constraints = await ctx.db
      .query("agentMemory")
      .withIndex("userId_and_memoryType", (q) =>
        q.eq("userId", userId).eq("memoryType", "constraint")
      )
      .collect()
      .then((r) => r.filter((x) => !x.expiresAt || x.expiresAt > now).slice(0, limit));
    const recentInteractions = await ctx.db
      .query("agentMemory")
      .withIndex("userId_and_memoryType", (q) =>
        q.eq("userId", userId).eq("memoryType", "interaction")
      )
      .collect()
      .then((r) => r.filter((x) => !x.expiresAt || x.expiresAt > now).slice(0, 5));
    const lastDoc = await ctx.db
      .query("agentMemory")
      .withIndex("userId_and_key", (q) =>
        q.eq("userId", userId).eq("key", "last_search_summary")
      )
      .first();
    let lastSearchSummary: {
      query: string;
      location: string | null;
      budgetHint: string | null;
      findingsCount: number;
    } | null = null;
    if (lastDoc && (!lastDoc.expiresAt || lastDoc.expiresAt > now)) {
      try {
        lastSearchSummary = JSON.parse(lastDoc.value);
      } catch {
        lastSearchSummary = null;
      }
    }
    const summary = buildMemorySummary(
      preferences,
      constraints,
      recentInteractions,
      lastSearchSummary
    );
    return {
      summary,
      preferences,
      constraints,
      recentInteractions,
      lastSearchSummary,
    };
  },
});

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
      .then((r) => r.filter((x) => !x.expiresAt || x.expiresAt > now).slice(0, limit));
    const constraints = await ctx.db
      .query("agentMemory")
      .withIndex("userId_and_memoryType", (q) =>
        q.eq("userId", userId).eq("memoryType", "constraint")
      )
      .collect()
      .then((r) => r.filter((x) => !x.expiresAt || x.expiresAt > now).slice(0, limit));
    const recentInteractions = await ctx.db
      .query("agentMemory")
      .withIndex("userId_and_memoryType", (q) =>
        q.eq("userId", userId).eq("memoryType", "interaction")
      )
      .collect()
      .then((r) => r.filter((x) => !x.expiresAt || x.expiresAt > now).slice(0, 5));
    const summary = buildMemorySummary(preferences, constraints, recentInteractions);
    return { summary, preferences, constraints, recentInteractions };
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
