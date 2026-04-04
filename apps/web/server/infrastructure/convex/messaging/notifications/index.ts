import { fetchMutation, fetchQuery } from "convex/nextjs";
import { notificationsApi } from "./api";
import type { NotificationsRepository } from "./types";

export type { NotificationsRepository } from "./types";

export const convexNotificationsRepository: NotificationsRepository = {
  async list(token, limit) {
    return fetchQuery(notificationsApi.listWorkspaceNotifications as never, { limit } as never, { token }) as ReturnType<NotificationsRepository["list"]>;
  },
  async getSummary(token) {
    return fetchQuery(notificationsApi.getWorkspaceNotificationSummary as never, {} as never, { token }) as ReturnType<NotificationsRepository["getSummary"]>;
  },
  async markRead(token, notificationId) {
    await fetchMutation(notificationsApi.markWorkspaceNotificationRead as never, { notificationId } as never, { token });
  },
  async updatePreferences(token, input) {
    await fetchMutation(notificationsApi.updateNotificationPreferences as never, input as never, { token });
  },
  async registerPushSubscription(token, input) {
    await fetchMutation(notificationsApi.registerPushSubscription as never, input as never, { token });
  },
  async removePushSubscription(token, endpoint) {
    await fetchMutation(notificationsApi.removePushSubscription as never, { endpoint } as never, { token });
  },
  async getPushConfig(token) {
    return fetchQuery(notificationsApi.getPushSubscriptionConfig as never, {} as never, { token }) as Promise<{
      publicKey: string | null;
      browserPushEnabled: boolean;
    }> as ReturnType<NotificationsRepository["getPushConfig"]>;
  },
};
