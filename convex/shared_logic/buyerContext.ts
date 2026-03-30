import { internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import { buildCompiledBuyerContextPayload } from "./buyerContext/compiled";
import {
  BUYER_SUMMARY_KEYS,
  buyerChannelStateRecordValidator,
  buyerChannelStateValidator,
  buyerChannelValidator,
  buyerContextSummariesValidator,
  buyerQualificationValidator,
  knowledgeSnippetValidator,
  promptBudgetMetaValidator,
} from "./buyerContext/constants";
import { estimateTokenCount, toBuyerStateRecord } from "./buyerContext/helpers";
import { loadBuyerMemoryContext, loadBuyerSummaries, syncBuyerContextSummaries, upsertSummaryMemory } from "./buyerContext/storage";

export { buildCompiledBuyerContextPayload } from "./buyerContext/compiled";
export { buyerQualificationValidator, buyerChannelStateValidator } from "./buyerContext/constants";

/**
 * WHY:   Public and channel assistants need one stable state read path that is not tied to WhatsApp-specific internals.
 * WHAT:  Returns the persisted buyer state for one user + channel pair.
 * HOW:   Reads `buyerChannelStates` through the shared index and normalizes the stored row shape.
 */
export const getBuyerChannelStateInternal = internalQuery({
  args: {
    channel: buyerChannelValidator,
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
 * WHY:   Buyer-facing assistants must keep selected property, shown results, and qualification aligned after each turn.
 * WHAT:  Upserts the canonical buyer state row for one user + channel pair.
 * HOW:   Replaces the current row keyed by `channel + userId` while preserving the original creation timestamp.
 */
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
    };

    if (existing) {
      await ctx.db.patch(existing._id, record);
      const normalized = toBuyerStateRecord(record as any);
      await syncBuyerContextSummaries({
        ctx,
        channel: args.channel,
        userId: args.userId,
        threadId: args.threadId ? String(args.threadId) : undefined,
        state: {
          state: normalized.state,
          lastSearchQuery: normalized.lastSearchQuery,
          selectedPropertyId: normalized.selectedPropertyId ? String(normalized.selectedPropertyId) : undefined,
          lastResultPropertyIds: normalized.lastResultPropertyIds.map((id: any) => String(id)),
          qualification: normalized.qualification,
        },
      });
      return normalized;
    }

    await ctx.db.insert("buyerChannelStates", record as any);
    const normalized = toBuyerStateRecord(record as any);
    await syncBuyerContextSummaries({
      ctx,
      channel: args.channel,
      userId: args.userId,
      threadId: args.threadId ? String(args.threadId) : undefined,
      state: {
        state: normalized.state,
        lastSearchQuery: normalized.lastSearchQuery,
        selectedPropertyId: normalized.selectedPropertyId ? String(normalized.selectedPropertyId) : undefined,
        lastResultPropertyIds: normalized.lastResultPropertyIds.map((id: any) => String(id)),
        qualification: normalized.qualification,
      },
    });
    return normalized;
  },
});

/**
 * WHY:   Public assistants need state and memory together when deciding what to show next.
 * WHAT:  Returns normalized buyer state plus memory summary for the given channel user.
 * HOW:   Combines `buyerChannelStates` with active preference/constraint/interaction memory.
 */
export const getBuyerContextInternal = internalQuery({
  args: {
    channel: buyerChannelValidator,
    userId: v.string(),
  },
  returns: v.object({
    state: v.union(buyerChannelStateRecordValidator, v.null()),
    memory: v.object({
      summary: v.string(),
      preferences: v.array(v.any()),
      constraints: v.array(v.any()),
      recentInteractions: v.array(v.any()),
      lastSearchSummary: v.union(v.null(), v.any()),
    }),
    summaries: buyerContextSummariesValidator,
  }),
  handler: async (ctx, args): Promise<any> => {
    const [stateRow, memory, summaries] = await Promise.all([
      ctx.db
        .query("buyerChannelStates")
        .withIndex("channel_userId", (q) =>
          q.eq("channel", args.channel).eq("userId", args.userId),
        )
        .first(),
      loadBuyerMemoryContext(ctx, args.userId),
      loadBuyerSummaries(ctx, args.userId),
    ]);

    return {
      state: stateRow ? toBuyerStateRecord(stateRow as any) : null,
      memory,
      summaries,
    };
  },
});

