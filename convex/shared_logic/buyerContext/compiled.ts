import type { Id } from "../../_generated/dataModel";
import { BUYER_CONTEXT_TOKEN_BUDGET, KNOWLEDGE_SNIPPET_CAP, THREAD_RECAP_LINE_CAP, getCompiledContextKey } from "./constants";
import { estimatePromptBudget, inferBuyerIntent, selectBuyerSummarySnippets, selectRawMemoryFallback, serializeForFingerprint, toBuyerStateRecord } from "./helpers";
import { buildBuyerContextSummariesSnapshot, loadBuyerMemoryContext, loadBuyerSummaries, loadKnowledgeSnippets, loadRecentThreadRecap, readSummaryValue, syncBuyerContextSummaries, upsertSummaryMemory } from "./storage";
import type { BuyerChannel } from "./types";

export async function buildCompiledBuyerContextPayload(args: {
  ctx: any;
  channel: BuyerChannel;
  userId: string;
  message: string;
  threadId?: Id<"assistantThreads">;
  persistCompiledCache: boolean;
}) {
  const [stateRow, memory] = await Promise.all([
    args.ctx.db
      .query("buyerChannelStates")
      .withIndex("channel_userId", (q: any) =>
        q.eq("channel", args.channel).eq("userId", args.userId),
      )
      .first(),
    loadBuyerMemoryContext(args.ctx, args.userId),
  ]);

  const state = stateRow ? toBuyerStateRecord(stateRow as any) : null;
  const threadId = String(args.threadId ?? state?.threadId ?? "");
  const effectiveState = state
    ? {
        state: state.state,
        lastSearchQuery: state.lastSearchQuery,
        selectedPropertyId: state.selectedPropertyId ? String(state.selectedPropertyId) : undefined,
        lastResultPropertyIds: state.lastResultPropertyIds.map((id: any) => String(id)),
        qualification: state.qualification,
      }
    : null;

  const persistedSummaries = await loadBuyerSummaries(args.ctx, args.userId);
  const hasPersistedSummaries =
    Boolean(persistedSummaries.buyerProfileSummary) ||
    Boolean(persistedSummaries.activePropertySummary) ||
    Boolean(persistedSummaries.searchJourneySummary) ||
    Boolean(persistedSummaries.financeQualificationSummary);

  const summaries = hasPersistedSummaries
    ? persistedSummaries
    : args.persistCompiledCache
      ? await syncBuyerContextSummaries({
          ctx: args.ctx,
          channel: args.channel,
          userId: args.userId,
          threadId: threadId || undefined,
          state: effectiveState ?? {
            state: "idle",
            lastResultPropertyIds: [],
          },
        })
      : await buildBuyerContextSummariesSnapshot({
          ctx: args.ctx,
          channel: args.channel,
          userId: args.userId,
          state: effectiveState ?? {
            state: "idle",
            lastResultPropertyIds: [],
          },
        });

  const intent = inferBuyerIntent(args.message);
  const recentThreadRecap = await loadRecentThreadRecap({
    ctx: args.ctx,
    threadId: threadId || undefined,
    lineCap: THREAD_RECAP_LINE_CAP,
  });
  const buyerSummarySnippets = selectBuyerSummarySnippets({
    query: args.message,
    summaries,
    intent,
  });
  const rawMemoryFallback = selectRawMemoryFallback({
    query: args.message,
    memory,
  });
  const companyKnowledgeSnippets = await loadKnowledgeSnippets({
    ctx: args.ctx,
    query: args.message,
    limit: KNOWLEDGE_SNIPPET_CAP,
  });

  const namedBlocks = [
    {
      name: "buyer_profile",
      text: summaries.buyerProfileSummary ?? "",
      bucket: "context" as const,
      priority: intent === "search" ? 1 : 3,
    },
    {
      name: "active_property",
      text: summaries.activePropertySummary ?? "",
      bucket: "context" as const,
      priority: intent === "property" || intent === "finance" || intent === "handoff" ? 1 : 4,
    },
    {
      name: "search_journey",
      text: summaries.searchJourneySummary ?? "",
      bucket: "context" as const,
      priority: intent === "search" ? 0 : 3,
    },
    {
      name: "finance_qualification",
      text: summaries.financeQualificationSummary ?? "",
      bucket: "memory" as const,
      priority: intent === "finance" || intent === "handoff" ? 1 : 5,
    },
    {
      name: "memory_summary",
      text: memory.summary,
      bucket: "memory" as const,
      priority: 5,
    },
    {
      name: "raw_memory_fallback",
      text: rawMemoryFallback.join("\n"),
      bucket: "memory" as const,
      priority: 6,
    },
    {
      name: "thread_recap",
      text: recentThreadRecap.join("\n"),
      bucket: "history" as const,
      priority: 2,
    },
    {
      name: "buyer_summary_rag",
      text: buyerSummarySnippets.join("\n"),
      bucket: "rag" as const,
      priority: 2,
    },
    {
      name: "company_knowledge_rag",
      text: companyKnowledgeSnippets
        .map((snippet: { title: string; category?: string; excerpt: string }) =>
          `- ${snippet.title}${snippet.category ? ` (${snippet.category})` : ""}: ${snippet.excerpt}`,
        )
        .join("\n"),
      bucket: "rag" as const,
      priority: intent === "finance" ? 4 : 3,
    },
    {
      name: "shown_property_ids",
      text: state?.lastResultPropertyIds?.length
        ? `Already shown property ids: ${state.lastResultPropertyIds.join(", ")}. Prefer fresh options unless the user explicitly asks to revisit older listings.`
        : "",
      bucket: "context" as const,
      priority: intent === "search" ? 1 : 5,
    },
  ];

  const fingerprint = serializeForFingerprint({
    message: args.message.toLowerCase(),
    intent,
    threadId,
    state: effectiveState,
    memorySummary: memory.summary,
    summaries,
    recap: recentThreadRecap,
    knowledge: companyKnowledgeSnippets,
  });

  const cacheKey = getCompiledContextKey(args.channel, threadId || undefined);
  const cachedCompilation = await readSummaryValue(args.ctx, args.userId, cacheKey);
  if (
    cachedCompilation?.metadata &&
    typeof cachedCompilation.metadata === "object" &&
    (cachedCompilation.metadata as Record<string, unknown>).fingerprint === fingerprint
  ) {
    try {
      const parsed = JSON.parse(cachedCompilation.value) as {
        compiledPromptContext: string;
        promptBudgetMeta: ReturnType<typeof estimatePromptBudget>;
      };
      return {
        state,
        memory,
        summaries,
        recentThreadRecap,
        buyerSummarySnippets,
        rawMemoryFallback,
        companyKnowledgeSnippets,
        alreadyShownPropertyIds: state?.lastResultPropertyIds ?? [],
        compiledPromptContext: parsed.compiledPromptContext,
        promptBudgetMeta: {
          ...parsed.promptBudgetMeta,
          cacheHit: true,
        },
      };
    } catch {
      // Ignore malformed cache entries and rebuild below.
    }
  }

  const promptBudgetMeta = estimatePromptBudget({
    blocks: namedBlocks,
    budgetCap: BUYER_CONTEXT_TOKEN_BUDGET,
    cacheHit: false,
  });

  const includedText = namedBlocks
    .filter((block) => promptBudgetMeta.includedBlocks.includes(block.name))
    .map((block) => `[${block.name}]\n${block.text}`)
    .join("\n\n");

  const compiledPromptContext = includedText
    ? `[Buyer Context Compiler]\nIntent: ${intent}\nChannel: ${args.channel}\n\n${includedText}`
    : `[Buyer Context Compiler]\nIntent: ${intent}\nChannel: ${args.channel}`;

  if (args.persistCompiledCache) {
    await upsertSummaryMemory({
      ctx: args.ctx,
      userId: args.userId,
      threadId: threadId || undefined,
      key: cacheKey,
      summary: JSON.stringify({
        compiledPromptContext,
        promptBudgetMeta,
      }),
      metadata: {
        fingerprint,
        cacheType: "compiled_context",
        channel: args.channel,
      },
    });
  }

  return {
    state,
    memory,
    summaries,
    recentThreadRecap,
    buyerSummarySnippets,
    rawMemoryFallback,
    companyKnowledgeSnippets,
    alreadyShownPropertyIds: state?.lastResultPropertyIds ?? [],
    compiledPromptContext,
    promptBudgetMeta,
  };
}
