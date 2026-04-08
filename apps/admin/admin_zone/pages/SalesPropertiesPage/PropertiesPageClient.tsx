"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminInput, AdminSelect } from "@/components/shared/AdminFieldControls";
import DataTable from "@/components/shared/DataTable";
import PageActions from "@/components/shared/PageActions";
import SectionScaffold from "@/components/shared/SectionScaffold";
import StatusBadge from "@/components/shared/StatusBadge";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { salesTabs } from "@/lib/adminSectionTabs";
import { formatCurrency } from "@/lib/format";
import type { PropertyRecord } from "@/admin_zone/mocks/types";

type PropertiesPageClientProps = {
  properties: PropertyRecord[];
};

/**
 * WHY:   Operators need one inventory page to inspect project units and their publication state without backend writes.
 * WHAT:  Renders a searchable and filterable properties table backed by mock data.
 * HOW:   Applies local state filters for query, project, type, and status before rendering the table rows.
 */
export default function PropertiesPageClient({ properties }: PropertiesPageClientProps) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [publicationStatus, setPublicationStatus] = useState("all");

  const filteredProperties = useMemo(
    () =>
      properties.filter((property) => {
        const matchesSearch = [property.title, property.projectName, property.organizationName].some((value) =>
          value.toLowerCase().includes(search.toLowerCase()),
        );
        const matchesType = type === "all" || property.type === type;
        const matchesStatus = publicationStatus === "all" || property.publicationStatus === publicationStatus;
        return matchesSearch && matchesType && matchesStatus;
      }),
    [properties, publicationStatus, search, type],
  );

  const types = Array.from(new Set(properties.map((item) => item.type)));

  return (
    <SectionScaffold
      eyebrow="المبيعات"
      title="العقارات"
      description="قائمة موحدة للعقارات المرتبطة بالمشاريع مع حالة النشر والمخزون."
      tabs={salesTabs}
      actions={<PageActions actions={[{ label: "إضافة عقار", href: "/sales/properties/new" }]} />}
      layout="list"
      contentWidth="contained"
    >
      <WorkspacePanel density="compact">
        <div className="grid gap-3 md:grid-cols-3">
          <AdminInput placeholder="ابحث باسم العقار أو المشروع" value={search} onChange={(event) => setSearch(event.target.value)} />
          <AdminSelect value={type} onChange={(event) => setType(event.target.value)}>
            <option value="all">كل الأنواع</option>
            {types.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </AdminSelect>
          <AdminSelect value={publicationStatus} onChange={(event) => setPublicationStatus(event.target.value)}>
            <option value="all">كل حالات النشر</option>
            <option value="published">منشور</option>
            <option value="draft">مسودة</option>
          </AdminSelect>
        </div>
      </WorkspacePanel>

      <WorkspacePanel density="default" bodyClassName="!px-0 !py-0">
      <DataTable headers={["العقار", "المشروع", "المنظمة", "النوع", "النشر", "الحالة", "السعر"]} className="rounded-none border-0 bg-transparent shadow-none">
        {filteredProperties.map((property) => (
          <tr key={property.id} className="group transition-colors hover:bg-muted/5">
            <td className="px-5 py-4">
              <Link href={`/sales/properties/${property.id}`} className="block font-black tracking-tight text-foreground hover:text-primary transition-colors">
                {property.title}
              </Link>
            </td>
            <td className="px-5 py-4 text-[13px] font-bold text-muted-foreground/70">{property.projectName}</td>
            <td className="px-5 py-4 text-[13px] font-bold text-muted-foreground/70">{property.organizationName}</td>
            <td className="px-5 py-4 text-[13px] font-bold text-muted-foreground/70">{property.type}</td>
            <td className="px-5 py-4"><StatusBadge value={property.publicationStatus} /></td>
            <td className="px-5 py-4"><StatusBadge value={property.inventoryStatus} /></td>
            <td className="px-5 py-4 text-[13px] font-black tracking-tight text-foreground">{formatCurrency(property.price)}</td>
          </tr>
        ))}
      </DataTable>
      </WorkspacePanel>
    </SectionScaffold>
  );
}
