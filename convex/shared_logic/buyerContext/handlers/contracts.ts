import { v } from "convex/values";
import {
  BUYER_SUMMARY_KEYS,
  buyerChannelStateRecordValidator,
  buyerContextSummariesValidator,
  knowledgeSnippetValidator,
  promptBudgetMetaValidator,
} from "../constants";

export const buyerMemoryContextValidator = v.object({
  summary: v.string(),
  preferences: v.array(v.any()),
  constraints: v.array(v.any()),
  recentInteractions: v.array(v.any()),
  lastSearchSummary: v.union(v.null(), v.any()),
});

export const buyerContextSnapshotValidator = v.object({
  state: v.union(buyerChannelStateRecordValidator, v.null()),
  memory: buyerMemoryContextValidator,
  summaries: buyerContextSummariesValidator,
});

export const compiledBuyerContextValidator = v.object({
  state: v.union(buyerChannelStateRecordValidator, v.null()),
  memory: buyerMemoryContextValidator,
  summaries: buyerContextSummariesValidator,
  recentThreadRecap: v.array(v.string()),
  buyerSummarySnippets: v.array(v.string()),
  rawMemoryFallback: v.array(v.string()),
  companyKnowledgeSnippets: v.array(knowledgeSnippetValidator),
  alreadyShownPropertyIds: v.array(v.id("properties")),
  compiledPromptContext: v.string(),
  promptBudgetMeta: promptBudgetMetaValidator,
});

export const buyerSummaryKeyValidator = v.union(
  v.literal(BUYER_SUMMARY_KEYS.buyerProfileSummary),
  v.literal(BUYER_SUMMARY_KEYS.activePropertySummary),
  v.literal(BUYER_SUMMARY_KEYS.searchJourneySummary),
  v.literal(BUYER_SUMMARY_KEYS.financeQualificationSummary),
);

export const buyerContextPromotionResultValidator = v.object({
  movedThreadIds: v.array(v.id("assistantThreads")),
  activeThreadId: v.optional(v.id("assistantThreads")),
});
