"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/convexApi";
import { BuyerRailCard, ResponsiveBuyerShell } from "../../components/layout";
import { MobileHeader, MobileButton } from "../../components/ui";

/**
 * WHY:   Buyers need a dedicated history route that still feels like the same responsive product as the assistant and search flows.
 * WHAT:  Renders saved conversation history with a focused desktop summary rail and direct reopen actions.
 * HOW:   Reads recent buyer threads from the existing `user_zone/web` query and uses the query string thread id when present to highlight one thread.
 */
export default function HistoryScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const threads = useQuery(api.user_zone.web.threads.listClientThreads, { limit: 20 }) ?? [];
  const selectedThreadId = searchParams.get("threadId");
  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === selectedThreadId) ?? threads[0] ?? null,
    [selectedThreadId, threads],
  );

  const header = (
    <MobileHeader
      title="سجل المحادثات"
      backHref="/app"
      rightSlot={<span className="block h-12 w-12" />}
    />
  );

  const main = (
    <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-10 pt-2 md:px-8 lg:px-8">
      <div className="mb-6 rounded-[28px] border border-slate-200 bg-white px-5 py-5 text-right dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-[20px] font-black text-slate-900 dark:text-slate-50">كل محادثاتك في مكان واحد</h1>
        <p className="mt-2 text-[14px] leading-7 font-medium text-slate-500 dark:text-slate-400">
          افتح أي محادثة للعودة مباشرة إلى المساعد بنفس السجل والسياق.
        </p>
      </div>

      {threads.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-slate-200 bg-white px-8 py-12 text-right dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-[18px] font-black text-slate-900 dark:text-slate-50">لا توجد محادثات محفوظة بعد</h2>
          <p className="mt-2 text-[14px] leading-7 font-medium text-slate-500 dark:text-slate-400">
            ابدأ من المساعد وسيظهر هذا السجل تلقائياً بعد تسجيل الدخول.
          </p>
          <MobileButton label="العودة إلى المساعد" href="/app" className="mt-5 w-full md:w-auto" />
        </div>
      ) : (
        <div className="space-y-4">
          {threads.map((thread) => {
            const isSelected = thread.id === selectedThread?.id;
            return (
              <button
                key={thread.id}
                type="button"
                onClick={() => router.push(`/app?threadId=${thread.id}`)}
                className={`block w-full rounded-[28px] border px-6 py-5 text-right transition hover:border-blue-200 ${
                  isSelected
                    ? "border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/30"
                    : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                }`}
              >
                <div className="flex flex-col gap-3 md:flex-row-reverse md:items-center md:justify-between">
                  <div className="flex-1">
                    <h2 className="text-lg font-black text-slate-950 dark:text-slate-50">{thread.title}</h2>
                    {thread.preview ? (
                      <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{thread.preview}</p>
                    ) : null}
                  </div>
                  <span className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-[12px] font-black text-white dark:bg-slate-50 dark:text-slate-950">
                    افتح المحادثة
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  const desktopRail = (
    <>
      <BuyerRailCard title="المحادثة المحددة" eyebrow="ملخص">
        {selectedThread ? (
          <>
            <p className="text-[16px] font-black text-slate-900 dark:text-slate-50">{selectedThread.title}</p>
            <p className="text-[14px] leading-7 font-medium text-slate-500 dark:text-slate-400">
              {selectedThread.preview ?? "افتح هذه المحادثة للرجوع مباشرة إلى نفس السجل داخل المساعد."}
            </p>
            <MobileButton label="افتح داخل المساعد" href={`/app?threadId=${selectedThread.id}`} className="w-full" />
          </>
        ) : (
          <p className="text-[14px] leading-7 font-medium text-slate-500 dark:text-slate-400">
            ما إن تبدأ المحادثات المحفوظة بالظهور، ستجد ملخصها السريع هنا.
          </p>
        )}
      </BuyerRailCard>

      <BuyerRailCard title="إجراءات سريعة" eyebrow="التنقل">
        <Link
          href="/app"
          className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-3 text-[14px] font-black text-white dark:bg-slate-50 dark:text-slate-950"
        >
          محادثة جديدة
        </Link>
        <Link
          href="/search"
          className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 px-4 py-3 text-[14px] font-black text-slate-900 dark:border-slate-800 dark:text-slate-50"
        >
          افتح البحث
        </Link>
      </BuyerRailCard>
    </>
  );

  return <ResponsiveBuyerShell header={header} main={main} desktopRail={desktopRail} />;
}
