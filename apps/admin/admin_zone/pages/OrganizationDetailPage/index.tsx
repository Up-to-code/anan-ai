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
import { convexAdminOrganizationsRepository } from "@/server/infrastructure/convex/adminOrganizationsRepository";
import { requireAdminPageSession } from "@/lib/serverSession";

type OrganizationDetailPageProps = {
  organizationId?: string;
  organizationKey?: string;
  tab?: string;
};

function isLiveOrganizationKey(value?: string) {
  return typeof value === "string" && (value.startsWith("broker__") || value.startsWith("red__"));
}

function toStringValue(value: unknown, fallback = "غير متوفر") {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function toNumberValue(value: unknown) {
  return typeof value === "number" ? value : null;
}

async function renderLiveOrganizationDetail(organizationKey: string) {
  const session = await requireAdminPageSession(`/organizations/${encodeURIComponent(organizationKey)}`);
  const detail = await convexAdminOrganizationsRepository.getDetail(session.token, organizationKey);

  if (!detail) {
    return <EmptyState title="المنظمة غير موجودة" description="تعذر العثور على المنظمة المطلوبة داخل البيانات الحية." />;
  }

  const organization = (detail.organization ?? {}) as Record<string, unknown>;
  const metrics = (detail.metrics ?? {}) as Record<string, unknown>;
  const memberships = Array.isArray(detail.memberships) ? detail.memberships : [];
  const verificationRequests = Array.isArray(detail.verificationRequests) ? detail.verificationRequests : [];
  const properties = Array.isArray(detail.properties) ? detail.properties : [];

  return (
    <SectionScaffold
      eyebrow="المنظمات"
      title={toStringValue(organization.name)}
      description="عرض تفصيلي حي لحالة المنظمة، التوثيق، الفريق، والعقارات المرتبطة."
      tabs={organizationDetailTabs(organizationKey)}
    >
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_340px]">
        <div className="space-y-8">
          <WorkspacePanel className="space-y-6 p-8">
            <div className="flex flex-wrap items-center gap-3 border-b border-border/20 pb-6">
              <StatusBadge value={typeof organization.status === "string" ? organization.status : null} />
              <StatusBadge value={organization.isVerified === true ? "approved" : "pending"} />
            </div>
            <KeyValueGrid
              items={[
                { label: "نوع المنظمة", value: organization.ownerType === "broker" ? "وسيط" : "مطور" },
                { label: "المعرف", value: toStringValue(organization.slug) },
                { label: "بريد التواصل", value: toStringValue(organization.contactEmail) },
                { label: "عدد الأعضاء", value: toNumberValue(metrics.membersCount) ?? 0 },
                { label: "الدعوات المعلقة", value: toNumberValue(metrics.invitesCount) ?? 0 },
                { label: "طلبات التوثيق", value: toNumberValue(metrics.verificationCount) ?? 0 },
              ]}
              columns={3}
            />
          </WorkspacePanel>

          <WorkspacePanel className="space-y-6 p-8">
            <h2 className="text-xl font-black tracking-tight text-foreground">طلبات التوثيق</h2>
            <div className="space-y-3">
              {verificationRequests.length > 0 ? (
                verificationRequests.map((request) => {
                  const record = request as Record<string, unknown>;
                  return (
                    <Link
                      key={toStringValue(record.id)}
                      href={`/verifications/${toStringValue(record.id)}`}
                      className="block rounded-2xl border border-border/30 bg-muted/5 p-5 transition hover:border-primary/30 hover:bg-muted/10"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-black text-foreground">{toStringValue(record.title, "طلب توثيق")}</div>
                          <div className="mt-1 text-xs font-bold text-muted-foreground/60">
                            {formatDateTime(toNumberValue(record.submittedAt))}
                          </div>
                        </div>
                        <StatusBadge value={typeof record.currentStatus === "string" ? record.currentStatus : null} />
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-border/40 bg-muted/5 p-10 text-center text-sm font-bold text-muted-foreground/40">
                  لا توجد طلبات توثيق مرتبطة بهذه المنظمة.
                </div>
              )}
            </div>
          </WorkspacePanel>

          <WorkspacePanel className="space-y-6 p-8">
            <h2 className="text-xl font-black tracking-tight text-foreground">العقارات المرتبطة</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {properties.length > 0 ? (
                properties.map((property) => {
                  const record = property as Record<string, unknown>;
                  return (
                    <div key={toStringValue(record.id)} className="rounded-2xl border border-border/30 bg-muted/5 p-5">
                      <div className="text-sm font-black text-foreground">{toStringValue(record.title)}</div>
                      <div className="mt-1 text-xs font-bold text-muted-foreground/60">{toStringValue(record.address)}</div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-border/40 bg-muted/5 p-10 text-center text-sm font-bold text-muted-foreground/40 md:col-span-2">
                  لا توجد عقارات مرتبطة.
                </div>
              )}
            </div>
          </WorkspacePanel>
        </div>

        <div className="space-y-8">
          <WorkspacePanel className="space-y-6 p-8">
            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground/40">الفريق</h2>
            <div className="space-y-3">
              {memberships.length > 0 ? (
                memberships.map((membership) => {
                  const record = membership as Record<string, unknown>;
                  return (
                    <div key={toStringValue(record.id)} className="rounded-xl border border-border/30 bg-card p-4 shadow-sm">
                      <div className="text-[13px] font-black text-foreground">{toStringValue(record.profileName)}</div>
                      <div className="mt-1 text-[11px] font-bold text-muted-foreground/60">{toStringValue(record.profileEmail)}</div>
                      <div className="mt-3">
                        <StatusBadge value={typeof record.role === "string" ? record.role : null} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-xl border border-dashed border-border/40 bg-muted/5 p-8 text-center text-xs font-bold text-muted-foreground/40">
                  لا توجد عضويات مرتبطة.
                </div>
              )}
            </div>
          </WorkspacePanel>
        </div>
      </div>
    </SectionScaffold>
  );
}

function renderMockOrganizationDetail(organizationId: string) {
  const organization = getOrganizationById(organizationId);

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

/**
 * WHY:   Organization operations need one detail route that can serve both the legacy mock console and the new live admin data.
 * WHAT:  Renders a live organization view for prefixed organization keys and falls back to the legacy mock page otherwise.
 * HOW:   Detects the route key shape and chooses the appropriate backing data source for the detail screen.
 */
export default async function OrganizationDetailPage({ organizationId, organizationKey }: OrganizationDetailPageProps) {
  const resolvedKey = organizationKey ?? organizationId ?? "";

  if (isLiveOrganizationKey(resolvedKey)) {
    return renderLiveOrganizationDetail(resolvedKey);
  }

  return renderMockOrganizationDetail(resolvedKey);
}
