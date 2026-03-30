import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireRole } from "../_core/security/accessPolicy";
import {
  buildOrganizationProjection,
  getLookbackMs,
  toBucketLabels,
} from "./analytics.helpers";

type OfferOrgStat = {
  organizationKey: string;
  ownerType: "broker" | "red" | "marketplace";
  name: string;
  offersCount: number;
  acceptedCount: number;
  pendingCount: number;
};

function incrementOfferTrend(trendBuckets: Map<number, number>, createdAt: number, since: number) {
  if (createdAt < since) return;
  const dayMs = 24 * 60 * 60 * 1000;
  const bucket = Math.floor(createdAt / dayMs) * dayMs;
  trendBuckets.set(bucket, (trendBuckets.get(bucket) ?? 0) + 1);
}

function upsertOfferOrgStats(
  stats: Map<string, OfferOrgStat>,
  projection: { organizationKey: string; ownerType: "broker" | "red" | "marketplace"; name: string },
  status: string | undefined
) {
  const current = stats.get(projection.organizationKey) ?? {
    ...projection,
    offersCount: 0,
    acceptedCount: 0,
    pendingCount: 0,
  };
  current.offersCount += 1;
  if (status === "accepted") current.acceptedCount += 1;
  if (status === "pending") current.pendingCount += 1;
  stats.set(projection.organizationKey, current);
}

function resolveRecipientProjection(offer: any, brokers: any[], developers: any[]) {
  return (
    buildOrganizationProjection(
      {
        brokerId: offer.toBrokerId ? String(offer.toBrokerId) : null,
        redId: offer.toREDId ? String(offer.toREDId) : null,
      },
      brokers,
      developers,
    ) ?? {
      organizationKey: "marketplace__public",
      ownerType: "marketplace" as const,
      name: "السوق العامة",
    }
  );
}

function buildOfferSummary(offers: any[]) {
  return {
    total: offers.length,
    pending: offers.filter((offer) => offer.status === "pending").length,
    accepted: offers.filter((offer) => offer.status === "accepted").length,
    rejected: offers.filter((offer) => offer.status === "rejected").length,
    public: offers.filter((offer) => offer.visibility === "public").length,
    private: offers.filter((offer) => offer.visibility !== "public").length,
  };
}

function toTopOrganizations(stats: Map<string, OfferOrgStat>, limit: number) {
  return Array.from(stats.values())
    .sort((left, right) => right.offersCount - left.offersCount)
    .slice(0, limit);
}

async function loadOfferAnalyticsData(ctx: any) {
  const [offers, brokers, developers] = await Promise.all([
    ctx.db.query("offers").order("desc").take(500),
    ctx.db.query("brokers").order("desc").take(500),
    ctx.db.query("RED").order("desc").take(500),
  ]);
  return { offers, brokers, developers };
}

function collectOfferAnalytics(args: {
  offers: any[];
  brokers: any[];
  developers: any[];
  since: number;
}) {
  const trendBuckets = new Map<number, number>();
  const senderStats = new Map<string, OfferOrgStat>();
  const recipientStats = new Map<string, OfferOrgStat>();
  for (const offer of args.offers) {
    incrementOfferTrend(trendBuckets, offer._creationTime ?? 0, args.since);
    const sender = buildOrganizationProjection(
      {
        brokerId: offer.fromBrokerId ? String(offer.fromBrokerId) : null,
        redId: offer.fromREDId ? String(offer.fromREDId) : null,
      },
      args.brokers,
      args.developers,
    );
    if (sender) upsertOfferOrgStats(senderStats, sender, offer.status);
    upsertOfferOrgStats(recipientStats, resolveRecipientProjection(offer, args.brokers, args.developers), offer.status);
  }
  return { trendBuckets, senderStats, recipientStats };
}

/**
 * WHY:   Property analytics should stay outside dashboard overview and power the dedicated analytics tab.
 * WHAT:  Returns property status counts, owner-type counts, and a recent creation trend.
 * HOW:   Groups properties by status and ownership while also bucketing recent creations by day.
 */
export const propertyAnalytics = query({
  args: {
    range: v.optional(v.union(v.literal("week"), v.literal("month"))),
  },
  handler: async (ctx, { range = "month" }) => {
    await requireRole(ctx, ["admin"]);

    const properties = await ctx.db.query("properties").order("desc").take(500);
    const since = Date.now() - getLookbackMs(range === "week" ? "week" : "month");
    const trendBuckets = new Map<number, number>();

    for (const property of properties) {
      if ((property._creationTime ?? 0) >= since) {
        const bucket = Math.floor((property._creationTime ?? 0) / (24 * 60 * 60 * 1000)) * (24 * 60 * 60 * 1000);
        trendBuckets.set(bucket, (trendBuckets.get(bucket) ?? 0) + 1);
      }
    }

    return {
      total: properties.length,
      statusBreakdown: {
        available: properties.filter((property) => property.status === "available").length,
        reserved: properties.filter((property) => property.status === "reserved").length,
        sold: properties.filter((property) => property.status === "sold").length,
        unspecified: properties.filter((property) => !property.status).length,
      },
      ownerBreakdown: {
        brokers: properties.filter((property) => Boolean(property.brokerId)).length,
        developers: properties.filter((property) => Boolean(property.REDId)).length,
        unassigned: properties.filter((property) => !property.brokerId && !property.REDId).length,
      },
      trend: toBucketLabels(trendBuckets),
    };
  },
});

/**
 * WHY:   Admin needs a dedicated offers analytics view outside the generic organization and property charts.
 * WHAT:  Returns offer totals, status/visibility breakdowns, recent trend, and the top sending/receiving organizations.
 * HOW:   Aggregates all stored offers, groups by sender and recipient owner ids, and buckets recent creations by day.
 */
export const offerAnalytics = query({
  args: {
    range: v.optional(v.union(v.literal("week"), v.literal("month"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { range = "month", limit = 10 }) => {
    await requireRole(ctx, ["admin"]);
    const { offers, brokers, developers } = await loadOfferAnalyticsData(ctx);
    const since = Date.now() - getLookbackMs(range === "week" ? "week" : "month");
    const { trendBuckets, senderStats, recipientStats } = collectOfferAnalytics({
      offers,
      brokers,
      developers,
      since,
    });
    return {
      summary: buildOfferSummary(offers),
      trend: toBucketLabels(trendBuckets),
      topSenders: toTopOrganizations(senderStats, limit),
      topRecipients: toTopOrganizations(recipientStats, limit),
    };
  },
});
