"use client";

import React, { memo } from "react";
import { AIMotionLogo, type AIMotionState } from "../AIMotion";
import { cn } from "@/lib/utils";
import type { UploadedFileReference } from "@/server/contracts/files";
import { MarkdownContent } from "@/components/ui/markdown-content";
import {
  WorkspaceAssistantBadgeRow,
  getWorkspaceAssistantBadges,
  isArabicText,
  resolveAssistantDirection,
} from "./WorkspaceAssistantBadges";

const MessageRowComponent = function MessageRow({
  isUser,
  content,
  meta,
  attachments,
  fallbackTeamId,
  fallbackAgentName,
  isInfo = false,
  avatarState = "idle",
  isStreaming = false,
  children,
}: {
  isUser: boolean;
  content?: string;
  meta?: unknown;
  attachments?: UploadedFileReference[];
  fallbackTeamId?: string | null;
  fallbackAgentName?: string | null;
  isInfo?: boolean;
  avatarState?: AIMotionState;
  isStreaming?: boolean;
  children?: React.ReactNode;
}) {
  const direction = resolveAssistantDirection(content);
  const shouldUseArabicChrome = isArabicText(content);
  const assistantBadges = !isUser
    ? getWorkspaceAssistantBadges({
        content,
        meta,
        fallbackTeamId,
        fallbackAgentName,
      })
    : [];

  return (
    <div
      className={cn("flex min-w-0 shrink-0 gap-3 md:gap-4", isUser ? "flex-row-reverse" : "flex-row")}
      dir={isUser ? "rtl" : direction}
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
        {!isUser ? <WorkspaceAssistantBadgeRow badges={assistantBadges} dir={direction} className="mb-1" /> : null}
        {content ? (
          <div
            className={cn(
              isUser ? "max-w-[90%] sm:max-w-[85%] md:max-w-[75%]" : "w-full max-w-[52rem]",
              isStreaming && "transition-all duration-150",
            )}
          >
            <div
              className={cn(
                "min-w-0 max-w-full text-[15px] leading-[1.7] transition-all duration-300 md:text-[16px]",
                isUser
                  ? "w-fit break-words rounded-t-[32px] rounded-br-[32px] rounded-bl-[12px] bg-slate-900 px-5 py-3 text-white shadow-sm dark:bg-slate-800 dark:text-white md:px-6 md:py-4"
                  : "w-full bg-transparent px-0 py-2.5 font-medium text-slate-800 dark:text-slate-100",
                !isUser && isInfo && "text-slate-400 italic",
              )}
              dir={isUser ? "rtl" : direction}
              style={{ unicodeBidi: "plaintext" }}
            >
              {isUser ? (
                content
              ) : (
                <MarkdownContent
                  content={content}
                  className={cn(
                    "workspace-assistant-markdown max-w-none break-words [overflow-wrap:anywhere]",
                    "[&_h1]:mt-0 [&_h1]:text-2xl [&_h1]:font-black [&_h2]:text-xl [&_h2]:font-black [&_h2]:border-none [&_h2]:pb-0",
                    "[&_h3]:text-lg [&_h3]:font-extrabold [&_p]:mt-0 [&_p]:leading-8 [&_p]:text-[15px] md:[&_p]:text-[16px]",
                    "[&_ul]:my-3 [&_ul]:space-y-2 [&_ul]:marker:text-[var(--workspace-highlight)] [&_ol]:my-3 [&_ol]:space-y-2 [&_ol]:marker:font-black [&_ol]:marker:text-[var(--workspace-highlight)] [&_li]:mt-0",
                    "[&_table]:my-4 [&_table]:w-full [&_table]:overflow-hidden [&_table]:rounded-2xl [&_table]:border [&_table]:border-slate-200 dark:[&_table]:border-white/10",
                    "[&_th]:bg-slate-100 [&_th]:px-3 [&_th]:py-2 [&_th]:text-right dark:[&_th]:bg-white/5",
                    "[&_td]:border-t [&_td]:border-slate-200 [&_td]:px-3 [&_td]:py-2 dark:[&_td]:border-white/10",
                    "[&_pre]:max-w-full [&_pre]:overflow-x-auto [&_code]:break-words [&_blockquote]:rounded-2xl [&_blockquote]:bg-slate-100/70 [&_blockquote]:py-3 dark:[&_blockquote]:bg-white/5",
                    shouldUseArabicChrome ? "[&_ul]:mr-5 [&_ol]:mr-5 [&_blockquote]:border-r-2 [&_blockquote]:border-l-0 [&_blockquote]:pr-4 [&_blockquote]:pl-0" : "[&_ul]:ml-5 [&_ol]:ml-5",
                  )}
                />
              )}
            </div>
          </div>
        ) : null}
        {attachments?.length ? (
          <div className={cn("grid w-full max-w-[420px] gap-3", attachments.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
            {attachments.map((attachment) => (
              <a
                key={attachment.key}
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
                className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-white/[0.03]"
              >
                {/* biome-ignore lint/performance/noImgElement: Workspace attachments can come from arbitrary storage URLs and render as simple previews. */}
                <img
                  src={attachment.url}
                  alt={attachment.name}
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="px-4 py-3 text-right">
                  <div className="truncate text-[12px] font-bold text-slate-700 dark:text-slate-200">{attachment.name}</div>
                </div>
              </a>
            ))}
          </div>
        ) : null}
        {children ? <div className="mt-1 w-full md:mt-2">{children}</div> : null}
      </div>
    </div>
  );
}

export default memo(MessageRowComponent);
