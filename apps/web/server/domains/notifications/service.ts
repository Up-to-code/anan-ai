import {
  convexNotificationsRepository,
  type NotificationsRepository,
} from "@/server/infrastructure/convex/notificationsRepository";
import { requireSessionContext } from "@/server/auth/session";
import type {
  NotificationPreference,
  PushSubscriptionInput,
} from "@/server/contracts/notifications";

type NotificationsServiceDependencies = {
  requireSession: typeof requireSessionContext;
  repository: NotificationsRepository;
};

const defaultDependencies: NotificationsServiceDependencies = {
  requireSession: requireSessionContext,
  repository: convexNotificationsRepository,
};

export async function listWorkspaceNotifications(
  limit?: number,
  dependencies: NotificationsServiceDependencies = defaultDependencies,
) {
  const session = await dependencies.requireSession();
  return dependencies.repository.list(session.token, limit);
}

export async function getWorkspaceNotificationSummary(
  dependencies: NotificationsServiceDependencies = defaultDependencies,
) {
  const session = await dependencies.requireSession();
  return dependencies.repository.getSummary(session.token);
}

export async function markWorkspaceNotificationRead(
  notificationId: string,
  dependencies: NotificationsServiceDependencies = defaultDependencies,
) {
  const session = await dependencies.requireSession();
  return dependencies.repository.markRead(session.token, notificationId);
}

export async function updateWorkspaceNotificationPreferences(
  input: NotificationPreference,
  dependencies: NotificationsServiceDependencies = defaultDependencies,
) {
  const session = await dependencies.requireSession();
  return dependencies.repository.updatePreferences(session.token, input);
}

export async function registerWorkspacePushSubscription(
  input: PushSubscriptionInput,
  dependencies: NotificationsServiceDependencies = defaultDependencies,
) {
  const session = await dependencies.requireSession();
  return dependencies.repository.registerPushSubscription(session.token, input);
}

export async function removeWorkspacePushSubscription(
  endpoint: string,
  dependencies: NotificationsServiceDependencies = defaultDependencies,
) {
  const session = await dependencies.requireSession();
  return dependencies.repository.removePushSubscription(session.token, endpoint);
}

export async function getWorkspacePushConfig(
  dependencies: NotificationsServiceDependencies = defaultDependencies,
) {
  const session = await dependencies.requireSession();
  return dependencies.repository.getPushConfig(session.token);
}
