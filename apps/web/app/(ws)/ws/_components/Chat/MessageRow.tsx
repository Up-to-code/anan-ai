"use client";

import React from "react";
import { User } from "lucide-react";
import { AIMotionLogo, type AIMotionState } from "@/app/(ws)/ws/_components/AIMotion";
import { cn } from "@/lib/utils";
import MessageBubble from "./MessageBubble";

/**
 * WHY:   The AI conversation thread needs one row primitive that can handle text, UI cards, and branded avatars together.
 * WHAT:  Renders one conversation row for either a user message or an assistant message.
 * HOW:   Uses the animated Anan logo for assistant rows and a distinct user avatar for user rows.
 */
export default function MessageRow({
  isUser,
  content,
  isInfo = false,
  avatarState = "idle",
  children,
}: {
  isUser: boolean;
  content?: string;
  isInfo?: boolean;
  avatarState?: AIMotionState;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("flex min-w-0 shrink-0 gap-6", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        data-slot={isUser ? "user-avatar" : "ai-avatar"}
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center",
          isUser ? "bg-slate-950" : "",
        )}
      >
        {isUser ? (
          <User className="h-5 w-5 text-white" />
        ) : (
          <AIMotionLogo state={avatarState} size="compact" />
        )}
      </div>

      <div className={cn("flex min-w-0 flex-1 flex-col gap-4", isUser ? "items-end" : "items-start")}>
        <MessageBubble content={content} isUser={isUser} isInfo={isInfo} />
        {children}
      </div>
    </div>
  );
}
