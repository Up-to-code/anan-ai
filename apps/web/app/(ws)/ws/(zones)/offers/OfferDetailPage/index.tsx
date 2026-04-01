"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Archive,
  CheckCircle2,
  Handshake,
  Mail,
  MapPin,
  ShieldCheck,
  Tag,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";
import { formatOfferPrice, formatOfferStageLabel, formatOfferTypeLabel } from "../offerViewModel";
import type { WorkspaceOfferDetail } from "../offerTypes";
import type { OfferActionResult } from "@/server/contracts/offers";

type DetailActionResult = { redirectTo?: string } | { ok: true } | OfferActionResult | void;

function DetailSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border/70 pt-6 first:border-t-0 first:pt-0">
      <div className="space-y-2 text-right">
        {eyebrow ? (
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</div>
        ) : null}
        <h2 className="text-xl font-black text-foreground">{title}</h2>
        {description ? <p className="max-w-3xl text-[14px] leading-7 text-muted-foreground">{description}</p> : null}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function DetailRows({
  rows,
}: {
  rows: Array<{ label: string; value: string; helper?: string }>;
}) {
  return (
    <div className="grid gap-3">
      {rows.map((row) => (
        <div key={row.label} className="border-b border-border/60 pb-3 text-right last:border-b-0 last:pb-0">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{row.label}</div>
          <div className="mt-2 text-[15px] font-black text-foreground">{row.value}</div>
          {row.helper ? <div className="mt-1 text-[13px] leading-6 text-muted-foreground">{row.helper}</div> : null}
        </div>
      ))}
    </div>
  );
}

/**
 * WHY:   Each offer case needs one action-oriented workspace page where brokers and developers can move collaboration forward.
 * WHAT:  Renders the case detail, participants, package data, activity, and role-based case actions.
 * HOW:   Treats server actions as async callbacks, handling redirect-capable and refresh-only responses in one place.
 */
