/**
 * WHY:   Property-search agents need one focused module for searchable property reads and search helpers.
 * WHAT:  Exposes normalization helpers, shared validators, and the public DB-backed property search query.
 * HOW:   Normalizes queries, queries Convex search indexes, and filters out draft or archived inventory.
 */
import { query } from "../../_generated/server";
import { v } from "convex/values";
import type { Id } from "../../_generated/dataModel";
import { DEFAULT_COMPLIANCE_COUNTRY, findActiveComplianceRuleset } from "../compliance/utils";

/**
 * WHY:   Search indexes need consistent normalized strings to match user intent.
 * WHAT:  Normalizes a free-form query into a predictable search token string.
 * HOW:   Lowercases, trims, collapses whitespace, and strips common Arabic articles.
 */
export function normalizeQuery(q: string): string {
  return q
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[،,]/g, " ")
    .replace(/\bفي\b/g, "")
    .replace(/\bال\b/g, "")
    .trim();
}

const NORMALIZE_FOR_CACHE: [RegExp, string][] = [
  [/\bشقق\b/g, "شقة"],
  [/\bapartments\b/g, "apartment"],
  [/\bvillas\b/g, "villa"],
  [/الرياض/g, "riyadh"],
  [/جدة|جده/g, "jeddah"],
];

/**
 * WHY:   Cache keys should ignore minor lexical variations in user queries.
 * WHAT:  Normalizes the query and applies synonym substitutions.
 * HOW:   Uses normalizeQuery plus a small replacement map for common terms.
 */
export function normalizeQueryForCache(q: string): string {
  let out = normalizeQuery(q);
  for (const [re, repl] of NORMALIZE_FOR_CACHE) {
    out = out.replace(re, repl);
  }
  return out;
}

const QUERY_STOPWORDS = new Set([
  "a", "an", "the", "in", "at", "for", "of", "to", "with",
  "property", "properties", "home", "house", "real", "estate",
  "في", "من", "على", "الى", "عقار", "عقارات", "شقة", "شقق",
]);

/**
 * WHY:   Similarity scoring needs tokenized queries without stopwords.
 * WHAT:  Converts a query into a filtered token array suitable for similarity checks.
 * HOW:   Normalizes, strips non-letters/digits, splits on whitespace, and removes stopwords.
 */
export function tokenizeForCache(query: string): string[] {
  const normalized = normalizeQueryForCache(query);
  return normalized
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2 && !QUERY_STOPWORDS.has(t));
}

/**
 * WHY:   Fuzzy cache matching needs a cheap similarity metric.
 * WHAT:  Computes Jaccard similarity between two token arrays.
 * HOW:   Uses set intersection over union of unique tokens.
 */
