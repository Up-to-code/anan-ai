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
  isStreaming = false,
}: {
  content?: string;
  isUser: boolean;
  isInfo?: boolean;
  isStreaming?: boolean;
}) {
  if (!content) {
    return null;
  }

  return (
    <div
      className={cn(
        "max-w-[88%] min-w-[120px] whitespace-pre-wrap break-words px-5 py-3 text-sm leading-relaxed rounded-2xl border",
        isUser && "border-slate-200 bg-slate-100 text-slate-900",
        !isUser && isInfo && "border-slate-200 bg-slate-50 text-slate-700",
        !isUser && !isInfo && "border-slate-200 bg-white text-slate-900 shadow-sm",
        isStreaming && "transition-all duration-150",
      )}
      dir="rtl"
    >
      {content}
    </div>
  );
}
