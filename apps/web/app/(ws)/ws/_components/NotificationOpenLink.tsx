"use client";

import Link from "next/link";
import { useMutation } from "convex/react";
import type { Id } from "@convex/dataModel";
import { api } from "@/lib/convexApi";

type NotificationOpenLinkViewProps = {
  notificationId: string;
  href: string;
  isRead: boolean;
  className?: string;
  children: React.ReactNode;
};

type MarkNotificationRead = (args: {
  notificationId: Id<"workspaceNotifications">;
}) => Promise<unknown>;

/**
 * WHY:   Workspace notifications should clear the navbar signal only when the user explicitly opens one.
 * WHAT:  Fires the existing notification-read mutation without blocking the destination navigation.
 * HOW:   No-ops for already-read items and intentionally avoids awaiting the mutation before route change.
 */
export function markNotificationReadOnOpen(args: {
  notificationId: string;
  isRead: boolean;
  markRead: MarkNotificationRead;
}) {
  if (args.isRead) {
    return;
  }

  void args.markRead({
    notificationId: args.notificationId as Id<"workspaceNotifications">,
  }).catch(() => undefined);
}

/**
 * WHY:   Notification rows and toasts need one reusable activation surface with consistent read-state behavior.
 * WHAT:  Renders a client-side link that marks unread notifications as read when activated.
 * HOW:   Delegates the mutation side effect to `markNotificationReadOnOpen` and leaves navigation untouched.
 */
export function NotificationOpenLinkView({
  notificationId,
  href,
  isRead,
  className,
  children,
  markRead,
}: NotificationOpenLinkViewProps & {
  markRead: MarkNotificationRead;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => markNotificationReadOnOpen({ notificationId, isRead, markRead })}
    >
      {children}
    </Link>
  );
}

/**
 * WHY:   Workspace notification surfaces should reuse the same read-on-open behavior everywhere.
 * WHAT:  Connects the shared notification link view to the live Convex notification mutation.
 * HOW:   Uses the authenticated workspace Convex client already mounted at the `(ws)` route group.
 */
export default function NotificationOpenLink(props: NotificationOpenLinkViewProps) {
  const markRead = useMutation(api.shared_logic.notifications.markWorkspaceNotificationRead);

  return <NotificationOpenLinkView {...props} markRead={markRead} />;
}
