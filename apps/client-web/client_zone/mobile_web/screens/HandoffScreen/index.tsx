"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/lib/convexApi";
import { BuyerRailCard, ResponsiveBuyerShell } from "../../components/layout";
import { MobileHeader, MobileButton } from "../../components/ui";
import { formatCurrency, normalizeBuyerProperty } from "../../lib/mobileWebData";

/**
 * WHY:   The buyer handoff confirmation route should stay visually aligned with the rebuilt buyer shell across screen sizes.
 * WHAT:  Renders one advisor handoff summary with a responsive main panel and desktop next-step rail.
 * HOW:   Queries the existing `user_zone/web.orders` contract and projects the optional property detail through the shared mobile-web helpers.
 */
export default function HandoffScreen({ orderId }: { orderId: string }) {
  const order = useQuery(api.user_zone.web.orders.getClientOrderDetail, {
    orderId: orderId as never,
  });

  if (order === undefined) {
    return <HandoffState title="جاري تحميل الطلب" body="نراجع تفاصيل التحويل إلى المستشار." />;
  }

  if (!order) {
    return <HandoffState title="الطلب غير متاح" body="قد تحتاج إلى تسجيل الدخول أو العودة إلى المساعد لمتابعة الطلب من جديد." />;
  }

  const property = order.property ? normalizeBuyerProperty(order.property) : null;
  const statusLabel = order.status === "qualified" ? "qualified" : order.status;

  const header = (
    <MobileHeader
      title="ملخص التحويل"
      backHref={order.threadId ? `/app?threadId=${order.threadId}` : "/app"}
      rightSlot={<span className="block h-12 w-12" />}
    />
  );

  const main = (
    <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-10 pt-2 md:px-8 lg:px-8">
      <div
        data-testid="client-handoff-summary"
        className="space-y-6 rounded-[32px] border border-slate-200 bg-white px-6 py-6 text-right shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="space-y-3">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">handoff</p>
          <h1 className="text-[26px] font-black text-slate-900 dark:text-slate-50">تم استلام طلبك</h1>
          <p className="text-[15px] leading-8 font-medium text-slate-500 dark:text-slate-400">
            سنُبقي هذا المسار مختصراً وواضحاً: الطلب محفوظ ويمكنك الرجوع إلى المساعد أو متابعة السجل من هنا.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <SummaryMetric label="الحالة" value={statusLabel} emphasized />
          <SummaryMetric label="القناة" value={String(order.sourceChannel ?? "web")} />
          <SummaryMetric label="النوع" value={String(order.type ?? "property")} />
          <SummaryMetric label="النية" value={String(order.intent ?? "advisor_handoff")} />
        </div>

        {property ? (
          <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-5 py-5 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-[16px] font-black text-slate-900 dark:text-slate-50">{property.title}</p>
            <p className="mt-2 text-[14px] leading-7 font-medium text-slate-500 dark:text-slate-400">{property.address}</p>
            <p className="mt-3 text-[18px] font-black text-blue-600">{formatCurrency(property.price)}</p>
          </div>
        ) : null}

        {order.notes ? (
          <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-5 py-5 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-[13px] font-black uppercase tracking-[0.15em] text-slate-400">notes</p>
            <p className="mt-3 text-[14px] leading-7 font-medium text-slate-600 dark:text-slate-300">{String(order.notes)}</p>
          </div>
        ) : null}
      </div>
    </div>
  );

  const desktopRail = (
    <>
      <BuyerRailCard title="ماذا بعد؟" eyebrow="الخطوات التالية">
        <MobileButton label="العودة إلى المساعد" href={order.threadId ? `/app?threadId=${order.threadId}` : "/app"} className="w-full" />
        <MobileButton label="فتح السجل" href="/app/history" variant="secondary" className="w-full" />
      </BuyerRailCard>

      {property ? (
        <BuyerRailCard title="العقار المرتبط" eyebrow="السياق">
          <p className="text-[16px] font-black text-slate-900 dark:text-slate-50">{property.title}</p>
          <p className="text-[14px] leading-7 font-medium text-slate-500 dark:text-slate-400">{property.address}</p>
          <Link
            href={`/app/property/${property.id}`}
            className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 px-4 py-3 text-[14px] font-black text-slate-900 dark:border-slate-800 dark:text-slate-50"
          >
            عرض العقار
          </Link>
        </BuyerRailCard>
      ) : null}
    </>
  );

  const mobileBottomBar = (
    <div className="sticky bottom-0 border-t border-slate-200 bg-white/95 px-6 pb-5 pt-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="flex flex-row-reverse gap-4">
        <MobileButton label="العودة إلى المساعد" href={order.threadId ? `/app?threadId=${order.threadId}` : "/app"} className="flex-1" />
        <MobileButton label="فتح السجل" href="/app/history" variant="secondary" className="flex-1" />
      </div>
    </div>
  );

  return <ResponsiveBuyerShell header={header} main={main} desktopRail={desktopRail} mobileBottomBar={mobileBottomBar} />;
}

function HandoffState({ title, body }: { title: string; body: string }) {
  return (
    <ResponsiveBuyerShell
      main={
        <div className="flex min-h-dvh items-center justify-center px-6">
          <div className="w-full rounded-[32px] border border-slate-200 bg-white px-8 py-10 text-center dark:border-slate-800 dark:bg-slate-900">
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50">{title}</h1>
            <p className="mt-3 text-[15px] leading-relaxed font-medium text-slate-500 dark:text-slate-400">{body}</p>
          </div>
        </div>
      }
    />
  );
}

function SummaryMetric({
  label,
  value,
  emphasized,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <div className="rounded-[24px] bg-slate-50 px-4 py-4 dark:bg-slate-950">
      <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">{label}</p>
      <p className={`mt-2 text-[15px] ${emphasized ? "font-black text-slate-900 dark:text-slate-50" : "font-bold text-slate-700 dark:text-slate-200"}`}>
        {value}
      </p>
    </div>
  );
}
