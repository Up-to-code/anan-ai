"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminInput, AdminSelect } from "@/components/shared/AdminFieldControls";
import DataTable from "@/components/shared/DataTable";
import PageActions from "@/components/shared/PageActions";
import SectionScaffold from "@/components/shared/SectionScaffold";
import StatusBadge from "@/components/shared/StatusBadge";
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

  return (
    <SectionScaffold
      eyebrow="إدارة العروض"
      title="مراجعة العروض"
      description="قائمة موحدة للعروض مع قرار الاعتماد أو الرفض داخل الإدارة."
      tabs={offersTabs}
      actions={<PageActions actions={[{ label: "إضافة عرض", href: "/offers/new" }]} />}
    >
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
        <AdminInput placeholder="ابحث باسم العرض أو المنظمة" value={search} onChange={(event) => setSearch(event.target.value)} />
        <AdminSelect value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">كل الحالات</option>
          <option value="pending">معلّق</option>
          <option value="approved">معتمد</option>
          <option value="rejected">مرفوض</option>
        </AdminSelect>
      </div>
      <DataTable headers={["العرض", "المنظمة", "المرسل", "المشروع", "الحالة", "القيمة", "التاريخ"]}>
        {filteredOffers.map((offer) => (
          <tr key={offer.id} className="border-b border-border last:border-b-0">
            <td className="px-4 py-3">
              <Link href={`/offers/${offer.id}`} className="font-medium text-slate-900 hover:text-blue-600">{offer.title}</Link>
            </td>
            <td className="px-4 py-3 text-sm text-slate-600">{offer.organizationName}</td>
            <td className="px-4 py-3 text-sm text-slate-600">{offer.submittedBy}</td>
            <td className="px-4 py-3 text-sm text-slate-600">{offer.projectName}</td>
            <td className="px-4 py-3"><StatusBadge value={offer.status} /></td>
            <td className="px-4 py-3 text-sm text-slate-600">{formatCurrency(offer.amount)}</td>
            <td className="px-4 py-3 text-sm text-slate-600">{formatDateTime(offer.createdAt)}</td>
          </tr>
        ))}
      </DataTable>
    </SectionScaffold>
  );
}
