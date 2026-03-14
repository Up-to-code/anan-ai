import { fetchMutation, fetchQuery } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";
import type {
  NotificationPreference,
  NotificationSummary,
  NotificationSummaryResponse,
  PushSubscriptionInput,
} from "@/server/contracts/notifications";

type NotificationsApiRefs = {
  listWorkspaceNotifications: unknown;
  getWorkspaceNotificationSummary: unknown;
  markWorkspaceNotificationRead: unknown;
  updateNotificationPreferences: unknown;
  registerPushSubscription: unknown;
  removePushSubscription: unknown;
  getPushSubscriptionConfig: unknown;
};

const notificationsApi = apiUnsafe["shared_logic/notifications"] as NotificationsApiRefs;

export type NotificationsRepository = {
  list(token: string, limit?: number): Promise<NotificationSummary[]>;
  getSummary(token: string): Promise<NotificationSummaryResponse>;
  markRead(token: string, notificationId: string): Promise<void>;
  updatePreferences(token: string, input: NotificationPreference): Promise<void>;
  registerPushSubscription(token: string, input: PushSubscriptionInput): Promise<void>;
  removePushSubscription(token: string, endpoint: string): Promise<void>;
  getPushConfig(token: string): Promise<{ publicKey: string | null; browserPushEnabled: boolean }>;
};

export const convexNotificationsRepository: NotificationsRepository = {
  async list(token, limit) {
    return fetchQuery(notificationsApi.listWorkspaceNotifications as never, { limit } as never, { token }) as Promise<NotificationSummary[]>;
  },
  async getSummary(token) {
    return fetchQuery(notificationsApi.getWorkspaceNotificationSummary as never, {} as never, { token }) as Promise<NotificationSummaryResponse>;
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
    }>;
  },
};
