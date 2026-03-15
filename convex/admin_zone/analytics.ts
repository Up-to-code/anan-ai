import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireRole } from "../_core/security/accessPolicy";
import { tenants } from "../tenants";

type Range = "day" | "week" | "month";

function getLookbackMs(range: Range) {
  switch (range) {
    case "day":
      return 24 * 60 * 60 * 1000;
    case "week":
      return 7 * 24 * 60 * 60 * 1000;
    case "month":
    default:
      return 30 * 24 * 60 * 60 * 1000;
  }
}

function getBucketMs(range: Range) {
  return range === "day" ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
}

function toBucketLabels(buckets: Map<number, number>) {
  return Array.from(buckets.entries())
    .sort(([left], [right]) => left - right)
    .map(([timestamp, value]) => ({
      label: new Date(timestamp).toISOString().slice(0, 10),
      value,
    }));
}

function buildOrganizationProjection(
  args: {
    brokerId?: string | null;
    redId?: string | null;
  },
  brokers: Array<{ _id: unknown; name: string }>,
  developers: Array<{ _id: unknown; name: string }>,
) {
  if (args.brokerId) {
    const broker = brokers.find((item) => String(item._id) === String(args.brokerId));
    return {
      organizationKey: `broker__${String(args.brokerId)}`,
      ownerType: "broker" as const,
      name: broker?.name ?? "وسيط غير معروف",
    };
  }

  if (args.redId) {
    const developer = developers.find((item) => String(item._id) === String(args.redId));
    return {
      organizationKey: `red__${String(args.redId)}`,
      ownerType: "red" as const,
      name: developer?.name ?? "مطور غير معروف",
    };
  }

  return null;
}

function extractOfferIdFromMetadata(metadata: unknown) {
  if (!metadata || typeof metadata !== "object") {
    return null;
  }

  const candidate = metadata as { offerId?: string };
  return typeof candidate.offerId === "string" ? candidate.offerId : null;
}

/**
 * WHY:   The analytics section needs one communication dataset that combines AI and inbox activity.
 * WHAT:  Returns total message volume, activated action-mode volume, top users by engagement, and an activated-message trend.
 * HOW:   Reads assistant and inbox messages, attributes AI messages through thread ownership, and counts inbox messages for both participants.
 */
