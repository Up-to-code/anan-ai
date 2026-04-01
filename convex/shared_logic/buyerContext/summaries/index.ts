import type { LastSearchSummary } from "../../memory/repository/shared";
import type {
  BuyerMemoryContext,
  BuyerQualification,
  BuyerStateSnapshot,
} from "../types";

function formatApproxCurrency(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return `SAR ${Math.round(value).toLocaleString("en-US")}`;
}

/**
 * WHY:   Buyer-context summaries should express financing readiness in one reusable format.
 * WHAT:  Builds a short finance qualification summary from the captured buyer fields.
 * HOW:   Formats the known qualification facts and falls back to a guidance message when data is missing.
 */
export function summarizeQualification(qualification?: BuyerQualification) {
  if (!qualification) {
    return "Finance qualification is still light. Capture salary, down payment, and preferred years before hard loan recommendations.";
  }

  const facts = [
    qualification.monthlySalary
      ? `salary ${formatApproxCurrency(qualification.monthlySalary)}`
      : null,
    qualification.downPayment
      ? `down payment ${formatApproxCurrency(qualification.downPayment)}`
      : null,
    qualification.preferredYears ? `term ${qualification.preferredYears} years` : null,
    qualification.employmentStatus ? `employment ${qualification.employmentStatus}` : null,
    qualification.notes ? `notes ${qualification.notes}` : null,
  ].filter(Boolean);

  return facts.length > 0
    ? `Finance qualification summary: ${facts.join(", ")}.`
    : "Finance qualification is still light. Capture salary, down payment, and preferred years before hard loan recommendations.";
}

/**
 * WHY:   Search continuation turns need one stable narrative for what the buyer has already explored.
 * WHAT:  Summarizes the latest search query, filters, shown results, and selected property state.
 * HOW:   Merges the transient state snapshot with the persisted last-search memory summary.
 */
export function summarizeSearchJourney(args: {
  state?: BuyerStateSnapshot | null;
  lastSearchSummary?: LastSearchSummary | null;
}) {
  const { state, lastSearchSummary } = args;
  if (!state?.lastSearchQuery && !lastSearchSummary?.query) {
    return "Search journey is just starting. No durable search query has been captured yet.";
  }

  const query = state?.lastSearchQuery ?? lastSearchSummary?.query;
  const location = lastSearchSummary?.location ? ` in ${lastSearchSummary.location}` : "";
  const budget = lastSearchSummary?.budgetHint
    ? ` around ${lastSearchSummary.budgetHint}`
    : "";
  const shownCount =
    state?.lastResultPropertyIds?.length ?? lastSearchSummary?.findingsCount ?? 0;
  const selected = state?.selectedPropertyId
    ? ` Active property ${state.selectedPropertyId}.`
    : "";
  return `Search journey: latest request "${query}"${location}${budget}. ${shownCount} recent result ids are already in-context for diversification.${selected}`;
}

/**
 * WHY:   Buyer context needs a durable profile summary instead of recomputing preference hints ad hoc.
 * WHAT:  Summarizes preferred property type, area, budget hint, and latest ask for the buyer.
 * HOW:   Reads preference/constraint memory and appends the finance summary when available.
 */
export function summarizeBuyerProfile(args: {
  state?: Pick<BuyerStateSnapshot, "lastSearchQuery" | "qualification"> | null;
  memory: BuyerMemoryContext;
}) {
  const propertyType = args.memory.preferences.find(
    (record) => record?.key === "preferred_property_type",
  )?.value;
  const location = args.memory.preferences.find(
    (record) => record?.key === "preferred_location",
  )?.value;
  const budget =
    args.memory.constraints.find((record) => record?.key === "budget_hint")?.value ??
    args.memory.lastSearchSummary?.budgetHint;
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

/**
 * WHY:   Property follow-up prompts need one consistent summary of the currently selected listing.
 * WHAT:  Summarizes the active property or returns a fallback when none is selected yet.
 * HOW:   Extracts the most important property facts used by finance, ROI, and handoff flows.
 */
export function summarizeActiveProperty(property: any | null) {
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
