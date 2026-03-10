/**
 * WHY:   Property-search agents need one focused module for searchable property reads and search helpers.
 * WHAT:  Exposes normalization helpers, shared validators, and the public DB-backed property search query.
 * HOW:   Normalizes queries, queries Convex search indexes, and filters out draft or archived inventory.
 */
import { query } from "../../_generated/server";
import { v } from "convex/values";

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

export function tokenizeForCache(query: string): string[] {
  const normalized = normalizeQueryForCache(query);
  return normalized
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2 && !QUERY_STOPWORDS.has(t));
}

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
    const normalized = normalizeQuery(q);
    let results = await ctx.db
      .query("properties")
      .withSearchIndex("search_full", (s) => s.search("searchText", normalized))
      .take((limit ?? 20) * 2);
    if (results.length === 0) {
      results = await ctx.db
        .query("properties")
        .withSearchIndex("search_body", (s) => s.search("description", normalized))
        .take((limit ?? 20) * 2);
    }
    if (onlyAvailable) {
      results = results.filter((p) => !p.status || p.status === "available");
    }
    results = results.filter(
      (p) =>
        (p as { publicationState?: string }).publicationState !== "draft" &&
        (p as { publicationState?: string }).publicationState !== "archived",
    );
    return results.slice(0, limit ?? 20);
  },
});
