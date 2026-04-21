import { paginationOptsValidator } from "convex/server";
import { v, type Infer } from "convex/values";
import { internalQuery, query } from "../../_generated/server";
import { mobilePropertyFeedItemValidator } from "./contracts";
import { DEFAULT_COMPLIANCE_COUNTRY, findActiveComplianceRuleset } from "../../shared_logic/compliance/utils";
import { isPropertyDistributionReady } from "../../shared_logic/projects/readiness";

type MobilePropertyFeedItem = Infer<typeof mobilePropertyFeedItemValidator>;
type PropertyAdLicenseStatus = "pending" | "approved" | "rejected";

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
  bankId?: any;
  publicationState?: "draft" | "published" | "archived";
  adLicenseStatus?: PropertyAdLicenseStatus;
  listingVerified?: boolean;
  isPublicSearchable?: boolean;
  projectReadinessStatus?: string;
};

type PropertyOwner = {
  _id?: unknown;
  name?: string;
  slug?: string;
  isVerified?: boolean;
  countryCode?: string;
  description?: string;
  phone?: string;
  contactEmail?: string;
  notes?: string;
};

const FALLBACK_FEED_IMAGE =
  "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80";

function calculateMortgagePreview(args: {
  price: number;
  downPayment: number;
  annualRate: number;
  years: number;
}) {
  const loanAmount = Math.max(0, args.price - args.downPayment);
  const monthlyRate = args.annualRate / 100 / 12;
  const installments = Math.max(args.years * 12, 1);
  const factor = Math.pow(1 + monthlyRate, installments);
  const monthlyPayment =
    monthlyRate > 0
      ? Math.round((loanAmount * monthlyRate * factor) / Math.max(factor - 1, 1))
      : Math.round(loanAmount / installments);

  return {
    loanAmount,
    monthlyPayment,
  };
}

async function resolvePropertyOwner(ctx: any, property: PropertyDoc) {
  if (property.brokerId) {
    const owner = (await ctx.db.get(property.brokerId)) as PropertyOwner | null;
    return owner ? { owner, ownerType: "broker" as const, orgType: "broker" as const } : null;
  }
  if (property.REDId) {
    const owner = (await ctx.db.get(property.REDId)) as PropertyOwner | null;
    return owner ? { owner, ownerType: "RED" as const, orgType: "red" as const } : null;
  }
  return null;
}

function resolveFeedMedia(property: PropertyDoc) {
  const media = (property.media ?? []).map((item) => item.url).filter(Boolean);
  if (media.length === 0 && property.heroImage?.url) media.push(property.heroImage.url);
  if (media.length === 0) media.push(FALLBACK_FEED_IMAGE);
  return media;
}

function parseOwnerNotesMetadata(notes?: string) {
  if (!notes) return null;
  try {
    const parsed = JSON.parse(notes);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as {
      agencyLabel?: string;
      rating?: number;
      establishedYear?: number;
      completedProjects?: number;
    };
  } catch {
    return null;
  }
}

async function countActiveListingsForOwner(ctx: any, property: PropertyDoc) {
  if (property.brokerId) {
    return (
      await ctx.db
        .query("properties")
        .withIndex("brokerId", (q: any) => q.eq("brokerId", property.brokerId))
        .collect()
    ).filter((item: any) => item.publicationState === "published").length;
  }

  if (property.REDId) {
    return (
      await ctx.db
        .query("properties")
        .withIndex("REDId", (q: any) => q.eq("REDId", property.REDId))
        .collect()
    ).filter((item: any) => item.publicationState === "published").length;
  }

  return 0;
}

function toOwnerPreview(owner: PropertyOwner, ownerType: "broker" | "RED") {
  const notesMetadata = parseOwnerNotesMetadata(owner.notes);
  return {
    id: String(owner._id ?? ""),
    type: ownerType,
    name: owner.name ?? "Anan Partner",
    slug: owner.slug ?? "anan-partner",
    isVerified: owner.isVerified === true,
    description: owner.description,
    phone: owner.phone,
    contactEmail: owner.contactEmail,
    agencyLabel: notesMetadata?.agencyLabel,
    rating: notesMetadata?.rating,
    establishedYear: notesMetadata?.establishedYear,
    completedProjects: notesMetadata?.completedProjects,
  };
}

