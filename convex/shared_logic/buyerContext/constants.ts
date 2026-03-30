import { v } from "convex/values";

export const buyerChannelValidator = v.union(
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

export const buyerChannelStateRecordValidator = v.object({
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

export const buyerContextSummariesValidator = v.object({
  buyerProfileSummary: v.optional(v.string()),
  activePropertySummary: v.optional(v.string()),
  searchJourneySummary: v.optional(v.string()),
  financeQualificationSummary: v.optional(v.string()),
});

export const promptBudgetMetaValidator = v.object({
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

export const knowledgeSnippetValidator = v.object({
  title: v.string(),
  category: v.optional(v.string()),
  excerpt: v.string(),
});

export const BUYER_SUMMARY_KEYS = {
  buyerProfileSummary: "buyer_profile_summary",
  activePropertySummary: "active_property_summary",
  searchJourneySummary: "search_journey_summary",
  financeQualificationSummary: "finance_qualification_summary",
} as const;

const COMPILED_CONTEXT_KEY_PREFIX = "buyer_compiled_context";
export const BUYER_CONTEXT_TOKEN_BUDGET = 1_200;
export const THREAD_RECAP_LINE_CAP = 6;
export const MEMORY_FACT_CAP = 4;
export const KNOWLEDGE_SNIPPET_CAP = 3;
export const SUMMARY_SNIPPET_CAP = 4;

export const SEARCH_KEYWORDS = ["search", "find", "apartment", "property", "house", "home", "ابحث", "أبحث", "شقة", "عقار", "وحدة"];
export const MORE_RESULTS_KEYWORDS = ["more", "another", "different", "other", "غيرها", "غيره", "مزيد", "أكثر", "بدائل"];
export const FINANCE_KEYWORDS = ["loan", "mortgage", "afford", "finance", "payment", "eligibility", "bank", "تمويل", "قرض", "راتب", "أهلية", "قسط", "بنك"];
export const HANDOFF_KEYWORDS = ["advisor", "handoff", "book", "visit", "call", "contact", "مستشار", "زيارة", "احجز", "تواصل"];
export const COMPARE_KEYWORDS = ["compare", "comparison", "قارن", "مقارنة"];

export function getCompiledContextKey(channel: "whatsapp" | "app" | "web", threadId?: string) {
  return `${COMPILED_CONTEXT_KEY_PREFIX}:${channel}:${threadId ?? "default"}`;
}
