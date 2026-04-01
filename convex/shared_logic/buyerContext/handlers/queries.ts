import { v } from "convex/values";
import { internalQuery } from "../../../_generated/server";
import { buildCompiledBuyerContextPayload } from "../compiled";
import {
  buyerChannelStateRecordValidator,
  buyerChannelValidator,
  promptBudgetMetaValidator,
} from "../constants";
import { estimateTokenCount, toBuyerStateRecord } from "../helpers";
import { loadBuyerMemoryContext, loadBuyerSummaries } from "../storage";
import {
  buyerContextSnapshotValidator,
  compiledBuyerContextValidator,
} from "./contracts";

async function loadBuyerChannelStateRecord(args: {
  ctx: any;
  channel: "whatsapp" | "app" | "web";
  userId: string;
}) {
  const state = await args.ctx.db
    .query("buyerChannelStates")
    .withIndex("channel_userId", (q: any) =>
      q.eq("channel", args.channel).eq("userId", args.userId),
    )
    .first();

  return state ? toBuyerStateRecord(state as any) : null;
}

function buildPromptBudgetMeta(args: {
  contextText?: string;
  memoryText?: string;
  ragText?: string;
  historyText?: string;
  budgetCap?: number;
}) {
  const contextText = args.contextText ?? "";
  const memoryText = args.memoryText ?? "";
  const ragText = args.ragText ?? "";
  const historyText = args.historyText ?? "";

  return {
    contextTokens: estimateTokenCount(contextText),
    memoryTokens: estimateTokenCount(memoryText),
    ragTokens: estimateTokenCount(ragText),
    historyTokens: estimateTokenCount(historyText),
    totalContextTokens:
      estimateTokenCount(contextText) +
      estimateTokenCount(memoryText) +
      estimateTokenCount(ragText) +
      estimateTokenCount(historyText),
    budgetCap: args.budgetCap ?? 1_200,
    cacheHit: false,
    includedBlocks: ["context", "memory", "rag", "history"].filter((name) => {
      if (name === "context") return Boolean(contextText.trim());
      if (name === "memory") return Boolean(memoryText.trim());
      if (name === "rag") return Boolean(ragText.trim());
      return Boolean(historyText.trim());
    }),
    droppedBlocks: [],
  };
}

export const getBuyerChannelStateInternal = internalQuery({
  args: {
    channel: buyerChannelValidator,
    userId: v.string(),
  },
  returns: v.union(buyerChannelStateRecordValidator, v.null()),
  handler: async (ctx, args) =>
    loadBuyerChannelStateRecord({
      ctx,
      channel: args.channel,
      userId: args.userId,
    }),
});

export const getBuyerContextInternal = internalQuery({
  args: {
    channel: buyerChannelValidator,
    userId: v.string(),
  },
  returns: buyerContextSnapshotValidator,
  handler: async (ctx, args): Promise<any> => {
    const [state, memory, summaries] = await Promise.all([
      loadBuyerChannelStateRecord({
        ctx,
        channel: args.channel,
        userId: args.userId,
      }),
      loadBuyerMemoryContext(ctx, args.userId),
      loadBuyerSummaries(ctx, args.userId),
    ]);

    return {
      state,
      memory,
      summaries,
    };
  },
});

export const estimateBuyerPromptBudgetInternal = internalQuery({
  args: {
    contextText: v.optional(v.string()),
    memoryText: v.optional(v.string()),
    ragText: v.optional(v.string()),
    historyText: v.optional(v.string()),
    budgetCap: v.optional(v.number()),
  },
  returns: promptBudgetMetaValidator,
  handler: async (_ctx, args) => buildPromptBudgetMeta(args),
});

export const getCompiledBuyerContextReadOnlyInternal = internalQuery({
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
      persistCompiledCache: false,
    }),
});
