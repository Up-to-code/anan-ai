import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireRole } from "../_core/security/accessPolicy";

type ActivitySource = "all" | "notifications" | "messages" | "admin";
type ActivityTableRow = Record<string, any>;

type ActivitySources = {
  notifications: ActivityTableRow[];
  inboxMessages: ActivityTableRow[];
  assistantMessages: ActivityTableRow[];
  knowledgeResearch: ActivityTableRow[];
  searchLogs: ActivityTableRow[];
  verificationRequests: ActivityTableRow[];
  threadUserById: Map<string, string>;
};

async function loadActivitySources(ctx: any): Promise<ActivitySources> {
  const [
    notifications,
    inboxMessages,
    assistantThreads,
    assistantMessages,
    knowledgeResearch,
    searchLogs,
    verificationRequests,
  ] = await Promise.all([
    ctx.db.query("workspaceNotifications").order("desc").take(200),
    ctx.db.query("inboxMessages").order("desc").take(200),
    ctx.db.query("assistantThreads").order("desc").take(200),
    ctx.db.query("assistantMessages").order("desc").take(200),
    ctx.db.query("knowledgeResearch").order("desc").take(200),
    ctx.db.query("searchLogs").order("desc").take(200),
    ctx.db.query("verificationRequests").order("desc").take(200),
  ]);
  const threadUserById: Map<string, string> = new Map(
    assistantThreads.map((thread: ActivityTableRow): [string, string] => [
      String(thread._id),
      String(thread.userId ?? ""),
    ]),
  );
  return {
    notifications,
    inboxMessages,
    assistantMessages,
    knowledgeResearch,
    searchLogs,
    verificationRequests,
    threadUserById,
  };
}

function mapNotificationFeedItem(item: ActivityTableRow) {
  return {
    id: String(item._id),
    source: "notifications" as const,
    createdAt: item.createdAt,
    title: item.title,
    subtitle: item.summary,
    subject: item.userId,
    metadata: { type: item.type, href: item.href, severity: item.severity },
  };
}

function mapInboxFeedItem(item: ActivityTableRow) {
  return {
    id: String(item._id),
    source: "messages" as const,
    createdAt: item.createdAt,
    title: item.type === "offer_event" ? "رسالة عرض" : "رسالة مباشرة",
    subtitle: item.body,
    subject: item.senderUserId,
    metadata: { recipientUserId: item.recipientUserId, conversationId: item.conversationId },
  };
}

function mapAssistantFeedItem(item: ActivityTableRow, threadUserById: Map<string, string>) {
  return {
    id: String(item._id),
    source: "messages" as const,
    createdAt: item.createdAt,
    title: item.mode === "action" ? "رسالة تفعيل" : "رسالة مساعد",
    subtitle: item.content,
    subject: threadUserById.get(String(item.threadId)) ?? "unknown",
    metadata: { role: item.role, mode: item.mode, threadId: item.threadId },
  };
}

function mapKnowledgeFeedItem(item: ActivityTableRow) {
  return {
    id: String(item._id),
    source: "messages" as const,
    createdAt: item.createdAt,
    title: "بحث معرفي",
    subtitle: item.query,
    subject: item.userId,
    metadata: { status: item.status, channel: item.channel, threadId: item.threadId },
  };
}

function mapSearchLogFeedItem(item: ActivityTableRow) {
  return {
    id: String(item._id),
    source: "messages" as const,
    createdAt: item._creationTime ?? 0,
    title: "سجل بحث",
    subtitle: item.query ?? "بدون نص",
    subject: item.userId ?? "anonymous",
    metadata: {
      status: item.status,
      stage: item.stage,
      channel: item.channel,
      errorMessage: item.errorMessage,
    },
  };
}

function buildVerificationSubject(item: ActivityTableRow) {
  return (
    item.authUserId ??
    item.externalUserId ??
    String(item.subjectProfileId ?? item.subjectBrokerId ?? item.subjectREDId ?? "unknown")
  );
}

function mapVerificationFeedItems(item: ActivityTableRow) {
  const createdItem = {
    id: `${String(item._id)}-submitted`,
    source: "admin" as const,
    createdAt: item.submittedAt,
    title: "طلب تحقق جديد",
    subtitle: item.title ?? item.requestType,
    subject: buildVerificationSubject(item),
    metadata: { status: item.currentStatus, requestType: item.requestType },
  };
  if (!item.reviewedAt) {
    return [createdItem];
  }
  return [
    createdItem,
    {
      id: `${String(item._id)}-reviewed`,
      source: "admin" as const,
      createdAt: item.reviewedAt,
      title: "قرار تحقق",
      subtitle: item.reviewerNotes ?? item.title ?? item.requestType,
      subject: item.reviewerId ?? "admin",
      metadata: { status: item.currentStatus, requestType: item.requestType },
    },
  ];
}

