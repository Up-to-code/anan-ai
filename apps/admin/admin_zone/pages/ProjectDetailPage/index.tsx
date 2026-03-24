import Link from "next/link";
import EmptyState from "@/components/shared/EmptyState";
import KeyValueGrid from "@/components/shared/KeyValueGrid";
import PageActions from "@/components/shared/PageActions";
import SectionScaffold from "@/components/shared/SectionScaffold";
import StatusBadge from "@/components/shared/StatusBadge";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { getProjectById, offers, properties } from "@/admin_zone/mocks/data";
import { salesTabs } from "@/lib/adminSectionTabs";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format";

type ProjectDetailPageProps = {
  projectId: string;
};

/**
 * WHY:   Project reviewers need one focused detail page that combines stage, assistant readiness, inventory, and related offers.
 * WHAT:  Renders the mocked project detail for a single project id.
 * HOW:   Joins the base project record with related properties and offers from the mock repository.
 */
export default function ProjectDetailPage({ projectId }: ProjectDetailPageProps) {
  const project = getProjectById(projectId);

  if (!project) {
    return <EmptyState title="المشروع غير موجود" description="تعذر العثور على هذا المشروع داخل بيانات mock الحالية." />;
  }

  const relatedProperties = properties.filter((item) => item.projectId === project.id);
  const relatedOffers = offers.filter((item) => item.projectId === project.id);

  return (
    <SectionScaffold
      eyebrow="المبيعات"
      title={project.name}
      description={project.summary}
      tabs={salesTabs}
      actions={
        <PageActions
          actions={[
            { label: "تعديل", href: `/sales/projects/${project.id}/edit` },
            { label: "حذف", href: `/sales/projects/${project.id}/delete`, variant: "outline" },
          ]}
        />
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_320px]">
        <div className="space-y-6">
          <WorkspacePanel className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge value={project.stage} />
              <StatusBadge value={project.assistantEnabled ? "active" : "inactive"} />
            </div>
            <KeyValueGrid
              items={[
                { label: "المنظمة", value: project.organizationName },
                { label: "المدينة", value: project.city },
                { label: "العقارات", value: formatNumber(project.propertyCount) },
                { label: "العروض المرتبطة", value: formatNumber(project.offerCount) },
                { label: "الوصول للمساعد", value: project.assistantEnabled ? "متاح" : "متوقف" },
                { label: "آخر تحديث", value: formatDateTime(project.updatedAt) },
              ]}
              columns={3}
            />
          </WorkspacePanel>

          <WorkspacePanel className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">العقارات داخل المشروع</h2>
            <div className="space-y-3">
              {relatedProperties.map((property) => (
                <div key={property.id} className="rounded-[8px] border border-border bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <Link href={`/sales/properties/${property.id}`} className="font-medium text-slate-900 hover:underline">
                        {property.title}
                      </Link>
                      <div className="mt-1 text-sm text-slate-500">{property.type} · {property.city}</div>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-slate-900">{formatCurrency(property.price)}</div>
                      <div className="mt-1">
                        <StatusBadge value={property.publicationStatus} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </WorkspacePanel>
        </div>

        <div className="space-y-6">
          <WorkspacePanel className="space-y-4">
            <h2 className="text-base font-semibold text-slate-900">العروض المرتبطة</h2>
            {relatedOffers.length > 0 ? (
              <div className="space-y-3">
                {relatedOffers.map((offer) => (
                  <div key={offer.id} className="rounded-[8px] border border-border bg-white px-4 py-3">
                    <div className="font-medium text-slate-900">{offer.title}</div>
                    <div className="mt-1 text-sm text-slate-500">{offer.organizationName}</div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <StatusBadge value={offer.status} />
                      <Link href={`/offers/${offer.id}`} className="text-sm text-blue-600 hover:text-blue-700">فتح العرض</Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="لا توجد عروض" description="لم يتم ربط أي عرض بهذا المشروع حتى الآن." />
            )}
          </WorkspacePanel>
        </div>
      </div>
    </SectionScaffold>
  );
}
