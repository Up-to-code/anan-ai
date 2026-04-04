"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import StatCard from "@/components/shared/StatCard";
import { AdminInput, AdminSelect } from "@/components/shared/AdminFieldControls";
import DataTable from "@/components/shared/DataTable";
import PageActions from "@/components/shared/PageActions";
import SectionScaffold from "@/components/shared/SectionScaffold";
import StatusBadge from "@/components/shared/StatusBadge";
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
 * HOW:   Filters the user array locally and links each row to the user detail page.
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
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="إجمالي المستخدمين" value={String(summary.total)} hint="كل الحسابات التي تظهر في الإدارة حاليًا." />
        <StatCard label="المشرفون" value={String(summary.admins)} hint="حسابات تملك صلاحيات تحكم مباشرة." />
        <StatCard label="مستخدمو الشركاء" value={String(summary.partners)} hint="وسطاء ومطورون ضمن المسارات التشغيلية." />
        <StatCard label="تحتاج تحقق" value={String(summary.needsVerification)} hint="حسابات لا تزال بحاجة لاعتماد أو مراجعة." />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
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
      </div>

      <DataTable headers={["المستخدم", "الدور", "المنظمة", "التحقق", "الحالة", "آخر نشاط"]}>
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
    </SectionScaffold>
  );
}
