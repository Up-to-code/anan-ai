import {
  BUYER_CONTEXT_TOKEN_BUDGET,
  KNOWLEDGE_SNIPPET_CAP,
  THREAD_RECAP_LINE_CAP,
} from "../constants";
import {
  estimatePromptBudget,
  inferBuyerIntent,
  selectBuyerSummarySnippets,
  selectRawMemoryFallback,
  serializeForFingerprint,
  toBuyerStateRecord,
} from "../prompt";
import {
  buildBuyerContextSummariesSnapshot,
  loadBuyerMemoryContext,
  loadBuyerSummaries,
  loadKnowledgeSnippets,
  loadRecentThreadRecap,
  readSummaryValue,
  syncBuyerContextSummaries,
} from "../storage";
import type {
  BuyerChannel,
  BuyerMemoryContext,
  BuyerStateSnapshot,
  BuyerSummaryCollection,
  KnowledgeSnippet,
} from "../types";
import { buildPersonaContextBlock } from "../../memory/persona";

type PromptBlock = {
  name: string;
  text: string;
  bucket: "context" | "memory" | "rag" | "history";
  priority: number;
};

type PromptBudgetMeta = ReturnType<typeof estimatePromptBudget>;

type CompiledBuyerCachePayload = {
  compiledPromptContext: string;
  promptBudgetMeta: PromptBudgetMeta;
};

