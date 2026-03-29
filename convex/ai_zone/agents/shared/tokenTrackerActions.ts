/**
 * tokenTrackerActions.ts — Internal mutation wrapper for token tracking
 *
 * WHY:   Actions can't write to DB directly; they must call mutations.
 * WHAT:  Provides an internal mutation to record token usage.
 * HOW:   Wraps trackTokenUsage and exposes a stable internal API path.
 */
import { internalMutation } from "../../../_generated/server";
import { v } from "convex/values";
import { trackTokenUsage } from "./tokenTracker";

export const trackTokenUsageInternal = internalMutation({
  args: {
    agentName: v.string(),
    teamName: v.optional(v.string()),
    promptVersion: v.optional(v.string()),
    modelName: v.string(),
    inputTokens: v.number(),
    outputTokens: v.number(),
    userId: v.optional(v.string()),
    threadId: v.optional(v.string()),
    channel: v.optional(v.string()),
    role: v.optional(v.string()),
    errorOccurred: v.optional(v.boolean()),
    contextTokens: v.optional(v.number()),
    memoryTokens: v.optional(v.number()),
    ragTokens: v.optional(v.number()),
    historyTokens: v.optional(v.number()),
    cacheHit: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await trackTokenUsage(ctx, args);
    return null;
  },
});
