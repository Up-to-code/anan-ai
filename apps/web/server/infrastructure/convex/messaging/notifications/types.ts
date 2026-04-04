import type {
  NotificationPreference,
  NotificationSummary,
  NotificationSummaryResponse,
  PushSubscriptionInput,
} from "@/server/contracts/notifications";

export type NotificationsRepository = {
  list(token: string, limit?: number): Promise<NotificationSummary[]>;
  getSummary(token: string): Promise<NotificationSummaryResponse>;
  markRead(token: string, notificationId: string): Promise<void>;
  updatePreferences(token: string, input: NotificationPreference): Promise<void>;
  registerPushSubscription(token: string, input: PushSubscriptionInput): Promise<void>;
  removePushSubscription(token: string, endpoint: string): Promise<void>;
  getPushConfig(token: string): Promise<{ publicKey: string | null; browserPushEnabled: boolean }>;
};
