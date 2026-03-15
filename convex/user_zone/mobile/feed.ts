import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { internalQuery, query } from "../../_generated/server";
import { mobilePropertyFeedItemValidator } from "./contracts";
import { DEFAULT_COMPLIANCE_COUNTRY, findActiveComplianceRuleset } from "../../shared_logic/compliance/utils";

type PropertyDoc = {
  _id: any;
  title: string;
  address: string;
  location?: string;
  area?: string;
  price: number;
  beds: number;
  baths: number;
  sqft?: number;
  status?: string;
  description: string;
  REDId?: any;
  brokerId?: any;
  heroImage?: { url: string };
  media?: Array<{ url: string }>;
};

/**
 * WHY:   The mobile swipe feed needs one compact read surface optimized for media-first discovery.
 * WHAT:  Returns paginated published properties enriched with verified owner data and AI summary text.
 * HOW:   Reads published inventory, hydrates owner data, and maps records into a feed-specific DTO.
 */
export const listFeed = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { paginationOpts }) => {
    const results = await ctx.db
      .query("properties")
      .withIndex("publicationState", (q) => q.eq("publicationState", "published"))
      .order("desc")
      .paginate(paginationOpts);

    const pageItems = await Promise.all(
      results.page.map((property) => buildMobilePropertyFeedItem(ctx, property as PropertyDoc)),
    );
    const page = pageItems.filter(Boolean);

    return {
      ...results,
      page,
    };
  },
});

/**
 * WHY:   The mobile assistant needs a slim property context lookup it can call from an action.
 * WHAT:  Returns the same compact feed item for one property id.
 * HOW:   Loads the property and owner, then maps the result through the shared feed DTO builder.
 */
export const getPropertyContext = internalQuery({
  args: {
    propertyId: v.id("properties"),
  },
  returns: v.union(mobilePropertyFeedItemValidator, v.null()),
  handler: async (ctx, { propertyId }) => {
    const property = await ctx.db.get(propertyId);
    if (!property) return null;
    if (property.publicationState && property.publicationState !== "published") return null;
    return buildMobilePropertyFeedItem(ctx, property as PropertyDoc);
  },
});

/**
 * WHY:   Multiple mobile endpoints need one canonical way to shrink property docs into feed cards.
 * WHAT:  Maps a property plus owner record into the mobile feed DTO.
 * HOW:   Prefers uploaded media URLs, falls back to hero image, and synthesizes a concise AI summary.
 */
export async function buildMobilePropertyFeedItem(
  ctx: any,
  property: PropertyDoc,
) {
  const adLicenseStatus = (property as { adLicenseStatus?: string }).adLicenseStatus;
  const owner =
    property.brokerId
      ? await ctx.db.get(property.brokerId)
      : property.REDId
        ? await ctx.db.get(property.REDId)
        : null;
  if (!owner) return null;

  const orgType: "broker" | "red" = property.brokerId ? "broker" : "red";
  const countryCode = (owner as { countryCode?: string }).countryCode ?? DEFAULT_COMPLIANCE_COUNTRY;
  const ruleset = await findActiveComplianceRuleset(ctx, { countryCode, orgType });
  if (!ruleset) return null;
  const enforcement = ruleset.enforcement;
  if (enforcement.hideUnverified) {
    if (enforcement.requireOrgVerification && owner.isVerified !== true) return null;
    if (enforcement.requireListingVerification && adLicenseStatus !== "approved") return null;
  }

  const ownerType: "broker" | "RED" = property.brokerId ? "broker" : "RED";
  const media = (property.media ?? []).map((item) => item.url).filter(Boolean);
  if (media.length === 0 && property.heroImage?.url) {
    media.push(property.heroImage.url);
  }
  if (media.length === 0) {
    media.push("https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80");
  }

  return {
    id: property._id,
    title: property.title,
    address: property.address,
    location: property.location,
    area: property.area,
    price: property.price,
    beds: property.beds,
    baths: property.baths,
    sqft: property.sqft,
    status: property.status,
    media,
    owner: {
      id: String(owner?._id ?? ""),
      type: ownerType,
      name: owner?.name ?? "Anan Partner",
      slug: owner?.slug ?? "anan-partner",
      isVerified: owner?.isVerified === true,
    },
    aiSummary: buildAiSummary(property),
  };
}

/**
 * WHY:   The mobile feed should show one useful summary line before the user opens chat.
 * WHAT:  Builds a compact Arabic summary sentence for the active property card.
 * HOW:   Pulls from area, location, and bedroom count while staying resilient to missing fields.
 */
export function buildAiSummary(property: Pick<PropertyDoc, "title" | "location" | "area" | "beds" | "description">) {
  const place = property.area ?? property.location ?? "موقع مميز";
  const beds = property.beds ? `${property.beds} غرف` : "وحدة جاهزة";
  const lead = property.description?.trim().slice(0, 96);
  return `${property.title} في ${place}، ${beds}${lead ? `، ${lead}` : ""}`;
}
