"use client";

import { X } from "lucide-react";
import type { ThreadSummary } from "@/client_zone/lib/types";
import { useLocaleDictionary } from "@/client_zone/components/LocaleProvider";
import { Button } from "@/client_zone/components/ui/button";
import { Badge } from "@/client_zone/components/ui/badge";
import { cn } from "@/lib/utils";
import { ThreadListItem } from "./ThreadListItem";

/**
 * WHY:   The burger menu should reveal a professional history drawer instead of navigating away from the chat immediately.
 * WHAT:  Renders the slide-over history sidebar for desktop and mobile.
 * HOW:   Shows auth status, recent local threads, and a focused action path to the full history page.
 */
export function ChatHistorySidebar({
  open,
  isAuthenticated,
  demoThreads,
  recentThreads,
  activeThreadId,
  onSelectDemoThread,
  onSelectHistoryThread,
  onClose,
}: {
  open: boolean;
  isAuthenticated: boolean;
  demoThreads: ThreadSummary[];
  recentThreads: ThreadSummary[];
  activeThreadId: string | null;
  onSelectDemoThread: (threadId: string) => void;
  onSelectHistoryThread: (threadId: string) => void;
  onClose: () => void;
}) {
  const { dictionary, locale } = useLocaleDictionary();
  const titleId = "client-history-sidebar-title";
  const statusLabel = isAuthenticated ? dictionary.app.signedInStatus : dictionary.app.continueGuest;

  return (
    <>
      <button
        type="button"
        aria-hidden={!open}
        aria-label={dictionary.app.closeHistory}
        className={cn(
          "fixed inset-0 z-30 bg-slate-950/18 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        id="client-history-sidebar"
        className={cn(
          "fixed inset-y-0 right-0 z-40 flex w-full max-w-sm flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform duration-200",
          open ? "translate-x-0" : "translate-x-full",
        )}
        aria-labelledby={titleId}
        aria-modal="true"
        role="dialog"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
          <div className="space-y-1">
            <h2 id={titleId} className="text-sm font-semibold text-slate-900">
              {dictionary.app.historyTitle}
            </h2>
            <div className="flex items-center gap-2">
              <Badge className="rounded-md bg-slate-100 text-slate-700">{statusLabel}</Badge>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={dictionary.app.closeHistory}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            <section className="space-y-2">
              <h3 className="px-3 text-xs font-medium text-slate-500">{dictionary.app.demoSectionTitle}</h3>
              <div className="space-y-1">
                {demoThreads.map((item) => (
                  <ThreadListItem
                    key={item.id}
                    title={item.title}
                    meta={new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
                      dateStyle: "medium",
                    }).format(item.createdAt)}
                    active={activeThreadId === item.id}
                    onSelect={() => {
                      onSelectDemoThread(item.id);
                      onClose();
                    }}
                  />
                ))}
              </div>
            </section>
            <section className="space-y-2">
              <h3 className="px-3 text-xs font-medium text-slate-500">{dictionary.app.recentSectionTitle}</h3>
              <div className="space-y-1">
                {recentThreads.length === 0 ? (
                  <p className="px-3 text-sm text-slate-500">{dictionary.app.historyEmpty}</p>
                ) : (
                  recentThreads.map((item) => (
                    <ThreadListItem
                      key={item.id}
                      title={item.title}
                      meta={new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(item.createdAt)}
                      active={activeThreadId === item.id}
                      onSelect={() => {
                        onSelectHistoryThread(item.id);
                        onClose();
                      }}
                    />
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </aside>
    </>
  );
}
