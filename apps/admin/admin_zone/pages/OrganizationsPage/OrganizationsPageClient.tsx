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
import { organizationsTabs } from "@/lib/adminSectionTabs";
import { formatDateTime } from "@/lib/format";
import { labelForOwnerType } from "@/lib/adminLabels";
import type { OrganizationRecord } from "@/admin_zone/mocks/types";

type OrganizationsPageClientProps = {
  organizations: OrganizationRecord[];
};

/**
 * WHY:   Admin operations need one searchable organizations directory covering both brokers and developers.
 * WHAT:  Renders the mocked organizations list with kind and verification filters.
 * HOW:   Filters locally and routes each row into the organization detail page.
 */
export default function OrganizationsPageClient({ organizations }: OrganizationsPageClientProps) {
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("all");
  const [verificationStatus, setVerificationStatus] = useState("all");

  const filteredOrganizations = useMemo(
    () =>
      organizations.filter((organization) => {
        const matchesSearch = [organization.name, organization.budgetBand].some((value) =>
          value.toLowerCase().includes(search.toLowerCase()),
        );
        const matchesKind = kind === "all" || organization.kind === kind;
        const matchesVerification = verificationStatus === "all" || organization.verificationStatus === verificationStatus;
        return matchesSearch && matchesKind && matchesVerification;
      }),
    [kind, organizations, search, verificationStatus],
  );

  const summary = useMemo(
    () => ({
      total: organizations.length,
      developers: organizations.filter((organization) => organization.kind === "developer").length,
      brokers: organizations.filter((organization) => organization.kind === "broker").length,
      needsReview: organizations.filter((organization) => organization.verificationStatus !== "approved").length,
    }),
    [organizations],
  );

  return (
    <SectionScaffold
      eyebrow="المنظمات"
      title="كل المنظمات"
      description="قائمة موحدة للوسطاء والمطورين مع حالة التحقق والوثائق والأنشطة المرتبطة."
      tabs={organizationsTabs}
      actions={
        <PageActions
          actions={[
            { label: "إضافة منظمة", href: getAdminPageOperationHref("organizations", "create") ?? "/organizations/new" },
          ]}
        />
      }
      layout="list"
      contentWidth="contained"
    >
      <AdminMetricGrid minItemWidth={205}>
        <StatCard label="إجمالي المنظمات" value={String(summary.total)} hint="كل الشركاء الظاهرين في الدليل الحالي." className="rounded-[24px] p-5" />
        <StatCard label="المطورون" value={String(summary.developers)} hint="جهات تملك مشاريع وكتالوجًا مباشرًا." className="rounded-[24px] p-5" />
        <StatCard label="الوسطاء" value={String(summary.brokers)} hint="منظمات تعتمد على التوزيع والتعاون." className="rounded-[24px] p-5" />
        <StatCard label="تحتاج مراجعة" value={String(summary.needsReview)} hint="منظمات لم تصل لاعتماد كامل بعد." className="rounded-[24px] p-5" />
      </AdminMetricGrid>

      <WorkspacePanel density="compact">
        <div className="grid gap-3 md:grid-cols-3">
          <AdminInput placeholder="ابحث باسم المنظمة" value={search} onChange={(event) => setSearch(event.target.value)} />
          <AdminSelect value={kind} onChange={(event) => setKind(event.target.value)}>
            <option value="all">كل الأنواع</option>
            <option value="broker">وسيط</option>
            <option value="developer">مطور</option>
          </AdminSelect>
          <AdminSelect value={verificationStatus} onChange={(event) => setVerificationStatus(event.target.value)}>
            <option value="all">كل حالات التحقق</option>
            <option value="approved">معتمد</option>
            <option value="in_review">قيد المراجعة</option>
            <option value="pending">معلق</option>
          </AdminSelect>
        </div>
      </WorkspacePanel>

      <WorkspacePanel density="default" bodyClassName="!px-0 !py-0">
        <DataTable headers={["المنظمة", "النوع", "التحقق", "الوثائق", "المشاريع", "الأعضاء", "آخر نشاط"]} className="rounded-none border-0 bg-transparent shadow-none">
          {filteredOrganizations.map((organization) => (
            <tr key={organization.id} className="group transition-colors hover:bg-muted/5">
              <td className="px-5 py-4">
                <Link
                  href={getAdminPageOperationHref("organizations", "detail", organization.id) ?? `/organizations/${organization.id}`}
                  className="block font-black tracking-tight text-foreground transition-colors hover:text-primary"
                >
                  {organization.name}
                </Link>
                <div className="mt-1 text-[11px] font-bold text-muted-foreground/50">{organization.budgetBand}</div>
              </td>
              <td className="px-5 py-4 text-[13px] font-bold text-muted-foreground/70">{labelForOwnerType(organization.kind)}</td>
              <td className="px-5 py-4"><StatusBadge value={organization.verificationStatus} /></td>
              <td className="px-5 py-4"><StatusBadge value={organization.documentationStatus} /></td>
              <td className="px-5 py-4 text-[13px] font-bold text-muted-foreground/70 tracking-tight">{organization.projectsCount}</td>
              <td className="px-5 py-4 text-[13px] font-bold text-muted-foreground/70 tracking-tight">{organization.membersCount}</td>
              <td className="px-5 py-4 text-[13px] font-bold text-muted-foreground/50">{formatDateTime(organization.lastActiveAt)}</td>
            </tr>
          ))}
        </DataTable>
      </WorkspacePanel>
    </SectionScaffold>
  );
}
