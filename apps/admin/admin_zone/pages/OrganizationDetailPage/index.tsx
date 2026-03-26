import EmptyState from "@/components/shared/EmptyState";
import Link from "next/link";
import KeyValueGrid from "@/components/shared/KeyValueGrid";
import PageActions from "@/components/shared/PageActions";
import SectionScaffold from "@/components/shared/SectionScaffold";
import StatusBadge from "@/components/shared/StatusBadge";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { getOrganizationById, projects, users } from "@/admin_zone/mocks/data";
import { organizationDetailTabs } from "@/lib/adminSectionTabs";
import { formatDateTime } from "@/lib/format";

type OrganizationDetailPageProps = {
  organizationId?: string;
  organizationKey?: string;
  tab?: string;
};

/**
 * WHY:   Organization operations need one drill-down page combining verification, membership, and project data.
 * WHAT:  Renders a mocked organization detail page for a single organization id.
 * HOW:   Resolves the organization and joins related projects and members from the in-memory repository.
 */
export default function OrganizationDetailPage({ organizationId, organizationKey }: OrganizationDetailPageProps) {
  const organization = getOrganizationById(organizationId ?? organizationKey ?? "");

  if (!organization) {
    return <EmptyState title="المنظمة غير موجودة" description="تعذر العثور على المنظمة المطلوبة داخل بيانات mock." />;
  }

  const organizationProjects = projects.filter((item) => item.organizationId === organization.id);
  const organizationUsers = users.filter((item) => item.organizationId === organization.id);

  return (
    <SectionScaffold
      eyebrow="المنظمات"
      title={organization.name}
      description="عرض تفصيلي لحالة المنظمة، مستنداتها، مشاريعها، وأعضائها."
      tabs={organizationDetailTabs(organization.id)}
      actions={
        <PageActions
          actions={[
            { label: "تعديل", href: `/organizations/${organization.id}/edit` },
            { label: "حذف", href: `/organizations/${organization.id}/delete`, variant: "outline" },
          ]}
        />
      }
    >
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_340px]">
        <div className="space-y-8">
          <WorkspacePanel className="p-8 space-y-6">
            <div className="flex flex-wrap items-center gap-3 pb-6 border-b border-border/20">
              <StatusBadge value={organization.verificationStatus} />
              <StatusBadge value={organization.documentationStatus} />
            </div>
            <KeyValueGrid
              items={[
                { label: "نوع المنظمة", value: organization.kind === "broker" ? "وسيط" : "مطور" },
                { label: "النطاق المالي", value: organization.budgetBand },
                { label: "عدد المشاريع", value: organization.projectsCount },
                { label: "عدد الأعضاء", value: organization.membersCount },
                { label: "عدد العروض", value: organization.offersCount },
                { label: "آخر نشاط", value: formatDateTime(organization.lastActiveAt) },
              ]}
              columns={3}
            />
          </WorkspacePanel>

          <WorkspacePanel className="p-8 space-y-6">
            <h2 className="text-xl font-black tracking-tight text-foreground underline decoration-primary/20 decoration-4 underline-offset-8">المشاريع التابعة</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {organizationProjects.map((project) => (
                <Link key={project.id} href={`/sales/projects/${project.id}`} className="group block rounded-2xl border border-border/30 bg-muted/5 p-6 transition-all hover:bg-muted/10 hover:border-primary/30">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="text-lg font-black tracking-tight text-foreground group-hover:text-primary transition-colors">{project.name}</div>
                      <div className="text-[13px] font-bold text-muted-foreground/60 line-clamp-2">{project.summary}</div>
                    </div>
                    <StatusBadge value={project.stage} />
                  </div>
                </Link>
              ))}
            </div>
          </WorkspacePanel>
        </div>

        <div className="space-y-8">
          <WorkspacePanel className="p-8 space-y-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground/40">الوثائق</h2>
            <div className="space-y-3">
              {[
                { label: "السجل التجاري", status: organization.documentationStatus === "complete" ? "approved" : "pending" },
                { label: "هوية الممثل", status: organization.verificationStatus },
                { label: "تفويض الاستخدام", status: organization.documentationStatus === "missing_document" ? "rejected" : "approved" },
              ].map((doc) => (
                <div key={doc.label} className="flex items-center justify-between rounded-xl border border-border/30 bg-card p-4 shadow-sm group hover:border-border transition-colors">
                  <span className="text-[13px] font-bold text-muted-foreground/70">{doc.label}</span>
                  <StatusBadge value={doc.status} />
                </div>
              ))}
            </div>
          </WorkspacePanel>

          <WorkspacePanel className="p-8 space-y-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground/40">الأعضاء</h2>
            <div className="space-y-3">
              {organizationUsers.map((user) => (
                <Link key={user.id} href={`/users/${user.id}`} className="group flex items-center justify-between rounded-xl border border-border/30 bg-muted/5 p-4 transition-all hover:bg-muted/10 hover:border-primary/30">
                  <div className="space-y-1">
                    <div className="text-[13px] font-black text-foreground group-hover:text-primary transition-colors">{user.name}</div>
                    <div className="text-[11px] font-bold text-muted-foreground/50">{user.email}</div>
                  </div>
                </Link>
              ))}
              {organizationUsers.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/40 bg-muted/5 p-8 text-center text-xs font-bold text-muted-foreground/40">لا توجد عضويات مرتبطة.</div>
              ) : null}
            </div>
          </WorkspacePanel>
        </div>
      </div>
    </SectionScaffold>
  );
}
