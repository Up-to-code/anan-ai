"use client";

import { MessageSquareText, PenSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnanProThreadSummary } from "@/server/contracts/ananPro";

type WorkspaceAssistantRailProps = {
  threads: AnanProThreadSummary[];
  activeThreadId: string | null;
  isLoadingThread: boolean;
  onCreateThread: () => void;
  onSelectThread: (threadId: string) => void;
};

function formatThreadDate(timestamp: number) {
  return new Date(timestamp).toLocaleString("ar-EG", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getThreadLabel(thread: AnanProThreadSummary) {
  const title = thread.title?.trim();
  return title && title.length > 0 ? title : "محادثة بدون عنوان";
}

/**
 * WHY:   Workspace operators need a simple way to reopen recent assistant work without leaving the main dashboard.
 * WHAT:  Renders the assistant thread history and the action for starting a new Anan Pro thread.
 * HOW:   Uses one responsive list that scrolls horizontally on small screens and becomes a fixed rail on larger layouts.
 */
export default function WorkspaceAssistantRail({
  threads,
  activeThreadId,
  isLoadingThread,
  onCreateThread,
  onSelectThread,
}: WorkspaceAssistantRailProps) {
  return (
    <aside className="border-b border-stone-200 bg-white lg:flex lg:w-80 lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-s lg:min-h-[calc(100svh-7rem)]">
      <div className="flex items-center justify-between border-b border-stone-200 px-4 py-4 sm:px-6 lg:px-5">
        <div>
          <div className="text-sm font-bold text-slate-950">سجل المساعد</div>
          <div className="mt-1 text-xs text-slate-500">أكمل المحادثات السابقة أو ابدأ محادثة جديدة.</div>
        </div>
        <button
          type="button"
          onClick={onCreateThread}
          className="inline-flex h-10 items-center gap-2 border border-stone-300 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:border-stone-400 hover:text-slate-950"
        >
          <PenSquare className="h-4 w-4" />
          محادثة جديدة
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto px-4 py-4 sm:px-6 lg:flex-1 lg:flex-col lg:overflow-y-auto lg:px-5">
        {threads.length === 0 ? (
          <div className="flex min-h-28 min-w-64 items-center justify-center border border-dashed border-stone-300 bg-stone-50 px-4 text-sm text-slate-500 lg:min-w-0">
            ستظهر هنا المحادثات بعد أول رسالة ترسلها إلى Anan Pro.
          </div>
        ) : (
          threads.map((thread) => {
            const isActive = thread.id === activeThreadId;

            return (
              <button
                key={thread.id}
                type="button"
                onClick={() => onSelectThread(thread.id)}
                disabled={isLoadingThread && !isActive}
                className={cn(
                  "min-w-72 border p-4 text-right transition-colors lg:min-w-0",
                  isActive
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-stone-200 bg-white text-slate-900 hover:border-stone-300 hover:bg-stone-50",
                  isLoadingThread && !isActive && "cursor-wait opacity-70",
                )}
              >
                <div className="flex items-start gap-3">
                  <MessageSquareText className={cn("mt-0.5 h-4 w-4 shrink-0", isActive ? "text-white" : "text-slate-400")} />
                  <div className="min-w-0 flex-1">
                    <div className={cn("truncate text-sm font-semibold", isActive ? "text-white" : "text-slate-950")}>
                      {getThreadLabel(thread)}
                    </div>
                    <div className={cn("mt-2 text-xs", isActive ? "text-slate-300" : "text-slate-500")}>
                      {formatThreadDate(thread.updatedAt)}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