function buildMergedActivityItems({
  notifications,
  inboxMessages,
  assistantMessages,
  knowledgeResearch,
  searchLogs,
  verificationRequests,
  threadUserById,
}: ActivitySources) {
  return [
    ...notifications.map(mapNotificationFeedItem),
    ...inboxMessages.map(mapInboxFeedItem),
    ...assistantMessages.map((item) => mapAssistantFeedItem(item, threadUserById)),
    ...knowledgeResearch.map(mapKnowledgeFeedItem),
    ...searchLogs.map(mapSearchLogFeedItem),
    ...verificationRequests.flatMap(mapVerificationFeedItems),
  ];
}

function mapNotificationRecentItem(item: ActivityTableRow) {
  return {
    id: String(item._id),
    type: "notification" as const,
    userId: item.userId,
    query: item.title,
    createdAt: item.createdAt,
    metadata: { summary: item.summary, severity: item.severity, href: item.href },
  };
}

function mapInboxRecentItem(item: ActivityTableRow) {
  return {
    id: String(item._id),
    type: "message" as const,
    userId: item.senderUserId,
    query: item.body,
    createdAt: item.createdAt,
    metadata: { recipientUserId: item.recipientUserId, messageType: item.type },
  };
}

function mapAssistantRecentItem(item: ActivityTableRow, threadUserById: Map<string, string>) {
  return {
    id: String(item._id),
    type: "message" as const,
    userId: threadUserById.get(String(item.threadId)) ?? undefined,
    query: item.content,
    createdAt: item.createdAt,
    metadata: { role: item.role, mode: item.mode, threadId: item.threadId },
  };
}

function mapKnowledgeRecentItem(item: ActivityTableRow) {
  return {
    id: String(item._id),
    type: "knowledgeResearch" as const,
    userId: item.userId,
    query: item.query,
    createdAt: item.createdAt,
    metadata: { status: item.status, channel: item.channel, threadId: item.threadId },
  };
}

function mapSearchLogRecentItem(item: ActivityTableRow) {
  return {
    id: String(item._id),
    type: "searchLog" as const,
    userId: item.userId ?? undefined,
    query: item.query,
    createdAt: item._creationTime ?? 0,
    metadata: { status: item.status, stage: item.stage, channel: item.channel, errorMessage: item.errorMessage },
  };
}

function mapVerificationRecentItem(item: ActivityTableRow) {
  return {
    id: String(item._id),
    type: "verification" as const,
    userId: item.authUserId ?? item.externalUserId ?? undefined,
    query: item.title ?? item.requestType,
    createdAt: item.reviewedAt ?? item.submittedAt,
    metadata: { status: item.currentStatus, requestType: item.requestType, reviewerId: item.reviewerId },
  };
}

function buildRecentActivityItems({
  notifications,
  inboxMessages,
  assistantMessages,
  knowledgeResearch,
  searchLogs,
  verificationRequests,
  threadUserById,
}: ActivitySources) {
  return [
    ...notifications.map(mapNotificationRecentItem),
    ...inboxMessages.map(mapInboxRecentItem),
    ...assistantMessages.map((item) => mapAssistantRecentItem(item, threadUserById)),
    ...knowledgeResearch.map(mapKnowledgeRecentItem),
    ...searchLogs.map(mapSearchLogRecentItem),
    ...verificationRequests.map(mapVerificationRecentItem),
  ];
}

/**
 * WHY:   The redesigned admin activity section needs one merged operational feed with source filtering.
 * WHAT:  Returns a normalized activity list across notifications, direct messages, AI/search activity, and admin verification actions.
 * HOW:   Reads the current source tables, maps them into one feed shape, then sorts by newest first.
 */
export const listActivityFeed = query({
  args: {
    source: v.optional(
      v.union(
        v.literal("all"),
        v.literal("notifications"),
        v.literal("messages"),
        v.literal("admin"),
      ),
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { source = "all", limit = 50 }) => {
    await requireRole(ctx, ["admin"]);
    const items = buildMergedActivityItems(await loadActivitySources(ctx));
    const filtered = items.filter((item) => source === "all" || item.source === source);
    return filtered.sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
  },
});

/**
 * WHY:   Existing admin overview loaders still depend on a recent-activity query.
 * WHAT:  Provides a backward-compatible alias for the merged activity feed.
 * HOW:   Delegates to the same merged-source logic used by the activity section and returns the newest items only.
 */
export const recentActivities = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 50 }) => {
    await requireRole(ctx, ["admin"]);
    const items = buildRecentActivityItems(await loadActivitySources(ctx));
    return items.sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
  },
});