async function buildFinancePreview(ctx: any, property: PropertyDoc) {
  const defaultDownPayment = Math.round(property.price * 0.1);
  const defaultYears = 20;
  const defaultAnnualRate = 4.75;
  const mortgagePreview = calculateMortgagePreview({
    price: property.price,
    downPayment: defaultDownPayment,
    annualRate: defaultAnnualRate,
    years: defaultYears,
  });
  const bank = property.bankId ? await ctx.db.get(property.bankId) : null;

  return {
    defaultDownPayment,
    defaultYears,
    defaultAnnualRate,
    estimatedLoanAmount: mortgagePreview.loanAmount,
    estimatedMonthlyPayment: mortgagePreview.monthlyPayment,
    bankOfferCount: bank?.products?.length ?? 0,
  };
}

function buildContactPreview(property: PropertyDoc, owner: PropertyOwner) {
  const phone = owner.phone?.trim();
  const email = owner.contactEmail?.trim();
  return {
    hasPhone: Boolean(phone),
    hasEmail: Boolean(email),
    hasWhatsApp: Boolean(phone),
    mapQuery: property.address,
  };
}

function buildCompliancePreview(args: {
  owner: PropertyOwner;
  adLicenseStatus?: PropertyAdLicenseStatus;
  listingVerified?: boolean;
}) {
  const ownerVerified = args.owner.isVerified === true;
  const listingVerified = args.listingVerified === true || args.adLicenseStatus === "approved";
  return {
    adLicenseStatus:
      args.adLicenseStatus === "pending" || args.adLicenseStatus === "approved" || args.adLicenseStatus === "rejected"
        ? args.adLicenseStatus
        : undefined,
    permitStatus: ownerVerified && listingVerified ? ("verified" as const) : ownerVerified ? ("pending_review" as const) : ("not_available" as const),
    ownerVerified,
    listingVerified,
  };
}

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
      results.page
        .filter((property) => isPropertyDistributionReady(property as any))
        .map((property) => buildMobilePropertyFeedItem(ctx, property as PropertyDoc)),
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
    if (!isPropertyDistributionReady(property as any)) return null;
    return buildMobilePropertyFeedItem(ctx, property as PropertyDoc);
  },
});

/**
 * WHY:   Mobile property routes still need a direct public lookup when the feed page is not already in memory.
 * WHAT:  Returns one published buyer-facing property DTO for the requested id.
 * HOW:   Reuses the same feed-item builder so feed cards and detail screens stay contract-identical.
 */
export const getPropertyDetail = query({
  args: {
    propertyId: v.id("properties"),
  },
  returns: v.union(mobilePropertyFeedItemValidator, v.null()),
  handler: async (ctx, { propertyId }) => {
    const property = await ctx.db.get(propertyId);
    if (!property) return null;
    if (!isPropertyDistributionReady(property as any)) return null;
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
): Promise<MobilePropertyFeedItem | null> {
  if (!isPropertyDistributionReady(property)) return null;
  const adLicenseStatus = property.adLicenseStatus;
  const listingVerified = property.listingVerified;
  const ownerContext = await resolvePropertyOwner(ctx, property);
  if (!ownerContext) return null;
  const { owner, ownerType, orgType } = ownerContext;
  const countryCode = owner.countryCode ?? DEFAULT_COMPLIANCE_COUNTRY;
  const ruleset = await findActiveComplianceRuleset(ctx, { countryCode, orgType });
  if (!ruleset) return null;
  const enforcement = ruleset.enforcement;
  if (enforcement.hideUnverified) {
    if (enforcement.requireOrgVerification && owner.isVerified !== true) return null;
    if (enforcement.requireListingVerification && adLicenseStatus !== "approved") return null;
  }

  const media = resolveFeedMedia(property);
  const activeListings = await countActiveListingsForOwner(ctx, property);
  const ownerPreview = toOwnerPreview(owner, ownerType);
  const [finance, contact] = await Promise.all([
    buildFinancePreview(ctx, property),
    Promise.resolve(buildContactPreview(property, owner)),
  ]);
  const compliance = buildCompliancePreview({ owner, adLicenseStatus, listingVerified });

  return {
    id: property._id,
    title: property.title,
    address: property.address,
    bankId: property.bankId,
    location: property.location,
    area: property.area,
    price: property.price,
    beds: property.beds,
    baths: property.baths,
    sqft: property.sqft,
    status: property.status,
    media,
    owner: {
      ...ownerPreview,
      activeListings,
    },
    aiSummary: buildAiSummary(property),
    finance,
    contact,
    compliance,
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
