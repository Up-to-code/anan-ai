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
import { usersTabs } from "@/lib/adminSectionTabs";
import { formatDateTime } from "@/lib/format";
import { labelForRole } from "@/lib/adminLabels";
import type { UserRecord } from "@/admin_zone/mocks/types";

type UsersPageClientProps = {
  users: UserRecord[];
};

/**
 * WHY:   The rewritten admin needs one searchable user directory with clean role and verification visibility.
 * WHAT:  Renders the mocked users table with local search and role filters.
 * HOW:   Moves filters into a pinned operational rail and keeps the user table inside a bounded panel so long lists do not expand the full page.
 */
export default function UsersPageClient({ users }: UsersPageClientProps) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const matchesSearch = [user.name, user.email, user.organizationName].some((value) =>
          value.toLowerCase().includes(search.toLowerCase()),
        );
        const matchesRole = role === "all" || user.role === role;
        const matchesStatus = status === "all" || user.status === status;
        return matchesSearch && matchesRole && matchesStatus;
      }),
    [role, search, status, users],
  );

  const summary = useMemo(
    () => ({
      total: users.length,
      admins: users.filter((user) => user.role === "admin").length,
      partners: users.filter((user) => user.role === "broker" || user.role === "developer").length,
      needsVerification: users.filter((user) => user.verificationStatus !== "approved").length,
    }),
    [users],
  );

  return (
    <SectionScaffold
      eyebrow="المستخدمون"
      title="كل المستخدمين"
      description="قائمة موحدة للمستخدمين مع الدور، المنظمة، حالة التحقق، وآخر نشاط."
      tabs={usersTabs}
      actions={
        <PageActions
          actions={[
            { label: "إضافة مستخدم", href: getAdminPageOperationHref("users", "create") ?? "/users/new" },
          ]}
        />
      }
      layout="list"
      contentWidth="contained"
      rail={
        <>
          <WorkspacePanel
            density="compact"
            header={
              <div className="space-y-2">
                <h2 className="text-xl font-black tracking-tight text-[var(--workspace-bubble-other-foreground)]">
                  الفلاتر
                </h2>
                <p className="text-sm font-medium text-[var(--workspace-muted)]">
                  ابحث بسرعة في المستخدمين ثم ضيق القائمة حسب الدور والحالة.
                </p>
              </div>
            }
            bodyClassName="grid gap-3"
          >
            <AdminInput placeholder="ابحث بالاسم أو البريد" value={search} onChange={(event) => setSearch(event.target.value)} />
            <AdminSelect value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="all">كل الأدوار</option>
              <option value="admin">مشرف</option>
              <option value="broker">وسيط</option>
              <option value="developer">مطور</option>
              <option value="user">مستخدم</option>
            </AdminSelect>
            <AdminSelect value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">كل الحالات</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
            </AdminSelect>
          </WorkspacePanel>

          <WorkspacePanel
            density="compact"
            header={
              <div className="space-y-2">
                <h2 className="text-xl font-black tracking-tight text-[var(--workspace-bubble-other-foreground)]">
                  ملخص التشغيل
                </h2>
                <p className="text-sm font-medium text-[var(--workspace-muted)]">
                  قراءة سريعة لما يحتاج متابعة قبل فتح تفاصيل المستخدم.
                </p>
              </div>
            }
            bodyClassName="grid gap-3"
          >
            <div className="rounded-[24px] border border-[color:color-mix(in_srgb,var(--workspace-border)_70%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-elevated)_58%,transparent)] p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--workspace-muted)]">Results</div>
              <div className="mt-2 text-3xl font-black tracking-tight text-[var(--workspace-bubble-other-foreground)]">
                {filteredUsers.length}
              </div>
              <p className="mt-2 text-sm font-medium text-[var(--workspace-muted)]">عدد السجلات المطابقة للفلاتر الحالية.</p>
            </div>
            <div className="rounded-[24px] border border-[color:color-mix(in_srgb,var(--workspace-border)_70%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-elevated)_58%,transparent)] p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--workspace-muted)]">Verification</div>
              <div className="mt-2 text-2xl font-black tracking-tight text-[var(--workspace-bubble-other-foreground)]">
                {summary.needsVerification}
              </div>
              <p className="mt-2 text-sm font-medium text-[var(--workspace-muted)]">حسابات ما زالت تحتاج اعتمادًا أو مراجعة.</p>
            </div>
          </WorkspacePanel>
        </>
      }
    >
      <AdminMetricGrid minItemWidth={200}>
        <StatCard label="إجمالي المستخدمين" value={String(summary.total)} hint="كل الحسابات التي تظهر في الإدارة حاليًا." className="rounded-[24px] p-5" />
        <StatCard label="المشرفون" value={String(summary.admins)} hint="حسابات تملك صلاحيات تحكم مباشرة." className="rounded-[24px] p-5" />
        <StatCard label="مستخدمو الشركاء" value={String(summary.partners)} hint="وسطاء ومطورون ضمن المسارات التشغيلية." className="rounded-[24px] p-5" />
        <StatCard label="تحتاج تحقق" value={String(summary.needsVerification)} hint="حسابات لا تزال بحاجة لاعتماد أو مراجعة." className="rounded-[24px] p-5" />
      </AdminMetricGrid>

      <WorkspacePanel
        density="default"
        header={
          <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-[var(--workspace-bubble-other-foreground)]">
                دليل المستخدمين
              </h2>
              <p className="text-sm font-medium text-[var(--workspace-muted)]">
                جدول ثابت الارتفاع لاستيعاب كميات كبيرة من الحسابات بدون تمديد الصفحة بالكامل.
              </p>
            </div>
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--workspace-muted)]">
              {filteredUsers.length} نتائج
            </div>
          </div>
        }
        bodyClassName="!px-0 !py-0"
      >
        <DataTable
          headers={["المستخدم", "الدور", "المنظمة", "التحقق", "الحالة", "آخر نشاط"]}
          className="rounded-none border-0 bg-transparent shadow-none"
          maxHeightClassName="max-h-[min(70vh,980px)]"
        >
          {filteredUsers.map((user) => (
            <tr key={user.id} className="group transition-colors hover:bg-muted/5">
              <td className="px-5 py-4">
                <Link
                  href={getAdminPageOperationHref("users", "detail", user.id) ?? `/users/${user.id}`}
                  className="block font-black tracking-tight text-foreground transition-colors hover:text-primary"
                >
                  {user.name}
                </Link>
                <div className="mt-1 text-[11px] font-bold text-muted-foreground/50">{user.email}</div>
              </td>
              <td className="px-5 py-4 text-[13px] font-bold text-muted-foreground/70">{labelForRole(user.role)}</td>
              <td className="px-5 py-4 text-[13px] font-bold text-muted-foreground/70">{user.organizationName}</td>
              <td className="px-5 py-4"><StatusBadge value={user.verificationStatus} /></td>
              <td className="px-5 py-4"><StatusBadge value={user.status} /></td>
              <td className="px-5 py-4 text-[13px] font-bold text-muted-foreground/50">{formatDateTime(user.lastActiveAt)}</td>
            </tr>
          ))}
        </DataTable>
      </WorkspacePanel>
    </SectionScaffold>
  );
}
