import type { BuyerAnalyzerAssistantKind } from "./constants";

export type ConversationAnalyzerPaymentIntent =
  | "cash"
  | "installments"
  | "mortgage"
  | "mixed"
  | "unknown";

export type ConversationAnalyzerIntent =
  | "investment"
  | "residential"
  | "mixed"
  | "unknown";

export type ConversationAnalyzerStatus =
  | "draft"
  | "processing"
  | "done"
  | "failed";

export type ConversationAnalyzerRunStatus =
  | "draft"
  | "running"
  | "done"
  | "failed";

export type ConversationTranscriptMessage = {
  role: "user" | "assistant";
  content: string;
  createdAt: number;
};

export type ConversationTranscript = {
  threadId: string;
  userId: string;
  assistantKind: BuyerAnalyzerAssistantKind;
  messages: ConversationTranscriptMessage[];
};

export type ConversationDemandOutput = {
  summary: string;
  hotCities: string[];
  hotAreas: Array<{ city?: string; area: string }>;
  propertyTypes: string[];
  budgetBands: string[];
  paymentIntents: ConversationAnalyzerPaymentIntent[];
  configurations: string[];
  bedroomCounts: string[];
  bathroomCounts: string[];
  timelineSignals: string[];
  mustHaveFeatures: string[];
  strongConstraints: string[];
  intent: ConversationAnalyzerIntent;
  repeatedKeywords: string[];
  repeatedTopics: string[];
};

export type ConversationDailyMetric = {
  label: string;
  count: number;
};

export type ConversationDailyAreaMetric = {
  city?: string;
  area: string;
  count: number;
};

export type ConversationDailySummary = {
  summaryText: string;
  topCities: ConversationDailyMetric[];
  topAreas: ConversationDailyAreaMetric[];
  propertyTypes: ConversationDailyMetric[];
  budgetBands: ConversationDailyMetric[];
  paymentIntents: ConversationDailyMetric[];
  configurations: ConversationDailyMetric[];
  bedroomCounts: ConversationDailyMetric[];
  bathroomCounts: ConversationDailyMetric[];
  timelineSignals: ConversationDailyMetric[];
  mustHaveFeatures: ConversationDailyMetric[];
  strongConstraints: ConversationDailyMetric[];
  intents: ConversationDailyMetric[];
  repeatedKeywords: ConversationDailyMetric[];
  repeatedTopics: ConversationDailyMetric[];
};

export type ConversationAnalyzerWindow = {
  runKey: string;
  windowStartMs: number;
  windowEndMs: number;
  timezone: string;
};
