"use client";

import { X } from "lucide-react";
import type { BuyerThreadSummary } from "@/client_zone/shared/types";

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

/**
 * WHY:   The buyer web product now needs one shared shell that preserves the mobile feel while expanding into a desktop split view.
 * WHAT:  Renders a breakpoint-aware buyer layout with a primary pane plus an optional sticky desktop rail.
 * HOW:   Keeps the mobile-width frame on smaller screens, relaxes spacing on tablet, and switches to a two-column layout from `lg` upward.
 */
export function ResponsiveBuyerShell({
  header,
  main,
  desktopRail,
  mobileBottomBar,
  mainClassName,
  desktopRailClassName,
}: {
  header?: React.ReactNode;
  main: React.ReactNode;
  desktopRail?: React.ReactNode;
  mobileBottomBar?: React.ReactNode;
  mainClassName?: string;
  desktopRailClassName?: string;
}) {
  return (
    <main
      data-testid="client-responsive-shell"
      className="min-h-dvh bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-slate-50"
    >
      <div className="mx-auto flex min-h-dvh w-full max-w-[1440px] justify-center lg:px-6 xl:px-8">
        <div className="flex min-h-dvh w-full max-w-[440px] flex-col md:max-w-[760px] lg:grid lg:max-w-none lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-6 lg:py-6">
          <section
            data-testid="client-responsive-shell-primary"
            className="flex min-h-dvh min-w-0 flex-col lg:min-h-[calc(100dvh-3rem)] lg:overflow-hidden lg:rounded-[36px] lg:border lg:border-slate-200 lg:bg-white lg:shadow-[0_30px_120px_rgba(15,23,42,0.10)] dark:lg:border-slate-800 dark:lg:bg-slate-950"
          >
            {header ? <div className="shrink-0">{header}</div> : null}
            <div className={cn("min-h-0 flex-1", mainClassName)}>{main}</div>
            {mobileBottomBar ? <div className="shrink-0 lg:hidden">{mobileBottomBar}</div> : null}
          </section>

          {desktopRail ? (
            <aside
              data-testid="client-responsive-shell-rail"
              className={cn("hidden lg:block lg:min-w-0", desktopRailClassName)}
            >
              <div className="sticky top-6 space-y-4">{desktopRail}</div>
            </aside>
          ) : null}
        </div>
      </div>
    </main>
  );
}

/**
 * WHY:   Desktop rails reuse the same elevated card treatment for history, context, and next-step content.
 * WHAT:  Wraps buyer rail content in one consistent card container.
 * HOW:   Applies the shared rounded, bordered panel styling used across the responsive desktop shell.
 */
export function BuyerRailCard({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white px-5 py-5 text-right shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {eyebrow ? (
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{eyebrow}</p>
      ) : null}
      <h2 className={cn("text-[18px] font-black text-slate-900 dark:text-slate-50", eyebrow && "mt-2")}>{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

/**
 * WHY:   Buyer thread history needs one shared renderer that can behave like a mobile sheet or a desktop inline panel.
 * WHAT:  Renders the same thread list in either overlay-sheet or inline-rail mode.
 * HOW:   Reuses the same thread rows and reset action while swapping only the surrounding container based on `mode`.
 */
export function ResponsiveHistoryPanel({
  mode,
  open = true,
  activeThreadId,
  threads,
  onClose,
  onSelect,
  onReset,
}: {
  mode: "sheet" | "inline";
  open?: boolean;
  activeThreadId?: string | null;
  threads: BuyerThreadSummary[];
  onClose?: () => void;
  onSelect: (threadId: string) => void;
  onReset: () => void;
}) {
  if (mode === "sheet") {
    if (!open) return null;

    return (
      <div
        data-testid="client-history-panel-sheet"
        className="fixed inset-0 z-50 bg-slate-950/45 px-4 pb-4 pt-16 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="mx-auto flex h-full w-full max-w-[440px] flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl dark:bg-slate-900"
          onClick={(event) => event.stopPropagation()}
        >
          <HistoryPanelHeader
            showClose
            onClose={onClose}
            onReset={onReset}
          />
          <HistoryPanelBody activeThreadId={activeThreadId} threads={threads} onSelect={onSelect} />
        </div>
      </div>
    );
  }

  return (
    <div data-testid="client-history-panel-inline" className="rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <HistoryPanelHeader onReset={onReset} />
      <HistoryPanelBody activeThreadId={activeThreadId} threads={threads} onSelect={onSelect} />
    </div>
  );
}

function HistoryPanelHeader({
  onReset,
  onClose,
  showClose = false,
}: {
  onReset: () => void;
  onClose?: () => void;
  showClose?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 text-right dark:border-slate-800">
      <button type="button" onClick={onReset} className="text-[13px] font-black text-blue-600">
        محادثة جديدة
      </button>
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">السجل</p>
        <h2 className="text-[18px] font-black text-slate-900 dark:text-slate-50">سجل المحادثات</h2>
      </div>
      {showClose ? (
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
        >
          <X className="h-4 w-4" />
        </button>
      ) : (
        <span className="block h-10 w-10" aria-hidden="true" />
      )}
    </div>
  );
}

function HistoryPanelBody({
  activeThreadId,
  threads,
  onSelect,
}: {
  activeThreadId?: string | null;
  threads: BuyerThreadSummary[];
  onSelect: (threadId: string) => void;
}) {
  return (
    <div className="max-h-[70dvh] overflow-y-auto p-4">
      {threads.length === 0 ? (
        <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-5 py-6 text-right dark:border-slate-800 dark:bg-slate-950">
          <p className="text-[16px] font-black text-slate-900 dark:text-slate-50">لا توجد محادثات محفوظة بعد</p>
          <p className="mt-2 text-[14px] leading-7 text-slate-500 dark:text-slate-400">
            ابدأ من المساعد ثم سيظهر آخر سياق هنا بنفس أسلوب الموبايل.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {threads.map((thread) => {
            const isActive = thread.id === activeThreadId;
            return (
              <button
                key={thread.id}
                type="button"
                onClick={() => onSelect(thread.id)}
                className={cn(
                  "block w-full rounded-[28px] border px-5 py-4 text-right transition active:scale-[0.99]",
                  isActive
                    ? "border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/30"
                    : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950",
                )}
              >
                <p className="text-[15px] font-black text-slate-900 dark:text-slate-50">{thread.title}</p>
                {thread.preview ? (
                  <p className="mt-2 line-clamp-2 text-[13px] leading-6 text-slate-500 dark:text-slate-400">
                    {thread.preview}
                  </p>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