export function jaccardSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 1;
  const setA = new Set(a);
  const setB = new Set(b);
  let intersection = 0;
  for (const t of setA) {
    if (setB.has(t)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * WHY:   Location hints improve relevance when the query includes city names.
 * WHAT:  Returns a detected city label when present in the query.
 * HOW:   Checks the normalized query against a small list of city aliases.
 */
export function extractLocationHint(q: string): string | undefined {
  const cities = ["riyadh", "الرياض", "jeddah", "جدة", "جده", "dammam", "الدمام"];
  const normalized = q.toLowerCase();
  for (const city of cities) {
    if (normalized.includes(city)) return city;
  }
  return undefined;
}

export const propertyFindingValidator = v.object({
  sourceRank: v.number(),
  sourceUrl: v.string(),
  sourceTitle: v.optional(v.string()),
  cardRank: v.number(),
  propertyUrl: v.optional(v.string()),
  detailSourceUrl: v.optional(v.string()),
  detailFetched: v.optional(v.boolean()),
  title: v.string(),
  description: v.optional(v.string()),
  priceHint: v.optional(v.string()),
  locationHint: v.optional(v.string()),
  imageUrls: v.array(v.string()),
  offerDetails: v.optional(v.string()),
  confidence: v.optional(v.number()),
  bathrooms: v.optional(v.string()),
  area: v.optional(v.string()),
  features: v.optional(v.array(v.string())),
  beds: v.optional(v.string()),
});

export const searchScopeValidator = v.union(
  v.literal("saudi"),
  v.literal("uae"),
  v.literal("global"),
);

/**
 * WHY:   Global search caching needs a stable key across locales and pagination.
 * WHAT:  Builds a cache key and normalized query for a global search request.
 * HOW:   Normalizes the query, applies a default scope, and includes offset in the key.
 */
export function buildGlobalSearchCacheKey(params: {
  query: string;
  offset?: number;
  scope?: "saudi" | "uae" | "global";
}): { cacheKey: string; normalizedQuery: string; scope: "saudi" | "uae" | "global"; offset: number } {
  const normalizedQuery = normalizeQueryForCache(params.query);
  const scope = params.scope ?? "saudi";
  const offset = params.offset ?? 0;
  const cacheKey = `global:${normalizedQuery}:${scope}:${offset}`;
  return { cacheKey, normalizedQuery, scope, offset };
}

type PublicSearchResult = {
  _id: Id<"properties">;
  _creationTime: number;
  title: string;
  address: string;
  price: number;
  beds: number;
  baths: number;
  description: string;
  location?: string;
  area?: string;
  status?: string;
};

async function searchCandidates(ctx: any, normalizedQuery: string, limit: number) {
  let results = await ctx.db
    .query("properties")
    .withSearchIndex("search_full", (s: any) => s.search("searchText", normalizedQuery))
    .take(limit * 2);
  if (results.length === 0) {
    results = await ctx.db
      .query("properties")
      .withSearchIndex("search_body", (s: any) => s.search("description", normalizedQuery))
      .take(limit * 2);
  }
  return results;
}

function applyAvailabilityFilter(results: any[], onlyAvailable: boolean) {
  if (!onlyAvailable) return results;
  return results.filter((property) => !property.status || property.status === "available");
}

function toPublicSearchResult(property: any): PublicSearchResult {
  return {
    _id: property._id,
    _creationTime: property._creationTime,
    title: property.title,
    address: property.address,
    price: property.price,
    beds: property.beds,
    baths: property.baths,
    description: property.description,
    location: property.location,
    area: property.area,
    status: property.status ? String(property.status) : undefined,
  };
}

async function mapPublicResult(ctx: any, property: any): Promise<PublicSearchResult | null> {
  const publicationState = property.publicationState as string | undefined;
  if (publicationState === "draft" || publicationState === "archived") return null;
  if (property.isPublicSearchable === true) {
    return toPublicSearchResult(property);
  }
  const ownerType = property.ownerType === "broker" ? "broker" : "red";
  const ruleset = await findActiveComplianceRuleset(ctx, {
    countryCode: property.ownerCountryCode ?? DEFAULT_COMPLIANCE_COUNTRY,
    orgType: ownerType,
  });
  if (!ruleset) return null;
  if (ruleset.enforcement.hideUnverified) {
    if (ruleset.enforcement.requireOrgVerification && property.ownerVerified !== true) return null;
    if (ruleset.enforcement.requireListingVerification && property.listingVerified !== true) return null;
  }
  if (property.isPublicSearchable === false) return null;
  return toPublicSearchResult(property);
}

/**
 * WHY:   Public search consumers need a single query that enforces publication/compliance rules.
 * WHAT:  Returns matching published properties that pass availability and compliance filters.
 * HOW:   Searches both indexes, filters by availability, publication state, ad license, and owner verification.
 */
export const search = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
    onlyAvailable: v.optional(v.boolean()),
  },
  returns: v.array(
    v.object({
      _id: v.id("properties"),
      _creationTime: v.number(),
      title: v.string(),
      address: v.string(),
      price: v.number(),
      beds: v.number(),
      baths: v.number(),
      description: v.string(),
      location: v.optional(v.string()),
      area: v.optional(v.string()),
      status: v.optional(v.string()),
    }),
  ),
  handler: async (ctx, { query: q, limit = 20, onlyAvailable = true }) => {
    const results = await searchCandidates(ctx, normalizeQuery(q), limit);
    const availabilityFiltered = applyAvailabilityFilter(results, onlyAvailable);
    const mapped = await Promise.all(availabilityFiltered.map((property) => mapPublicResult(ctx, property)));
    return mapped.filter(Boolean).slice(0, limit) as PublicSearchResult[];
  },
});
