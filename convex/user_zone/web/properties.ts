import { v } from "convex/values";
import { query } from "../../_generated/server";
import { mobilePropertyFeedItemValidator } from "./contracts";
import { buildMobilePropertyFeedItem } from "../mobile/feed";
import type { Infer } from "convex/values";

type PropertyFeedItem = Infer<typeof mobilePropertyFeedItemValidator>;

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
    const results = await ctx.db
      .query("properties")
      .withIndex("publicationState", (q) => q.eq("publicationState", "published"))
      .order("desc")
      .take(limit * 2);

    const mapped = await Promise.all(
      results.map((property) =>
        buildMobilePropertyFeedItem(ctx, property as Parameters<typeof buildMobilePropertyFeedItem>[1]),
      ),
    );

    return mapped.filter(Boolean).slice(0, limit) as PropertyFeedItem[];
  },
});
