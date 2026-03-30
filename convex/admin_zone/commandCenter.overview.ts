import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireRole } from "../_core/security/accessPolicy";
import { buildDailySeries, getDashboardRangeDays, normalizeTimestamp, pushBucketValue } from "./commandCenter.helpers";
import { buildActiveUsersSummary, buildAlerts, buildTopOrganizations, countWindowRecords, getWindowBoundaries } from "./commandCenter.shared";

/**
 * WHY:   The rebuilt admin dashboard needs one leadership-ready control-room dataset rather than many disconnected counters.
 * WHAT:  Returns top-line KPIs, activity and commercial trends, partner/queue snapshots, top organizations, and urgent alerts.
 * HOW:   Aggregates current admin-owned tables over the selected rolling window and compares them against the previous window.
 */
export const commandCenterOverview = query({
  args: {
    range: v.optional(v.union(v.literal("30d"), v.literal("90d"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { range = "90d", limit = 6 }) => {
    await requireRole(ctx, ["admin"]);

    const [
      assistantThreads,
      assistantMessages,
      inboxMessages,
      knowledgeResearch,
      searchLogs,
      offers,
      orders,
      deals,
      subscriptions,
      verificationRequests,
      brokers,
      developers,
      properties,
      memberships,
    ] = await Promise.all([
      ctx.db.query("assistantThreads").order("desc").take(500),
      ctx.db.query("assistantMessages").order("desc").take(500),
      ctx.db.query("inboxMessages").order("desc").take(500),
      ctx.db.query("knowledgeResearch").order("desc").take(500),
      ctx.db.query("searchLogs").order("desc").take(500),
      ctx.db.query("offers").order("desc").take(500),
      ctx.db.query("orders").order("desc").take(500),
      ctx.db.query("deals").order("desc").take(500),
      ctx.db.query("subscriptions").order("desc").take(500),
      ctx.db.query("verificationRequests").order("desc").take(500),
      ctx.db.query("brokers").order("desc").take(500),
      ctx.db.query("RED").order("desc").take(500),
      ctx.db.query("properties").order("desc").take(500),
      ctx.db.query("organizationMemberships").order("desc").take(500),
    ]);

    const { currentStart, previousStart } = getWindowBoundaries(range);
    const days = getDashboardRangeDays(range);

    const activityBuckets = new Map<number, { messages: number; searches: number; research: number }>();
    for (const message of assistantMessages) {
      pushBucketValue({
        buckets: activityBuckets,
        timestamp: normalizeTimestamp(message.createdAt),
        createEmpty: () => ({ messages: 0, searches: 0, research: 0 }),
        update: (bucket) => {
          bucket.messages += 1;
        },
      });
    }
    for (const message of inboxMessages) {
      pushBucketValue({
        buckets: activityBuckets,
        timestamp: normalizeTimestamp(message.createdAt),
        createEmpty: () => ({ messages: 0, searches: 0, research: 0 }),
        update: (bucket) => {
          bucket.messages += 1;
        },
      });
    }
    for (const item of knowledgeResearch) {
      pushBucketValue({
        buckets: activityBuckets,
        timestamp: normalizeTimestamp(item.createdAt),
        createEmpty: () => ({ messages: 0, searches: 0, research: 0 }),
        update: (bucket) => {
          bucket.research += 1;
        },
      });
    }
    for (const item of searchLogs) {
      pushBucketValue({
        buckets: activityBuckets,
        timestamp: normalizeTimestamp(item._creationTime),
        createEmpty: () => ({ messages: 0, searches: 0, research: 0 }),
        update: (bucket) => {
          bucket.searches += 1;
        },
      });
    }

    const commercialBuckets = new Map<number, { offers: number; orders: number; deals: number }>();
    for (const offer of offers) {
      pushBucketValue({
        buckets: commercialBuckets,
        timestamp: normalizeTimestamp(offer._creationTime),
        createEmpty: () => ({ offers: 0, orders: 0, deals: 0 }),
        update: (bucket) => {
          bucket.offers += 1;
        },
      });
    }
    for (const order of orders) {
      pushBucketValue({
        buckets: commercialBuckets,
        timestamp: normalizeTimestamp(order._creationTime),
        createEmpty: () => ({ offers: 0, orders: 0, deals: 0 }),
        update: (bucket) => {
          bucket.orders += 1;
        },
      });
    }
    for (const deal of deals) {
      pushBucketValue({
        buckets: commercialBuckets,
        timestamp: normalizeTimestamp(deal._creationTime),
        createEmpty: () => ({ offers: 0, orders: 0, deals: 0 }),
        update: (bucket) => {
          bucket.deals += 1;
        },
      });
    }

    const activeUsers = buildActiveUsersSummary({
      currentStart,
      previousStart,
      assistantThreads,
      assistantMessages,
      inboxMessages,
      knowledgeResearch,
      searchLogs,
    });
    const offerVolume = countWindowRecords({
      items: offers,
      getTimestamp: (item) => normalizeTimestamp(item._creationTime),
      currentStart,
      previousStart,
    });
    const qualifiedOrders = countWindowRecords({
      items: orders,
      getTimestamp: (item) => normalizeTimestamp(item._creationTime),
      currentStart,
      previousStart,
      predicate: (item) => ["qualified", "offer_made", "under_contract", "closed_won"].includes(String(item.status ?? "")),
    });
    const closedWins = countWindowRecords({
      items: orders,
      getTimestamp: (item) => normalizeTimestamp(item._creationTime),
      currentStart,
      previousStart,
      predicate: (item) => item.status === "closed_won",
    });
    const pipelineValue = deals
      .filter((item) => ["new", "contacted", "negotiation"].includes(String(item.stage ?? "")))
      .reduce((sum, item) => sum + (typeof item.value === "number" ? item.value : 0), 0);

    return {
      range,
      kpis: {
        activeUsers,
        offerVolume,
        qualifiedOrders,
        closedWins,
      },
      pipeline: {
        value: pipelineValue,
        dealCount: deals.filter((item) => ["new", "contacted", "negotiation"].includes(String(item.stage ?? ""))).length,
        valuedDealCount: deals.filter(
          (item) =>
            ["new", "contacted", "negotiation"].includes(String(item.stage ?? "")) &&
            typeof item.value === "number" &&
            item.value > 0,
        ).length,
      },
      queueHealth: {
        unassignedOrders: orders.filter((item) => !item.assignedTo).length,
        newVerifications: verificationRequests.filter((item) => item.currentStatus === "new").length,
        inReviewVerifications: verificationRequests.filter((item) => item.currentStatus === "in_review").length,
        errorEvents: searchLogs.filter((item) => item.status === "failed" || Boolean(item.errorMessage)).length,
      },
      partnerHealth: {
        brokers: brokers.length,
        developers: developers.length,
        verifiedOrganizations:
          brokers.filter((item) => item.isVerified === true).length +
          developers.filter((item) => item.isVerified === true).length,
        activeSubscriptions: subscriptions.filter((item) => item.status === "active").length,
        trialSubscriptions: subscriptions.filter((item) => item.status === "trial").length,
        actionModeOrganizations: subscriptions.filter(
          (item) => (item.status === "active" || item.status === "trial") && item.actionModeEnabled === true,
        ).length,
      },
      activityTrend: buildDailySeries({
        days,
        buckets: activityBuckets,
        createEmpty: () => ({ messages: 0, searches: 0, research: 0 }),
      }),
      commercialTrend: buildDailySeries({
        days,
        buckets: commercialBuckets,
        createEmpty: () => ({ offers: 0, orders: 0, deals: 0 }),
      }),
      topOrganizations: buildTopOrganizations({
        brokers,
        developers,
        properties,
        offers,
        memberships,
        subscriptions,
        limit,
      }),
      alerts: buildAlerts({
        verificationRequests,
        searchLogs,
        orders,
        limit: 8,
      }),
    };
  },
});

