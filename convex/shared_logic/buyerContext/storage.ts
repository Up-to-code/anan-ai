import { buildMemorySummary, type LastSearchSummary } from "../memory/repository/shared";
import { BUYER_SUMMARY_KEYS, KNOWLEDGE_SNIPPET_CAP, THREAD_RECAP_LINE_CAP } from "./constants";
import {
  normalizeTerms,
  scoreText,
  summarizeActiveProperty,
  summarizeBuyerProfile,
  summarizeQualification,
  summarizeSearchJourney,
} from "./helpers";
import type { BuyerChannel, BuyerMemoryContext, BuyerStateSnapshot } from "./types";

export async function buildBuyerContextSummariesSnapshot(args: {
  ctx: any;
  channel: BuyerChannel;
  userId: string;
  state: BuyerStateSnapshot;
}) {
  const memory = await loadBuyerMemoryContext(args.ctx, args.userId);
  const selectedProperty = args.state.selectedPropertyId
    ? await args.ctx.db.get(args.state.selectedPropertyId)
    : null;

  return {
    buyerProfileSummary: summarizeBuyerProfile({
      state: {
        lastSearchQuery: args.state.lastSearchQuery,
        qualification: args.state.qualification,
      },
      memory,
    }),
    activePropertySummary: summarizeActiveProperty(selectedProperty),
    searchJourneySummary: summarizeSearchJourney({
      state: args.state,
      lastSearchSummary: memory.lastSearchSummary,
    }),
    financeQualificationSummary: summarizeQualification(args.state.qualification),
  };
}

export async function upsertSummaryMemory(args: {
  ctx: any;
  userId: string;
  threadId?: string;
  key: string;
  summary: string;
  metadata?: Record<string, unknown>;
}) {
  const existing = await args.ctx.db
    .query("agentMemory")
    .withIndex("userId_and_key", (q: any) =>
      q.eq("userId", args.userId).eq("key", args.key),
    )
    .first();

  const nextValue = {
    userId: args.userId,
    threadId: args.threadId,
    memoryType: "fact" as const,
    key: args.key,
    value: args.summary,
    confidence: 0.92,
    source: "buyer_context_compiler",
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30,
    metadata: args.metadata,
  };

  if (existing) {
    await args.ctx.db.patch(existing._id, nextValue);
    return existing._id;
  }

  return args.ctx.db.insert("agentMemory", nextValue);
}

export async function readSummaryValue(ctx: any, userId: string, key: string) {
  const record = await ctx.db
    .query("agentMemory")
    .withIndex("userId_and_key", (q: any) => q.eq("userId", userId).eq("key", key))
    .first();

  if (!record || (record.expiresAt && record.expiresAt <= Date.now())) {
    return null;
  }

  return record;
}

export async function loadBuyerSummaries(ctx: any, userId: string) {
  const [buyerProfileSummary, activePropertySummary, searchJourneySummary, financeQualificationSummary] =
    await Promise.all([
      readSummaryValue(ctx, userId, BUYER_SUMMARY_KEYS.buyerProfileSummary),
      readSummaryValue(ctx, userId, BUYER_SUMMARY_KEYS.activePropertySummary),
      readSummaryValue(ctx, userId, BUYER_SUMMARY_KEYS.searchJourneySummary),
      readSummaryValue(ctx, userId, BUYER_SUMMARY_KEYS.financeQualificationSummary),
    ]);

  return {
    buyerProfileSummary: buyerProfileSummary?.value,
    activePropertySummary: activePropertySummary?.value,
    searchJourneySummary: searchJourneySummary?.value,
    financeQualificationSummary: financeQualificationSummary?.value,
  };
}

export async function loadRecentThreadRecap(args: {
  ctx: any;
  threadId?: string;
  lineCap?: number;
}) {
  if (!args.threadId) return [];

  const cap = Math.max(args.lineCap ?? THREAD_RECAP_LINE_CAP, 1);
  const messages = await args.ctx.db
    .query("assistantMessages")
    .withIndex("threadId", (q: any) => q.eq("threadId", args.threadId))
    .order("desc")
    .take(cap);

  return messages
    .reverse()
    .map((message: any) => {
      const label = message.role === "assistant" ? "Assistant" : "User";
      return `${label}: ${String(message.content ?? "").replace(/\s+/g, " ").trim()}`;
    });
}

