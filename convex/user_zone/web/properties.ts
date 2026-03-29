import { v } from "convex/values";
import { query } from "../../_generated/server";
import { api } from "../../_generated/api";
import { mobilePropertyFeedItemValidator } from "./contracts";
import { buildMobilePropertyFeedItem } from "../mobile/feed";
import type { Infer } from "convex/values";

type PropertyFeedItem = Infer<typeof mobilePropertyFeedItemValidator>;

async function mapPublishedProperties(
  ctx: any,
  properties: Array<Parameters<typeof buildMobilePropertyFeedItem>[1]>,
  limit: number,
) {
  const mapped = await Promise.all(
    properties.map((property) =>
      buildMobilePropertyFeedItem(ctx, property),
    ),
  );

  return mapped.filter(Boolean).slice(0, limit) as PropertyFeedItem[];
}

async function listFallbackFeaturedProperties(ctx: any, limit: number) {
  const results = await ctx.db
    .query("properties")
    .withIndex("publicationState", (q: any) => q.eq("publicationState", "published"))
    .order("desc")
    .take(limit * 2);

  return mapPublishedProperties(ctx, results as any, limit);
}

/**
 * WHY:   The client web property page needs a public detail lookup without relying on mobile-only internals.
 * WHAT:  Returns the published buyer-facing property DTO for one property id.
 * HOW:   Reuses the shared mobile feed mapper so compliance, owner, and summary rules stay identical.
 */
export const getPropertyDetail = query({
  args: {
    propertyId: v.id("properties"),
  },
  returns: v.union(mobilePropertyFeedItemValidator, v.null()),
  handler: async (ctx, { propertyId }) => {
    const property = await ctx.db.get(propertyId);
    if (!property) return null;
    if (property.publicationState && property.publicationState !== "published") return null;
    return buildMobilePropertyFeedItem(ctx, property as Parameters<typeof buildMobilePropertyFeedItem>[1]);
  },
});

/**
 * WHY:   Landing and assistant side panels need a small featured property set without paginated client wiring.
 * WHAT:  Returns the newest published buyer-facing properties up to the requested limit.
 * HOW:   Reads published records in descending order and maps them through the shared mobile feed DTO builder.
 */
export const listFeaturedProperties = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(mobilePropertyFeedItemValidator),
  handler: async (ctx, { limit = 4 }) => {
    return listFallbackFeaturedProperties(ctx, limit);
  },
});

/**
 * WHY:   Deterministic buyer assistant search should resolve final display-ready property cards in one backend query instead of fan-out detail reads.
 * WHAT:  Returns up to four mapped property feed items for an assistant search query, with featured published fallback results when no direct matches exist.
 * HOW:   Runs the shared property search once, maps the resulting published properties through the buyer feed mapper, and falls back to featured inventory only when needed.
 */
export const searchAssistantFeedItems = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(mobilePropertyFeedItemValidator),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 4;
    const propertySearchResults = await ctx.runQuery(
      api.shared_logic.properties.search.search,
      {
        query: args.query,
        limit,
        onlyAvailable: true,
      } as never,
    );

    const properties = await Promise.all(
      (propertySearchResults as Array<{ _id: string }>).map((result) =>
        ctx.db.get(result._id as never),
      ),
    );

    const mapped = await mapPublishedProperties(
      ctx,
      properties.filter(Boolean) as any,
      limit,
    );

    if (mapped.length > 0) {
      return mapped;
    }

    return listFallbackFeaturedProperties(ctx, limit);
  },
});