export const messageAnalytics = query({
  args: {
    range: v.optional(v.union(v.literal("day"), v.literal("week"), v.literal("month"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { range = "month", limit = 10 }) => {
    await requireRole(ctx, ["admin"]);

    const [assistantThreads, assistantMessages, inboxMessages, profiles, channelUsers] = await Promise.all([
      ctx.db.query("assistantThreads").collect(),
      ctx.db.query("assistantMessages").collect(),
      ctx.db.query("inboxMessages").collect(),
      ctx.db.query("userProfiles").collect(),
      ctx.db.query("users").collect(),
    ]);

    const now = Date.now();
    const since = now - getLookbackMs(range);
    const bucketMs = getBucketMs(range);
    const threadUserById = new Map(assistantThreads.map((thread) => [String(thread._id), thread.userId]));
    const userNameById = new Map<string, string>();
    const totals = {
      assistantMessages: 0,
      inboxMessages: 0,
      activatedMessages: 0,
      combinedMessages: 0,
    };

    for (const profile of profiles) {
      userNameById.set(profile.authUserId, profile.name ?? profile.email ?? profile.authUserId);
    }

    for (const user of channelUsers) {
      if (user.userId) {
        userNameById.set(user.userId, user.displayName ?? user.name ?? user.email ?? user.userId);
      }
    }
    const byUser = new Map<string, { userId: string; assistantMessages: number; inboxMessages: number; activatedMessages: number; totalMessages: number }>();
    const activatedBuckets = new Map<number, number>();

    for (const message of assistantMessages) {
      if (message.createdAt < since) continue;
      const userId = threadUserById.get(String(message.threadId));
      if (!userId) continue;
      const entry = byUser.get(userId) ?? {
        userId,
        assistantMessages: 0,
        inboxMessages: 0,
        activatedMessages: 0,
        totalMessages: 0,
      };
      entry.assistantMessages += 1;
      entry.totalMessages += 1;
      totals.assistantMessages += 1;
      totals.combinedMessages += 1;

      if (message.mode === "action") {
        entry.activatedMessages += 1;
        totals.activatedMessages += 1;
        const bucket = Math.floor(message.createdAt / bucketMs) * bucketMs;
        activatedBuckets.set(bucket, (activatedBuckets.get(bucket) ?? 0) + 1);
      }

      byUser.set(userId, entry);
    }

    for (const message of inboxMessages) {
      if (message.createdAt < since) continue;
      totals.inboxMessages += 1;
      totals.combinedMessages += 1;

      for (const userId of [message.senderUserId, message.recipientUserId]) {
        const entry = byUser.get(userId) ?? {
          userId,
          assistantMessages: 0,
          inboxMessages: 0,
          activatedMessages: 0,
          totalMessages: 0,
        };
        entry.inboxMessages += 1;
        entry.totalMessages += 1;
        byUser.set(userId, entry);
      }
    }

    return {
      totals,
      topUsers: Array.from(byUser.values())
        .map((entry) => ({
          ...entry,
          name: userNameById.get(entry.userId) ?? entry.userId,
        }))
        .sort((left, right) => right.totalMessages - left.totalMessages)
        .slice(0, limit),
      activatedTrend: toBucketLabels(activatedBuckets),
    };
  },
});

/**
 * WHY:   Admin needs a dedicated 30-day active-user chart that blends AI, inbox, and search engagement.
 * WHAT:  Returns daily active user counts and the distinct active total across the selected lookback window.
 * HOW:   Builds day buckets from assistant, inbox, knowledge-research, and search-log activity using distinct user ids per bucket.
 */
export const activeUsersAnalytics = query({
  args: {
    range: v.optional(v.union(v.literal("week"), v.literal("month"))),
  },
  handler: async (ctx, { range = "month" }) => {
    await requireRole(ctx, ["admin"]);

    const [assistantThreads, assistantMessages, inboxMessages, knowledgeResearch, searchLogs] = await Promise.all([
      ctx.db.query("assistantThreads").collect(),
      ctx.db.query("assistantMessages").collect(),
      ctx.db.query("inboxMessages").collect(),
      ctx.db.query("knowledgeResearch").collect(),
      ctx.db.query("searchLogs").collect(),
    ]);

    const now = Date.now();
    const since = now - getLookbackMs(range === "week" ? "week" : "month");
    const threadUserById = new Map(assistantThreads.map((thread) => [String(thread._id), thread.userId]));
    const bucketUsers = new Map<number, Set<string>>();
    const distinctUsers = new Set<string>();

    const addUser = (timestamp: number, userId?: string | null) => {
      if (!userId || timestamp < since) return;
      const bucket = Math.floor(timestamp / (24 * 60 * 60 * 1000)) * (24 * 60 * 60 * 1000);
      const users = bucketUsers.get(bucket) ?? new Set<string>();
      users.add(userId);
      bucketUsers.set(bucket, users);
      distinctUsers.add(userId);
    };

    for (const message of assistantMessages) {
      addUser(message.createdAt, threadUserById.get(String(message.threadId)));
    }

    for (const message of inboxMessages) {
      addUser(message.createdAt, message.senderUserId);
      addUser(message.createdAt, message.recipientUserId);
    }

    for (const item of knowledgeResearch) {
      addUser(item.createdAt, item.userId);
    }

    for (const item of searchLogs) {
      addUser(item._creationTime ?? 0, item.userId);
    }

    return {
      totalDistinctUsers: distinctUsers.size,
      trend: Array.from(bucketUsers.entries())
        .sort(([left], [right]) => left - right)
        .map(([timestamp, users]) => ({
          label: new Date(timestamp).toISOString().slice(0, 10),
          value: users.size,
        })),
    };
  },
});

/**
 * WHY:   The admin analytics area needs broker charts and inventory proxies in one payload.
 * WHAT:  Returns broker totals by state and the highest broker inventory counts.
 * HOW:   Aggregates brokers, linked profiles, tenant members, and broker-owned properties into one summary.
 */
export const brokerAnalytics = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 10 }) => {
    await requireRole(ctx, ["admin"]);

    const [brokers, profiles, tenantLinks, properties] = await Promise.all([
      ctx.db.query("brokers").collect(),
      ctx.db.query("userProfiles").collect(),
      ctx.db.query("tenantOrgLinks").collect(),
      ctx.db.query("properties").collect(),
    ]);

    const tenantOrgIdByBrokerId = new Map<string, string>();
    for (const link of tenantLinks) {
      if (link.ownerBrokerId) {
        tenantOrgIdByBrokerId.set(String(link.ownerBrokerId), link.tenantOrgId);
      }
    }

    const topByInventory = (await Promise.all(
      brokers.map(async (broker) => {
        const tenantOrgId = tenantOrgIdByBrokerId.get(String(broker._id));
        const members = tenantOrgId ? await tenants.listMembers(ctx as never, tenantOrgId) : [];

        return {
          id: String(broker._id),
          name: broker.name,
          status: broker.status ?? "pending",
          isVerified: broker.isVerified === true,
          linkedProfilesCount: profiles.filter((profile) => profile.brokerId === broker._id).length,
          membersCount: members.filter((member) => (member.status ?? "active") === "active").length,
          inventoryCount: properties.filter((property) => property.brokerId === broker._id).length,
        };
      }),
    ))
      .sort((left, right) => right.inventoryCount - left.inventoryCount)
      .slice(0, limit);

    return {
      summary: {
        total: brokers.length,
        verified: brokers.filter((broker) => broker.isVerified === true).length,
        pending: brokers.filter((broker) => broker.status === "pending").length,
      },
      topByInventory,
    };
  },
});

