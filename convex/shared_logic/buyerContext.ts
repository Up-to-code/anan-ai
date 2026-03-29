import { internalMutation, internalQuery } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { v } from "convex/values";
import { buildMemorySummary, type LastSearchSummary } from "./memory/repository/shared";

const buyerChannelValidator = v.union(
  v.literal("whatsapp"),
  v.literal("app"),
  v.literal("web"),
);

export const buyerQualificationValidator = v.object({
  monthlySalary: v.optional(v.number()),
  downPayment: v.optional(v.number()),
  preferredYears: v.optional(v.number()),
  employmentStatus: v.optional(v.string()),
  notes: v.optional(v.string()),
});

export const buyerChannelStateValidator = v.union(
  v.literal("idle"),
  v.literal("search_results"),
  v.literal("property_selected"),
  v.literal("handoff_ready"),
);

const buyerChannelStateRecordValidator = v.object({
  channel: buyerChannelValidator,
  userId: v.string(),
  threadId: v.optional(v.id("assistantThreads")),
  state: buyerChannelStateValidator,
  selectedPropertyId: v.optional(v.id("properties")),
  lastResultPropertyIds: v.array(v.id("properties")),
  lastSearchQuery: v.optional(v.string()),
  qualification: v.optional(buyerQualificationValidator),
  createdAt: v.number(),
  updatedAt: v.number(),
});

const buyerContextSummariesValidator = v.object({
  buyerProfileSummary: v.optional(v.string()),
  activePropertySummary: v.optional(v.string()),
  searchJourneySummary: v.optional(v.string()),
  financeQualificationSummary: v.optional(v.string()),
});

const promptBudgetMetaValidator = v.object({
  contextTokens: v.number(),
  memoryTokens: v.number(),
  ragTokens: v.number(),
  historyTokens: v.number(),
  totalContextTokens: v.number(),
  budgetCap: v.number(),
  cacheHit: v.boolean(),
  includedBlocks: v.array(v.string()),
  droppedBlocks: v.array(v.string()),
});

const knowledgeSnippetValidator = v.object({
  title: v.string(),
  category: v.optional(v.string()),
  excerpt: v.string(),
});

const BUYER_SUMMARY_KEYS = {
  buyerProfileSummary: "buyer_profile_summary",
  activePropertySummary: "active_property_summary",
  searchJourneySummary: "search_journey_summary",
  financeQualificationSummary: "finance_qualification_summary",
} as const;

const COMPILED_CONTEXT_KEY_PREFIX = "buyer_compiled_context";
const BUYER_CONTEXT_TOKEN_BUDGET = 1_200;
const THREAD_RECAP_LINE_CAP = 6;
const MEMORY_FACT_CAP = 4;
const KNOWLEDGE_SNIPPET_CAP = 3;
const SUMMARY_SNIPPET_CAP = 4;

const SEARCH_KEYWORDS = ["search", "find", "apartment", "property", "house", "home", "ابحث", "أبحث", "شقة", "عقار", "وحدة"];
const MORE_RESULTS_KEYWORDS = ["more", "another", "different", "other", "غيرها", "غيره", "مزيد", "أكثر", "بدائل"];
const FINANCE_KEYWORDS = ["loan", "mortgage", "afford", "finance", "payment", "eligibility", "bank", "تمويل", "قرض", "راتب", "أهلية", "قسط", "بنك"];
const HANDOFF_KEYWORDS = ["advisor", "handoff", "book", "visit", "call", "contact", "مستشار", "زيارة", "احجز", "تواصل"];
const COMPARE_KEYWORDS = ["compare", "comparison", "قارن", "مقارنة"];