export async function loadBuyerStateAndMemory(args: {
  ctx: any;
  channel: BuyerChannel;
  userId: string;
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
  return { state, memory };
}

export function buildEmptyBuyerMemoryContext(): BuyerMemoryContext {
  return {
    summary: "",
    preferences: [],
    constraints: [],
    recentInteractions: [],
    lastSearchSummary: null,
  };
}

export function buildEmptyBuyerSummaries(): BuyerSummaryCollection {
  return {};
}

export function buildEffectiveBuyerStateSnapshot(state: any): BuyerStateSnapshot | null {
  return state
    ? {
        state: state.state,
        lastSearchQuery: state.lastSearchQuery,
        selectedPropertyId: state.selectedPropertyId
          ? String(state.selectedPropertyId)
          : undefined,
        lastResultPropertyIds: state.lastResultPropertyIds.map((id: any) => String(id)),
        comparisonPropertyIds: state.comparisonPropertyIds?.map((id: any) => String(id)),
        lastComparisonArtifactId: state.lastComparisonArtifactId
          ? String(state.lastComparisonArtifactId)
          : undefined,
        qualification: state.qualification,
      }
    : null;
}

export async function resolveBuyerSummaries(args: {
  ctx: any;
  channel: BuyerChannel;
  userId: string;
  threadId?: string;
  effectiveState: BuyerStateSnapshot | null;
  persistCompiledCache: boolean;
}) {
  const persistedSummaries = await loadBuyerSummaries(args.ctx, args.userId);
  const hasPersistedSummaries =
    Boolean(persistedSummaries.buyerProfileSummary) ||
    Boolean(persistedSummaries.activePropertySummary) ||
    Boolean(persistedSummaries.searchJourneySummary) ||
    Boolean(persistedSummaries.financeQualificationSummary);

  if (hasPersistedSummaries) {
    return persistedSummaries;
  }

  const fallbackState = args.effectiveState ?? {
    state: "idle" as const,
    lastResultPropertyIds: [],
  };

  if (args.persistCompiledCache) {
    return syncBuyerContextSummaries({
      ctx: args.ctx,
      channel: args.channel,
      userId: args.userId,
      threadId: args.threadId,
      state: fallbackState,
    });
  }

  return buildBuyerContextSummariesSnapshot({
    ctx: args.ctx,
    channel: args.channel,
    userId: args.userId,
    state: fallbackState,
  });
}

export async function loadCompiledBuyerContextIngredients(args: {
  ctx: any;
  message: string;
  state: any;
  memory: BuyerMemoryContext;
  summaries: BuyerSummaryCollection;
}) {
  const intent = inferBuyerIntent(args.message);
  const recentThreadRecap = await loadRecentThreadRecap({
    ctx: args.ctx,
    threadId: args.state?.threadId ? String(args.state.threadId) : undefined,
    lineCap: THREAD_RECAP_LINE_CAP,
  });
  const recentPropertyRefIds = args.state?.threadId
    ? await args.ctx.db
        .query("buyerThreadResourceRefs")
        .withIndex("threadId_createdAt", (q: any) => q.eq("threadId", args.state.threadId))
        .order("desc")
        .take(8)
        .then((rows: Array<{ resourceId: string }>) => {
          const deduped = new Set<string>();
          const propertyIds: string[] = [];
          for (const row of rows) {
            const key = String(row.resourceId);
            if (deduped.has(key)) continue;
            deduped.add(key);
            propertyIds.push(key);
          }
          return propertyIds;
        })
    : [];
  const buyerSummarySnippets = selectBuyerSummarySnippets({
    query: args.message,
    summaries: args.summaries,
    intent,
  });
  const rawMemoryFallback = selectRawMemoryFallback({
    query: args.message,
    memory: args.memory,
  });
  const companyKnowledgeSnippets = await loadKnowledgeSnippets({
    ctx: args.ctx,
    query: args.message,
    limit: KNOWLEDGE_SNIPPET_CAP,
  });

  return {
    intent,
    recentThreadRecap,
    recentPropertyRefIds,
    buyerSummarySnippets,
    rawMemoryFallback,
    companyKnowledgeSnippets,
  };
}

export function buildBuyerPromptBlocks(args: {
  intent: "search" | "property" | "finance" | "handoff";
  state: any;
  memory: BuyerMemoryContext;
  summaries: BuyerSummaryCollection;
  recentThreadRecap: string[];
  recentPropertyRefIds: string[];
  buyerSummarySnippets: string[];
  rawMemoryFallback: string[];
  companyKnowledgeSnippets: KnowledgeSnippet[];
}): PromptBlock[] {
  return [
    {
      name: "buyer_profile",
      text: args.summaries.buyerProfileSummary ?? "",
      bucket: "context",
      priority: args.intent === "search" ? 1 : 3,
    },
    {
      name: "active_property",
      text: args.summaries.activePropertySummary ?? "",
      bucket: "context",
      priority:
        args.intent === "property" || args.intent === "finance" || args.intent === "handoff"
          ? 1
          : 4,
    },
    {
      name: "search_journey",
      text: args.summaries.searchJourneySummary ?? "",
      bucket: "context",
      priority: args.intent === "search" ? 0 : 3,
    },
    {
      name: "finance_qualification",
      text: args.summaries.financeQualificationSummary ?? "",
      bucket: "memory",
      priority: args.intent === "finance" || args.intent === "handoff" ? 1 : 5,
    },
    {
      name: "memory_summary",
      text: args.memory.summary,
      bucket: "memory",
      priority: 5,
    },
    {
      name: "persona_context",
      text: buildPersonaContextBlock(args.memory),
      bucket: "memory",
      priority: 4,
    },
    {
      name: "raw_memory_fallback",
      text: args.rawMemoryFallback.join("\n"),
      bucket: "memory",
      priority: 6,
    },
    {
      name: "thread_recap",
      text: args.recentThreadRecap.join("\n"),
      bucket: "history",
      priority: 2,
    },
    {
      name: "buyer_summary_rag",
      text: args.buyerSummarySnippets.join("\n"),
      bucket: "rag",
      priority: 2,
    },
    {
      name: "company_knowledge_rag",
      text: args.companyKnowledgeSnippets
        .map((snippet) =>
          `- ${snippet.title}${snippet.category ? ` (${snippet.category})` : ""}: ${snippet.excerpt}`,
        )
        .join("\n"),
      bucket: "rag",
      priority: args.intent === "finance" ? 4 : 3,
    },
    {
      name: "shown_property_ids",
      text: args.state?.lastResultPropertyIds?.length
        ? `Already shown property ids: ${args.state.lastResultPropertyIds.join(", ")}. Prefer fresh options unless the user explicitly asks to revisit older listings.`
        : "",
      bucket: "context",
      priority: args.intent === "search" ? 1 : 5,
    },
    {
      name: "recent_property_refs",
      text: args.recentPropertyRefIds.length
        ? `Recent property refs: ${args.recentPropertyRefIds.join(", ")}. Use these ids to ground shortlist follow-ups and comparisons without replaying full UI payloads.`
        : "",
      bucket: "context",
      priority: args.intent === "property" ? 1 : 4,
    },
    {
      name: "active_compare_set",
      text: args.state?.comparisonPropertyIds?.length
        ? `Active comparison property ids: ${args.state.comparisonPropertyIds.join(", ")}. Reuse this set only when the user is clearly continuing the same comparison.`
        : "",
      bucket: "context",
      priority: args.intent === "property" ? 2 : 6,
    },
  ];
}

export function buildBuyerCompilationFingerprint(args: {
  message: string;
  intent: "search" | "property" | "finance" | "handoff";
  threadId: string;
  effectiveState: BuyerStateSnapshot | null;
  memory: BuyerMemoryContext;
  summaries: BuyerSummaryCollection;
  recentThreadRecap: string[];
  recentPropertyRefIds: string[];
  companyKnowledgeSnippets: KnowledgeSnippet[];
}) {
  return serializeForFingerprint({
    message: args.message.toLowerCase(),
    intent: args.intent,
    threadId: args.threadId,
    state: args.effectiveState,
    memorySummary: args.memory.summary,
    personaContext: buildPersonaContextBlock(args.memory),
    summaries: args.summaries,
    recap: args.recentThreadRecap,
    recentPropertyRefIds: args.recentPropertyRefIds,
    knowledge: args.companyKnowledgeSnippets,
  });
}

export async function readCompiledBuyerContextCache(args: {
  ctx: any;
  userId: string;
  cacheKey: string;
  fingerprint: string;
}) {
  const cachedCompilation = await readSummaryValue(args.ctx, args.userId, args.cacheKey);
  if (
    !cachedCompilation?.metadata ||
    typeof cachedCompilation.metadata !== "object" ||
    (cachedCompilation.metadata as Record<string, unknown>).fingerprint !== args.fingerprint
  ) {
    return null;
  }

  try {
    return JSON.parse(cachedCompilation.value) as CompiledBuyerCachePayload;
  } catch {
    return null;
  }
}

export function compileBuyerPromptContext(args: {
  intent: "search" | "property" | "finance" | "handoff";
  channel: BuyerChannel;
  namedBlocks: PromptBlock[];
}) {
  const promptBudgetMeta = estimatePromptBudget({
    blocks: args.namedBlocks,
    budgetCap: BUYER_CONTEXT_TOKEN_BUDGET,
    cacheHit: false,
  });

  const includedText = args.namedBlocks
    .filter((block) => promptBudgetMeta.includedBlocks.includes(block.name))
    .map((block) => `[${block.name}]\n${block.text}`)
    .join("\n\n");

  const compiledPromptContext = includedText
    ? `[Buyer Context Compiler]\nIntent: ${args.intent}\nChannel: ${args.channel}\n\n${includedText}`
    : `[Buyer Context Compiler]\nIntent: ${args.intent}\nChannel: ${args.channel}`;

  return { compiledPromptContext, promptBudgetMeta };
}
