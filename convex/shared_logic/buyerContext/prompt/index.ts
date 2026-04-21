import {
  BUYER_CONTEXT_TOKEN_BUDGET,
  COMPARE_KEYWORDS,
  FINANCE_KEYWORDS,
  HANDOFF_KEYWORDS,
  MEMORY_FACT_CAP,
  MORE_RESULTS_KEYWORDS,
  SEARCH_KEYWORDS,
  SUMMARY_SNIPPET_CAP,
} from "../constants";
import type {
  BuyerMemoryContext,
  BuyerStateRecordInput,
  BuyerSummaryCollection,
} from "../types";
export {
  summarizeActiveProperty,
  summarizeBuyerProfile,
  summarizeQualification,
  summarizeSearchJourney,
} from "../summaries";

export function toBuyerStateRecord(doc: BuyerStateRecordInput) {
  return {
    channel: doc.channel,
    userId: doc.userId,
    threadId: doc.threadId as any,
    state: doc.state,
    selectedPropertyId: doc.selectedPropertyId as any,
    lastResultPropertyIds: doc.lastResultPropertyIds as any,
    comparisonPropertyIds: doc.comparisonPropertyIds as any,
    lastComparisonArtifactId: doc.lastComparisonArtifactId as any,
    lastSearchQuery: doc.lastSearchQuery,
    qualification: doc.qualification,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function normalizeTerms(input: string) {
  return input
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 1)
    .slice(0, 12);
}

export function scoreText(content: string, terms: string[]) {
  if (!terms.length) return 0;
  const lower = content.toLowerCase();
  return terms.reduce((score, term) => (lower.includes(term) ? score + 1 : score), 0);
}

export function estimateTokenCount(text: string) {
  if (!text.trim()) return 0;
  return Math.max(1, Math.ceil(text.length / 4));
}

export function serializeForFingerprint(value: unknown) {
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

export function inferBuyerIntent(message: string) {
  const normalized = message.toLowerCase();
  if (FINANCE_KEYWORDS.some((keyword) => normalized.includes(keyword))) return "finance" as const;
  if (HANDOFF_KEYWORDS.some((keyword) => normalized.includes(keyword))) return "handoff" as const;
  if (COMPARE_KEYWORDS.some((keyword) => normalized.includes(keyword))) return "property" as const;
  if (MORE_RESULTS_KEYWORDS.some((keyword) => normalized.includes(keyword))) return "search" as const;
  if (SEARCH_KEYWORDS.some((keyword) => normalized.includes(keyword))) return "search" as const;
  return "property" as const;
}

export function selectBuyerSummarySnippets(args: {
  query: string;
  summaries: BuyerSummaryCollection;
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

export function selectRawMemoryFallback(args: {
  query: string;
  memory: Pick<BuyerMemoryContext, "preferences" | "constraints" | "recentInteractions">;
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

export function estimatePromptBudget(args: {
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
    budgetCap: args.budgetCap ?? BUYER_CONTEXT_TOKEN_BUDGET,
    cacheHit: args.cacheHit,
    includedBlocks,
    droppedBlocks,
  };
}
