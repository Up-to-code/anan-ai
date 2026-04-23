import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireAdminAccess } from "../_core/security/accessPolicy";
import { buildOrganizationProjection } from "./analytics.helpers";
import { buildDailySeries, getDashboardRangeDays, normalizeTimestamp, pushBucketValue } from "./commandCenter.helpers";
import { countWindowRecords, getWindowBoundaries } from "./commandCenter.shared";

/**
 * WHY:   Leadership and revenue-facing operators need one commercial read model focused on deal flow, pipeline quality, and order progression.
 * WHAT:  Returns offer velocity, deal-stage distribution, pipeline value, order funnel counts, and the strongest commercial organizations.
 * HOW:   Combines offers, deals, and orders into one windowed dataset while falling back to counts when deal values are missing.
 */
export const commercialAnalytics = query({
  args: {
    range: v.optional(v.union(v.literal("30d"), v.literal("90d"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { range = "90d", limit = 8 }) => {
    await requireAdminAccess(ctx);

    const [offers, deals, orders, brokers, developers] = await Promise.all([
      ctx.db.query("offers").order("desc").take(500),
      ctx.db.query("deals").order("desc").take(500),
      ctx.db.query("orders").order("desc").take(500),
      ctx.db.query("brokers").order("desc").take(500),
      ctx.db.query("RED").order("desc").take(500),
    ]);

    const { currentStart, previousStart } = getWindowBoundaries(range);
    const days = getDashboardRangeDays(range);
    const offerTrendBuckets = new Map<number, { offers: number; accepted: number; pending: number }>();
    const senderVolume = new Map<string, { organizationKey: string; ownerType: "broker" | "red"; name: string; offersCount: number; acceptedCount: number }>();

    for (const offer of offers) {
      const timestamp = normalizeTimestamp(offer._creationTime);
      pushBucketValue({
        buckets: offerTrendBuckets,
        timestamp,
        createEmpty: () => ({ offers: 0, accepted: 0, pending: 0 }),
        update: (bucket) => {
          bucket.offers += 1;
          if (offer.status === "accepted") {
            bucket.accepted += 1;
          }
          if (offer.status === "pending") {
            bucket.pending += 1;
          }
        },
      });

      if (timestamp < currentStart) {
        continue;
      }

      const sender = buildOrganizationProjection(
        {
          brokerId: offer.fromBrokerId ? String(offer.fromBrokerId) : null,
          redId: offer.fromREDId ? String(offer.fromREDId) : null,
        },
        brokers,
        developers,
      );

      if (!sender) {
        continue;
      }

      const current = senderVolume.get(sender.organizationKey) ?? {
        organizationKey: sender.organizationKey,
        ownerType: sender.ownerType,
        name: sender.name,
        offersCount: 0,
        acceptedCount: 0,
      };
      current.offersCount += 1;
      if (offer.status === "accepted") {
        current.acceptedCount += 1;
      }
      senderVolume.set(sender.organizationKey, current);
    }

    return {
      range,
      summary: {
        offers: countWindowRecords({
          items: offers,
          getTimestamp: (item) => normalizeTimestamp(item._creationTime),
          currentStart,
          previousStart,
        }),
        acceptedOffers: countWindowRecords({
          items: offers,
          getTimestamp: (item) => normalizeTimestamp(item._creationTime),
          currentStart,
          previousStart,
          predicate: (item) => item.status === "accepted",
        }),
        wonDeals: countWindowRecords({
          items: deals,
          getTimestamp: (item) => normalizeTimestamp(item._creationTime),
          currentStart,
          previousStart,
          predicate: (item) => item.stage === "won",
        }),
        lostDeals: countWindowRecords({
          items: deals,
          getTimestamp: (item) => normalizeTimestamp(item._creationTime),
          currentStart,
          previousStart,
          predicate: (item) => item.stage === "lost",
        }),
        pipelineValue: deals
          .filter((item) => ["new", "contacted", "negotiation"].includes(String(item.stage ?? "")))
          .reduce((sum, item) => sum + (typeof item.value === "number" ? item.value : 0), 0),
        pipelineFallbackCount: deals.filter(
          (item) =>
            ["new", "contacted", "negotiation"].includes(String(item.stage ?? "")) &&
            (typeof item.value !== "number" || item.value <= 0),
        ).length,
        openPipelineCount: deals.filter((item) => ["new", "contacted", "negotiation"].includes(String(item.stage ?? ""))).length,
      },
      offerTrend: buildDailySeries({
        days,
        buckets: offerTrendBuckets,
        createEmpty: () => ({ offers: 0, accepted: 0, pending: 0 }),
      }),
      dealStages: ["new", "contacted", "negotiation", "won", "lost"].map((stage) => {
        const stageDeals = deals.filter((item) => item.stage === stage);
        return {
          stage,
          count: stageDeals.length,
          value: stageDeals.reduce((sum, item) => sum + (typeof item.value === "number" ? item.value : 0), 0),
          valuedCount: stageDeals.filter((item) => typeof item.value === "number" && item.value > 0).length,
        };
      }),
      orderFunnel: [
        { label: "طلب جديد", value: orders.filter((item) => item.status === "new_lead").length },
        { label: "تم التواصل", value: orders.filter((item) => item.status === "contacted").length },
        { label: "مؤهل", value: orders.filter((item) => item.status === "qualified").length },
        { label: "عرض مقدم", value: orders.filter((item) => item.status === "offer_made").length },
        { label: "تحت التعاقد", value: orders.filter((item) => item.status === "under_contract").length },
        { label: "مغلق رابح", value: orders.filter((item) => item.status === "closed_won").length },
        { label: "مغلق خاسر", value: orders.filter((item) => item.status === "closed_lost").length },
      ],
      orderChannels: [
        { label: "واتساب", value: orders.filter((item) => item.sourceChannel === "whatsapp").length },
        { label: "التطبيق", value: orders.filter((item) => item.sourceChannel === "app").length },
        { label: "الويب", value: orders.filter((item) => item.sourceChannel === "web").length },
      ],
      topSenders: Array.from(senderVolume.values())
        .sort((left, right) => right.offersCount - left.offersCount)
        .slice(0, limit),
    };
  },
});

