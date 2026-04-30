"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BellDot, MessageSquareMore, X } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import type { NotificationSummary } from "@/server/contracts/notifications";
import NotificationOpenLink from "./NotificationOpenLink";

type ToastItem = NotificationSummary & {
  conversationId: string | null;
};

const AUTO_DISMISS_MS = 5000;

function resolveConversationId(notification: NotificationSummary) {
  const metadataConversationId =
    typeof notification.metadata?.conversationId === "string"
      ? notification.metadata.conversationId
      : null;

  return metadataConversationId ?? notification.entityId ?? null;
}

/**
 * WHY:   Workspace toasts should share the same explicit read-on-open behavior as the notifications center.
 * WHAT:  Renders a single toast card with an open action and separate dismiss controls.
 * HOW:   Uses the shared notification-open link for the primary action and keeps dismiss buttons side-effect free.
 */
export function WorkspaceMessageToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (toastId: string) => void;
}) {
  return (
    <div className="pointer-events-auto overflow-hidden rounded-[22px] border border-stone-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.18)] dark:border-stone-800 dark:bg-slate-950">
      <div className="flex items-start gap-3 p-4">
        <div className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-stone-950 text-white dark:bg-slate-100 dark:text-slate-950">
          <MessageSquareMore className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs font-black tracking-[0.14em] text-stone-500 dark:text-stone-400">
            <BellDot className="h-3.5 w-3.5" />
            رسالة جديدة
          </div>
          <div className="mt-2 text-sm font-black text-slate-950 dark:text-slate-100">{toast.title}</div>
          <div className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{toast.summary}</div>
          <div className="mt-3 flex items-center gap-2">
            <NotificationOpenLink
              notificationId={toast.id}
              href={toast.href}
              isRead={toast.isRead}
              className="inline-flex items-center rounded-2xl border border-stone-300 bg-stone-950 px-3 py-2 text-xs font-bold text-white transition hover:bg-stone-800"
            >
              فتح المحادثة
            </NotificationOpenLink>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="inline-flex items-center rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-bold text-stone-700 transition hover:border-stone-400 hover:text-stone-950 dark:border-stone-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-stone-500 dark:hover:text-white"
            >
              تجاهل
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 dark:text-stone-500 dark:hover:bg-slate-900 dark:hover:text-slate-200"
          aria-label="إغلاق التنبيه"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function WorkspaceMessageToasts({
  initialNotifications = [],
}: {
  initialNotifications?: NotificationSummary[];
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const notifications = initialNotifications;
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const hasSeededInitialNotificationsRef = useRef(false);
  const seededIdsRef = useRef<Set<string>>(new Set());
  const timeoutIdsRef = useRef<Map<string, number>>(new Map());

  const activeConversationId = useMemo(() => {
    if (pathname !== "/ws/inbox") {
      return null;
    }

    return searchParams.get("conversationId");
  }, [pathname, searchParams]);

  useEffect(() => {
    return () => {
      timeoutIdsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeoutIdsRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (notifications.length === 0) {
      return;
    }

    if (!hasSeededInitialNotificationsRef.current) {
      hasSeededInitialNotificationsRef.current = true;
      notifications.forEach((notification) => {
        seededIdsRef.current.add(notification.id);
      });
      return;
    }

    const incomingMessageNotifications = notifications.filter((notification) => {
      if (notification.type !== "message" || notification.isRead) {
        return false;
      }

      if (seededIdsRef.current.has(notification.id)) {
        return false;
      }

      const conversationId = resolveConversationId(notification);
      if (activeConversationId && conversationId === activeConversationId) {
        seededIdsRef.current.add(notification.id);
        return false;
      }

      return true;
    });

    if (incomingMessageNotifications.length === 0) {
      notifications.forEach((notification) => {
        seededIdsRef.current.add(notification.id);
      });
      return;
    }

    setToasts((current) => {
      const next = [...current];

      for (const notification of incomingMessageNotifications.reverse()) {
        seededIdsRef.current.add(notification.id);
        const toast: ToastItem = {
          ...notification,
          conversationId: resolveConversationId(notification),
        };
        next.unshift(toast);
      }

      return next.slice(0, 3);
    });

    incomingMessageNotifications.forEach((notification) => {
      const existingTimeout = timeoutIdsRef.current.get(notification.id);
      if (existingTimeout) {
        window.clearTimeout(existingTimeout);
      }

      const timeoutId = window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== notification.id));
        timeoutIdsRef.current.delete(notification.id);
      }, AUTO_DISMISS_MS);
      timeoutIdsRef.current.set(notification.id, timeoutId);
    });
  }, [activeConversationId, notifications]);

  const dismissToast = (toastId: string) => {
    const timeoutId = timeoutIdsRef.current.get(toastId);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutIdsRef.current.delete(toastId);
    }
    setToasts((current) => current.filter((toast) => toast.id !== toastId));
  };

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-5 left-5 z-[80] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-3">
      {toasts.map((toast) => (
        <WorkspaceMessageToastCard key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
}
