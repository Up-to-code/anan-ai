"use client";

import { ArrowRight } from "lucide-react";
import type { ConversationDetail } from "@/server/contracts/inbox";

/**
 * WHY:   The active thread should identify the participant clearly without oversized status chrome.
 * WHAT:  Renders the compact header for the selected inbox conversation, including a mobile back action.
 * HOW:   Shows the thread identity, organization context, message count, and a conditional back button on small screens.
 */
export default function InboxThreadHeader({
  conversation,
  onBack,
  showBackButton = false,
}: {
  conversation: ConversationDetail;
  onBack?: () => void;
  showBackButton?: boolean;
}) {
  return (
    <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
      <div className="flex items-center gap-3">
        {showBackButton ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-10 w-10 items-center justify-center border border-slate-200 bg-white text-slate-700 transition hover:border-blue-200 hover:text-blue-700 md:hidden"
            aria-label="العودة إلى قائمة المحادثات"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : null}

        <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-slate-200 bg-slate-950 text-sm font-black text-white">
          {conversation.otherUser.name.slice(0, 1) || "؟"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-black text-slate-950">{conversation.otherUser.name}</div>
          <div className="mt-0.5 text-xs font-medium text-slate-500">
            {conversation.otherUser.organizationName
              ? `${conversation.otherUser.role} · ${conversation.otherUser.organizationName}`
              : conversation.otherUser.role}
            {" · "}
            {conversation.messages.length} رسالة
          </div>
        </div>
      </div>
    </header>
  );
}
