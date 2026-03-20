import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireRole } from "../_core/security/accessPolicy";
import { getBucketMs, getLookbackMs, toBucketLabels } from "./analytics.helpers";

const DAY_MS = 24 * 60 * 60 * 1000;

function collectActiveUsers(args: {
  since: number;
  threadUserById: Map<string, string>;
  assistantMessages: Array<{ createdAt: number; threadId: unknown }>;
  inboxMessages: Array<{ createdAt: number; senderUserId?: string | null; recipientUserId?: string | null }>;
  knowledgeResearch: Array<{ createdAt: number; userId?: string | null }>;
  searchLogs: Array<{ _creationTime?: number | null; userId?: string | null }>;
}) {
  const bucketUsers = new Map<number, Set<string>>();
  const distinctUsers = new Set<string>();
  const addUser = (timestamp: number, userId?: string | null) => {
    if (!userId || timestamp < args.since) return;
    const bucket = Math.floor(timestamp / DAY_MS) * DAY_MS;
    const users = bucketUsers.get(bucket) ?? new Set<string>();
    users.add(userId);
    bucketUsers.set(bucket, users);
    distinctUsers.add(userId);
  };
  for (const message of args.assistantMessages) addUser(message.createdAt, args.threadUserById.get(String(message.threadId)));
  for (const message of args.inboxMessages) {
    addUser(message.createdAt, message.senderUserId);
    addUser(message.createdAt, message.recipientUserId);
  }
  for (const item of args.knowledgeResearch) addUser(item.createdAt, item.userId);
  for (const item of args.searchLogs) addUser(item._creationTime ?? 0, item.userId);
  return { bucketUsers, totalDistinctUsers: distinctUsers.size };
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
    const { bucketUsers, totalDistinctUsers } = collectActiveUsers({
      since,
      threadUserById,
      assistantMessages,
      inboxMessages,
      knowledgeResearch,
      searchLogs,
    });

    return {
      totalDistinctUsers,
      trend: Array.from(bucketUsers.entries())
        .sort(([left], [right]) => left - right)
        .map(([timestamp, users]) => ({
          label: new Date(timestamp).toISOString().slice(0, 10),
          value: users.size,
        })),
    };
  },
});
