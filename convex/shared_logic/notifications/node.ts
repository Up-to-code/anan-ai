"use node";

import { v } from "convex/values";
import { action } from "../../_generated/server";
import { internal } from "../../_generated/api";

function getWebPushConfig() {
  const publicKey = process.env.WEB_PUSH_PUBLIC_KEY;
  const privateKey = process.env.WEB_PUSH_PRIVATE_KEY;
  const subject = process.env.WEB_PUSH_SUBJECT ?? "mailto:support@anan.sa";
  if (!publicKey || !privateKey) return null;
  return { publicKey, privateKey, subject };
}

function buildMessagePayload(notification: { title: string; summary: string; href: string }, notificationId: string) {
  return JSON.stringify({
    title: notification.title,
    body: notification.summary,
    href: notification.href,
    notificationId,
  });
}

async function resolveWebPush() {
  const webPushModule = await import("web-push");
  return "default" in webPushModule ? webPushModule.default : webPushModule;
}

async function markSubscriptionDelivery(ctx: any, subscriptionId: any, ok: boolean, reason?: string) {
  await ctx.runMutation(internal.shared_logic.notifications._markSubscriptionDelivery, {
    subscriptionId,
    ok,
    reason,
  });
}

async function deliverPush(
  ctx: any,
  webPush: any,
  subscription: any,
  messagePayload: string,
  errors: string[]
) {
  try {
    await webPush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          auth: subscription.keysAuth,
          p256dh: subscription.keysP256dh,
        },
      },
      messagePayload,
    );
    await markSubscriptionDelivery(ctx, subscription._id, true);
    return true;
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Push delivery failed";
    errors.push(reason);
    await markSubscriptionDelivery(ctx, subscription._id, false, reason);
    return false;
  }
}

function buildPushDeliveryResult(sentCount: number, errors: string[]) {
  if (sentCount === 0) {
    return { status: "failed" as const, reason: errors[0] ?? "push_delivery_failed" };
  }
  return {
    status: "sent" as const,
    reason: errors[0],
  };
}

export const sendBrowserPush = action({
  args: {
    notificationId: v.id("workspaceNotifications"),
  },
  handler: async (ctx, { notificationId }) => {
    const payload = await ctx.runQuery(
      internal.shared_logic.notifications._getNotificationForDelivery,
      { notificationId },
    );

    if (!payload?.notification) {
      return { status: "skipped" as const, reason: "notification_missing" };
    }

    if (payload.preference?.browserPushEnabled === false) {
      return { status: "skipped" as const, reason: "push_disabled" };
    }

    if (!payload.subscriptions.length) {
      return { status: "skipped" as const, reason: "no_subscriptions" };
    }

    const config = getWebPushConfig();
    if (!config) {
      return { status: "skipped" as const, reason: "push_not_configured" };
    }

    const webPush = await resolveWebPush();
    webPush.setVapidDetails(config.subject, config.publicKey, config.privateKey);
    const messagePayload = buildMessagePayload(payload.notification, String(notificationId));

    let sentCount = 0;
    const errors: string[] = [];

    for (const subscription of payload.subscriptions) {
      sentCount += (await deliverPush(ctx, webPush, subscription, messagePayload, errors)) ? 1 : 0;
    }
    return buildPushDeliveryResult(sentCount, errors);
  },
});
