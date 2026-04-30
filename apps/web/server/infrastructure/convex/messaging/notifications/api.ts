import { createRepositoryRefs } from "@anan/convex-adapters/repository";
import { apiUnsafe } from "@/lib/convexApi";

export type NotificationsApiRefs = {
  listWorkspaceNotifications: unknown;
  getWorkspaceNotificationSummary: unknown;
  markWorkspaceNotificationRead: unknown;
  updateNotificationPreferences: unknown;
  registerPushSubscription: unknown;
  removePushSubscription: unknown;
  getPushSubscriptionConfig: unknown;
};

export const notificationsApi = createRepositoryRefs<NotificationsApiRefs>(apiUnsafe, "shared_logic/notifications");
