"use client";

import { cn } from "@/lib/utils";

/**
 * WHY:   The chat thread needs one consistent text bubble primitive across user and assistant messages.
 * WHAT:  Renders a message bubble for textual content only.
 * HOW:   Applies role-aware styling while returning `null` when the message has no text payload.
 */
export default function MessageBubble({
  content,
  isUser,
  isInfo = false,
}: {
  content?: string;
  isUser: boolean;
  isInfo?: boolean;
}) {
  if (!content) {
    return null;
  }

  return (
    <div
      className={cn(
        "max-w-[85%] min-w-[120px] px-5 py-3 text-sm font-bold leading-relaxed rounded-none",
        isUser && "bg-slate-100 text-slate-900",
        !isUser && isInfo && "bg-slate-50 text-slate-700",
        !isUser && !isInfo && "bg-white text-slate-900",
      )}
    >
      {content}
    </div>
  );
}
