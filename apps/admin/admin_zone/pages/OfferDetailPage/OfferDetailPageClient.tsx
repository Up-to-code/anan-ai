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
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_320px]">
        <div className="space-y-6">
          <WorkspacePanel className="space-y-4">
            <div className="flex items-center gap-3">
              <StatusBadge value={reviewStatus} />
            </div>
            <KeyValueGrid
              items={[
                { label: "المنظمة", value: offer.organizationName },
                { label: "المرسل", value: offer.submittedBy },
                { label: "المشروع", value: offer.projectName },
                { label: "العقار", value: offer.propertyName },
                { label: "القيمة", value: formatCurrency(offer.amount) },
                { label: "تاريخ الإنشاء", value: formatDateTime(offer.createdAt) },
              ]}
              columns={3}
            />
          </WorkspacePanel>

          <WorkspacePanel className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">قرار المراجعة</h2>
            <div className="space-y-3">
              <AdminTextarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="أدخل سبب الرفض عند الحاجة"
              />
              {error ? <div className="text-sm text-rose-600">{error}</div> : null}
              <div className="flex flex-wrap gap-3">
                <Button onClick={approveOffer}>اعتماد العرض</Button>
                <Button variant="outline" onClick={rejectOffer}>رفض العرض</Button>
              </div>
            </div>
          </WorkspacePanel>
        </div>

        <WorkspacePanel className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">سجل المراجعة</h2>
          <div className="space-y-3">
            {history.map((entry) => (
              <div key={entry.id} className="rounded-[8px] border border-border bg-slate-50 px-4 py-3">
                <div className="font-medium text-slate-900">{entry.action}</div>
                <div className="mt-1 text-sm text-slate-600">{entry.note}</div>
                <div className="mt-2 text-xs text-slate-500">{entry.actor} · {formatDateTime(entry.createdAt)}</div>
              </div>
            ))}
          </div>
        </WorkspacePanel>
      </div>
    </SectionScaffold>
  );
}
