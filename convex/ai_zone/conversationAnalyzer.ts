/**
 * conversationAnalyzer.ts — Daily buyer conversation analyzer controller
 *
 * WHY:   Market intelligence should come from one durable batch pipeline instead of heavy per-turn live analysis.
 * WHAT:  Exposes internal Convex queries, mutations, and actions for noon-window conversation analysis.
 * HOW:   Claims draft rows in batches, loads transcripts, extracts normalized demand signals, and writes one daily summary per window.
 */
import { internalQuery, internalMutation, internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import { DEFAULT_CONVERSATION_ANALYZER_BATCH_SIZE } from "./conversationAnalyzer/constants";
import { buildConversationDailySummary } from "./conversationAnalyzer/aggregate";
import { extractConversationDemand } from "./conversationAnalyzer/extract";
import { getLatestCompletedConversationAnalyzerWindow } from "./conversationAnalyzer/time";

export const getThreadTranscriptForAnalysis = internalQuery({
  args: {
    threadId: v.id("assistantThreads"),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const thread = await ctx.db.get(args.threadId);
    if (!thread) return null;
    const messages = await ctx.db
      .query("assistantMessages")
      .withIndex("threadId_createdAt", (q) => q.eq("threadId", args.threadId))
      .collect();
    return {
      threadId: String(thread._id),
      userId: thread.userId,
      assistantKind: thread.assistantKind === "anan_main_public" ? "anan_main_public" : "default",
      messages: messages.map((message) => ({
        role: message.role,
        content: message.content,
        createdAt: message.createdAt,
      })),
    };
  },
});

/**
 * WHY:   Each noon run should update one durable run row instead of scattering run metadata across many patches.
 * WHAT:  Creates or refreshes the canonical daily run record for the computed noon window.
 * HOW:   Looks up the run by `runKey`, preserves creation time on reruns, and marks the run as `running`.
 */
export const upsertConversationAnalysisRun = internalMutation({
  args: {
    runKey: v.string(),
    windowStartMs: v.number(),
    windowEndMs: v.number(),
    timezone: v.string(),
    startedAt: v.number(),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("aiConversationAnalysisRuns")
      .withIndex("by_runKey", (q) => q.eq("runKey", args.runKey))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: "running",
        windowStartMs: args.windowStartMs,
        windowEndMs: args.windowEndMs,
        timezone: args.timezone,
        startedAt: existing.startedAt ?? args.startedAt,
        updatedAt: args.startedAt,
        failureReason: undefined,
      });
      return existing._id;
    }

    return ctx.db.insert("aiConversationAnalysisRuns", {
      runKey: args.runKey,
      windowStartMs: args.windowStartMs,
      windowEndMs: args.windowEndMs,
      timezone: args.timezone,
      status: "running",
      draftCount: 0,
      processingCount: 0,
      doneCount: 0,
      failedCount: 0,
      analyzedThreadCount: 0,
      startedAt: args.startedAt,
      createdAt: args.startedAt,
      updatedAt: args.startedAt,
    });
  },
});

/**
 * WHY:   The daily action needs to process drafts in bounded chunks so one large day does not create one giant in-memory batch.
 * WHAT:  Claims up to `batchSize` draft or failed analyzer rows for the requested run key.
 * HOW:   Reads eligible rows by indexed status, patches them to `processing`, increments attempt count, and returns the claimed ids.
 */
export const claimConversationAnalysisBatch = internalMutation({
  args: {
    runKey: v.string(),
    batchSize: v.number(),
    claimedAt: v.number(),
  },
  returns: v.array(
    v.object({
      analysisId: v.id("aiConversationAnalyses"),
      threadId: v.id("assistantThreads"),
    }),
  ),
  handler: async (ctx, args) => {
    const draftRows = await ctx.db
      .query("aiConversationAnalyses")
      .withIndex("by_runKey_status", (q) =>
        q.eq("runKey", args.runKey).eq("status", "draft"),
      )
      .take(args.batchSize);
    const remaining = Math.max(args.batchSize - draftRows.length, 0);
    const failedRows =
      remaining > 0
        ? await ctx.db
            .query("aiConversationAnalyses")
            .withIndex("by_runKey_status", (q) =>
              q.eq("runKey", args.runKey).eq("status", "failed"),
            )
            .take(remaining)
        : [];
    const claimed = [...draftRows, ...failedRows].slice(0, args.batchSize);

    for (const row of claimed) {
      await ctx.db.patch(row._id, {
        status: "processing",
        claimedAt: args.claimedAt,
        updatedAt: args.claimedAt,
        attemptCount: row.attemptCount + 1,
        failureReason: undefined,
      });
    }

    return claimed.map((row) => ({
      analysisId: row._id,
      threadId: row.threadId,
    }));
  },
});

