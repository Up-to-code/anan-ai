import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "../../_generated/server";
import type { Doc, Id } from "../../_generated/dataModel";
import { internal } from "../../_generated/api";
import { requireSession } from "../../_core/security/accessPolicy";
import { enforceHttpRateLimit } from "../lib/middleware/rateLimit";

type NotificationKind =
  | "message"
  | "offer_sent"
  | "offer_approved"
  | "offer_rejected"
  | "offer_canceled"
  | "offer_completed"
  | "invite_sent"
  | "invite_accepted"
  | "approval_request";

export async function createWorkspaceNotification(
  ctx: Parameters<typeof internalMutation>[0] extends never ? never : any,
  args: {
    userId: string;
    type: NotificationKind;
    title: string;
    summary: string;
    href: string;
    source: string;
    severity?: "info" | "warning" | "success";
    entityType?: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
  },
) {
  const notificationId = await ctx.db.insert("workspaceNotifications", {
    userId: args.userId,
    type: args.type,
    title: args.title,
    summary: args.summary,
    href: args.href,
    source: args.source,
    severity: args.severity ?? "info",
    entityType: args.entityType,
    entityId: args.entityId,
    metadata: args.metadata,
    createdAt: Date.now(),
    pushStatus: "pending",
  });

  await ctx.scheduler.runAfter(
    0,
    internal.shared_logic.workspaceWorkflows.startNotificationWorkflow,
    { notificationId },
  );

  return notificationId;
}

function mapNotification(notification: Doc<"workspaceNotifications">) {
  return {
    id: notification._id,
    type: notification.type,
    title: notification.title,
    summary: notification.summary,
    href: notification.href,
    source: notification.source,
    severity: notification.severity,
    entityType: notification.entityType,
    entityId: notification.entityId,
    metadata: notification.metadata ?? null,
    isRead: Boolean(notification.readAt),
    createdAt: notification.createdAt,
    pushedAt: notification.pushedAt ?? null,
    pushStatus: notification.pushStatus ?? "pending",
  };
}

export const listWorkspaceNotifications = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 20 }) => {
    const session = await requireSession(ctx);
    const notifications = await ctx.db
      .query("workspaceNotifications")
      .withIndex("userId_createdAt", (q) => q.eq("userId", session.authUserId))
      .order("desc")
      .take(limit);

    return notifications.map(mapNotification);
  },
});

export const getWorkspaceNotificationSummary = query({
  args: {},
  handler: async (ctx) => {
    const session = await requireSession(ctx);
    const notifications = await ctx.db
      .query("workspaceNotifications")
      .withIndex("userId_createdAt", (q) => q.eq("userId", session.authUserId))
      .order("desc")
      .take(50);

    return {
      unreadCount: notifications.filter((item) => !item.readAt).length,
      latest: notifications.slice(0, 5).map(mapNotification),
    };
  },
});

export const markWorkspaceNotificationRead = mutation({
  args: {
    notificationId: v.id("workspaceNotifications"),
  },
  handler: async (ctx, { notificationId }) => {
    const session = await requireSession(ctx);
    const notification = await ctx.db.get(notificationId);
    if (!notification || notification.userId !== session.authUserId) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Notification not found" });
    }

    await ctx.db.patch(notificationId, {
      readAt: Date.now(),
    });
  },
});

export const updateNotificationPreferences = mutation({
  args: {
    browserPushEnabled: v.boolean(),
  },
  handler: async (ctx, { browserPushEnabled }) => {
    const session = await requireSession(ctx);
    await enforceHttpRateLimit(ctx, { key: `notification-pref:${session.authUserId}` });

    const existing = await ctx.db
      .query("workspaceNotificationPreferences")
      .withIndex("userId", (q) => q.eq("userId", session.authUserId))
      .unique();

    const updatedAt = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { browserPushEnabled, updatedAt });
      return existing._id;
    }

    return ctx.db.insert("workspaceNotificationPreferences", {
      userId: session.authUserId,
      browserPushEnabled,
      updatedAt,
    });
  },
});

export const registerPushSubscription = mutation({
  args: {
    endpoint: v.string(),
    auth: v.string(),
    p256dh: v.string(),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await requireSession(ctx);
    await enforceHttpRateLimit(ctx, { key: `push-subscription:${session.authUserId}` });

    const now = Date.now();
    const existing = await ctx.db
      .query("workspacePushSubscriptions")
      .withIndex("endpoint", (q) => q.eq("endpoint", args.endpoint))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        userId: session.authUserId,
        keysAuth: args.auth,
        keysP256dh: args.p256dh,
        userAgent: args.userAgent,
        isActive: true,
        updatedAt: now,
      });
      return existing._id;
    }

    return ctx.db.insert("workspacePushSubscriptions", {
      userId: session.authUserId,
      endpoint: args.endpoint,
      keysAuth: args.auth,
      keysP256dh: args.p256dh,
      userAgent: args.userAgent,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const removePushSubscription = mutation({
  args: {
    endpoint: v.string(),
  },
  handler: async (ctx, { endpoint }) => {
    const session = await requireSession(ctx);
    const subscription = await ctx.db
      .query("workspacePushSubscriptions")
      .withIndex("endpoint", (q) => q.eq("endpoint", endpoint))
      .unique();

    if (!subscription || subscription.userId !== session.authUserId) {
      return;
    }

    await ctx.db.patch(subscription._id, {
      isActive: false,
      updatedAt: Date.now(),
    });
  },
});

export const getPushSubscriptionConfig = query({
  args: {},
  handler: async (ctx) => {
    const session = await requireSession(ctx);
    const preference = await ctx.db
      .query("workspaceNotificationPreferences")
      .withIndex("userId", (q) => q.eq("userId", session.authUserId))
      .unique();

    return {
      publicKey: process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY ?? null,
      browserPushEnabled: preference?.browserPushEnabled ?? true,
    };
  },
});

export const _getNotificationForDelivery = internalQuery({
  args: {
    notificationId: v.id("workspaceNotifications"),
  },
  handler: async (ctx, { notificationId }) => {
    const notification = await ctx.db.get(notificationId);
    if (!notification) {
      return null;
    }

    const preference = await ctx.db
      .query("workspaceNotificationPreferences")
      .withIndex("userId", (q) => q.eq("userId", notification.userId))
      .unique();

    const subscriptions = await ctx.db
      .query("workspacePushSubscriptions")
      .withIndex("userId_isActive", (q) => q.eq("userId", notification.userId).eq("isActive", true))
      .collect();

    return {
      notification,
      preference,
      subscriptions,
    };
  },
});

export const _markNotificationDelivered = internalMutation({
  args: {
    notificationId: v.id("workspaceNotifications"),
    status: v.union(v.literal("sent"), v.literal("failed"), v.literal("skipped")),
    error: v.optional(v.string()),
  },
  handler: async (ctx, { notificationId, status, error }) => {
    await ctx.db.patch(notificationId, {
      pushStatus: status,
      pushedAt: status === "sent" ? Date.now() : undefined,
      pushError: error,
    });
  },
});

export const _markSubscriptionDelivery = internalMutation({
  args: {
    subscriptionId: v.id("workspacePushSubscriptions"),
    ok: v.boolean(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { subscriptionId, ok, reason }) => {
    await ctx.db.patch(subscriptionId, ok
      ? { lastSuccessAt: Date.now(), failureReason: undefined, isActive: true, updatedAt: Date.now() }
      : { lastFailureAt: Date.now(), failureReason: reason, updatedAt: Date.now() });
  },
});
