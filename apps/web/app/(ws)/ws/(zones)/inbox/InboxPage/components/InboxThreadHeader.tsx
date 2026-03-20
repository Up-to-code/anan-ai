"use client";

import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConversationDetail } from "@/server/contracts/inbox";

function ThreadAvatar({ image, name }: { image?: string | null; name: string }) {
  if (image) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img src={image} alt={name} className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-slate-100" />
    );
  }

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-black text-slate-600">
      {name.slice(0, 1) || "؟"}
    </div>
  );
}

function ThreadSubtitle({ conversation }: { conversation: ConversationDetail }) {
  const { otherUser } = conversation;
  const toneClass = otherUser.organizationName ? "text-slate-500" : "text-slate-400";
  const organizationPart = otherUser.organizationName ? `${otherUser.role} · ${otherUser.organizationName}` : otherUser.role;
  return (
    <div className={cn("mt-0.5 text-xs font-medium", toneClass)}>
      {organizationPart}
      {" · "}
      {conversation.messages.length} رسالة
    </div>
  );
}

/**
 * WHY:   The active thread should identify the participant clearly with their real avatar.
 * WHAT:  Renders the compact header for the selected inbox conversation with avatar, name, org, and a mobile back action.
 * HOW:   Shows a real Google avatar (or initials fallback), the thread identity, organization context, and message count.
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
  const { otherUser } = conversation;

  return (
    <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3">
        {showBackButton ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-blue-200 hover:text-blue-700 md:hidden"
            aria-label="العودة إلى قائمة المحادثات"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : null}

        <ThreadAvatar image={otherUser.image} name={otherUser.name} />

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-black text-slate-950">{otherUser.name}</div>
          <ThreadSubtitle conversation={conversation} />
        </div>
      </div>
    </header>
  );
}