/**
 * WHY:   Per-chat completion needs one write path so finished analyzer rows always store metrics and output consistently.
 * WHAT:  Marks the claimed row as done and stores the extracted transcript metrics plus demand output.
 * HOW:   Patches the existing analysis row in place after the action finishes extracting the chat signals.
 */
export const completeConversationAnalysis = internalMutation({
  args: {
    analysisId: v.id("aiConversationAnalyses"),
    processedAt: v.number(),
    messageCount: v.number(),
    firstMessageAt: v.number(),
    lastMessageAt: v.number(),
    output: v.any(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.analysisId, {
      status: "done",
      processedAt: args.processedAt,
      messageCount: args.messageCount,
      firstMessageAt: args.firstMessageAt,
      lastMessageAt: args.lastMessageAt,
      output: args.output,
      updatedAt: args.processedAt,
      failureReason: undefined,
    });
    return null;
  },
});

/**
 * WHY:   Failed chats must remain retryable without duplicating rows or hiding the last error.
 * WHAT:  Marks the claimed row as failed with the captured reason.
 * HOW:   Keeps the row in place so a later rerun can reclaim the same chat for the same noon window.
 */
export const failConversationAnalysis = internalMutation({
  args: {
    analysisId: v.id("aiConversationAnalyses"),
    processedAt: v.number(),
    failureReason: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.analysisId, {
      status: "failed",
      processedAt: args.processedAt,
      failureReason: args.failureReason,
      updatedAt: args.processedAt,
    });
    return null;
  },
});

/**
 * WHY:   The daily run record should always reflect the latest counts and aggregate summary for its noon window.
 * WHAT:  Recomputes run counts and the per-day summary from all analyzer rows belonging to the run key.
 * HOW:   Reads each status bucket by index, aggregates only completed outputs, and patches the canonical run row once.
 */
export const finalizeConversationAnalysisRun = internalMutation({
  args: {
    runKey: v.string(),
    completedAt: v.number(),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const [run, draftRows, processingRows, doneRows, failedRows] = await Promise.all([
      ctx.db
        .query("aiConversationAnalysisRuns")
        .withIndex("by_runKey", (q) => q.eq("runKey", args.runKey))
        .first(),
      ctx.db
        .query("aiConversationAnalyses")
        .withIndex("by_runKey_status", (q) =>
          q.eq("runKey", args.runKey).eq("status", "draft"),
        )
        .collect(),
      ctx.db
        .query("aiConversationAnalyses")
        .withIndex("by_runKey_status", (q) =>
          q.eq("runKey", args.runKey).eq("status", "processing"),
        )
        .collect(),
      ctx.db
        .query("aiConversationAnalyses")
        .withIndex("by_runKey_status", (q) =>
          q.eq("runKey", args.runKey).eq("status", "done"),
        )
        .collect(),
      ctx.db
        .query("aiConversationAnalyses")
        .withIndex("by_runKey_status", (q) =>
          q.eq("runKey", args.runKey).eq("status", "failed"),
        )
        .collect(),
    ]);

    if (!run) {
      throw new Error(`Conversation analyzer run not found for ${args.runKey}`);
    }

    const summary = buildConversationDailySummary(
      doneRows
        .map((row) => row.output)
        .filter((row): row is NonNullable<typeof row> => Boolean(row)),
    );

    const status =
      processingRows.length > 0 || draftRows.length > 0
        ? "running"
        : failedRows.length > 0
          ? "failed"
          : "done";

    await ctx.db.patch(run._id, {
      status,
      summary,
      draftCount: draftRows.length,
      processingCount: processingRows.length,
      doneCount: doneRows.length,
      failedCount: failedRows.length,
      analyzedThreadCount: doneRows.length,
      completedAt: args.completedAt,
      updatedAt: args.completedAt,
    });

    return {
      status,
      doneCount: doneRows.length,
      failedCount: failedRows.length,
      draftCount: draftRows.length,
      processingCount: processingRows.length,
      summary,
    };
  },
});

