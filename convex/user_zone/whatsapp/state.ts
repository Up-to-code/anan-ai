import { v } from "convex/values";
import type { Id } from "../../_generated/dataModel";
import { internalMutation, internalQuery } from "../../_generated/server";
import {
  buyerChannelStateValidator,
  type MobileQualification,
} from "./contracts";
import { mobileQualificationContextValidator } from "../mobile/contracts";

const channelValidator = v.union(
  v.literal("whatsapp"),
  v.literal("app"),
  v.literal("web"),
);

const buyerChannelStateRecordValidator = v.object({
  channel: channelValidator,
  userId: v.string(),
  threadId: v.optional(v.id("assistantThreads")),
  state: buyerChannelStateValidator,
  selectedPropertyId: v.optional(v.id("properties")),
  lastResultPropertyIds: v.array(v.id("properties")),
  lastSearchQuery: v.optional(v.string()),
  qualification: v.optional(mobileQualificationContextValidator),
  createdAt: v.number(),
  updatedAt: v.number(),
});

function toBuyerStateRecord(doc: {
  channel: "whatsapp" | "app" | "web";
  userId: string;
  threadId?: Id<"assistantThreads">;
  state: "idle" | "search_results" | "property_selected" | "handoff_ready";
  selectedPropertyId?: Id<"properties">;
  lastResultPropertyIds: Id<"properties">[];
  lastSearchQuery?: string;
  qualification?: MobileQualification;
  createdAt: number;
  updatedAt: number;
}) {
  return {
    channel: doc.channel,
    userId: doc.userId,
    threadId: doc.threadId,
    state: doc.state,
    selectedPropertyId: doc.selectedPropertyId,
    lastResultPropertyIds: doc.lastResultPropertyIds,
    lastSearchQuery: doc.lastSearchQuery,
    qualification: doc.qualification,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/**
 * WHY:   The WhatsApp buyer flow needs persisted state across independent webhook deliveries.
 * WHAT:  Returns the current buyer channel state for one user and channel.
 * HOW:   Reads the dedicated buyer state table via the `channel_userId` index.
 */
export const getBuyerChannelState = internalQuery({
  args: {
    channel: channelValidator,
    userId: v.string(),
  },
  returns: v.union(buyerChannelStateRecordValidator, v.null()),
  handler: async (ctx, args) => {
    const state = await ctx.db
      .query("buyerChannelStates")
      .withIndex("channel_userId", (q) =>
        q.eq("channel", args.channel).eq("userId", args.userId),
      )
      .first();
    return state ? toBuyerStateRecord(state as any) : null;
  },
});

/**
 * WHY:   The deterministic WhatsApp state machine must update its canonical turn state after each reply.
 * WHAT:  Creates or replaces the persisted buyer state for one channel user.
 * HOW:   Upserts by `channel + userId` and refreshes the timestamps while preserving one canonical row.
 */
export const upsertBuyerChannelState = internalMutation({
  args: {
    channel: channelValidator,
    userId: v.string(),
    threadId: v.optional(v.id("assistantThreads")),
    state: buyerChannelStateValidator,
    selectedPropertyId: v.optional(v.id("properties")),
    lastResultPropertyIds: v.array(v.id("properties")),
    lastSearchQuery: v.optional(v.string()),
    qualification: v.optional(mobileQualificationContextValidator),
  },
  returns: buyerChannelStateRecordValidator,
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("buyerChannelStates")
      .withIndex("channel_userId", (q) =>
        q.eq("channel", args.channel).eq("userId", args.userId),
      )
      .first();

    const record = {
      channel: args.channel,
      userId: args.userId,
      threadId: args.threadId,
      state: args.state,
      selectedPropertyId: args.selectedPropertyId,
      lastResultPropertyIds: args.lastResultPropertyIds,
      lastSearchQuery: args.lastSearchQuery,
      qualification: args.qualification,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    } satisfies {
      channel: "whatsapp" | "app" | "web";
      userId: string;
      threadId?: Id<"assistantThreads">;
      state: "idle" | "search_results" | "property_selected" | "handoff_ready";
      selectedPropertyId?: Id<"properties">;
      lastResultPropertyIds: Id<"properties">[];
      lastSearchQuery?: string;
      qualification?: MobileQualification;
      createdAt: number;
      updatedAt: number;
    };

    if (existing) {
      await ctx.db.patch(existing._id, record);
      return toBuyerStateRecord(record);
    }

    await ctx.db.insert("buyerChannelStates", record as any);
    return toBuyerStateRecord(record);
  },
});

const claimReceiptResultValidator = v.object({
  proceed: v.boolean(),
  status: v.union(
    v.literal("processing"),
    v.literal("processed"),
    v.literal("failed"),
  ),
  threadId: v.optional(v.id("assistantThreads")),
});

/**
 * WHY:   Webhook retries must not generate duplicate buyer replies.
 * WHAT:  Claims an inbound channel message receipt if it has not already been processed.
 * HOW:   Upserts a receipt row keyed by `channel + messageId` and marks new work as `processing`.
 */
export const claimInboundMessageReceipt = internalMutation({
  args: {
    channel: channelValidator,
    messageId: v.string(),
    userId: v.optional(v.string()),
  },
  returns: claimReceiptResultValidator,
  handler: async (ctx, args): Promise<{
    proceed: boolean;
    status: "processing" | "processed" | "failed";
    threadId?: Id<"assistantThreads">;
  }> => {
    const existing = await ctx.db
      .query("channelMessageReceipts")
      .withIndex("channel_messageId", (q) =>
        q.eq("channel", args.channel).eq("messageId", args.messageId),
      )
      .first();

    if (existing?.status === "processed" || existing?.status === "processing") {
      return {
        proceed: false,
        status: existing.status as "processing" | "processed" | "failed",
        threadId: existing.threadId,
      };
    }

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        status: "processing",
        userId: args.userId ?? existing.userId,
        failureCode: undefined,
        processedAt: undefined,
      });
      return { proceed: true, status: "processing" as const };
    }

    await ctx.db.insert("channelMessageReceipts", {
      channel: args.channel,
      messageId: args.messageId,
      status: "processing",
      userId: args.userId,
      createdAt: now,
    });
    return { proceed: true, status: "processing" as const };
  },
});

