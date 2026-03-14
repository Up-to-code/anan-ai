"use client";

import { MessageCircleMore } from "lucide-react";

/**
 * WHY:   Inbox users need a calm default state when no thread is currently opened in the thread panel.
 * WHAT:  Renders the empty thread state with simple guidance for selecting or starting a conversation.
 * HOW:   Uses minimal copy and iconography so the empty state supports the workspace rather than dominating it.
 */
export function InboxThreadEmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-slate-50/60 px-6 text-center">
      <MessageCircleMore className="h-10 w-10 text-slate-300" />
      <h2 className="text-lg font-black text-slate-950">اختر محادثة من القائمة</h2>
      <p className="max-w-sm text-sm font-medium leading-6 text-slate-500">
        افتح محادثة حالية أو ابحث عن مستخدم جديد لبدء نقاش مباشر من مساحة العمل.
      </p>
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
    <div className="flex h-full items-center justify-center bg-slate-50/60 px-6 text-sm font-medium text-slate-500">
      جاري تحميل المحادثة...
    </div>
  );
}
