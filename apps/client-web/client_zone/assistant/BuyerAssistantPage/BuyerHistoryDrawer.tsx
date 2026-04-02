"use client";

import Link from "next/link";
import { useLocale } from "@/app/_components/LocaleProvider";
import { Button } from "@/components/ui/button";
import type { BuyerThreadSummary } from "@/client_zone/shared/types";

/**
 * WHY:   Buyers need lightweight access to saved conversations without leaving the assistant surface completely.
 * WHAT:  Renders a slide-over history drawer with links to saved threads and the standalone history page.
 * HOW:   Uses the existing `user_zone/web` thread summaries and keeps the UI buyer-specific instead of mirroring the workspace sidebar.
 */
export default function BuyerHistoryDrawer({
  open,
  threads,
  onClose,
}: {
  open: boolean;
  threads: BuyerThreadSummary[];
  onClose: () => void;
}) {
  const { dictionary } = useLocale();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex bg-black/35" onClick={onClose}>
      <aside
        className="ms-auto flex h-full w-full max-w-md flex-col border-s border-[var(--workspace-border)] bg-[var(--workspace-panel)] p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onClose}>{dictionary.common.close}</Button>
          <div className="text-right">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--workspace-muted)]">{dictionary.history.drawerEyebrow}</p>
            <h2 className="text-lg font-black">{dictionary.history.title}</h2>
          </div>
        </div>

        <div className="mt-6 flex-1 space-y-3 overflow-y-auto">
          {threads.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[var(--workspace-border)] px-5 py-6 text-right text-sm leading-7 text-slate-600 dark:text-slate-300">
              {dictionary.history.emptyBody}
            </div>
          ) : (
            threads.map((thread) => (
              <Link
                key={thread.id}
                href={`/app?threadId=${thread.id}`}
                className="block rounded-[24px] border border-[var(--workspace-border)] bg-background px-5 py-4 text-right transition hover:border-[color:color-mix(in_srgb,var(--workspace-highlight)_24%,transparent)] hover:bg-[color:color-mix(in_srgb,var(--workspace-highlight)_6%,white)]"
              >
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-50">{thread.title}</h3>
                {thread.preview ? (
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{thread.preview}</p>
                ) : null}
              </Link>
            ))
          )}
        </div>

        <Link href="/app/history" className="mt-6">
          <Button variant="outline" className="w-full rounded-full">{dictionary.history.openPage}</Button>
        </Link>
      </aside>
    </div>
  );
}