export const upsertBuyerContextSummaryInternal = internalMutation({
  args: {
    userId: v.string(),
    threadId: v.optional(v.string()),
    summaryKey: v.union(
      v.literal(BUYER_SUMMARY_KEYS.buyerProfileSummary),
      v.literal(BUYER_SUMMARY_KEYS.activePropertySummary),
      v.literal(BUYER_SUMMARY_KEYS.searchJourneySummary),
      v.literal(BUYER_SUMMARY_KEYS.financeQualificationSummary),
    ),
    summary: v.string(),
    metadata: v.optional(v.any()),
  },
  returns: v.id("agentMemory"),
  handler: async (ctx, args) => {
    return upsertSummaryMemory({
      ctx,
      userId: args.userId,
      threadId: args.threadId,
      key: args.summaryKey,
      summary: args.summary,
      metadata: args.metadata as Record<string, unknown> | undefined,
    });
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
  handler: async (_ctx, args) => {
    return {
      contextTokens: estimateTokenCount(args.contextText ?? ""),
      memoryTokens: estimateTokenCount(args.memoryText ?? ""),
      ragTokens: estimateTokenCount(args.ragText ?? ""),
      historyTokens: estimateTokenCount(args.historyText ?? ""),
      totalContextTokens:
        estimateTokenCount(args.contextText ?? "") +
        estimateTokenCount(args.memoryText ?? "") +
        estimateTokenCount(args.ragText ?? "") +
        estimateTokenCount(args.historyText ?? ""),
      budgetCap: args.budgetCap ?? 1_200,
      cacheHit: false,
      includedBlocks: ["context", "memory", "rag", "history"].filter((name) => {
        if (name === "context") return Boolean(args.contextText?.trim());
        if (name === "memory") return Boolean(args.memoryText?.trim());
        if (name === "rag") return Boolean(args.ragText?.trim());
        return Boolean(args.historyText?.trim());
      }),
      droppedBlocks: [],
    };
  },
});

export const getCompiledBuyerContextInternal = internalMutation({
  args: {
    channel: buyerChannelValidator,
    userId: v.string(),
    message: v.string(),
    threadId: v.optional(v.id("assistantThreads")),
  },
  returns: v.object({
    state: v.union(buyerChannelStateRecordValidator, v.null()),
    memory: v.object({
      summary: v.string(),
      preferences: v.array(v.any()),
      constraints: v.array(v.any()),
      recentInteractions: v.array(v.any()),
      lastSearchSummary: v.union(v.null(), v.any()),
    }),
    summaries: buyerContextSummariesValidator,
    recentThreadRecap: v.array(v.string()),
    buyerSummarySnippets: v.array(v.string()),
    rawMemoryFallback: v.array(v.string()),
    companyKnowledgeSnippets: v.array(knowledgeSnippetValidator),
    alreadyShownPropertyIds: v.array(v.id("properties")),
    compiledPromptContext: v.string(),
    promptBudgetMeta: promptBudgetMetaValidator,
  }),
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

/**
 * WHY:   Assistant runtime bundles need buyer context in a single read path before orchestration starts.
 * WHAT:  Returns the compiled buyer context payload without mutating summary/cache rows.
 * HOW:   Reuses the compiled-context builder in read-only mode so actions can bundle state resolution into one query.
 */
export const getCompiledBuyerContextReadOnlyInternal = internalQuery({
  args: {
    channel: buyerChannelValidator,
    userId: v.string(),
    message: v.string(),
    threadId: v.optional(v.id("assistantThreads")),
  },
  returns: v.object({
    state: v.union(buyerChannelStateRecordValidator, v.null()),
    memory: v.object({
      summary: v.string(),
      preferences: v.array(v.any()),
      constraints: v.array(v.any()),
      recentInteractions: v.array(v.any()),
      lastSearchSummary: v.union(v.null(), v.any()),
    }),
    summaries: buyerContextSummariesValidator,
    recentThreadRecap: v.array(v.string()),
    buyerSummarySnippets: v.array(v.string()),
    rawMemoryFallback: v.array(v.string()),
    companyKnowledgeSnippets: v.array(knowledgeSnippetValidator),
    alreadyShownPropertyIds: v.array(v.id("properties")),
    compiledPromptContext: v.string(),
    promptBudgetMeta: promptBudgetMetaValidator,
  }),
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

/**
 * WHY:   Guest public conversations should become the signed-in buyer's durable history instead of resetting after auth.
 * WHAT:  Reassigns public assistant threads, buyer state, and memory from a guest owner id to an authenticated owner id.
 * HOW:   Patches rows in place so thread ids remain stable and reopened conversations keep working after promotion.
 */
export const promoteBuyerContextInternal = internalMutation({
  args: {
    fromUserId: v.string(),
    toUserId: v.string(),
  },
  returns: v.object({
    movedThreadIds: v.array(v.id("assistantThreads")),
    activeThreadId: v.optional(v.id("assistantThreads")),
  }),
  handler: async (ctx, args) => {
    if (args.fromUserId === args.toUserId) {
      const activeState = await ctx.db
        .query("buyerChannelStates")
        .withIndex("channel_userId", (q) =>
          q.eq("channel", "web").eq("userId", args.toUserId),
        )
        .first();
      return {
        movedThreadIds: [],
        activeThreadId: activeState?.threadId,
      };
    }

    const publicThreads = await ctx.db
      .query("assistantThreads")
      .withIndex("userId", (q) => q.eq("userId", args.fromUserId))
      .collect();

    const movedThreadIds: Array<any> = [];
    for (const thread of publicThreads) {
      if (thread.assistantKind !== "anan_main_public") continue;
      await ctx.db.patch(thread._id, {
        userId: args.toUserId,
      });
      movedThreadIds.push(thread._id);
    }

    const guestState = await ctx.db
      .query("buyerChannelStates")
      .withIndex("channel_userId", (q) =>
        q.eq("channel", "web").eq("userId", args.fromUserId),
      )
      .first();

    const existingAuthState = await ctx.db
      .query("buyerChannelStates")
      .withIndex("channel_userId", (q) =>
        q.eq("channel", "web").eq("userId", args.toUserId),
      )
      .first();

    let activeThreadId = guestState?.threadId ?? existingAuthState?.threadId;

    if (guestState) {
      const nextState = {
        userId: args.toUserId,
        threadId: guestState.threadId,
        state: guestState.state,
        selectedPropertyId:
          guestState.selectedPropertyId ?? existingAuthState?.selectedPropertyId,
        lastResultPropertyIds:
          guestState.lastResultPropertyIds.length > 0
            ? guestState.lastResultPropertyIds
            : (existingAuthState?.lastResultPropertyIds ?? []),
        lastSearchQuery:
          guestState.lastSearchQuery ?? existingAuthState?.lastSearchQuery,
        qualification:
          guestState.qualification ?? existingAuthState?.qualification,
        updatedAt: Date.now(),
      };

      if (existingAuthState) {
        await ctx.db.patch(existingAuthState._id, nextState as any);
      } else {
        await ctx.db.insert("buyerChannelStates", {
          channel: "web",
          ...nextState,
          createdAt: guestState.createdAt,
        } as any);
      }

      await ctx.db.delete(guestState._id);
      activeThreadId = guestState.threadId ?? activeThreadId;
    }

    const guestMemories = await ctx.db
      .query("agentMemory")
      .withIndex("userId", (q) => q.eq("userId", args.fromUserId))
      .collect();

    for (const memory of guestMemories) {
      const duplicate = await ctx.db
        .query("agentMemory")
        .withIndex("userId_and_key", (q) =>
          q.eq("userId", args.toUserId).eq("key", memory.key),
        )
        .first();

      if (duplicate && duplicate.memoryType === memory.memoryType) {
        await ctx.db.patch(duplicate._id, {
          value: memory.value,
          confidence: Math.max(
            duplicate.confidence ?? 0,
            memory.confidence ?? 0,
          ),
          expiresAt: memory.expiresAt,
          metadata: memory.metadata,
          threadId: memory.threadId ?? duplicate.threadId,
          source: memory.source ?? duplicate.source,
        });
        await ctx.db.delete(memory._id);
        continue;
      }

      await ctx.db.patch(memory._id, {
        userId: args.toUserId,
      });
    }

    const guestSearchLogs = await ctx.db
      .query("searchLogs")
      .withIndex("userId", (q) => q.eq("userId", args.fromUserId))
      .collect();
    for (const log of guestSearchLogs) {
      await ctx.db.patch(log._id, { userId: args.toUserId });
    }

    const guestResearch = await ctx.db
      .query("knowledgeResearch")
      .withIndex("by_userId_and_createdAt", (q) => q.eq("userId", args.fromUserId))
      .collect();
    for (const row of guestResearch) {
      await ctx.db.patch(row._id, { userId: args.toUserId });
    }

    return {
      movedThreadIds,
      activeThreadId,
    };
  },
});
