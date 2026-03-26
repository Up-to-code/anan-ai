"use client";

import { MessageCircleMore } from "lucide-react";

/**
 * WHY:   Inbox users need a calm default state when no thread is currently opened in the thread panel.
 * WHAT:  Renders the empty thread state with simple guidance for selecting or starting a conversation.
 * HOW:   Uses minimal copy and iconography so the empty state supports the workspace rather than dominating it.
 */
export function InboxThreadEmptyState() {
  return (
    <div className="flex h-full items-center justify-center bg-background/50 px-6">
      <div className="flex max-w-md flex-col items-center gap-4 rounded-3xl border border-border bg-card px-8 py-12 text-center shadow-sm">
        <MessageCircleMore className="h-10 w-10 text-muted-foreground/40" />
        <h2 className="text-xl font-black tracking-tight text-foreground">البريد الوارد</h2>
        <p className="max-w-xs text-[13px] font-medium leading-relaxed text-muted-foreground/80">
          اختر محادثة من القائمة الجانبية أو ابحث عن مستخدم جديد لبدء نقاش مباشر.
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
    <div className="flex h-full items-center justify-center bg-background/50 px-6">
      <div className="rounded-2xl border border-border bg-card px-6 py-4 text-[13px] font-bold text-muted-foreground shadow-sm animate-pulse">
        جاري تحميل المحادثة...
      </div>
    </div>
  );
}
