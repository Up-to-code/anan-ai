import { v } from "convex/values";

/**
 * WHY:   Public buyer comparison state needs one compact, reusable validator set across storage and DTO mapping.
 * WHAT:  Defines typed validators for thread resource refs, artifact snapshots, and selection sources.
 * HOW:   Keeps the storage contracts colocated so assistant/public layers do not re-declare comparison shapes.
 */
export const buyerComparisonSelectionSourceValidator = v.union(
  v.literal("ui_selected"),
  v.literal("history_resolved"),
  v.literal("text_resolved"),
);

/**
 * WHY:   The buyer ref ledger should remain intentionally narrow in v1.
 * WHAT:  Restricts stored comparison refs to canonical property ids only.
 * HOW:   Uses one fixed resource type so future expansion stays explicit.
 */
export const buyerComparisonResourceRefValidator = v.object({
  threadId: v.string(),
  userId: v.string(),
  channel: v.union(v.literal("whatsapp"), v.literal("app"), v.literal("web")),
  resourceType: v.literal("property"),
  resourceId: v.id("properties"),
  source: v.union(
    v.literal("shortlist_displayed"),
    v.literal("ui_selected"),
    v.literal("active_property"),
    v.literal("comparison_request"),
  ),
  messageId: v.optional(v.string()),
  rank: v.optional(v.number()),
  createdAt: v.number(),
});

/**
 * WHY:   Comparison replay should restore one stable renderable payload without duplicating it in message metadata.
 * WHAT:  Validates the snapshot stored once per comparison artifact.
 * HOW:   Stores the buyer-facing response fragments needed to rebuild the thread message.
 */
export const buyerComparisonSnapshotValidator = v.object({
  message: v.string(),
  cards: v.array(v.any()),
  properties: v.array(v.any()),
  activePropertyId: v.optional(v.id("properties")),
  suggestedPrompts: v.array(v.string()),
});

/**
 * WHY:   Comparison artifact reads need one typed shape for persistence and hydration.
 * WHAT:  Validates the stored artifact row that backs replay and live refresh fallback.
 * HOW:   Keeps digest metadata small while separating the snapshot from message metadata.
 */
export const buyerComparisonArtifactValidator = v.object({
  threadId: v.string(),
  userId: v.string(),
  channel: v.union(v.literal("whatsapp"), v.literal("app"), v.literal("web")),
  locale: v.union(v.literal("ar"), v.literal("en"), v.literal("fr")),
  propertyIds: v.array(v.id("properties")),
  triggerMessageId: v.optional(v.string()),
  selectionSource: buyerComparisonSelectionSourceValidator,
  digestTitle: v.string(),
  digestSummary: v.string(),
  digestHash: v.string(),
  version: v.string(),
  snapshot: buyerComparisonSnapshotValidator,
  createdAt: v.number(),
  lastRefreshedAt: v.number(),
});

export type BuyerComparisonSelectionSource =
  | "ui_selected"
  | "history_resolved"
  | "text_resolved";

export type BuyerComparisonRefSource =
  | "shortlist_displayed"
  | "ui_selected"
  | "active_property"
  | "comparison_request";
