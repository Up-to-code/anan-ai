/**
 * WHY:   The conversation analyzer shares one set of scheduling and eligibility constants across registration, batching, and aggregation.
 * WHAT:  Exports the Riyadh-noon schedule, eligible buyer assistant kinds, and batch defaults.
 * HOW:   Keeps the daily analyzer deterministic and avoids repeating literals across modules.
 */
export const CONVERSATION_ANALYZER_TIMEZONE = "Asia/Riyadh";
export const RIYADH_UTC_OFFSET_MS = 3 * 60 * 60 * 1000;
export const CONVERSATION_ANALYZER_LOCAL_NOON_HOUR = 12;
export const CONVERSATION_ANALYZER_WINDOW_MS = 24 * 60 * 60 * 1000;
export const DEFAULT_CONVERSATION_ANALYZER_BATCH_SIZE = 20;
export const BUYER_ANALYZER_ASSISTANT_KINDS = ["default", "anan_main_public"] as const;

export type BuyerAnalyzerAssistantKind =
  (typeof BUYER_ANALYZER_ASSISTANT_KINDS)[number];
