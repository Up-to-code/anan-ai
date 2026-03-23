import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireRole } from "../_core/security/accessPolicy";
import { buildDailySeries, getDashboardRangeDays, normalizeTimestamp, pushBucketValue } from "./commandCenter.helpers";
import { buildTopOrganizations } from "./commandCenter.shared";

/**
 * WHY:   The admin team needs one partner-health dataset to judge onboarding quality, verification progress, and subscription adoption.
 * WHAT:  Returns broker/developer totals, onboarding trend, verification mix, subscription status, action-mode adoption, and a partner leaderboard.
 * HOW:   Projects organizations, subscriptions, verification requests, memberships, and inventory into management-oriented health metrics.
 */
export const partnerHealthAnalytics = query({
  args: {
    range: v.optional(v.union(v.literal("30d"), v.literal("90d"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { range = "90d", limit = 8 }) => {
    await requireRole(ctx, ["admin"]);

    const [brokers, developers, subscriptions, verificationRequests, properties, memberships, offers] = await Promise.all([
      ctx.db.query("brokers").collect(),
      ctx.db.query("RED").collect(),
      ctx.db.query("subscriptions").collect(),
      ctx.db.query("verificationRequests").collect(),
      ctx.db.query("properties").collect(),
      ctx.db.query("organizationMemberships").collect(),
      ctx.db.query("offers").collect(),
    ]);

    const onboardingBuckets = new Map<number, { brokers: number; developers: number }>();
    for (const broker of brokers) {
      pushBucketValue({
        buckets: onboardingBuckets,
        timestamp: normalizeTimestamp(broker._creationTime),
        createEmpty: () => ({ brokers: 0, developers: 0 }),
        update: (bucket) => {
          bucket.brokers += 1;
        },
      });
    }
    for (const developer of developers) {
      pushBucketValue({
        buckets: onboardingBuckets,
        timestamp: normalizeTimestamp(developer._creationTime),
        createEmpty: () => ({ brokers: 0, developers: 0 }),
        update: (bucket) => {
          bucket.developers += 1;
        },
      });
    }

    const brokerVerification = verificationRequests.filter((item) => item.requestType === "broker");
    const developerVerification = verificationRequests.filter((item) => item.requestType === "RED");

    return {
      range,
      summary: {
        brokers: brokers.length,
        developers: developers.length,
        verifiedBrokers: brokers.filter((item) => item.isVerified === true).length,
        verifiedDevelopers: developers.filter((item) => item.isVerified === true).length,
        activeSubscriptions: subscriptions.filter((item) => item.status === "active").length,
        trialSubscriptions: subscriptions.filter((item) => item.status === "trial").length,
      },
      onboardingTrend: buildDailySeries({
        days: getDashboardRangeDays(range),
        buckets: onboardingBuckets,
        createEmpty: () => ({ brokers: 0, developers: 0 }),
      }),
      verificationMix: {
        brokers: {
          new: brokerVerification.filter((item) => item.currentStatus === "new").length,
          inReview: brokerVerification.filter((item) => item.currentStatus === "in_review").length,
          approved: brokerVerification.filter((item) => item.currentStatus === "approved").length,
          rejected: brokerVerification.filter((item) => item.currentStatus === "rejected").length,
        },
        developers: {
          new: developerVerification.filter((item) => item.currentStatus === "new").length,
          inReview: developerVerification.filter((item) => item.currentStatus === "in_review").length,
          approved: developerVerification.filter((item) => item.currentStatus === "approved").length,
          rejected: developerVerification.filter((item) => item.currentStatus === "rejected").length,
        },
      },
      subscriptionHealth: [
        { label: "نشط", value: subscriptions.filter((item) => item.status === "active").length },
        { label: "تجريبي", value: subscriptions.filter((item) => item.status === "trial").length },
        { label: "غير نشط", value: subscriptions.filter((item) => item.status === "inactive").length },
        { label: "ملغي", value: subscriptions.filter((item) => item.status === "canceled").length },
      ],
      actionModeAdoption: {
        brokers: subscriptions.filter((item) => item.ownerType === "broker" && item.actionModeEnabled === true).length,
        developers: subscriptions.filter((item) => item.ownerType === "RED" && item.actionModeEnabled === true).length,
        totalEligible: subscriptions.filter((item) => item.status === "active" || item.status === "trial").length,
      },
      topOrganizations: buildTopOrganizations({
        brokers,
        developers,
        properties,
        offers,
        memberships,
        subscriptions,
        limit,
      }),
    };
  },
});

