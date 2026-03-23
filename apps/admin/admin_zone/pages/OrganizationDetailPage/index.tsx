import EmptyState from "@/components/shared/EmptyState";
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
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_320px]">
        <div className="space-y-6">
          <WorkspacePanel className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
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

          <WorkspacePanel className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">المشاريع التابعة</h2>
            <div className="space-y-3">
              {organizationProjects.map((project) => (
                <div key={project.id} className="rounded-[8px] border border-border bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-slate-900">{project.name}</div>
                      <div className="text-sm text-slate-500">{project.summary}</div>
                    </div>
                    <StatusBadge value={project.stage} />
                  </div>
                </div>
              ))}
            </div>
          </WorkspacePanel>
        </div>

        <div className="space-y-6">
          <WorkspacePanel className="space-y-4">
            <h2 className="text-base font-semibold text-slate-900">الوثائق</h2>
            <div className="space-y-3">
              {[
                { label: "السجل التجاري", status: organization.documentationStatus === "complete" ? "approved" : "pending" },
                { label: "هوية الممثل", status: organization.verificationStatus },
                { label: "تفويض الاستخدام", status: organization.documentationStatus === "missing_document" ? "rejected" : "approved" },
              ].map((doc) => (
                <div key={doc.label} className="flex items-center justify-between rounded-[8px] border border-border bg-white px-4 py-3">
                  <span className="text-sm text-slate-700">{doc.label}</span>
                  <StatusBadge value={doc.status} />
                </div>
              ))}
            </div>
          </WorkspacePanel>

          <WorkspacePanel className="space-y-4">
            <h2 className="text-base font-semibold text-slate-900">الأعضاء</h2>
            <div className="space-y-3">
              {organizationUsers.map((user) => (
                <div key={user.id} className="rounded-[8px] border border-border bg-slate-50 px-4 py-3">
                  <div className="font-medium text-slate-900">{user.name}</div>
                  <div className="mt-1 text-sm text-slate-500">{user.email}</div>
                </div>
              ))}
              {organizationUsers.length === 0 ? (
                <div className="text-sm text-slate-500">لا توجد عضويات مرتبطة داخل بيانات mock.</div>
              ) : null}
            </div>
          </WorkspacePanel>
        </div>
      </div>
    </SectionScaffold>
  );
}
