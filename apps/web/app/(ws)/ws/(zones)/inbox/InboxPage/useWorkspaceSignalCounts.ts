"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";
import { useConvex } from "convex/react";

import { api } from "@/lib/convexApi";

const inboxApi = api.shared_logic.inbox;
const notificationsApi = api.shared_logic.notifications;
const EMPTY_ARGS = {} as Record<string, never>;

type QueryWatch<QueryResult> = {
  localQueryResult: () => QueryResult | undefined;
  onUpdate: (callback: () => void) => () => void;
};

function useSafeLiveQuery<QueryResult>(
  createWatch: (() => QueryWatch<QueryResult>) | null,
) {
  const watchRef = useRef<QueryWatch<QueryResult> | null>(null);
  const subscribe = useCallback((onStoreChange: () => void) => {
    if (!createWatch) {
      watchRef.current = null;
      onStoreChange();
      return () => undefined;
    }

    const watch = createWatch();
    watchRef.current = watch;
    onStoreChange();
    return watch.onUpdate(onStoreChange);
  }, [createWatch]);

  const getSnapshot = useCallback(() => {
    try {
      return watchRef.current?.localQueryResult();
    } catch {
      return undefined;
    }
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/**
 * WHY:   Workspace top-bar badges should subscribe to realtime inbox and notification summaries.
 * WHAT:  Returns the latest unread counts with server-rendered values as a hydration fallback.
 * HOW:   Uses Convex watch subscriptions when a client exists and falls back to the server counts instead of throwing when no provider is mounted yet.
 */
export function useWorkspaceSignalCounts(initialCounts: {
  notificationCount: number;
  inboxCount: number;
}) {
  const convex = useConvex();

  const liveNotifications = useSafeLiveQuery(
    convex
      ? () => convex.watchQuery(notificationsApi.getWorkspaceNotificationSummary, EMPTY_ARGS)
      : null,
  );
  const liveInboxSummary = useSafeLiveQuery(
    convex ? () => convex.watchQuery(inboxApi.getInboxUnreadSummary, EMPTY_ARGS) : null,
  );

  return {
    notificationCount: liveNotifications?.unreadCount ?? initialCounts.notificationCount,
    inboxCount: liveInboxSummary?.unreadCount ?? initialCounts.inboxCount,
  };
}
