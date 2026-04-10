import { v } from "convex/values";
import {
  mobileAssistantResultCardValidator,
  mobilePropertyFeedItemValidator,
  mobileQualificationContextValidator,
} from "../mobile/contracts";

/**
 * WHY:   The client web assistant needs an explicit locale contract for Arabic, English, and French replies.
 * WHAT:  Validates the supported assistant locales.
 * HOW:   Restricts the assistant surface to the current supported product locales.
 */
export const clientWebLocaleValidator = v.union(v.literal("ar"), v.literal("en"), v.literal("fr"));

/**
 * WHY:   The client assistant needs one stable response envelope for cards, property results, and next prompts.
 * WHAT:  Validates deterministic assistant responses returned to the web app.
 * HOW:   Reuses the shared mobile property/card contracts so web and mobile stay aligned on result shapes.
 */
export const clientWebAssistantResponseValidator = v.object({
  message: v.string(),
  properties: v.array(mobilePropertyFeedItemValidator),
  cards: v.array(mobileAssistantResultCardValidator),
  suggestedPrompts: v.array(v.string()),
  activePropertyId: v.optional(v.id("properties")),
  requiresAuthForHandoff: v.boolean(),
  threadId: v.optional(v.id("assistantThreads")),
});

/**
 * WHY:   The client web app needs stable thread summaries for the history drawer and saved sessions page.
 * WHAT:  Validates one persisted buyer thread summary.
 * HOW:   Keeps the shape compact so the web client can render summaries without loading full transcripts.
 */
export const clientThreadSummaryValidator = v.object({
  id: v.id("assistantThreads"),
  title: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
  preview: v.optional(v.string()),
});

/**
 * WHY:   Persisted client assistant threads need a typed transcript payload for the buyer UI.
 * WHAT:  Validates one stored thread message with optional assistant metadata.
 * HOW:   Reuses the shared property/card validators so live assistant turns match the immediate response shape.
 */
export const clientThreadMessageValidator = v.object({
  id: v.id("assistantMessages"),
  role: v.union(v.literal("assistant"), v.literal("user")),
  text: v.string(),
  createdAt: v.number(),
  properties: v.optional(v.array(mobilePropertyFeedItemValidator)),
  cards: v.optional(v.array(mobileAssistantResultCardValidator)),
  activePropertyId: v.optional(v.id("properties")),
  requiresAuthForHandoff: v.optional(v.boolean()),
  suggestedPrompts: v.optional(v.array(v.string())),
  comparisonArtifactId: v.optional(v.id("buyerComparisonArtifacts")),
  comparisonPropertyIds: v.optional(v.array(v.id("properties"))),
  selectionSource: v.optional(
    v.union(
      v.literal("ui_selected"),
      v.literal("history_resolved"),
      v.literal("text_resolved"),
    ),
  ),
});

/**
 * WHY:   Guest buyer transcripts need one safe bridge format when they are promoted into authenticated history.
 * WHAT:  Validates one client transcript message used for guest-to-auth persistence.
 * HOW:   Mirrors the stored thread message shape while omitting server-generated identifiers.
 */
export const clientTranscriptSeedMessageValidator = v.object({
  role: v.union(v.literal("assistant"), v.literal("user")),
  text: v.string(),
  properties: v.optional(v.array(mobilePropertyFeedItemValidator)),
  cards: v.optional(v.array(mobileAssistantResultCardValidator)),
  activePropertyId: v.optional(v.id("properties")),
  requiresAuthForHandoff: v.optional(v.boolean()),
  suggestedPrompts: v.optional(v.array(v.string())),
  comparisonArtifactId: v.optional(v.id("buyerComparisonArtifacts")),
  comparisonPropertyIds: v.optional(v.array(v.id("properties"))),
  selectionSource: v.optional(
    v.union(
      v.literal("ui_selected"),
      v.literal("history_resolved"),
      v.literal("text_resolved"),
    ),
  ),
});

const clientOrderStatusValidator = v.union(
  v.literal("new_lead"),
  v.literal("contacted"),
  v.literal("qualified"),
  v.literal("offer_made"),
  v.literal("under_contract"),
  v.literal("closed_won"),
  v.literal("closed_lost"),
);

const clientOrderSourceChannelValidator = v.union(
  v.literal("whatsapp"),
  v.literal("app"),
  v.literal("web"),
);

/**
 * WHY:   The post-handoff confirmation page needs one authenticated order detail envelope.
 * WHAT:  Validates one buyer-owned order detail with optional linked property information.
 * HOW:   Reuses the buyer-facing property DTO so the confirmation route stays consistent with the rest of the app.
 */
export const clientOrderDetailValidator = v.object({
  orderId: v.id("orders"),
  status: clientOrderStatusValidator,
  type: v.union(v.literal("property"), v.literal("loan")),
  intent: v.optional(v.string()),
  notes: v.optional(v.string()),
  assignedTo: v.optional(v.string()),
  threadId: v.optional(v.string()),
  sourceChannel: v.optional(clientOrderSourceChannelValidator),
  property: v.union(mobilePropertyFeedItemValidator, v.null()),
});

export {
  clientOrderSourceChannelValidator,
  clientOrderStatusValidator,
  mobileAssistantResultCardValidator,
  mobilePropertyFeedItemValidator,
  mobileQualificationContextValidator,
};
