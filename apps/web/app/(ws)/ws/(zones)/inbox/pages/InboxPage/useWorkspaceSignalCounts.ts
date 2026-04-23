"use client";

/**
 * WHY:   Workspace top-bar badges need realtime inbox and notification counts.
 * WHAT:  Uses server-rendered counts from the workspace layout.
 * HOW:   Keeps protected Convex reads on the server boundary so auth hydration never fires noisy client queries.
 */
export function useWorkspaceSignalCounts(initialCounts: {
  notificationCount: number;
  inboxCount: number;
}) {
  return {
    notificationCount: initialCounts.notificationCount,
    inboxCount: initialCounts.inboxCount,
  };
}
