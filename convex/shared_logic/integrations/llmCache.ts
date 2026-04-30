import { v } from "convex/values";
import { LLMCache } from "@mzedstudio/llm-cache";
import { mutation, query } from "../../_generated/server";
import { components } from "../../_generated/api";
import { requireAdminAccess } from "../../_core/security/accessPolicy";

const llmCache = new LLMCache(components.llmCache);

/**
 * WHY:   Admin operators need visibility into current LLM cache tuning.
 * WHAT:  Returns the active cache configuration document.
 * HOW:   Enforces admin access then reads config from the cache component.
 */
export const getLlmCacheConfig = query({
  args: {},
  handler: async (ctx) => {
    await requireAdminAccess(ctx);
    return llmCache.getConfig(ctx);
  },
});

/**
 * WHY:   Cache tuning should be adjustable without code redeploys.
 * WHAT:  Updates the LLM cache configuration for TTLs, limits, and normalization.
 * HOW:   Enforces admin access then writes the config through the cache component.
 */
export const updateLlmCacheConfig = mutation({
  args: {
    config: v.object({
      defaultTtlMs: v.optional(v.number()),
      promotionTtlMs: v.optional(v.number()),
      ttlByModel: v.optional(v.record(v.string(), v.number())),
      ttlByTag: v.optional(v.record(v.string(), v.number())),
      normalizeRequests: v.optional(v.boolean()),
      maxEntries: v.optional(v.number()),
    }),
    replace: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdminAccess(ctx);
    return llmCache.setConfig(ctx, {
      config: args.config,
      replace: args.replace,
    });
  },
});

/**
 * WHY:   Ops dashboards need cache volume and hit-rate visibility.
 * WHAT:  Returns LLM cache statistics for admin viewing.
 * HOW:   Enforces admin access then reads stats from the cache component.
 */
export const getLlmCacheStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdminAccess(ctx);
    return llmCache.getStats(ctx);
  },
});
