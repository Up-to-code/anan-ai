"use client";

import { MessageSquareText, PenSquare } from "lucide-react";
import { motion } from "framer-motion";
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
 * WHAT:  Renders the assistant thread history and the action for starting a new Anan Workspace thread.
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
    <aside className="border-b border-slate-100 bg-white lg:flex lg:w-72 lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-s lg:border-slate-100 lg:min-h-[calc(100svh-7rem)]">
      {/* Rail header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5 sm:px-5">
        <div>
          <div className="text-sm font-semibold text-slate-900">سجل المساعد</div>
          <div className="mt-0.5 text-[11px] text-slate-400">المحادثات السابقة</div>
        </div>
        <button
          type="button"
          onClick={onCreateThread}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900"
          title="محادثة جديدة"
        >
          <PenSquare className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Thread list */}
      <div className="flex gap-2 overflow-x-auto px-3 py-3 sm:px-4 lg:flex-1 lg:flex-col lg:overflow-y-auto lg:px-3">
        {threads.length === 0 ? (
          <div className="flex min-h-28 min-w-64 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 text-xs text-slate-400 lg:min-w-0">
            ستظهر المحادثات هنا بعد أول رسالة.
          </div>
        ) : (
          threads.map((thread, index) => {
            const isActive = thread.id === activeThreadId;
            return (
              <motion.button
                key={thread.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.04 }}
                type="button"
                onClick={() => onSelectThread(thread.id)}
                disabled={isLoadingThread && !isActive}
                className={cn(
                  "min-w-60 rounded-xl px-3.5 py-3 text-right transition-all lg:min-w-0",
                  isActive
                    ? "bg-slate-950 shadow-sm"
                    : "border border-slate-100 bg-slate-50/50 hover:bg-slate-100",
                  isLoadingThread && !isActive && "cursor-wait opacity-60",
                )}
              >
                <div className="flex items-start gap-2.5">
                  <MessageSquareText
                    className={cn(
                      "mt-0.5 h-3.5 w-3.5 shrink-0",
                      isActive ? "text-slate-300" : "text-slate-400",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div
                      className={cn(
                        "truncate text-xs font-semibold leading-snug",
                        isActive ? "text-white" : "text-slate-800",
                      )}
                    >
                      {getThreadLabel(thread)}
                    </div>
                    <div
                      className={cn(
                        "mt-1.5 text-[10px]",
                        isActive ? "text-slate-400" : "text-slate-400",
                      )}
                    >
                      {formatThreadDate(thread.updatedAt)}
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })
        )}
      </div>
    </aside>
  );
}
