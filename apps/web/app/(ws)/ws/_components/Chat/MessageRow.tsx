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
      {!isUser && (
        <div
          data-slot="ai-avatar"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] dark:shadow-none"
        >
          <AIMotionLogo state={avatarState} size="compact" />
        </div>
      )}
      <div className={cn("flex min-w-0 flex-1 flex-col gap-1.5", isUser ? "items-end" : "items-start")}>

        {content ? (
          <div
            className={cn("max-w-[92%] sm:max-w-[82%]", isStreaming && "transition-all duration-150")}
          >
            <div
              className={cn(
                "w-fit min-w-0 max-w-full whitespace-pre-wrap break-words text-[15px] leading-relaxed text-right transition-all duration-300",
                isUser
                  ? "rounded-[1.5rem] bg-[var(--workspace-bubble-self)] px-5 py-3.5 text-[var(--workspace-bubble-self-foreground)]"
                  : "bg-transparent px-0 py-2 text-[var(--workspace-bubble-other-foreground)]",
                !isUser && isInfo && "text-[var(--workspace-muted)]",
                isStreaming && !isUser && "text-[var(--workspace-bubble-other-foreground)]",
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
