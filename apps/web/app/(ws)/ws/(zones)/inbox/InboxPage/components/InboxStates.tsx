"use client";

import { MessageCircleMore } from "lucide-react";

/**
 * WHY:   Inbox users need a calm default state when no thread is currently opened in the thread panel.
 * WHAT:  Renders the empty thread state with simple guidance for selecting or starting a conversation.
 * HOW:   Uses minimal copy and iconography so the empty state supports the workspace rather than dominating it.
 */
export function InboxThreadEmptyState() {
  return (
    <div className="flex h-full items-center justify-center bg-[color:color-mix(in_srgb,var(--workspace-canvas)_86%,transparent)] px-6">
      <div className="flex max-w-md flex-col items-center gap-4 rounded-[28px] border border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[var(--workspace-panel)] px-8 py-10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.12)]">
        <MessageCircleMore className="h-10 w-10 text-[var(--workspace-highlight)]" />
        <h2 className="text-lg font-black text-[var(--workspace-bubble-other-foreground)]">اختر محادثة من القائمة</h2>
        <p className="max-w-sm text-sm font-medium leading-6 text-[var(--workspace-muted)]">
          افتح محادثة حالية أو ابحث عن مستخدم جديد لبدء نقاش مباشر من مساحة العمل.
        </p>
      </div>
    </div>
  );
}

/**
 * WHY:   Realtime thread hydration should communicate progress without large loading shells.
 * WHAT:  Renders the loading state for the active inbox thread.
 * HOW:   Keeps the message short and visually light while data subscriptions resolve.
 */
export function InboxThreadLoadingState() {
  return (
    <div className="flex h-full items-center justify-center bg-[color:color-mix(in_srgb,var(--workspace-canvas)_86%,transparent)] px-6">
      <div className="rounded-2xl border border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[var(--workspace-panel)] px-5 py-4 text-sm font-medium text-[var(--workspace-muted)]">
        جاري تحميل المحادثة...
      </div>
    </div>
  );
}
