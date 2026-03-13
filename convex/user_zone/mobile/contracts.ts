import { v } from "convex/values";

/**
 * WHY:   The mobile app needs stable, typed payloads that are smaller than the web/dashboard domain objects.
 * WHAT:  Exports reusable validators for feed items, qualification context, and AI result cards.
 * HOW:   Centralizes the public mobile contract so feed and assistant endpoints stay aligned.
 */
export const mobileOwnerValidator = v.object({
  id: v.string(),
  type: v.union(v.literal("broker"), v.literal("RED")),
  name: v.string(),
  slug: v.string(),
  isVerified: v.boolean(),
});

/**
 * WHY:   The swipe feed should receive a compact, media-first property shape.
 * WHAT:  Validates the property payload rendered by the mobile full-screen feed.
 * HOW:   Flattens media, owner, and summary fields into one read-optimized DTO.
 */
export const mobilePropertyFeedItemValidator = v.object({
  id: v.id("properties"),
  title: v.string(),
  address: v.string(),
  location: v.optional(v.string()),
  area: v.optional(v.string()),
  price: v.number(),
  beds: v.number(),
  baths: v.number(),
  sqft: v.optional(v.number()),
  status: v.optional(v.string()),
  media: v.array(v.string()),
  owner: mobileOwnerValidator,
  aiSummary: v.optional(v.string()),
});

/**
 * WHY:   Mobile AI tools need a normalized qualification payload rather than free-form message parsing only.
 * WHAT:  Validates salary, down payment, and financing hints gathered from the user.
 * HOW:   Leaves all fields optional so the flow can graduate from partial to qualified over multiple prompts.
 */
export const mobileQualificationContextValidator = v.object({
  monthlySalary: v.optional(v.number()),
  downPayment: v.optional(v.number()),
  preferredYears: v.optional(v.number()),
  employmentStatus: v.optional(v.string()),
  notes: v.optional(v.string()),
});

const roiSummaryCardValidator = v.object({
  type: v.literal("roi_summary"),
  title: v.string(),
  purchasePrice: v.number(),
  estimatedAnnualRent: v.number(),
  grossYieldPercent: v.number(),
  summary: v.string(),
});

const paymentPlanCardValidator = v.object({
  type: v.literal("payment_plan"),
  title: v.string(),
  downPayment: v.number(),
  monthlyInstallment: v.number(),
  durationMonths: v.number(),
  summary: v.string(),
});

const mortgageCheckCardValidator = v.object({
  type: v.literal("mortgage_check"),
  title: v.string(),
  estimatedEligibility: v.union(v.literal("eligible"), v.literal("review"), v.literal("insufficient_data")),
  recommendedBudget: v.optional(v.number()),
  monthlyInstallmentEstimate: v.optional(v.number()),
  summary: v.string(),
});

const permitStatusCardValidator = v.object({
  type: v.literal("permit_status"),
  title: v.string(),
  permitStatus: v.union(v.literal("verified"), v.literal("pending_review"), v.literal("not_available")),
  summary: v.string(),
});

const comparisonTableCardValidator = v.object({
  type: v.literal("comparison_table"),
  title: v.string(),
  columns: v.array(v.string()),
  rows: v.array(v.array(v.string())),
  summary: v.string(),
});

const brokerHandoffCardValidator = v.object({
  type: v.literal("broker_handoff"),
  title: v.string(),
  handoffStatus: v.union(v.literal("qualified"), v.literal("needs_more_info")),
  summary: v.string(),
});

/**
 * WHY:   The mobile UI renders tool results as cards instead of markdown blobs.
 * WHAT:  Validates every supported result-card variant for the feed assistant.
 * HOW:   Uses a discriminated union keyed by `type` so the UI can switch safely.
 */
export const mobileAssistantResultCardValidator = v.union(
  roiSummaryCardValidator,
  paymentPlanCardValidator,
  mortgageCheckCardValidator,
  permitStatusCardValidator,
  comparisonTableCardValidator,
  brokerHandoffCardValidator,
);

/**
 * WHY:   The app needs one typed response object from the mobile assistant action.
 * WHAT:  Validates the assistant reply text, result cards, and follow-up prompts.
 * HOW:   Keeps the conversational layer decoupled from the specific tool chosen.
 */
export const mobileAssistantResponseValidator = v.object({
  message: v.string(),
  cards: v.array(mobileAssistantResultCardValidator),
  suggestedPrompts: v.array(v.string()),
});