/**
 * WHY:   Once transport succeeds, the inbound receipt must become the durable dedupe record.
 * WHAT:  Marks a channel message receipt as processed and stores the outbound reply ids.
 * HOW:   Updates the existing receipt row keyed by `channel + messageId`.
 */
export const completeInboundMessageReceipt = internalMutation({
  args: {
    channel: channelValidator,
    messageId: v.string(),
    userId: v.optional(v.string()),
    threadId: v.optional(v.id("assistantThreads")),
    replyMessageIds: v.optional(v.array(v.string())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("channelMessageReceipts")
      .withIndex("channel_messageId", (q) =>
        q.eq("channel", args.channel).eq("messageId", args.messageId),
      )
      .first();
    if (!existing) return null;

    await ctx.db.patch(existing._id, {
      status: "processed",
      userId: args.userId ?? existing.userId,
      threadId: args.threadId,
      replyMessageIds: args.replyMessageIds,
      processedAt: Date.now(),
      failureCode: undefined,
    });
    return null;
  },
});

/**
 * WHY:   Failed inbound messages still need an auditable receipt for review and retry analysis.
 * WHAT:  Marks a claimed inbound receipt as failed with a coarse failure code.
 * HOW:   Updates the existing receipt row keyed by `channel + messageId`.
 */
export const failInboundMessageReceipt = internalMutation({
  args: {
    channel: channelValidator,
    messageId: v.string(),
    userId: v.optional(v.string()),
    threadId: v.optional(v.id("assistantThreads")),
    failureCode: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("channelMessageReceipts")
      .withIndex("channel_messageId", (q) =>
        q.eq("channel", args.channel).eq("messageId", args.messageId),
      )
      .first();
    if (!existing) return null;

    await ctx.db.patch(existing._id, {
      status: "failed",
      userId: args.userId ?? existing.userId,
      threadId: args.threadId,
      failureCode: args.failureCode,
      processedAt: Date.now(),
    });
    return null;
  },
});