/**
 * WHY:   The admin analytics area also needs developer charts using RED as the source of truth.
 * WHAT:  Returns developer totals by state and the highest RED inventory counts.
 * HOW:   Aggregates RED organizations, linked profiles, tenant members, and RED-owned properties into one summary.
 */
export const developerAnalytics = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 10 }) => {
    await requireRole(ctx, ["admin"]);

    const [developers, profiles, tenantLinks, properties] = await Promise.all([
      ctx.db.query("RED").collect(),
      ctx.db.query("userProfiles").collect(),
      ctx.db.query("tenantOrgLinks").collect(),
      ctx.db.query("properties").collect(),
    ]);

    const tenantOrgIdByRedId = new Map<string, string>();
    for (const link of tenantLinks) {
      if (link.ownerREDId) {
        tenantOrgIdByRedId.set(String(link.ownerREDId), link.tenantOrgId);
      }
    }

    const topByInventory = (await Promise.all(
      developers.map(async (developer) => {
        const tenantOrgId = tenantOrgIdByRedId.get(String(developer._id));
        const members = tenantOrgId ? await tenants.listMembers(ctx as never, tenantOrgId) : [];

        return {
          id: String(developer._id),
          name: developer.name,
          status: developer.status ?? "pending",
          isVerified: developer.isVerified === true,
          linkedProfilesCount: profiles.filter((profile) => profile.REDId === developer._id).length,
          membersCount: members.filter((member) => (member.status ?? "active") === "active").length,
          inventoryCount: properties.filter((property) => property.REDId === developer._id).length,
        };
      }),
    ))
      .sort((left, right) => right.inventoryCount - left.inventoryCount)
      .slice(0, limit);

    return {
      summary: {
        total: developers.length,
        verified: developers.filter((developer) => developer.isVerified === true).length,
        pending: developers.filter((developer) => developer.status === "pending").length,
      },
      topByInventory,
    };
  },
});

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

    const properties = await ctx.db.query("properties").collect();
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

    const [offers, brokers, developers] = await Promise.all([
      ctx.db.query("offers").collect(),
      ctx.db.query("brokers").collect(),
      ctx.db.query("RED").collect(),
    ]);

    const since = Date.now() - getLookbackMs(range === "week" ? "week" : "month");
    const trendBuckets = new Map<number, number>();
    const senderStats = new Map<
      string,
      {
        organizationKey: string;
        ownerType: "broker" | "red";
        name: string;
        offersCount: number;
        acceptedCount: number;
        pendingCount: number;
      }
    >();
    const recipientStats = new Map<
      string,
      {
        organizationKey: string;
        ownerType: "broker" | "red" | "marketplace";
        name: string;
        offersCount: number;
        acceptedCount: number;
        pendingCount: number;
      }
    >();

    for (const offer of offers) {
      if ((offer._creationTime ?? 0) >= since) {
        const bucket = Math.floor((offer._creationTime ?? 0) / (24 * 60 * 60 * 1000)) * (24 * 60 * 60 * 1000);
        trendBuckets.set(bucket, (trendBuckets.get(bucket) ?? 0) + 1);
      }

      const sender = buildOrganizationProjection(
        {
          brokerId: offer.fromBrokerId ? String(offer.fromBrokerId) : null,
          redId: offer.fromREDId ? String(offer.fromREDId) : null,
        },
        brokers,
        developers,
      );
      if (sender) {
        const current = senderStats.get(sender.organizationKey) ?? {
          ...sender,
          offersCount: 0,
          acceptedCount: 0,
          pendingCount: 0,
        };
        current.offersCount += 1;
        if (offer.status === "accepted") current.acceptedCount += 1;
        if (offer.status === "pending") current.pendingCount += 1;
        senderStats.set(sender.organizationKey, current);
      }

      const recipient = buildOrganizationProjection(
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
      };

      const recipientCurrent = recipientStats.get(recipient.organizationKey) ?? {
        ...recipient,
        offersCount: 0,
        acceptedCount: 0,
        pendingCount: 0,
      };
      recipientCurrent.offersCount += 1;
      if (offer.status === "accepted") recipientCurrent.acceptedCount += 1;
      if (offer.status === "pending") recipientCurrent.pendingCount += 1;
      recipientStats.set(recipient.organizationKey, recipientCurrent);
    }

    return {
      summary: {
        total: offers.length,
        pending: offers.filter((offer) => offer.status === "pending").length,
        accepted: offers.filter((offer) => offer.status === "accepted").length,
        rejected: offers.filter((offer) => offer.status === "rejected").length,
        public: offers.filter((offer) => offer.visibility === "public").length,
        private: offers.filter((offer) => offer.visibility !== "public").length,
      },
      trend: toBucketLabels(trendBuckets),
      topSenders: Array.from(senderStats.values())
        .sort((left, right) => right.offersCount - left.offersCount)
        .slice(0, limit),
      topRecipients: Array.from(recipientStats.values())
        .sort((left, right) => right.offersCount - left.offersCount)
        .slice(0, limit),
    };
  },
});