export async function loadKnowledgeSnippets(args: {
  ctx: any;
  query: string;
  limit: number;
}) {
  const terms = normalizeTerms(args.query);
  const pages = await args.ctx.db.query("knowledgePages").take(50);
  return pages
    .map((page: any) => ({
      title: page.title,
      category: page.category,
      excerpt: String(page.content ?? "").slice(0, 280),
      score: scoreText(`${page.title}\n${page.category ?? ""}\n${page.content ?? ""}`, terms),
    }))
    .filter((row: { score: number }) => row.score > 0)
    .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
    .slice(0, Math.max(1, Math.min(args.limit, KNOWLEDGE_SNIPPET_CAP)))
    .map((row: { title: string; category?: string; excerpt: string }) => ({
      title: row.title,
      category: row.category,
      excerpt: row.excerpt,
    }));
}

async function loadActiveMemories(args: {
  ctx: any;
  userId: string;
  memoryType: "preference" | "constraint" | "interaction";
  now: number;
  limit: number;
}) {
  const records = await args.ctx.db
    .query("agentMemory")
    .withIndex("userId_and_memoryType", (q: any) =>
      q.eq("userId", args.userId).eq("memoryType", args.memoryType),
    )
    .collect();

  return records
    .filter((record: any) => !record.expiresAt || record.expiresAt > args.now)
    .slice(0, args.limit);
}

export async function loadBuyerMemoryContext(ctx: any, userId: string, limit = 10): Promise<BuyerMemoryContext> {
  const now = Date.now();
  const [preferences, constraints, recentInteractions] = await Promise.all([
    loadActiveMemories({ ctx, userId, memoryType: "preference", now, limit }),
    loadActiveMemories({ ctx, userId, memoryType: "constraint", now, limit }),
    loadActiveMemories({ ctx, userId, memoryType: "interaction", now, limit: 5 }),
  ]);

  const lastSummaryRecord = await ctx.db
    .query("agentMemory")
    .withIndex("userId_and_key", (q: any) =>
      q.eq("userId", userId).eq("key", "last_search_summary"),
    )
    .first();

  let lastSearchSummary: LastSearchSummary | null = null;
  if (lastSummaryRecord && (!lastSummaryRecord.expiresAt || lastSummaryRecord.expiresAt > now)) {
    try {
      lastSearchSummary = JSON.parse(lastSummaryRecord.value);
    } catch {
      lastSearchSummary = null;
    }
  }

  return {
    summary: buildMemorySummary(
      preferences,
      constraints,
      recentInteractions,
      lastSearchSummary,
    ),
    preferences,
    constraints,
    recentInteractions,
    lastSearchSummary,
  };
}

export async function syncBuyerContextSummaries(args: {
  ctx: any;
  channel: BuyerChannel;
  userId: string;
  threadId?: string;
  state: BuyerStateSnapshot;
}) {
  const summaries = await buildBuyerContextSummariesSnapshot({
    ctx: args.ctx,
    channel: args.channel,
    userId: args.userId,
    state: args.state,
  });

  await Promise.all([
    upsertSummaryMemory({
      ctx: args.ctx,
      userId: args.userId,
      threadId: args.threadId,
      key: BUYER_SUMMARY_KEYS.buyerProfileSummary,
      summary: summaries.buyerProfileSummary,
      metadata: { channel: args.channel },
    }),
    upsertSummaryMemory({
      ctx: args.ctx,
      userId: args.userId,
      threadId: args.threadId,
      key: BUYER_SUMMARY_KEYS.activePropertySummary,
      summary: summaries.activePropertySummary,
      metadata: {
        channel: args.channel,
        selectedPropertyId: args.state.selectedPropertyId,
      },
    }),
    upsertSummaryMemory({
      ctx: args.ctx,
      userId: args.userId,
      threadId: args.threadId,
      key: BUYER_SUMMARY_KEYS.searchJourneySummary,
      summary: summaries.searchJourneySummary,
      metadata: {
        channel: args.channel,
        lastSearchQuery: args.state.lastSearchQuery,
        resultCount: args.state.lastResultPropertyIds.length,
      },
    }),
    upsertSummaryMemory({
      ctx: args.ctx,
      userId: args.userId,
      threadId: args.threadId,
      key: BUYER_SUMMARY_KEYS.financeQualificationSummary,
      summary: summaries.financeQualificationSummary,
      metadata: {
        channel: args.channel,
        hasQualification: Boolean(args.state.qualification),
      },
    }),
  ]);

  return summaries;
}