function toBuyerStateRecord(doc: {
  channel: "whatsapp" | "app" | "web";
  userId: string;
  threadId?: string;
  state: "idle" | "search_results" | "property_selected" | "handoff_ready";
  selectedPropertyId?: string;
  lastResultPropertyIds: string[];
  lastSearchQuery?: string;
  qualification?: {
    monthlySalary?: number;
    downPayment?: number;
    preferredYears?: number;
    employmentStatus?: string;
    notes?: string;
  };
  createdAt: number;
  updatedAt: number;
}) {
  return {
    channel: doc.channel,
    userId: doc.userId,
    threadId: doc.threadId as any,
    state: doc.state,
    selectedPropertyId: doc.selectedPropertyId as any,
    lastResultPropertyIds: doc.lastResultPropertyIds as any,
    lastSearchQuery: doc.lastSearchQuery,
    qualification: doc.qualification,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function normalizeTerms(input: string) {
  return input
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 1)
    .slice(0, 12);
}

function scoreText(content: string, terms: string[]) {
  if (!terms.length) return 0;
  const lower = content.toLowerCase();
  return terms.reduce((score, term) => (lower.includes(term) ? score + 1 : score), 0);
}

function estimateTokenCount(text: string) {
  if (!text.trim()) return 0;
  return Math.max(1, Math.ceil(text.length / 4));
}

function formatApproxCurrency(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return `SAR ${Math.round(value).toLocaleString("en-US")}`;
}

function serializeForFingerprint(value: unknown) {
  return JSON.stringify(value, (_key, nestedValue) => {
    if (nestedValue && typeof nestedValue === "object" && !Array.isArray(nestedValue)) {
      return Object.fromEntries(
        Object.entries(nestedValue as Record<string, unknown>).sort(([a], [b]) =>
          a.localeCompare(b),
        ),
      );
    }
    return nestedValue;
  });
}

function getCompiledContextKey(channel: "whatsapp" | "app" | "web", threadId?: string) {
  return `${COMPILED_CONTEXT_KEY_PREFIX}:${channel}:${threadId ?? "default"}`;
}

function inferBuyerIntent(message: string) {
  const normalized = message.toLowerCase();
  if (FINANCE_KEYWORDS.some((keyword) => normalized.includes(keyword))) return "finance" as const;
  if (HANDOFF_KEYWORDS.some((keyword) => normalized.includes(keyword))) return "handoff" as const;
  if (COMPARE_KEYWORDS.some((keyword) => normalized.includes(keyword))) return "property" as const;
  if (MORE_RESULTS_KEYWORDS.some((keyword) => normalized.includes(keyword))) return "search" as const;
  if (SEARCH_KEYWORDS.some((keyword) => normalized.includes(keyword))) return "search" as const;
  return "property" as const;
}

function summarizeQualification(qualification?: {
  monthlySalary?: number;
  downPayment?: number;
  preferredYears?: number;
  employmentStatus?: string;
  notes?: string;
}) {
  if (!qualification) {
    return "Finance qualification is still light. Capture salary, down payment, and preferred years before hard loan recommendations.";
  }

  const facts = [
    qualification.monthlySalary ? `salary ${formatApproxCurrency(qualification.monthlySalary)}` : null,
    qualification.downPayment ? `down payment ${formatApproxCurrency(qualification.downPayment)}` : null,
    qualification.preferredYears ? `term ${qualification.preferredYears} years` : null,
    qualification.employmentStatus ? `employment ${qualification.employmentStatus}` : null,
    qualification.notes ? `notes ${qualification.notes}` : null,
  ].filter(Boolean);

  return facts.length > 0
    ? `Finance qualification summary: ${facts.join(", ")}.`
    : "Finance qualification is still light. Capture salary, down payment, and preferred years before hard loan recommendations.";
}

function summarizeSearchJourney(args: {
  state?: {
    lastSearchQuery?: string;
    lastResultPropertyIds: string[];
    selectedPropertyId?: string;
    state: "idle" | "search_results" | "property_selected" | "handoff_ready";
  } | null;
  lastSearchSummary?: LastSearchSummary | null;
}) {
  const { state, lastSearchSummary } = args;
  if (!state?.lastSearchQuery && !lastSearchSummary?.query) {
    return "Search journey is just starting. No durable search query has been captured yet.";
  }

  const query = state?.lastSearchQuery ?? lastSearchSummary?.query;
  const location = lastSearchSummary?.location ? ` in ${lastSearchSummary.location}` : "";
  const budget = lastSearchSummary?.budgetHint ? ` around ${lastSearchSummary.budgetHint}` : "";
  const shownCount = state?.lastResultPropertyIds?.length ?? lastSearchSummary?.findingsCount ?? 0;
  const selected = state?.selectedPropertyId ? ` Active property ${state.selectedPropertyId}.` : "";
  return `Search journey: latest request "${query}"${location}${budget}. ${shownCount} recent result ids are already in-context for diversification.${selected}`;
}

function summarizeBuyerProfile(args: {
  state?: {
    lastSearchQuery?: string;
    qualification?: {
      monthlySalary?: number;
      downPayment?: number;
      preferredYears?: number;
      employmentStatus?: string;
      notes?: string;
    };
  } | null;
  memory: {
    preferences: Array<any>;
    constraints: Array<any>;
    lastSearchSummary: LastSearchSummary | null;
  };
}) {
  const propertyType = args.memory.preferences.find((record) => record?.key === "preferred_property_type")?.value;
  const location = args.memory.preferences.find((record) => record?.key === "preferred_location")?.value;
  const budget = args.memory.constraints.find((record) => record?.key === "budget_hint")?.value
    ?? args.memory.lastSearchSummary?.budgetHint;
  const lastQuery = args.state?.lastSearchQuery ?? args.memory.lastSearchSummary?.query;
  const finance = summarizeQualification(args.state?.qualification);

  const parts = [
    propertyType ? `preferred property type ${propertyType}` : null,
    location ? `preferred area ${location}` : null,
    budget ? `budget hint ${budget}` : null,
    lastQuery ? `latest ask "${lastQuery}"` : null,
  ].filter(Boolean);

  if (parts.length === 0) {
    return `Buyer profile is still forming. ${finance}`;
  }

  return `Buyer profile summary: ${parts.join(", ")}. ${finance}`;
}

function summarizeActiveProperty(property: any | null) {
  if (!property) {
    return "No active property is locked yet. Treat property follow-ups as search continuation until the buyer selects a unit.";
  }

  const facts = [
    property.title,
    property.area ?? property.location ?? property.address,
    formatApproxCurrency(property.price),
    typeof property.beds === "number" ? `${property.beds} beds` : null,
    typeof property.baths === "number" ? `${property.baths} baths` : null,
    property.status ? `status ${property.status}` : null,
  ].filter(Boolean);

  return `Active property summary: ${facts.join(", ")}. Use this as the default subject for finance, ROI, comparison, and advisor follow-ups.`;
}

async function buildBuyerContextSummariesSnapshot(args: {
  ctx: any;
  channel: "whatsapp" | "app" | "web";
  userId: string;
  state: {
    lastSearchQuery?: string;
    selectedPropertyId?: string;
    lastResultPropertyIds: string[];
    qualification?: {
      monthlySalary?: number;
      downPayment?: number;
      preferredYears?: number;
      employmentStatus?: string;
      notes?: string;
    };
    state: "idle" | "search_results" | "property_selected" | "handoff_ready";
  };
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

async function upsertSummaryMemory(args: {
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

async function readSummaryValue(ctx: any, userId: string, key: string) {
  const record = await ctx.db
    .query("agentMemory")
    .withIndex("userId_and_key", (q: any) => q.eq("userId", userId).eq("key", key))
    .first();

  if (!record || (record.expiresAt && record.expiresAt <= Date.now())) {
    return null;
  }

  return record;
}

async function loadBuyerSummaries(ctx: any, userId: string) {
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

async function loadRecentThreadRecap(args: {
  ctx: any;
  threadId?: string;
  lineCap?: number;
}) {
  if (!args.threadId) return [];

  const messages = await args.ctx.db
    .query("assistantMessages")
    .withIndex("threadId", (q: any) => q.eq("threadId", args.threadId))
    .collect();

  return messages
    .sort((a: any, b: any) => a.createdAt - b.createdAt)
    .slice(-Math.max(args.lineCap ?? THREAD_RECAP_LINE_CAP, 1))
    .map((message: any) => {
      const label = message.role === "assistant" ? "Assistant" : "User";
      return `${label}: ${String(message.content ?? "").replace(/\s+/g, " ").trim()}`;
    });
}

async function loadKnowledgeSnippets(args: {
  ctx: any;
  query: string;
  limit: number;
}) {
  const terms = normalizeTerms(args.query);
  const pages = await args.ctx.db.query("knowledgePages").collect();
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

function selectBuyerSummarySnippets(args: {
  query: string;
  summaries: {
    buyerProfileSummary?: string;
    activePropertySummary?: string;
    searchJourneySummary?: string;
    financeQualificationSummary?: string;
  };
  intent: "search" | "property" | "finance" | "handoff";
}) {
  const ordered = [
    { name: "buyerProfileSummary", text: args.summaries.buyerProfileSummary ?? "" },
    { name: "activePropertySummary", text: args.summaries.activePropertySummary ?? "" },
    { name: "searchJourneySummary", text: args.summaries.searchJourneySummary ?? "" },
    { name: "financeQualificationSummary", text: args.summaries.financeQualificationSummary ?? "" },
  ];

  const weights: Record<typeof args.intent, string[]> = {
    search: ["searchJourneySummary", "buyerProfileSummary", "activePropertySummary", "financeQualificationSummary"],
    property: ["activePropertySummary", "searchJourneySummary", "buyerProfileSummary", "financeQualificationSummary"],
    finance: ["financeQualificationSummary", "activePropertySummary", "buyerProfileSummary", "searchJourneySummary"],
    handoff: ["activePropertySummary", "financeQualificationSummary", "buyerProfileSummary", "searchJourneySummary"],
  };

  const priority = weights[args.intent];
  const terms = normalizeTerms(args.query);

  return ordered
    .filter((item) => item.text.trim().length > 0)
    .map((item) => ({
      ...item,
      priority: priority.indexOf(item.name),
      score: scoreText(item.text, terms),
    }))
    .sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return b.score - a.score;
    })
    .slice(0, SUMMARY_SNIPPET_CAP)
    .map((item) => item.text);
}

function selectRawMemoryFallback(args: {
  query: string;
  memory: {
    preferences: Array<any>;
    constraints: Array<any>;
    recentInteractions: Array<any>;
  };
}) {
  const terms = normalizeTerms(args.query);
  return [...args.memory.preferences, ...args.memory.constraints, ...args.memory.recentInteractions]
    .map((record) => {
      const text = `${record?.key ?? ""}: ${record?.value ?? ""}`.trim();
      return {
        text,
        score: scoreText(text, terms),
      };
    })
    .filter((row) => row.text.length > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MEMORY_FACT_CAP)
    .map((row) => row.text);
}

function estimatePromptBudget(args: {
  blocks: Array<{ name: string; text: string; bucket: "context" | "memory" | "rag" | "history"; priority: number }>;
  budgetCap: number;
  cacheHit: boolean;
}) {
  const ordered = [...args.blocks].sort((a, b) => a.priority - b.priority);
  const includedBlocks: string[] = [];
  const droppedBlocks: string[] = [];
  let used = 0;

  const totals = {
    contextTokens: 0,
    memoryTokens: 0,
    ragTokens: 0,
    historyTokens: 0,
  };

  for (const block of ordered) {
    const tokens = estimateTokenCount(block.text);
    if (tokens === 0) continue;
    if (used + tokens > args.budgetCap && includedBlocks.length > 0) {
      droppedBlocks.push(block.name);
      continue;
    }
    used += tokens;
    includedBlocks.push(block.name);
    if (block.bucket === "context") totals.contextTokens += tokens;
    if (block.bucket === "memory") totals.memoryTokens += tokens;
    if (block.bucket === "rag") totals.ragTokens += tokens;
    if (block.bucket === "history") totals.historyTokens += tokens;
  }

  return {
    ...totals,
    totalContextTokens: used,
    budgetCap: args.budgetCap,
    cacheHit: args.cacheHit,
    includedBlocks,
    droppedBlocks,
  };
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

async function loadBuyerMemoryContext(ctx: any, userId: string, limit = 10) {
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

async function syncBuyerContextSummaries(args: {
  ctx: any;
  channel: "whatsapp" | "app" | "web";
  userId: string;
  threadId?: string;
  state: {
    lastSearchQuery?: string;
    selectedPropertyId?: string;
    lastResultPropertyIds: string[];
    qualification?: {
      monthlySalary?: number;
      downPayment?: number;
      preferredYears?: number;
      employmentStatus?: string;
      notes?: string;
    };
    state: "idle" | "search_results" | "property_selected" | "handoff_ready";
    };
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
      budgetCap: args.budgetCap ?? BUYER_CONTEXT_TOKEN_BUDGET,
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

export async function buildCompiledBuyerContextPayload(args: {
  ctx: any;
  channel: "whatsapp" | "app" | "web";
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