/**
 * WHY:   Admin operators need to inspect the strongest broker-developer collaboration links behind offer traffic.
 * WHAT:  Returns connection totals and the top organization pairs by offers, conversations, deals, and threaded orders.
 * HOW:   Joins offers with inbox offer-card messages, deals, and thread-linked orders, then groups by sender/recipient organization pair.
 */
export const connectionAnalytics = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 10 }) => {
    await requireRole(ctx, ["admin"]);

    const [offers, inboxMessages, deals, orders, brokers, developers] = await Promise.all([
      ctx.db.query("offers").collect(),
      ctx.db.query("inboxMessages").collect(),
      ctx.db.query("deals").collect(),
      ctx.db.query("orders").collect(),
      ctx.db.query("brokers").collect(),
      ctx.db.query("RED").collect(),
    ]);

    const conversationIdsByOfferId = new Map<string, Set<string>>();
    for (const message of inboxMessages) {
      const offerId = extractOfferIdFromMetadata(message.metadata);
      if (!offerId) {
        continue;
      }

      const current = conversationIdsByOfferId.get(offerId) ?? new Set<string>();
      current.add(String(message.conversationId));
      conversationIdsByOfferId.set(offerId, current);
    }

    const pairStats = new Map<
      string,
      {
        id: string;
        senderOrganizationKey: string;
        senderName: string;
        senderType: "broker" | "red";
        recipientOrganizationKey: string;
        recipientName: string;
        recipientType: "broker" | "red";
        offersCount: number;
        acceptedOffersCount: number;
        conversationCount: number;
        dealsCount: number;
        ordersCount: number;
      }
    >();

    let offersWithConversation = 0;
    let conversationsLeadingToDeals = 0;
    let conversationsLeadingToOrders = 0;

    for (const offer of offers) {
      const sender = buildOrganizationProjection(
        {
          brokerId: offer.fromBrokerId ? String(offer.fromBrokerId) : null,
          redId: offer.fromREDId ? String(offer.fromREDId) : null,
        },
        brokers,
        developers,
      );
      const recipient = buildOrganizationProjection(
        {
          brokerId: offer.toBrokerId ? String(offer.toBrokerId) : null,
          redId: offer.toREDId ? String(offer.toREDId) : null,
        },
        brokers,
        developers,
      );

      if (!sender || !recipient || sender.ownerType === recipient.ownerType) {
        continue;
      }

      const offerId = String(offer._id);
      const pairId = `${sender.organizationKey}__${recipient.organizationKey}`;
      const conversationIds = Array.from(conversationIdsByOfferId.get(offerId) ?? []);
      const relatedDeals = deals.filter((deal) => String(deal.offerId ?? "") === offerId);
      const relatedOrders = orders.filter((order) => order.threadId && conversationIds.includes(String(order.threadId)));

      if (conversationIds.length > 0) {
        offersWithConversation += 1;
      }
      if (conversationIds.length > 0 && relatedDeals.length > 0) {
        conversationsLeadingToDeals += 1;
      }
      if (conversationIds.length > 0 && relatedOrders.length > 0) {
        conversationsLeadingToOrders += 1;
      }

      const current = pairStats.get(pairId) ?? {
        id: pairId,
        senderOrganizationKey: sender.organizationKey,
        senderName: sender.name,
        senderType: sender.ownerType,
        recipientOrganizationKey: recipient.organizationKey,
        recipientName: recipient.name,
        recipientType: recipient.ownerType,
        offersCount: 0,
        acceptedOffersCount: 0,
        conversationCount: 0,
        dealsCount: 0,
        ordersCount: 0,
      };

      current.offersCount += 1;
      if (offer.status === "accepted") {
        current.acceptedOffersCount += 1;
      }
      current.conversationCount += conversationIds.length;
      current.dealsCount += relatedDeals.length;
      current.ordersCount += relatedOrders.length;
      pairStats.set(pairId, current);
    }

    return {
      summary: {
        totalPairs: pairStats.size,
        offersWithConversation,
        conversationsLeadingToDeals,
        conversationsLeadingToOrders,
      },
      topPairs: Array.from(pairStats.values())
        .sort((left, right) => {
          if (right.offersCount !== left.offersCount) {
            return right.offersCount - left.offersCount;
          }

          return right.conversationCount - left.conversationCount;
        })
        .slice(0, limit),
    };
  },
});
