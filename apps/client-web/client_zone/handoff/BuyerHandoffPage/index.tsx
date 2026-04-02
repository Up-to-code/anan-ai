"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { useLocale } from "@/app/_components/LocaleProvider";
import { api } from "@/lib/convexApi";
import { Button } from "@/components/ui/button";

/**
 * WHY:   Buyers need a confirmation route once the backend produces a handoff order.
 * WHAT:  Displays one buyer-owned advisor handoff record from `user_zone/web/orders`.
 * HOW:   Queries the existing order-detail read model and renders a success or empty state without changing backend behavior.
 */
export default function BuyerHandoffPage({ orderId }: { orderId: string }) {
  const { dictionary } = useLocale();
  const order = useQuery(api.user_zone.web.orders.getClientOrderDetail, {
    orderId: orderId as never,
  });

  if (order === undefined) {
    return <HandoffState title={dictionary.handoff.loadingTitle} body={dictionary.handoff.loadingBody} />;
  }

  if (!order) {
    return <HandoffState title={dictionary.handoff.missingTitle} body={dictionary.handoff.missingBody} />;
  }

  return (
    <main className="min-h-screen bg-background px-6 py-12 sm:px-10">
      <div data-testid="client-handoff-summary" className="mx-auto flex w-full max-w-3xl flex-col gap-6 rounded-[36px] border border-[var(--workspace-border)] bg-[var(--workspace-panel)] p-8 text-right shadow-sm">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--workspace-muted)]">{dictionary.handoff.eyebrow}</p>
        <h1 className="text-3xl font-black text-slate-950 dark:text-slate-50">{dictionary.handoff.successTitle}</h1>
        <p className="text-base leading-8 text-slate-600 dark:text-slate-300">
          {dictionary.handoff.statusLabel}: <span className="font-black text-slate-900 dark:text-slate-50">{order.status}</span>
        </p>
        {order.property ? (
          <div className="rounded-[28px] border border-[var(--workspace-border)] bg-background p-5">
            <p className="text-sm font-black">{order.property.title}</p>
            <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{order.property.address}</p>
          </div>
        ) : null}
        <div className="flex flex-wrap justify-end gap-3">
          <Link href="/app">
            <Button className="rounded-full px-6">{dictionary.handoff.backToAssistant}</Button>
          </Link>
          <Link href="/app/history">
            <Button variant="outline" className="rounded-full px-6">{dictionary.handoff.openHistory}</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

function HandoffState({ title, body }: { title: string; body: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-xl rounded-[32px] border border-[var(--workspace-border)] bg-[var(--workspace-panel)] px-8 py-8 text-right shadow-sm">
        <h1 className="text-2xl font-black">{title}</h1>
        <p className="mt-3 text-base leading-8 text-slate-600 dark:text-slate-300">{body}</p>
      </div>
    </main>
  );
}
