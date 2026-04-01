import { v } from "convex/values";
import { internalMutation } from "../../../_generated/server";
import { buildCompiledBuyerContextPayload } from "../compiled";
import {
  buyerChannelStateRecordValidator,
  buyerChannelStateValidator,
  buyerChannelValidator,
  buyerQualificationValidator,
} from "../constants";
import { toBuyerStateRecord } from "../helpers";
import { syncBuyerContextSummaries, upsertSummaryMemory } from "../storage";
import {
  buyerContextPromotionResultValidator,
  buyerSummaryKeyValidator,
  compiledBuyerContextValidator,
} from "./contracts";
import { promoteBuyerContext } from "./promotion";

function toSummarySnapshot(state: ReturnType<typeof toBuyerStateRecord>) {
  return {
    state: state.state,
    lastSearchQuery: state.lastSearchQuery,
    selectedPropertyId: state.selectedPropertyId
      ? String(state.selectedPropertyId)
      : undefined,
    lastResultPropertyIds: state.lastResultPropertyIds.map((id: any) =>
      String(id),
    ),
    qualification: state.qualification,
  };
}

async function persistBuyerChannelState(args: {
  ctx: any;
  channel: "whatsapp" | "app" | "web";
  userId: string;
  threadId?: any;
  state: "idle" | "search_results" | "property_selected" | "handoff_ready";
  selectedPropertyId?: any;
  lastResultPropertyIds: any[];
  lastSearchQuery?: string;
  qualification?: {
    monthlySalary?: number;
    downPayment?: number;
    preferredYears?: number;
    employmentStatus?: string;
    notes?: string;
  };
}) {
  const now = Date.now();
  const existing = await args.ctx.db
    .query("buyerChannelStates")
    .withIndex("channel_userId", (q: any) =>
      q.eq("channel", args.channel).eq("userId", args.userId),
    )
    .first();

  const nextRecord = {
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
  };

  if (existing) {
    await args.ctx.db.patch(existing._id, nextRecord);
  } else {
    await args.ctx.db.insert("buyerChannelStates", nextRecord as any);
  }

  const normalized = toBuyerStateRecord(nextRecord as any);
  await syncBuyerContextSummaries({
    ctx: args.ctx,
    channel: args.channel,
    userId: args.userId,
    threadId: args.threadId ? String(args.threadId) : undefined,
    state: toSummarySnapshot(normalized),
  });

  return normalized;
}

export const upsertBuyerChannelStateInternal = internalMutation({
  args: {
    channel: buyerChannelValidator,
    userId: v.string(),
    threadId: v.optional(v.id("assistantThreads")),
    state: buyerChannelStateValidator,
    selectedPropertyId: v.optional(v.id("properties")),
    lastResultPropertyIds: v.array(v.id("properties")),
    lastSearchQuery: v.optional(v.string()),
    qualification: v.optional(buyerQualificationValidator),
  },
  returns: buyerChannelStateRecordValidator,
  handler: async (ctx, args) =>
    persistBuyerChannelState({
      ctx,
      channel: args.channel,
      userId: args.userId,
      threadId: args.threadId,
      state: args.state,
      selectedPropertyId: args.selectedPropertyId,
      lastResultPropertyIds: args.lastResultPropertyIds,
      lastSearchQuery: args.lastSearchQuery,
      qualification: args.qualification,
    }),
});

export const upsertBuyerContextSummaryInternal = internalMutation({
  args: {
    userId: v.string(),
    threadId: v.optional(v.string()),
    summaryKey: buyerSummaryKeyValidator,
    summary: v.string(),
    metadata: v.optional(v.any()),
  },
  returns: v.id("agentMemory"),
  handler: async (ctx, args) =>
    upsertSummaryMemory({
      ctx,
      userId: args.userId,
      threadId: args.threadId,
      key: args.summaryKey,
      summary: args.summary,
      metadata: args.metadata as Record<string, unknown> | undefined,
    }),
});

export const getCompiledBuyerContextInternal = internalMutation({
  args: {
    channel: buyerChannelValidator,
    userId: v.string(),
    message: v.string(),
    threadId: v.optional(v.id("assistantThreads")),
  },
  returns: compiledBuyerContextValidator,
  handler: async (ctx, args): Promise<any> =>
    buildCompiledBuyerContextPayload({
      ctx,
      channel: args.channel,
      userId: args.userId,
      message: args.message,
      threadId: args.threadId,
      persistCompiledCache: true,
    }),
});

export const promoteBuyerContextInternal = internalMutation({
  args: {
    fromUserId: v.string(),
    toUserId: v.string(),
  },
  returns: buyerContextPromotionResultValidator,
  handler: async (ctx, args) =>
    promoteBuyerContext({
      ctx,
      fromUserId: args.fromUserId,
      toUserId: args.toUserId,
    }),
});
