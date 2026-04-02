"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { useLocale } from "@/app/_components/LocaleProvider";
import { api } from "@/lib/convexApi";
import { Button } from "@/components/ui/button";

/**
 * WHY:   Buyers need a full-page history surface in addition to the assistant drawer.
 * WHAT:  Lists saved buyer conversations from the existing `user_zone/web` thread contract.
 * HOW:   Reads recent buyer threads and routes back into `/app?threadId=...` for replay inside the assistant shell.
 */
export default function BuyerHistoryPage() {
  const { dictionary } = useLocale();
  const threads = useQuery(api.user_zone.web.threads.listClientThreads, { limit: 20 }) ?? [];

  return (
    <main className="min-h-screen bg-background px-6 py-10 sm:px-10">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <Link href="/app">
            <Button variant="outline" className="rounded-full px-6">
              {dictionary.history.backToAssistant}
            </Button>
          </Link>
          <div className="text-right">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--workspace-muted)]">
              {dictionary.history.pageEyebrow}
            </p>
            <h1 className="text-3xl font-black">{dictionary.history.title}</h1>
          </div>
        </div>

        {threads.length === 0 ? (
          <div className="rounded-[32px] border border-dashed border-[var(--workspace-border)] bg-[var(--workspace-panel)] px-8 py-8 text-right text-base leading-8 text-slate-600 dark:text-slate-300">
            {dictionary.history.emptyBody}
          </div>
        ) : (
          <div className="space-y-4">
            {threads.map((thread) => (
              <Link
                key={thread.id}
                href={`/app?threadId=${thread.id}`}
                className="block rounded-[28px] border border-[var(--workspace-border)] bg-[var(--workspace-panel)] px-6 py-5 text-right shadow-sm transition hover:border-[color:color-mix(in_srgb,var(--workspace-highlight)_24%,transparent)]"
              >
                <h2 className="text-lg font-black text-slate-950 dark:text-slate-50">{thread.title}</h2>
                {thread.preview ? (
                  <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{thread.preview}</p>
                ) : null}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
