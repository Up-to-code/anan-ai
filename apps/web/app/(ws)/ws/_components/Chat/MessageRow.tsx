"use client";

import React from "react";
import Image from "next/image";
import { User } from "lucide-react";
import { AIMotionLogo, type AIMotionState } from "../AIMotion";
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
    <div
      className={cn("flex min-w-0 shrink-0 gap-3", isUser ? "flex-row-reverse" : "flex-row")}
      dir="rtl"
    >
      <div
        data-slot={isUser ? "user-avatar" : "ai-avatar"}
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm",
          isUser ? "border-slate-900 bg-slate-900" : "",
        )}
      >
        {isUser ? (
          user?.image ? (
            <Image
              src={user.image}
              alt={user.name ?? "User"}
              width={40}
              height={40}
              unoptimized
              loader={({ src }) => src}
              className="h-full w-full rounded-[inherit] object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-[inherit] bg-blue-600 text-xs font-bold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || <User className="h-5 w-5 text-white" />}
            </div>
          )
        ) : (
          <AIMotionLogo state={avatarState} size="compact" />
        )}
      </div>
      <div className={cn("flex min-w-0 flex-1 flex-col gap-1.5", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "px-1 text-[11px] font-medium text-slate-400",
            "text-right",
          )}
        >
          {isUser ? user?.name || "أنت" : "Anan AI"}
        </div>
        {content ? (
          <div
            className={cn("max-w-[92%] sm:max-w-[82%]", isStreaming && "transition-all duration-150")}
          >
            <div
              className={cn(
                "w-fit min-w-0 max-w-full whitespace-pre-wrap break-words rounded-2xl border px-5 py-3.5 text-[15px] leading-7 text-right",
                isUser
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-100 bg-white text-slate-900 shadow-sm",
                !isUser && isInfo && "bg-slate-50 text-slate-600 shadow-none",
                isStreaming && !isUser && "border-stone-200 bg-stone-50",
              )}
              dir="rtl"
              style={{ unicodeBidi: "plaintext" }}
            >
              {content}
            </div>
          </div>
        ) : null}
        {children ? <div className="w-full">{children}</div> : null}
      </div>
    </div>
  );
}
