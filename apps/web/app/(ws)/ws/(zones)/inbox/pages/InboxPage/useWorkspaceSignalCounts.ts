"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/lib/convexApi";

/**
 * WHY:   Workspace top-bar badges need realtime inbox and notification counts.
 * WHAT:  Subscribes via Convex's built-in useQuery (already real-time) and
 *        falls back to server-rendered initialCounts while loading.
 * HOW:   useQuery returns undefined until Convex resolves; we coalesce with
 *        the SSR-provided initial counts so badges never flash to zero.
 */
export function useWorkspaceSignalCounts(initialCounts: {
  notificationCount: number;
  inboxCount: number;
}) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const queryArgs = !isLoading && isAuthenticated ? {} : "skip";
  const liveNotifications = useQuery(
    api.shared_logic.notifications.getWorkspaceNotificationSummary,
    queryArgs,
  );
  const liveInboxSummary = useQuery(
    api.shared_logic.inbox.getInboxUnreadSummary,
    queryArgs,
  );

  return {
    notificationCount: liveNotifications?.unreadCount ?? initialCounts.notificationCount,
    inboxCount: liveInboxSummary?.unreadCount ?? initialCounts.inboxCount,
  };
}
