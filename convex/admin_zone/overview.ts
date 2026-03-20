import { query } from "../_generated/server";
import { requireRole } from "../_core/security/accessPolicy";

type OverviewCollections = {
  users: any[];
  brokers: any[];
  developers: any[];
  properties: any[];
  offers: any[];
  conversations: any[];
  subscriptions: any[];
  deals: any[];
  verificationRequests: any[];
  assistantThreads: any[];
  assistantMessages: any[];
  inboxMessages: any[];
  knowledgeResearch: any[];
  searchLogs: any[];
};

const OVERVIEW_TABLES = [
  "users",
  "brokers",
  "RED",
  "properties",
  "offers",
  "inboxConversations",
  "subscriptions",
  "deals",
  "verificationRequests",
  "assistantThreads",
  "assistantMessages",
  "inboxMessages",
  "knowledgeResearch",
  "searchLogs",
] as const;

function mapOverviewRows(rows: any[]): OverviewCollections {
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
  ] = rows;
  return {
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
  };
}

async function loadOverviewCollections(ctx: any): Promise<OverviewCollections> {
  const rows = await Promise.all(OVERVIEW_TABLES.map((table) => ctx.db.query(table).collect()));
  return mapOverviewRows(rows);
}

function collectActiveUsers(collections: OverviewCollections, activeUsersSince: number) {
  const threadUserById = new Map(collections.assistantThreads.map((thread) => [String(thread._id), thread.userId]));
  const activeUsers = new Set<string>();
  for (const message of collections.assistantMessages) {
    if (message.createdAt < activeUsersSince) continue;
    const userId = threadUserById.get(String(message.threadId));
    if (userId) activeUsers.add(userId);
  }
  for (const message of collections.inboxMessages) {
    if (message.createdAt < activeUsersSince) continue;
    activeUsers.add(message.senderUserId);
    activeUsers.add(message.recipientUserId);
  }
  for (const item of collections.knowledgeResearch) {
    if (item.createdAt >= activeUsersSince) activeUsers.add(item.userId);
  }
  for (const log of collections.searchLogs) {
    if ((log._creationTime ?? 0) >= activeUsersSince && log.userId) activeUsers.add(log.userId);
  }
  return activeUsers.size;
}

function countRecentActivity(collections: OverviewCollections, recentActivitySince: number) {
  return (
    collections.assistantMessages.filter((item) => item.createdAt >= recentActivitySince).length +
    collections.inboxMessages.filter((item) => item.createdAt >= recentActivitySince).length +
    collections.knowledgeResearch.filter((item) => item.createdAt >= recentActivitySince).length +
    collections.searchLogs.filter((item) => (item._creationTime ?? 0) >= recentActivitySince).length
  );
}

function buildOverviewStats(
  collections: OverviewCollections,
  activeUsersLast30Days: number,
  recentActivityLast7Days: number
) {
  return {
    users: collections.users.length,
    brokers: collections.brokers.length,
    developers: collections.developers.length,
    properties: collections.properties.length,
    offers: collections.offers.length,
    pendingOffers: collections.offers.filter((item) => item.status === "pending").length,
    conversations: collections.conversations.length,
    directMessages: collections.inboxMessages.length,
    deals: collections.deals.length,
    activeSubscriptions: collections.subscriptions.filter((item) => item.status === "active" || item.status === "trial").length,
    actionEnabledOrganizations: collections.subscriptions.filter(
      (item) => (item.status === "active" || item.status === "trial") && item.actionModeEnabled === true,
    ).length,
    pendingVerificationRequests: collections.verificationRequests.filter((item) => item.currentStatus === "new").length,
    inReviewVerificationRequests: collections.verificationRequests.filter((item) => item.currentStatus === "in_review").length,
    approvedVerificationRequests: collections.verificationRequests.filter((item) => item.currentStatus === "approved").length,
    rejectedVerificationRequests: collections.verificationRequests.filter((item) => item.currentStatus === "rejected").length,
    activeUsersLast30Days,
    recentActivityLast7Days,
  };
}

/**
 * WHY:   The Arabic admin dashboard needs one lightweight summary source for KPI cards and review queues.
 * WHAT:  Returns high-level entity counts, verification queue sizes, offer/collaboration totals, and recent activity totals.
 * HOW:   Aggregates directly from the current schema tables and derives 30-day activity from messages and search activity.
 */
export const overviewStats = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["admin"]);
    const collections = await loadOverviewCollections(ctx);
    const now = Date.now();
    const activeUsersSince = now - 30 * 24 * 60 * 60 * 1000;
    const recentActivitySince = now - 7 * 24 * 60 * 60 * 1000;
    const activeUsersLast30Days = collectActiveUsers(collections, activeUsersSince);
    const recentActivityLast7Days = countRecentActivity(collections, recentActivitySince);
    return buildOverviewStats(collections, activeUsersLast30Days, recentActivityLast7Days);
  },
});
