import { query } from "../_generated/server";
import { requireRole } from "../_core/security/accessPolicy";

/**
 * WHY:   The Arabic admin dashboard needs one lightweight summary source for KPI cards and review queues.
 * WHAT:  Returns high-level entity counts, verification queue sizes, offer/collaboration totals, and recent activity totals.
 * HOW:   Aggregates directly from the current schema tables and derives 30-day activity from messages and search activity.
 */
export const overviewStats = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["admin"]);

    const [
      users,
      brokers,
      developers,
      properties,
      offers,
      conversations,
      subscriptions,
      deals,
      verificationRequests,
      assistantThreads,
      assistantMessages,
      inboxMessages,
      knowledgeResearch,
      searchLogs,
    ] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("brokers").collect(),
      ctx.db.query("RED").collect(),
      ctx.db.query("properties").collect(),
      ctx.db.query("offers").collect(),
      ctx.db.query("inboxConversations").collect(),
      ctx.db.query("subscriptions").collect(),
      ctx.db.query("deals").collect(),
      ctx.db.query("verificationRequests").collect(),
      ctx.db.query("assistantThreads").collect(),
      ctx.db.query("assistantMessages").collect(),
      ctx.db.query("inboxMessages").collect(),
      ctx.db.query("knowledgeResearch").collect(),
      ctx.db.query("searchLogs").collect(),
    ]);

    const now = Date.now();
    const activeUsersSince = now - 30 * 24 * 60 * 60 * 1000;
    const recentActivitySince = now - 7 * 24 * 60 * 60 * 1000;
    const threadUserById = new Map(assistantThreads.map((thread) => [String(thread._id), thread.userId]));
    const activeUsers = new Set<string>();

    for (const message of assistantMessages) {
      if (message.createdAt >= activeUsersSince) {
        const userId = threadUserById.get(String(message.threadId));
        if (userId) activeUsers.add(userId);
      }
    }

    for (const message of inboxMessages) {
      if (message.createdAt >= activeUsersSince) {
        activeUsers.add(message.senderUserId);
        activeUsers.add(message.recipientUserId);
      }
    }

    for (const item of knowledgeResearch) {
      if (item.createdAt >= activeUsersSince) {
        activeUsers.add(item.userId);
      }
    }

    for (const log of searchLogs) {
      if ((log._creationTime ?? 0) >= activeUsersSince && log.userId) {
        activeUsers.add(log.userId);
      }
    }

    const recentActivityCount =
      assistantMessages.filter((item) => item.createdAt >= recentActivitySince).length +
      inboxMessages.filter((item) => item.createdAt >= recentActivitySince).length +
      knowledgeResearch.filter((item) => item.createdAt >= recentActivitySince).length +
      searchLogs.filter((item) => (item._creationTime ?? 0) >= recentActivitySince).length;

    return {
      users: users.length,
      brokers: brokers.length,
      developers: developers.length,
      properties: properties.length,
      offers: offers.length,
      pendingOffers: offers.filter((item) => item.status === "pending").length,
      conversations: conversations.length,
      directMessages: inboxMessages.length,
      deals: deals.length,
      activeSubscriptions: subscriptions.filter((item) => item.status === "active" || item.status === "trial").length,
      actionEnabledOrganizations: subscriptions.filter(
        (item) => (item.status === "active" || item.status === "trial") && item.actionModeEnabled === true,
      ).length,
      pendingVerificationRequests: verificationRequests.filter((item) => item.currentStatus === "new").length,
      inReviewVerificationRequests: verificationRequests.filter((item) => item.currentStatus === "in_review").length,
      approvedVerificationRequests: verificationRequests.filter((item) => item.currentStatus === "approved").length,
      rejectedVerificationRequests: verificationRequests.filter((item) => item.currentStatus === "rejected").length,
      activeUsersLast30Days: activeUsers.size,
      recentActivityLast7Days: recentActivityCount,
    };
  },
});
