import Link from "next/link";
import EmptyState from "@/components/shared/EmptyState";
import KeyValueGrid from "@/components/shared/KeyValueGrid";
import PageActions from "@/components/shared/PageActions";
import SectionScaffold from "@/components/shared/SectionScaffold";
import StatusBadge from "@/components/shared/StatusBadge";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { getPropertyById } from "@/admin_zone/mocks/data";
import { salesTabs } from "@/lib/adminSectionTabs";
import { formatCurrency } from "@/lib/format";

type PropertyDetailPageProps = {
  propertyId: string;
};

/**
 * WHY:   Sales operators need a dedicated property detail route before they can safely edit or remove inventory items.
 * WHAT:  Renders a single property summary with linked project and organization context.
 * HOW:   Resolves the property from the mock repository and exposes route-backed CRUD actions for the current item.
 */
export default function PropertyDetailPage({ propertyId }: PropertyDetailPageProps) {
  const property = getPropertyById(propertyId);

  if (!property) {
    return <EmptyState title="العقار غير موجود" description="تعذر العثور على هذا العقار داخل بيانات mock الحالية." />;
  }

  return (
    <SectionScaffold
      eyebrow="المبيعات"
      title={property.title}
      description="عرض تفصيلي لعقار واحد مع حالة النشر والمخزون والروابط المرتبطة."
      tabs={salesTabs}
      actions={
        <PageActions
          actions={[
            { label: "تعديل", href: `/sales/properties/${property.id}/edit` },
            { label: "حذف", href: `/sales/properties/${property.id}/delete`, variant: "outline" },
          ]}
        />
      }
    >
      <WorkspacePanel className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge value={property.publicationStatus} />
          <StatusBadge value={property.inventoryStatus} />
        </div>
        <KeyValueGrid
          items={[
            { label: "المشروع", value: <Link href={`/sales/projects/${property.projectId}`} className="text-slate-900 underline-offset-2 hover:underline">{property.projectName}</Link> },
            { label: "المنظمة", value: <Link href={`/organizations/${property.organizationId}`} className="text-slate-900 underline-offset-2 hover:underline">{property.organizationName}</Link> },
            { label: "النوع", value: property.type },
            { label: "المدينة", value: property.city },
            { label: "السعر", value: formatCurrency(property.price) },
            { label: "المعرّف", value: property.id },
          ]}
          columns={3}
        />
      </WorkspacePanel>
    </SectionScaffold>
  );
}
