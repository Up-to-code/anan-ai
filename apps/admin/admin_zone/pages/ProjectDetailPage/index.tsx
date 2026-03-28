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
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_340px]">
        <div className="space-y-8">
          <WorkspacePanel className="p-8 space-y-6">
            <div className="flex flex-wrap items-center gap-3 pb-6 border-b border-border/20">
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

          <WorkspacePanel className="p-8 space-y-6">
            <h2 className="text-xl font-black tracking-tight text-foreground underline decoration-primary/20 decoration-4 underline-offset-8">العقارات داخل المشروع</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {relatedProperties.map((property) => (
                <Link key={property.id} href={`/sales/properties/${property.id}`} className="group block rounded-2xl border border-border/30 bg-muted/5 p-6 transition-all hover:bg-muted/10 hover:border-primary/30">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="text-lg font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
                        {property.title}
                      </div>
                      <div className="text-[13px] font-bold text-muted-foreground/50">{property.type} · {property.city}</div>
                    </div>
                    <div className="text-left space-y-2">
                      <div className="text-[13px] font-black text-foreground">{formatCurrency(property.price)}</div>
                      <StatusBadge value={property.publicationStatus} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </WorkspacePanel>
        </div>

        <div className="space-y-8">
          <WorkspacePanel className="p-8 space-y-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground/40">العروض المرتبطة</h2>
            {relatedOffers.length > 0 ? (
              <div className="space-y-3">
                {relatedOffers.map((offer) => (
                  <Link key={offer.id} href={`/offers/${offer.id}`} className="group block rounded-xl border border-border/30 bg-card p-5 shadow-sm hover:border-border transition-colors">
                    <div className="space-y-1">
                      <div className="text-[13px] font-black text-foreground group-hover:text-primary transition-colors">{offer.title}</div>
                      <div className="text-[11px] font-bold text-muted-foreground/50">{offer.organizationName}</div>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/10 pt-4">
                      <StatusBadge value={offer.status} />
                      <div className="text-[10px] font-black uppercase tracking-widest text-primary/60 group-hover:text-primary">عرض التفاصيل</div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/40 bg-muted/5 p-8 text-center text-xs font-bold text-muted-foreground/40">لم يتم ربط أي عرض بهذا المشروع حتى الآن.</div>
            )}
          </WorkspacePanel>
        </div>
      </div>
    </SectionScaffold>
  );
}