export default function OfferDetailPage({
  offer,
  onMessage,
  onArchive,
  onPublish,
  onEngage,
  onRespond,
  onAdvanceStage,
  editHref,
}: {
  offer: WorkspaceOfferDetail;
  onMessage: () => Promise<{ conversationId: string }>;
  onArchive?: () => Promise<{ redirectTo: string }>;
  onPublish?: () => Promise<DetailActionResult>;
  onEngage?: () => Promise<DetailActionResult>;
  onRespond?: (status: "accepted" | "rejected") => Promise<DetailActionResult>;
  onAdvanceStage?: (action: "mark_agreed" | "close_won" | "close_lost") => Promise<DetailActionResult>;
  editHref?: string | null;
}) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAction(actionKey: string, callback: () => Promise<DetailActionResult>) {
    setError(null);
    try {
      setPendingAction(actionKey);
      const result = await callback();
      if (result && typeof result === "object" && "redirectTo" in result && result.redirectTo) {
        router.push(result.redirectTo);
        return;
      }
      router.refresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "تعذر تنفيذ الإجراء.");
    } finally {
      setPendingAction(null);
    }
  }

  const hasWorkflowActions =
    offer.allowedActions.canEngage ||
    offer.allowedActions.canRespond ||
    offer.allowedActions.canMarkAgreed ||
    offer.allowedActions.canCloseWon ||
    offer.allowedActions.canCloseLost;

  return (
    <div className="flex min-h-full flex-col pb-32">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-6 lg:px-8 lg:py-8">
        <header className="border-b border-border/70 pb-8">
          <div className="flex flex-col gap-6 border-b border-border/60 pb-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4 text-right">
              <button
                type="button"
                onClick={() => router.push("/ws/offers")}
                className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.2em] text-muted-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                العودة للعروض
              </button>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <span className="rounded-full border border-border bg-muted/30 px-3 py-1 text-[11px] font-bold text-muted-foreground">
                  {formatOfferTypeLabel(offer.type)}
                </span>
                <span className="rounded-full border border-border bg-card/80 px-3 py-1 text-[11px] font-bold text-foreground">
                  {formatOfferStageLabel(offer.stage)}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-foreground">{offer.message}</h1>
                <p className="mt-3 max-w-3xl text-[15px] leading-8 text-muted-foreground">
                  {offer.description ?? offer.property?.address ?? "بدون وصف إضافي."}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-3 text-[13px] font-medium text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Tag className="h-4 w-4" />
                  {formatOfferPrice(offer.price)}
                </span>
                <span className="text-border">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {offer.propertyAddress}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 lg:justify-end">
              {offer.canPublish && onPublish ? (
                <button
                  type="button"
                  onClick={() => void runAction("publish", onPublish)}
                  className="rounded-2xl bg-foreground px-4 py-3 text-[13px] font-bold text-background shadow-sm"
                >
                  {pendingAction === "publish" ? "جارٍ النشر" : "نشر الحالة"}
                </button>
              ) : null}
              {editHref ? (
                <button
                  type="button"
                  onClick={() => router.push(editHref)}
                  className="rounded-2xl border border-border bg-background px-4 py-3 text-[13px] font-bold text-foreground shadow-sm"
                >
                  تعديل المسودة
                </button>
              ) : null}
              <button
                type="button"
                onClick={() =>
                  void runAction("message", async () => {
                    const result = await onMessage();
                    router.push(`/ws/inbox/${result.conversationId}`);
                  })
                }
                className="rounded-2xl border border-border bg-background px-4 py-3 text-[13px] font-bold text-foreground shadow-sm"
              >
                <span className="inline-flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  فتح المحادثة
                </span>
              </button>
              {offer.canArchive && onArchive ? (
                <button
                  type="button"
                  onClick={() => void runAction("archive", onArchive)}
                  className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] font-bold text-rose-700 shadow-sm"
                >
                  <span className="inline-flex items-center gap-2">
                    <Archive className="h-4 w-4" />
                    {pendingAction === "archive" ? "جارٍ الأرشفة" : "أرشفة"}
                  </span>
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="text-right">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">الأصل المرتبط</div>
              <div className="mt-2 text-[15px] font-black text-foreground">{offer.propertyTitle}</div>
              <div className="mt-1 text-[13px] text-muted-foreground">{offer.propertyAddress}</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">السعر والعمولة</div>
              <div className="mt-2 text-[15px] font-black text-foreground">{formatOfferPrice(offer.price)}</div>
              <div className="mt-1 text-[13px] text-muted-foreground">{offer.commissionText ?? "بدون عمولة محددة"}</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">الحالة الحالية</div>
              <div className="mt-2 text-[15px] font-black text-foreground">{formatOfferStageLabel(offer.stage)}</div>
              <div className="mt-1 text-[13px] text-muted-foreground">{offer.permitStatus ?? "بدون تصريح خاص"}</div>
            </div>
          </div>
        </header>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] font-bold text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid gap-6">
            <section className="overflow-hidden rounded-[24px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  offer.propertyImageUrl ??
                  offer.property?.imageUrl ??
                  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80"
                }
                alt={offer.propertyTitle}
                className="h-72 w-full object-cover lg:h-[420px]"
              />
            </section>

            <DetailSection
              eyebrow="Offer Details"
              title="تفاصيل العرض"
              description="قراءة سريعة للعناصر الأساسية التي يحتاجها الفريق لفهم الحالة واتخاذ الإجراء المناسب."
            >
              <div className="grid gap-4 lg:grid-cols-2">
                <DetailRows
                  rows={[
                    {
                      label: "الأصل المرتبط",
                      value: offer.propertyTitle,
                      helper: offer.propertyAddress,
                    },
                    {
                      label: "السعر",
                      value: formatOfferPrice(offer.price),
                      helper: offer.commissionText ?? "بدون عمولة محددة",
                    },
                  ]}
                />
                <DetailRows
                  rows={[
                    {
                      label: "التصريح",
                      value: offer.permitStatus ?? "بدون تصريح",
                      helper: offer.productStatus ?? "بدون حالة منتج",
                    },
                    {
                      label: "الوصف المختصر",
                      value: offer.description ?? "بدون وصف إضافي.",
                    },
                  ]}
                />
              </div>
            </DetailSection>

            {offer.clientContext ? (
              <DetailSection
                eyebrow="Client Context"
                title="ملف العميل"
                description="هذا القسم يلخص احتياج العميل المرتبط بالحالة لمساعدة الطرف المنفذ على فهم السياق بسرعة."
              >
                <div className="border-r-2 border-sky-300 bg-sky-50/50 p-5 text-right">
                  <div className="text-xl font-black text-sky-950">{offer.clientContext.clientName}</div>
                  <div className="mt-3 text-[14px] leading-7 text-sky-900/80">{offer.clientContext.clientNeed}</div>
                  <div className="mt-4 flex flex-wrap justify-end gap-3 text-[13px] font-bold text-sky-900/80">
                    {offer.clientContext.clientPhone ? (
                      <span className="bg-white/70 px-3 py-1.5">
                        {offer.clientContext.clientPhone}
                      </span>
                    ) : null}
                    {offer.clientContext.clientBudget ? (
                      <span className="bg-white/70 px-3 py-1.5">
                        {offer.clientContext.clientBudget}
                      </span>
                    ) : null}
                  </div>
                </div>
              </DetailSection>
            ) : null}

            <DetailSection
              eyebrow="Participants"
              title="الأطراف"
              description="الأطراف المرتبطة بهذه الحالة والجهات المسؤولة عن التقدم فيها."
            >
              {offer.participants.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-2">
                  {offer.participants.map((participant) => (
                    <div key={participant.id} className="border-b border-border/60 pb-4 text-right">
                      <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        <ShieldCheck className="h-4 w-4" />
                        {participant.role}
                      </div>
                      <div className="mt-2 text-[16px] font-black text-foreground">{participant.organizationName}</div>
                      <div className="mt-1 text-[13px] text-muted-foreground">{participant.name}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-8 text-center text-[13px] font-semibold text-muted-foreground">
                  لا توجد أطراف إضافية مسجلة لهذه الحالة حالياً.
                </div>
              )}
            </DetailSection>

            <DetailSection
              eyebrow="Timeline"
              title="التسلسل"
              description="سجل الأحداث المرتبطة بالحالة من الإنشاء وحتى آخر تفاعل."
            >
              <div className="grid gap-4">
                {offer.activity.length > 0 ? (
                  offer.activity.map((activity) => (
                    <div key={activity.id} className="border-b border-border/60 pb-4 text-right last:border-b-0 last:pb-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-[14px] font-black text-foreground">{activity.message ?? activity.kind}</div>
                        <div className="text-[12px] font-medium text-muted-foreground">
                          {new Intl.DateTimeFormat("ar-SA", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(activity.createdAt))}
                        </div>
                      </div>
                      {activity.actorName ? (
                        <div className="mt-2 text-[13px] text-muted-foreground">{activity.actorName}</div>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-[13px] text-muted-foreground">
                    لا توجد أحداث مسجلة بعد.
                  </div>
                )}
              </div>
            </DetailSection>
          </div>

          <aside className="grid gap-6">
            <DetailSection
              eyebrow="Quick Panel"
              title="الحالة والإجراءات"
              description="الإجراءات المتاحة هنا تعتمد على دورك الحالي ومرحلة هذه الحالة."
            >
              <div className="grid gap-3">
                <div className="border-b border-border/60 pb-3 text-right">
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">نوع الحالة</div>
                  <div className="mt-2 text-[15px] font-black text-foreground">{formatOfferTypeLabel(offer.type)}</div>
                </div>
                <div className="border-b border-border/60 pb-3 text-right">
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">مرحلة التنفيذ</div>
                  <div className="mt-2 text-[15px] font-black text-foreground">{formatOfferStageLabel(offer.stage)}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">سعر العرض</div>
                  <div className="mt-2 text-[15px] font-black text-foreground">{formatOfferPrice(offer.price)}</div>
                  <div className="mt-1 text-[13px] text-muted-foreground">{offer.productStatus ?? "بدون حالة منتج"}</div>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                {offer.allowedActions.canEngage && onEngage ? (
                  <button
                    type="button"
                    onClick={() => void runAction("engage", onEngage)}
                    className="rounded-2xl bg-foreground px-4 py-3 text-[13px] font-bold text-background"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Handshake className="h-4 w-4" />
                      {pendingAction === "engage" ? "جارٍ فتح التعاون" : "ابدأ التعاون"}
                    </span>
                  </button>
                ) : null}

                {offer.allowedActions.canRespond && onRespond ? (
                  <>
                    <button
                      type="button"
                      onClick={() => void runAction("accept", () => onRespond("accepted"))}
                      className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-bold text-emerald-700"
                    >
                      <span className="inline-flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        {pendingAction === "accept" ? "جارٍ القبول" : "قبول الحالة"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => void runAction("reject", () => onRespond("rejected"))}
                      className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] font-bold text-rose-700"
                    >
                      <span className="inline-flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        {pendingAction === "reject" ? "جارٍ الرفض" : "رفض الحالة"}
                      </span>
                    </button>
                  </>
                ) : null}

                {offer.allowedActions.canMarkAgreed && onAdvanceStage ? (
                  <button
                    type="button"
                    onClick={() => void runAction("mark_agreed", () => onAdvanceStage("mark_agreed"))}
                    className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-[13px] font-bold text-sky-700"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      {pendingAction === "mark_agreed" ? "جارٍ اعتماد الاتفاق" : "تحويل إلى تم الاتفاق"}
                    </span>
                  </button>
                ) : null}

                {offer.allowedActions.canCloseWon && onAdvanceStage ? (
                  <button
                    type="button"
                    onClick={() => void runAction("close_won", () => onAdvanceStage("close_won"))}
                    className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-bold text-emerald-700"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      {pendingAction === "close_won" ? "جارٍ الإغلاق" : "إغلاق ناجح"}
                    </span>
                  </button>
                ) : null}

                {offer.allowedActions.canCloseLost && onAdvanceStage ? (
                  <button
                    type="button"
                    onClick={() => void runAction("close_lost", () => onAdvanceStage("close_lost"))}
                    className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] font-bold text-rose-700"
                  >
                    <span className="inline-flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      {pendingAction === "close_lost" ? "جارٍ الإغلاق" : "إغلاق غير مكتمل"}
                    </span>
                  </button>
                ) : null}

                {!hasWorkflowActions ? (
                  <div className="px-2 py-4 text-center text-[13px] font-semibold text-muted-foreground">
                    لا توجد إجراءات إضافية متاحة في هذه المرحلة حالياً.
                  </div>
                ) : null}
              </div>
            </DetailSection>
          </aside>
        </div>
      </div>
    </div>
  );
}
