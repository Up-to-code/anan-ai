"use client";

import { useMemo, useState } from "react";
import Button from "@/components/shared/Button";
import { AdminTextarea } from "@/components/shared/AdminFieldControls";
import KeyValueGrid from "@/components/shared/KeyValueGrid";
import PageActions from "@/components/shared/PageActions";
import SectionScaffold from "@/components/shared/SectionScaffold";
import StatusBadge from "@/components/shared/StatusBadge";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { offerDetailTabs } from "@/lib/adminSectionTabs";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { OfferRecord } from "@/admin_zone/mocks/types";

type OfferDetailPageClientProps = {
  offer: OfferRecord;
};

/**
 * WHY:   Offer review requires a mocked interactive page where admins can approve or reject with a reason.
 * WHAT:  Renders offer details and local-only approval/rejection controls.
 * HOW:   Stores the review state in component state and appends the resulting decision to a local history list.
 */
export default function OfferDetailPageClient({ offer }: OfferDetailPageClientProps) {
  const [status, setStatus] = useState(offer.status);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState(offer.reviewHistory);

  const reviewStatus = useMemo(() => status, [status]);

  function approveOffer() {
    setStatus("approved");
    setError("");
    setHistory((current) => [
      { id: `history-approved-${current.length + 1}`, action: "اعتماد", actor: "المشرف الحالي", note: "تم اعتماد العرض من الواجهة التجريبية.", createdAt: Date.now() },
      ...current,
    ]);
  }

  function rejectOffer() {
    if (!reason.trim()) {
      setError("سبب الرفض مطلوب قبل إكمال القرار.");
      return;
    }
    setStatus("rejected");
    setError("");
    setHistory((current) => [
      { id: `history-rejected-${current.length + 1}`, action: "رفض", actor: "المشرف الحالي", note: reason.trim(), createdAt: Date.now() },
      ...current,
    ]);
    setReason("");
  }

  return (
    <SectionScaffold
      eyebrow="إدارة العروض"
      title={offer.title}
      description={offer.body}
      tabs={offerDetailTabs(offer.id)}
      actions={
        <PageActions
          actions={[
            { label: "تعديل", href: `/offers/${offer.id}/edit` },
            { label: "حذف", href: `/offers/${offer.id}/delete`, variant: "outline" },
          ]}
        />
      }
    >
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_340px]">
        <div className="space-y-8">
          <WorkspacePanel className="rounded-3xl p-10 space-y-10 border-border/30 bg-card/50 shadow-sm">
            <div className="flex items-center justify-between pb-8 border-b border-border/10">
              <div className="space-y-3">
                <h3 className="text-4xl font-black tracking-tighter text-foreground decoration-primary/20 underline decoration-8 underline-offset-8 decoration-skip-ink-none">{offer.title}</h3>
                <p className="text-[13px] font-bold text-muted-foreground/40 uppercase tracking-widest leading-relaxed">{offer.body}</p>
              </div>
              <StatusBadge value={reviewStatus} />
            </div>

            <KeyValueGrid
              items={[
                { label: "المنظمة", value: <span className="font-black text-foreground">{offer.organizationName}</span> },
                { label: "المرسل", value: <span className="font-black text-primary">{offer.submittedBy}</span> },
                { label: "المشروع", value: <span className="font-black text-foreground">{offer.projectName}</span> },
                { label: "العقار", value: <span className="font-black text-foreground">{offer.propertyName}</span> },
                { label: "القيمة", value: <span className="font-black text-primary text-xl">{formatCurrency(offer.amount)}</span> },
                { label: "تاريخ الإنشاء", value: <span className="font-bold text-muted-foreground/60">{formatDateTime(offer.createdAt)}</span> },
              ]}
              columns={3}
            />
          </WorkspacePanel>

          <WorkspacePanel className="rounded-3xl p-10 space-y-8 border-border/30 bg-card/30">
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-foreground">اتخاذ القرار</h2>
              <p className="text-[13px] font-bold text-muted-foreground/50">قم بمراجعة البيانات أعلاه ثم سجل قرارك النهائي مع إرفاق الملاحظات.</p>
            </div>
            
            <div className="space-y-6">
              <AdminTextarea
                className="rounded-2xl border-border/40 focus:border-primary/50 transition-all font-medium min-h-[120px]"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="أدخل سبب الرفض أو ملاحظات الاعتماد..."
              />
              {error ? <div className="text-sm font-black text-destructive">{error}</div> : null}
              <div className="flex flex-wrap gap-4 pt-4 border-t border-border/5">
                <Button className="h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[11px]" onClick={approveOffer}>اعتماد كلي للعرض</Button>
                <Button variant="outline" className="h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[11px] border-border/40" onClick={rejectOffer}>رفض الطلب</Button>
              </div>
            </div>
          </WorkspacePanel>
        </div>

        <WorkspacePanel className="rounded-3xl p-10 space-y-8 border-border/30 bg-muted/5 shadow-inner self-start">
          <div className="space-y-1">
            <h2 className="text-xl font-black tracking-tight text-foreground">سجل المراجعة</h2>
            <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/40">Audit Timeline</p>
          </div>

          <div className="space-y-6 relative before:absolute before:right-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border/20">
            {history.map((entry) => (
              <div key={entry.id} className="relative pr-8">
                <div className="absolute right-0 top-1.5 w-4 h-4 rounded-full border-4 border-background bg-primary/40" />
                <div className="font-black text-foreground text-sm uppercase tracking-tight">{entry.action}</div>
                <div className="mt-1 text-[13px] text-muted-foreground/80 leading-relaxed font-medium">{entry.note}</div>
                <div className="mt-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                  {entry.actor} <span className="mx-1">•</span> {formatDateTime(entry.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </WorkspacePanel>
      </div>
    </SectionScaffold>
  );
}
