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
  description: v.optional(v.string()),
  phone: v.optional(v.string()),
  contactEmail: v.optional(v.string()),
  agencyLabel: v.optional(v.string()),
  rating: v.optional(v.number()),
  activeListings: v.optional(v.number()),
  establishedYear: v.optional(v.number()),
  completedProjects: v.optional(v.number()),
});

export const mobilePropertyFinanceValidator = v.object({
  defaultDownPayment: v.number(),
  defaultYears: v.number(),
  defaultAnnualRate: v.number(),
  estimatedLoanAmount: v.number(),
  estimatedMonthlyPayment: v.number(),
  bankOfferCount: v.number(),
});

export const mobilePropertyContactValidator = v.object({
  hasPhone: v.boolean(),
  hasEmail: v.boolean(),
  hasWhatsApp: v.boolean(),
  mapQuery: v.string(),
});

export const mobilePropertyComplianceValidator = v.object({
  adLicenseStatus: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"))),
  permitStatus: v.union(v.literal("verified"), v.literal("pending_review"), v.literal("not_available")),
  ownerVerified: v.boolean(),
  listingVerified: v.boolean(),
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
  bankId: v.optional(v.id("banks")),
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
  finance: v.optional(mobilePropertyFinanceValidator),
  contact: v.optional(mobilePropertyContactValidator),
  compliance: v.optional(mobilePropertyComplianceValidator),
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

const brokerProfileCardValidator = v.object({
  type: v.literal("broker_profile"),
  title: v.string(),
  brokerName: v.string(),
  brokerAgency: v.string(),
  rating: v.number(),
  activeListings: v.number(),
  summary: v.string(),
});

const developerProfileCardValidator = v.object({
  type: v.literal("developer_profile"),
  title: v.string(),
  developerName: v.string(),
  establishedYear: v.number(),
  completedProjects: v.number(),
  summary: v.string(),
});

const loanCalculatorCardValidator = v.object({
  type: v.literal("loan_calculator"),
  title: v.string(),
  propertyPrice: v.number(),
  downPayment: v.number(),
  loanAmount: v.number(),
  interestRate: v.number(),
  years: v.number(),
  monthlyPayment: v.number(),
  summary: v.string(),
});

const bankOfferCardValidator = v.object({
  type: v.literal("bank_offer"),
  title: v.string(),
  bankName: v.string(),
  rateLabel: v.string(),
  downPaymentPercent: v.number(),
  monthlyEstimate: v.number(),
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
  brokerProfileCardValidator,
  developerProfileCardValidator,
  loanCalculatorCardValidator,
  bankOfferCardValidator,
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

export const mobileLocaleValidator = v.union(v.literal("ar"), v.literal("en"));

export const mobileBuyerProfileValidator = v.object({
  displayName: v.optional(v.string()),
  phone: v.optional(v.string()),
  email: v.optional(v.string()),
});

export const mobileBuyerConsentsValidator = v.object({
  privacyAcceptedAt: v.optional(v.number()),
  termsAcceptedAt: v.optional(v.number()),
  microphoneAcceptedAt: v.optional(v.number()),
  supportAcceptedAt: v.optional(v.number()),
});

export const mobileFinanceDefaultsValidator = v.object({
  downPaymentPercent: v.number(),
  preferredYears: v.number(),
  annualRate: v.number(),
});

export const mobileFinanceDefaultsPatchValidator = v.object({
  downPaymentPercent: v.optional(v.number()),
  preferredYears: v.optional(v.number()),
  annualRate: v.optional(v.number()),
});

export const mobileBuyerPreferencesValidator = v.object({
  locale: mobileLocaleValidator,
  onboardingCompletedAt: v.optional(v.number()),
  authEntryDismissedAt: v.optional(v.number()),
  financeDefaults: mobileFinanceDefaultsValidator,
});

export const mobileBuyerViewerValidator = v.object({
  id: v.optional(v.string()),
  authUserId: v.optional(v.string()),
  displayName: v.string(),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  role: v.union(
    v.literal("guest"),
    v.literal("user"),
    v.literal("broker"),
    v.literal("developer"),
    v.literal("RED"),
    v.literal("admin"),
  ),
  isAuthenticated: v.boolean(),
  qualifiedOrdersCount: v.number(),
  savedPropertyIds: v.array(v.string()),
  consents: mobileBuyerConsentsValidator,
  preferences: mobileBuyerPreferencesValidator,
});

export const mobileGuestBuyerLocalStateValidator = v.object({
  profile: mobileBuyerProfileValidator,
  savedPropertyIds: v.array(v.string()),
  consents: mobileBuyerConsentsValidator,
  preferences: mobileBuyerPreferencesValidator,
});

export const mobileAssistantThreadSummaryValidator = v.object({
  id: v.string(),
  title: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
  preview: v.optional(v.string()),
});

export const mobileAssistantMessageValidator = v.object({
  id: v.string(),
  role: v.union(v.literal("assistant"), v.literal("user")),
  text: v.string(),
  createdAt: v.number(),
  properties: v.optional(v.array(mobilePropertyFeedItemValidator)),
  cards: v.optional(v.array(mobileAssistantResultCardValidator)),
  activePropertyId: v.optional(v.string()),
  requiresAuthForHandoff: v.optional(v.boolean()),
  suggestedPrompts: v.optional(v.array(v.string())),
  comparisonArtifactId: v.optional(v.id("buyerComparisonArtifacts")),
  comparisonPropertyIds: v.optional(v.array(v.id("properties"))),
  selectionSource: v.optional(
    v.union(v.literal("ui_selected"), v.literal("history_resolved"), v.literal("text_resolved")),
  ),
});

export const mobileAssistantStateValidator = v.object({
  activeThreadId: v.optional(v.string()),
  recentThreads: v.array(mobileAssistantThreadSummaryValidator),
  activeMessages: v.array(mobileAssistantMessageValidator),
});

export const mobileFinanceBankOfferValidator = v.object({
  bankName: v.string(),
  rateLabel: v.string(),
  downPaymentPercent: v.number(),
  monthlyEstimate: v.number(),
  summary: v.string(),
});

export const mobileFinanceEstimateValidator = v.object({
  propertyId: v.optional(v.id("properties")),
  propertyTitle: v.optional(v.string()),
  propertyPrice: v.number(),
  downPayment: v.number(),
  downPaymentPercent: v.number(),
  loanAmount: v.number(),
  annualRate: v.number(),
  years: v.number(),
  monthlyPayment: v.number(),
  totalPaid: v.number(),
  totalInterest: v.number(),
  affordabilityStatus: v.union(v.literal("comfortable"), v.literal("review"), v.literal("stretch")),
  recommendedBudget: v.optional(v.number()),
  bankOffers: v.array(mobileFinanceBankOfferValidator),
  summary: v.string(),
});

const mobileAnalyticsMetricBlockValidator = v.object({
  visits: v.string(),
  seriousJourneys: v.string(),
  conversion: v.string(),
  followUps: v.string(),
});

const mobileAnalyticsTrendPointValidator = v.object({
  label: v.string(),
  visits: v.number(),
  qualified: v.number(),
  conversion: v.number(),
});

const mobileAnalyticsAreaSignalValidator = v.object({
  name: v.string(),
  story: v.string(),
  growth: v.string(),
  signalScore: v.number(),
  budget: v.string(),
  response: v.string(),
});

const mobileAnalyticsJourneyStageValidator = v.object({
  label: v.string(),
  count: v.string(),
  helper: v.string(),
  progress: v.number(),
});

export const mobileBuyerAnalyticsSummaryValidator = v.object({
  headline: v.string(),
  headlineBody: v.string(),
  updatedAtLabel: v.string(),
  topSignalLabel: v.string(),
  qualifiedLeadLabel: v.string(),
  averageResponseLabel: v.string(),
  metrics: mobileAnalyticsMetricBlockValidator,
  trendPoints: v.array(mobileAnalyticsTrendPointValidator),
  areaSignals: v.array(mobileAnalyticsAreaSignalValidator),
  journeyStages: v.array(mobileAnalyticsJourneyStageValidator),
  nextSteps: v.array(v.string()),
});
