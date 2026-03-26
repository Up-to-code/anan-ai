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
      className={cn("flex min-w-0 shrink-0 gap-3 md:gap-4", isUser ? "flex-row-reverse" : "flex-row")}
      dir="rtl"
    >
      {!isUser && (
        <div
          data-slot="ai-avatar"
          className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-[20px] md:rounded-3xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <AIMotionLogo state={avatarState} size="compact" />
        </div>
      )}
      <div className={cn("flex min-w-0 flex-1 flex-col gap-2", isUser ? "items-end" : "items-start")}>

        {content ? (
          <div
            className={cn("max-w-[90%] sm:max-w-[85%] md:max-w-[75%]", isStreaming && "transition-all duration-150")}
          >
            <div
              className={cn(
                "w-fit min-w-0 max-w-full whitespace-pre-wrap break-words text-[15px] md:text-[16px] leading-[1.7] text-right transition-all duration-300",
                isUser
                  ? "rounded-t-[32px] rounded-br-[32px] rounded-bl-[12px] bg-slate-900 px-5 py-3 md:px-6 md:py-4 text-white dark:bg-slate-800 dark:text-white shadow-sm"
                  : "bg-transparent px-0 py-2.5 text-slate-800 dark:text-slate-100 font-medium",
                !isUser && isInfo && "text-slate-400 italic",
              )}
              dir="rtl"
              style={{ unicodeBidi: "plaintext" }}
            >
              {content}
            </div>
          </div>
        ) : null}
        {children ? <div className="w-full mt-2 md:mt-4">{children}</div> : null}
      </div>
    </div>
  );
}
