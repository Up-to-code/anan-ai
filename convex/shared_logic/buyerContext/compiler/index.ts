import type { Id } from "../../../_generated/dataModel";
import { getCompiledContextKey } from "../constants";
import { upsertSummaryMemory } from "../storage";
import {
  buildBuyerCompilationFingerprint,
  buildBuyerPromptBlocks,
  buildEmptyBuyerMemoryContext,
  buildEmptyBuyerSummaries,
  buildEffectiveBuyerStateSnapshot,
  compileBuyerPromptContext,
  loadBuyerStateAndMemory,
  loadCompiledBuyerContextIngredients,
  readCompiledBuyerContextCache,
  resolveBuyerSummaries,
} from "./shared";
import type { BuyerChannel } from "../types";

export async function buildCompiledBuyerContextPayload(args: {
  ctx: any;
  channel: BuyerChannel;
  userId: string;
  message: string;
  threadId?: Id<"assistantThreads">;
  persistCompiledCache: boolean;
  startFresh?: boolean;
}) {
  const shouldBypassPersistedContext = args.startFresh === true;
  const { state, memory } = shouldBypassPersistedContext
    ? {
        state: null,
        memory: buildEmptyBuyerMemoryContext(),
      }
    : await loadBuyerStateAndMemory({
        ctx: args.ctx,
        channel: args.channel,
        userId: args.userId,
      });
  const threadId = String(args.threadId ?? state?.threadId ?? "");
  const effectiveState = buildEffectiveBuyerStateSnapshot(state);

  const summaries = shouldBypassPersistedContext
    ? buildEmptyBuyerSummaries()
    : await resolveBuyerSummaries({
        ctx: args.ctx,
        channel: args.channel,
        userId: args.userId,
        threadId: threadId || undefined,
        effectiveState,
        persistCompiledCache: args.persistCompiledCache,
      });
  const {
    intent,
    recentThreadRecap,
    recentPropertyRefIds,
    buyerSummarySnippets,
    rawMemoryFallback,
    companyKnowledgeSnippets,
  } = await loadCompiledBuyerContextIngredients({
    ctx: args.ctx,
    message: args.message,
    state,
    memory,
    summaries,
  });

  const namedBlocks = buildBuyerPromptBlocks({
    intent,
    state,
    memory,
    summaries,
    recentThreadRecap,
    recentPropertyRefIds,
    buyerSummarySnippets,
    rawMemoryFallback,
    companyKnowledgeSnippets,
  });

  const fingerprint = buildBuyerCompilationFingerprint({
    message: args.message,
    intent,
    threadId,
    effectiveState,
    memory,
    summaries,
    recentThreadRecap,
    recentPropertyRefIds,
    companyKnowledgeSnippets,
  });

  const cacheKey = getCompiledContextKey(args.channel, threadId || undefined);
  const cachedCompilation = await readCompiledBuyerContextCache({
    ctx: args.ctx,
    userId: args.userId,
    cacheKey,
    fingerprint,
  });
  if (cachedCompilation) {
    return {
      state,
      memory,
      summaries,
      recentThreadRecap,
      recentPropertyRefIds,
      buyerSummarySnippets,
      rawMemoryFallback,
      companyKnowledgeSnippets,
      alreadyShownPropertyIds: state?.lastResultPropertyIds ?? [],
      activeComparisonPropertyIds: state?.comparisonPropertyIds ?? [],
      compiledPromptContext: cachedCompilation.compiledPromptContext,
      promptBudgetMeta: {
        ...cachedCompilation.promptBudgetMeta,
        cacheHit: true,
      },
    };
  }

  const { compiledPromptContext, promptBudgetMeta } = compileBuyerPromptContext({
    intent,
    channel: args.channel,
    namedBlocks,
  });

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
    recentPropertyRefIds,
    buyerSummarySnippets,
    rawMemoryFallback,
    companyKnowledgeSnippets,
    alreadyShownPropertyIds: state?.lastResultPropertyIds ?? [],
    activeComparisonPropertyIds: state?.comparisonPropertyIds ?? [],
    compiledPromptContext,
    promptBudgetMeta,
  };
}
