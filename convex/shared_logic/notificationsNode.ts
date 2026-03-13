"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";
import { internalRefs } from "./lib/generatedApiRefs";

export const sendBrowserPush = action({
  args: {
    notificationId: v.id("workspaceNotifications"),
  },
  handler: async (ctx, { notificationId }) => {
    const payload = await ctx.runQuery(
      internalRefs["shared_logic/notifications"]._getNotificationForDelivery,
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

    const publicKey = process.env.WEB_PUSH_PUBLIC_KEY;
    const privateKey = process.env.WEB_PUSH_PRIVATE_KEY;
    const subject = process.env.WEB_PUSH_SUBJECT ?? "mailto:support@anan.sa";

    if (!publicKey || !privateKey) {
      return { status: "skipped" as const, reason: "push_not_configured" };
    }

    const webPushModule = await import("web-push");
    const webPush = "default" in webPushModule ? webPushModule.default : webPushModule;

    webPush.setVapidDetails(subject, publicKey, privateKey);

    const messagePayload = JSON.stringify({
      title: payload.notification.title,
      body: payload.notification.summary,
      href: payload.notification.href,
      notificationId,
    });

    let sentCount = 0;
    const errors: string[] = [];

    for (const subscription of payload.subscriptions) {
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
        sentCount += 1;
        await ctx.runMutation(internalRefs["shared_logic/notifications"]._markSubscriptionDelivery, {
          subscriptionId: subscription._id,
          ok: true,
        });
      } catch (error) {
        const reason = error instanceof Error ? error.message : "Push delivery failed";
        errors.push(reason);
        await ctx.runMutation(internalRefs["shared_logic/notifications"]._markSubscriptionDelivery, {
          subscriptionId: subscription._id,
          ok: false,
          reason,
        });
      }
    }

    if (sentCount === 0) {
      return { status: "failed" as const, reason: errors[0] ?? "push_delivery_failed" };
    }

    return {
      status: "sent" as const,
      reason: errors[0],
    };
  },
});
