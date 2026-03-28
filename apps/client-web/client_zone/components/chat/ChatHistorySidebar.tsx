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
  recentThreads,
  activeThreadId,
  onSelectHistoryThread,
  onClose,
}: {
  open: boolean;
  isAuthenticated: boolean;
  recentThreads: ThreadSummary[];
  activeThreadId: string | null;
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
          "fixed inset-0 z-30 bg-slate-950/26 backdrop-blur-[2px] transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        id="client-history-sidebar"
        className={cn(
          "fixed inset-y-0 right-0 z-40 flex w-full max-w-sm flex-col border-l border-[color:var(--workspace-border)] bg-[var(--workspace-sidebar)] shadow-[0_24px_80px_rgba(15,23,42,0.22)] transition-transform duration-200",
          open ? "translate-x-0" : "translate-x-full",
        )}
        aria-labelledby={titleId}
        aria-modal="true"
        role="dialog"
      >
        <div className="flex items-center justify-between border-b border-[color:var(--workspace-border)] px-5 py-5">
          <div className="space-y-1">
            <h2
              id={titleId}
              className="text-sm font-black text-[var(--workspace-bubble-other-foreground)]"
            >
              {dictionary.app.historyTitle}
            </h2>
            <div className="flex items-center gap-2">
              <Badge>{statusLabel}</Badge>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={dictionary.app.closeHistory}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-5">
          <section className="space-y-2">
            <h3 className="px-3 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--workspace-muted)]">
              {dictionary.app.recentSectionTitle}
            </h3>
            <div className="space-y-1">
              {recentThreads.length === 0 ? (
                <p className="px-3 text-sm leading-7 text-[var(--workspace-muted)]">
                  {isAuthenticated ? dictionary.app.historyEmpty : dictionary.app.signInPrompt}
                </p>
              ) : (
                recentThreads.map((item) => (
                  <ThreadListItem
                    key={item.id}
                    title={item.title}
                    meta={new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(item.updatedAt)}
                    preview={item.preview}
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
      </aside>
    </>
  );
}
