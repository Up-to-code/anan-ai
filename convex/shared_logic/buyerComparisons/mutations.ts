import { v } from "convex/values";
import { internalMutation } from "../../_generated/server";
import type { Doc } from "../../_generated/dataModel";
import {
  buyerComparisonSelectionSourceValidator,
  buyerComparisonSnapshotValidator,
} from "./types";

const REF_DEDUPE_WINDOW_MS = 1000 * 60 * 5;

/**
 * WHY:   Public buyer turns should remember which canonical properties the UI showed or the user selected.
 * WHAT:  Writes thread-scoped property refs with short-window deduplication by thread/resource/source.
 * HOW:   Skips inserts when an equivalent ref was already stored recently to avoid noisy history rows.
 */
export const trackBuyerPropertyRefsInternal = internalMutation({
  args: {
    threadId: v.string(),
    userId: v.string(),
    channel: v.union(v.literal("whatsapp"), v.literal("app"), v.literal("web")),
    refs: v.array(v.object({
      resourceId: v.id("properties"),
      source: v.union(
        v.literal("shortlist_displayed"),
        v.literal("ui_selected"),
        v.literal("active_property"),
        v.literal("comparison_request"),
      ),
      messageId: v.optional(v.string()),
      rank: v.optional(v.number()),
    })),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const createdAt = Date.now();
    let inserted = 0;

    for (const ref of args.refs) {
      const recent = await ctx.db
        .query("buyerThreadResourceRefs")
        .withIndex("threadId_resource_source_createdAt", (q) =>
          q
            .eq("threadId", args.threadId)
            .eq("resourceId", ref.resourceId)
            .eq("source", ref.source)
            .gte("createdAt", createdAt - REF_DEDUPE_WINDOW_MS),
        )
        .first();

      if (recent) continue;

      await ctx.db.insert("buyerThreadResourceRefs", {
        threadId: args.threadId,
        userId: args.userId,
        channel: args.channel,
        resourceType: "property",
        resourceId: ref.resourceId,
        source: ref.source,
        messageId: ref.messageId,
        rank: ref.rank,
        createdAt,
      });
      inserted += 1;
    }

    return inserted;
  },
});

/**
 * WHY:   Compare turns need a single durable replay artifact instead of copying the full snapshot into assistant message metadata.
 * WHAT:  Stores one comparison artifact snapshot and returns the new artifact id.
 * HOW:   Persists the ordered property ids, selection source, digest metadata, and full buyer-facing snapshot once per turn.
 */
export const storeBuyerComparisonArtifactInternal = internalMutation({
  args: {
    threadId: v.string(),
    userId: v.string(),
    channel: v.union(v.literal("whatsapp"), v.literal("app"), v.literal("web")),
    locale: v.union(v.literal("ar"), v.literal("en"), v.literal("fr")),
    propertyIds: v.array(v.id("properties")),
    triggerMessageId: v.optional(v.string()),
    selectionSource: buyerComparisonSelectionSourceValidator,
    digestTitle: v.string(),
    digestSummary: v.string(),
    digestHash: v.string(),
    version: v.string(),
    snapshot: buyerComparisonSnapshotValidator,
  },
  returns: v.id("buyerComparisonArtifacts"),
  handler: async (ctx, args) => {
    const now = Date.now();
    return ctx.db.insert("buyerComparisonArtifacts", {
      ...args,
      createdAt: now,
      lastRefreshedAt: now,
    });
  },
});

/**
 * WHY:   Compare turns should remain resumable without replaying the full snapshot through prompt history.
 * WHAT:  Updates the buyer channel state with the latest active comparison set.
 * HOW:   Patches the canonical buyer state row only when it exists for the same channel/user pair.
 */
export const setBuyerActiveComparisonInternal = internalMutation({
  args: {
    channel: v.union(v.literal("whatsapp"), v.literal("app"), v.literal("web")),
    userId: v.string(),
    comparisonPropertyIds: v.array(v.id("properties")),
    lastComparisonArtifactId: v.id("buyerComparisonArtifacts"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("buyerChannelStates")
      .withIndex("channel_userId", (q) =>
        q.eq("channel", args.channel).eq("userId", args.userId),
      )
      .first();

    if (!existing) return null;

    await ctx.db.patch(existing._id, {
      comparisonPropertyIds: args.comparisonPropertyIds,
      lastComparisonArtifactId: args.lastComparisonArtifactId,
      updatedAt: Date.now(),
    } satisfies Partial<Doc<"buyerChannelStates">>);
    return null;
  },
});
