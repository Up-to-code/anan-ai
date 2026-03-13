import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireRole } from "../_core/security/accessPolicy";

type ActivitySource = "all" | "notifications" | "messages" | "admin";

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

    const [notifications, inboxMessages, assistantThreads, assistantMessages, knowledgeResearch, searchLogs, verificationRequests] = await Promise.all([
      ctx.db.query("workspaceNotifications").collect(),
      ctx.db.query("inboxMessages").collect(),
      ctx.db.query("assistantThreads").collect(),
      ctx.db.query("assistantMessages").collect(),
      ctx.db.query("knowledgeResearch").collect(),
      ctx.db.query("searchLogs").collect(),
      ctx.db.query("verificationRequests").collect(),
    ]);
    const threadUserById = new Map(assistantThreads.map((thread) => [String(thread._id), thread.userId]));

    const items = [
      ...notifications.map((item) => ({
        id: String(item._id),
        source: "notifications" as const,
        createdAt: item.createdAt,
        title: item.title,
        subtitle: item.summary,
        subject: item.userId,
        metadata: {
          type: item.type,
          href: item.href,
          severity: item.severity,
        },
      })),
      ...inboxMessages.map((item) => ({
        id: String(item._id),
        source: "messages" as const,
        createdAt: item.createdAt,
        title: item.type === "offer_event" ? "رسالة عرض" : "رسالة مباشرة",
        subtitle: item.body,
        subject: item.senderUserId,
        metadata: {
          recipientUserId: item.recipientUserId,
          conversationId: item.conversationId,
        },
      })),
      ...assistantMessages.map((item) => ({
        id: String(item._id),
        source: "messages" as const,
        createdAt: item.createdAt,
        title: item.mode === "action" ? "رسالة تفعيل" : "رسالة مساعد",
        subtitle: item.content,
        subject: threadUserById.get(String(item.threadId)) ?? "unknown",
        metadata: {
          role: item.role,
          mode: item.mode,
          threadId: item.threadId,
        },
      })),
      ...knowledgeResearch.map((item) => ({
        id: String(item._id),
        source: "messages" as const,
        createdAt: item.createdAt,
        title: "بحث معرفي",
        subtitle: item.query,
        subject: item.userId,
        metadata: {
          status: item.status,
          channel: item.channel,
          threadId: item.threadId,
        },
      })),
      ...searchLogs.map((item) => ({
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
      })),
      ...verificationRequests.flatMap((item) => {
        const createdItems = [
          {
            id: `${String(item._id)}-submitted`,
            source: "admin" as const,
            createdAt: item.submittedAt,
            title: "طلب تحقق جديد",
            subtitle: item.title ?? item.requestType,
            subject: item.authUserId ?? item.externalUserId ?? String(item.subjectProfileId ?? item.subjectBrokerId ?? item.subjectREDId ?? "unknown"),
            metadata: {
              status: item.currentStatus,
              requestType: item.requestType,
            },
          },
        ];

        const reviewedItems = item.reviewedAt
          ? [
              {
                id: `${String(item._id)}-reviewed`,
                source: "admin" as const,
                createdAt: item.reviewedAt,
                title: "قرار تحقق",
                subtitle: item.reviewerNotes ?? item.title ?? item.requestType,
                subject: item.reviewerId ?? "admin",
                metadata: {
                  status: item.currentStatus,
                  requestType: item.requestType,
                },
              },
            ]
          : [];

        return [...createdItems, ...reviewedItems];
      }),
    ];

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

    const [notifications, inboxMessages, assistantThreads, assistantMessages, knowledgeResearch, searchLogs, verificationRequests] = await Promise.all([
      ctx.db.query("workspaceNotifications").collect(),
      ctx.db.query("inboxMessages").collect(),
      ctx.db.query("assistantThreads").collect(),
      ctx.db.query("assistantMessages").collect(),
      ctx.db.query("knowledgeResearch").collect(),
      ctx.db.query("searchLogs").collect(),
      ctx.db.query("verificationRequests").collect(),
    ]);
    const threadUserById = new Map(assistantThreads.map((thread) => [String(thread._id), thread.userId]));

    const items = [
      ...notifications.map((item) => ({
        id: String(item._id),
        type: "notification" as const,
        userId: item.userId,
        query: item.title,
        createdAt: item.createdAt,
        metadata: { summary: item.summary, severity: item.severity, href: item.href },
      })),
      ...inboxMessages.map((item) => ({
        id: String(item._id),
        type: "message" as const,
        userId: item.senderUserId,
        query: item.body,
        createdAt: item.createdAt,
        metadata: { recipientUserId: item.recipientUserId, messageType: item.type },
      })),
      ...assistantMessages.map((item) => ({
        id: String(item._id),
        type: "message" as const,
        userId: threadUserById.get(String(item.threadId)) ?? undefined,
        query: item.content,
        createdAt: item.createdAt,
        metadata: { role: item.role, mode: item.mode, threadId: item.threadId },
      })),
      ...knowledgeResearch.map((item) => ({
        id: String(item._id),
        type: "knowledgeResearch" as const,
        userId: item.userId,
        query: item.query,
        createdAt: item.createdAt,
        metadata: { status: item.status, channel: item.channel, threadId: item.threadId },
      })),
      ...searchLogs.map((item) => ({
        id: String(item._id),
        type: "searchLog" as const,
        userId: item.userId ?? undefined,
        query: item.query,
        createdAt: item._creationTime ?? 0,
        metadata: { status: item.status, stage: item.stage, channel: item.channel, errorMessage: item.errorMessage },
      })),
      ...verificationRequests.map((item) => ({
        id: String(item._id),
        type: "verification" as const,
        userId: item.authUserId ?? item.externalUserId ?? undefined,
        query: item.title ?? item.requestType,
        createdAt: item.reviewedAt ?? item.submittedAt,
        metadata: { status: item.currentStatus, requestType: item.requestType, reviewerId: item.reviewerId },
      })),
    ];

    return items.sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
  },
});
