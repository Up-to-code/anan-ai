"use client";

import React from "react";
import { User } from "lucide-react";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { AIMotionLogo, type AIMotionState } from "@/app/(ws)/ws/_components/AIMotion";
import type { SessionUser } from "@/server/contracts/session";
import { cn } from "@/lib/utils";

export default function MessageRow({
  isUser,
  user,
  content,
  isInfo = false,
  avatarState = "idle",
  isStreaming = false,
  children,
}: {
  isUser: boolean;
  user?: SessionUser;
  content?: string;
  isInfo?: boolean;
  avatarState?: AIMotionState;
  isStreaming?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("flex min-w-0 shrink-0 gap-3 sm:gap-4", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        data-slot={isUser ? "user-avatar" : "ai-avatar"}
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-[0_8px_20px_-18px_rgba(15,23,42,0.55)]",
          isUser ? "border-slate-950 bg-slate-950" : "",
        )}
      >
        {isUser ? (
          user?.image ? (
            <img src={user.image} alt={user.name ?? "User"} className="h-full w-full object-cover rounded-none" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-blue-600 text-xs font-bold text-white rounded-none">
              {user?.name?.charAt(0)?.toUpperCase() || <User className="h-5 w-5 text-white" />}
            </div>
          )
        ) : (
          <AIMotionLogo state={avatarState} size="compact" />
        )}
      </div>
      <div className={cn("flex min-w-0 flex-1 flex-col gap-2", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "px-1 text-[11px] font-medium text-slate-400",
            isUser ? "text-right" : "text-left",
          )}
        >
          {isUser ? user?.name || "أنت" : "Anan AI"}
        </div>
        {content ? (
          <Message
            from={isUser ? "user" : "assistant"}
            className={cn("max-w-[92%] sm:max-w-[82%]", isStreaming && "transition-all duration-150")}
          >
            <MessageContent
              className={cn(
                "whitespace-pre-wrap break-words",
                !isUser && isInfo && "bg-slate-100 text-slate-600 shadow-none",
                isStreaming && !isUser && "border-slate-300",
              )}
              dir="rtl"
            >
              {content}
            </MessageContent>
          </Message>
        ) : null}
        {children}
      </div>
    </div>
  );
}
