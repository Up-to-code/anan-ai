import { queryRef, voidMutationRef } from "@anan/convex-adapters/repository";
import { notificationsApi } from "./api";
import type { NotificationsRepository } from "./types";

export type { NotificationsRepository } from "./types";

export const convexNotificationsRepository: NotificationsRepository = {
  async list(token, limit) {
    return queryRef<Awaited<ReturnType<NotificationsRepository["list"]>>>(
      token,
      notificationsApi.listWorkspaceNotifications,
      { limit },
    );
  },
  async getSummary(token) {
    return queryRef<Awaited<ReturnType<NotificationsRepository["getSummary"]>>>(
      token,
      notificationsApi.getWorkspaceNotificationSummary,
    );
  },
  async markRead(token, notificationId) {
    await voidMutationRef(token, notificationsApi.markWorkspaceNotificationRead, { notificationId });
  },
  async updatePreferences(token, input) {
    await voidMutationRef(token, notificationsApi.updateNotificationPreferences, input);
  },
  async registerPushSubscription(token, input) {
    await voidMutationRef(token, notificationsApi.registerPushSubscription, input);
  },
  async removePushSubscription(token, endpoint) {
    await voidMutationRef(token, notificationsApi.removePushSubscription, { endpoint });
  },
  async getPushConfig(token) {
    return queryRef<Awaited<ReturnType<NotificationsRepository["getPushConfig"]>>>(
      token,
      notificationsApi.getPushSubscriptionConfig,
    );
  },
};
