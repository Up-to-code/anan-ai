"use client";

import { useQuery } from "convex/react";

import { api } from "@/lib/convexApi";

const inboxApi = api.shared_logic.inbox;
const notificationsApi = api.shared_logic.notifications;

/**
 * WHY:   Workspace top-bar badges should subscribe to realtime inbox and notification summaries.
 * WHAT:  Returns the latest unread counts with server-rendered values as a hydration fallback.
 * HOW:   Reads the Convex notification summary and inbox unread summary queries directly from the client provider.
 */
export function useWorkspaceSignalCounts(initialCounts: {
  notificationCount: number;
  inboxCount: number;
}) {
  const liveNotifications = useQuery(notificationsApi.getWorkspaceNotificationSummary, {});
  const liveInboxSummary = useQuery(inboxApi.getInboxUnreadSummary, {});

  return {
    notificationCount: liveNotifications?.unreadCount ?? initialCounts.notificationCount,
    inboxCount: liveInboxSummary?.unreadCount ?? initialCounts.inboxCount,
  };
}
