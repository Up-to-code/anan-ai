"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminMetricGrid } from "@/components/shared/AdminPageLayout";
import StatCard from "@/components/shared/StatCard";
import { AdminInput, AdminSelect } from "@/components/shared/AdminFieldControls";
import DataTable from "@/components/shared/DataTable";
import PageActions from "@/components/shared/PageActions";
import SectionScaffold from "@/components/shared/SectionScaffold";
import StatusBadge from "@/components/shared/StatusBadge";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { getAdminPageOperationHref } from "@/lib/adminPages";
import { offersTabs } from "@/lib/adminSectionTabs";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { OfferRecord } from "@/admin_zone/mocks/types";

type OffersPageClientProps = {
  offers: OfferRecord[];
};

/**
 * WHY:   Offer reviewers need one queue view to inspect, search, and open offer review details.
 * WHAT:  Renders the mocked offers list with client-side filtering by text and review status.
 * HOW:   Filters the in-memory array and links each row to the dedicated detail route.
 */
export default function OffersPageClient({ offers }: OffersPageClientProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const filteredOffers = useMemo(
    () =>
      offers.filter((offer) => {
        const matchesSearch = [offer.title, offer.organizationName, offer.submittedBy, offer.projectName].some((value) =>
          value.toLowerCase().includes(search.toLowerCase()),
        );
        const matchesStatus = status === "all" || offer.status === status;
        return matchesSearch && matchesStatus;
      }),
    [offers, search, status],
  );

  const summary = useMemo(
    () => ({
      total: offers.length,
      pending: offers.filter((offer) => offer.status === "pending").length,
      approved: offers.filter((offer) => offer.status === "approved").length,
      pipelineValue: offers.reduce((accumulator, offer) => accumulator + offer.amount, 0),
    }),
    [offers],
  );

  return (
    <SectionScaffold
      eyebrow="إدارة العروض"
      title="مراجعة العروض"
      description="قائمة موحدة للعروض مع قرار الاعتماد أو الرفض داخل الإدارة."
      tabs={offersTabs}
      actions={
        <PageActions
          actions={[
            { label: "إضافة عرض", href: getAdminPageOperationHref("offers", "create") ?? "/offers/new" },
          ]}
        />
      }
      layout="list"
      contentWidth="contained"
    >
      <AdminMetricGrid minItemWidth={205}>
        <StatCard label="إجمالي العروض" value={String(summary.total)} hint="كل العروض المفتوحة داخل لوحة المراجعة." className="rounded-[24px] p-5" />
        <StatCard label="بانتظار القرار" value={String(summary.pending)} hint="عروض تحتاج اعتمادًا أو رفضًا من الإدارة." className="rounded-[24px] p-5" />
        <StatCard label="المعتمدة" value={String(summary.approved)} hint="عروض اجتازت مسار المراجعة الحالي." className="rounded-[24px] p-5" />
        <StatCard label="قيمة الخط" value={formatCurrency(summary.pipelineValue)} hint="القيمة الإجمالية للعروض داخل البيانات التجريبية." className="rounded-[24px] p-5" />
      </AdminMetricGrid>

      <WorkspacePanel density="compact">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
          <AdminInput placeholder="ابحث باسم العرض أو المنظمة" value={search} onChange={(event) => setSearch(event.target.value)} />
          <AdminSelect value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">كل الحالات</option>
            <option value="pending">معلّق</option>
            <option value="approved">معتمد</option>
            <option value="rejected">مرفوض</option>
          </AdminSelect>
        </div>
      </WorkspacePanel>
      <WorkspacePanel density="default" bodyClassName="!px-0 !py-0">
        <DataTable headers={["العرض", "المنظمة", "المرسل", "المشروع", "الحالة", "القيمة", "التاريخ"]} className="rounded-none border-0 bg-transparent shadow-none">
          {filteredOffers.map((offer) => (
            <tr key={offer.id} className="group transition-colors hover:bg-muted/5">
              <td className="px-5 py-4">
                <Link
                  href={getAdminPageOperationHref("offers", "detail", offer.id) ?? `/offers/${offer.id}`}
                  className="block font-black tracking-tight text-foreground transition-colors hover:text-primary"
                >
                  {offer.title}
                </Link>
              </td>
              <td className="px-5 py-4 text-[13px] font-bold text-muted-foreground/70">{offer.organizationName}</td>
              <td className="px-5 py-4 text-[13px] font-bold text-muted-foreground/70">{offer.submittedBy}</td>
              <td className="px-5 py-4 text-[13px] font-bold text-muted-foreground/70">{offer.projectName}</td>
              <td className="px-5 py-4"><StatusBadge value={offer.status} /></td>
              <td className="px-5 py-4 text-[13px] font-black tracking-tight text-foreground">{formatCurrency(offer.amount)}</td>
              <td className="px-5 py-4 text-[11px] font-black uppercase tracking-widest text-muted-foreground/40">{formatDateTime(offer.createdAt)}</td>
            </tr>
          ))}
        </DataTable>
      </WorkspacePanel>
    </SectionScaffold>
  );
}