/**
 * WHY:   Catastrophic batch failures should still leave a clear run-level error on the canonical noon run row.
 * WHAT:  Marks the run itself as failed while preserving the already-written per-chat rows.
 * HOW:   Patches the run record by its stable run key with the captured action error.
 */
export const markConversationAnalysisRunFailed = internalMutation({
  args: {
    runKey: v.string(),
    completedAt: v.number(),
    failureReason: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const run = await ctx.db
      .query("aiConversationAnalysisRuns")
      .withIndex("by_runKey", (q) => q.eq("runKey", args.runKey))
      .first();
    if (!run) return null;
    await ctx.db.patch(run._id, {
      status: "failed",
      failureReason: args.failureReason,
      completedAt: args.completedAt,
      updatedAt: args.completedAt,
    });
    return null;
  },
});

/**
 * WHY:   The entire buyer-conversation analyzer should run from one daily cron entry rather than many live per-turn side effects.
 * WHAT:  Processes the most recent completed Riyadh-noon window in batches and writes the final daily summary.
 * HOW:   Upserts the run row, repeatedly claims drafts, analyzes each transcript, and finalizes the aggregated summary at the end.
 */
export const runDailyNoonConversationAnalyzer = internalAction({
  args: {
    runAtMs: v.optional(v.number()),
    batchSize: v.optional(v.number()),
  },
  returns: v.any(),
  handler: async (ctx, args): Promise<any> => {
    const startedAt = args.runAtMs ?? Date.now();
    const batchSize = Math.max(args.batchSize ?? DEFAULT_CONVERSATION_ANALYZER_BATCH_SIZE, 1);
    const window = getLatestCompletedConversationAnalyzerWindow(startedAt);
    const analyzerApi = internal.ai_zone.conversationAnalyzer as any;

    await ctx.runMutation(analyzerApi.upsertConversationAnalysisRun, {
      ...window,
      startedAt,
    });

    let processedCount = 0;
    let failedCount = 0;

    try {
      while (true) {
        const claimed = await ctx.runMutation(
          analyzerApi.claimConversationAnalysisBatch,
          {
            runKey: window.runKey,
            batchSize,
            claimedAt: Date.now(),
          },
        );

        if (!claimed.length) break;

        for (const item of claimed) {
          try {
            const transcript = await ctx.runQuery(
              analyzerApi.getThreadTranscriptForAnalysis,
              { threadId: item.threadId },
            );
            if (!transcript || !transcript.messages?.length) {
              throw new Error("ANALYZER_TRANSCRIPT_NOT_FOUND");
            }

            const output = extractConversationDemand(transcript);
            const firstMessageAt = transcript.messages[0]?.createdAt ?? startedAt;
            const lastMessageAt =
              transcript.messages[transcript.messages.length - 1]?.createdAt ??
              startedAt;

            await ctx.runMutation(
              analyzerApi.completeConversationAnalysis,
              {
                analysisId: item.analysisId,
                processedAt: Date.now(),
                messageCount: transcript.messages.length,
                firstMessageAt,
                lastMessageAt,
                output,
              },
            );
            processedCount += 1;
          } catch (error) {
            failedCount += 1;
            await ctx.runMutation(
              analyzerApi.failConversationAnalysis,
              {
                analysisId: item.analysisId,
                processedAt: Date.now(),
                failureReason:
                  error instanceof Error && error.message.trim()
                    ? error.message
                    : "ANALYZER_PROCESSING_FAILED",
              },
            );
          }
        }
      }

      const summary: any = await ctx.runMutation(
        analyzerApi.finalizeConversationAnalysisRun,
        {
          runKey: window.runKey,
          completedAt: Date.now(),
        },
      );

      return {
        runKey: window.runKey,
        processedCount,
        failedCount,
        ...summary,
      };
    } catch (error) {
      await ctx.runMutation(
        analyzerApi.markConversationAnalysisRunFailed,
        {
          runKey: window.runKey,
          completedAt: Date.now(),
          failureReason:
            error instanceof Error && error.message.trim()
              ? error.message
              : "ANALYZER_RUN_FAILED",
        },
      );
      throw error;
    }
  },
});
