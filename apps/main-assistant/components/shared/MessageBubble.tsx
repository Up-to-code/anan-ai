"use client";

import type { MainAssistantMessage } from "@/server/contracts/mainAssistant";
import { cn } from "@/lib/utils";

type MessageBubbleProps = {
  message: MainAssistantMessage;
};

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

/**
 * WHY:   The transcript needs one compact visual treatment for user and assistant turns.
 * WHAT:  Renders a single conversation bubble with role-aware styling and timestamp metadata.
 * HOW:   Uses a calm, editorial card treatment instead of chat-bubble gimmicks to match the public product tone.
 */
export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <article
      className={cn(
        "max-w-[44rem] rounded-[1.5rem] border px-5 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]",
        isUser
          ? "mr-auto border-stone-900 bg-stone-950 text-white"
          : "ml-auto border-stone-200 bg-white text-stone-900",
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] opacity-70">
        <span>{isUser ? "You" : "Anan"}</span>
        <span className="normal-case tracking-normal">{formatTime(message.createdAt)}</span>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-7">{message.content}</p>
    </article>
  );
}
