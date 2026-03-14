import Link from "next/link";
import { getAdminUsersPageData } from "@/admin_zone/api/users";
import DataTable from "@/components/shared/DataTable";
import EmptyState from "@/components/shared/EmptyState";
import StatusBadge from "@/components/shared/StatusBadge";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { labelForChannel, labelForOwnerType, labelForRole } from "@/lib/adminLabels";
import { formatDateTime } from "@/lib/format";

type UsersPageProps = {
  tab?: "users" | "profiles" | "memberships" | "verification";
};

function value(row: Record<string, unknown>, key: string, fallback = "غير متوفر") {
  const field = row[key];
  if (field === undefined || field === null || field === "") {
    return fallback;
  }

  return String(field);
}

/**
 * WHY:   The users workspace is now split into focused tabs instead of one mixed management screen.
 * WHAT:  Renders the requested users tab with Arabic tables for all users, profiles, memberships, or verification state.
 * HOW:   Loads the selected users dataset on the server and maps rows into a small, goal-specific table.
 */
export default async function UsersPage({ tab = "users" }: UsersPageProps) {
  const data = await getAdminUsersPageData({ tab });
  const rows = data.users.page as Array<Record<string, unknown>>;

  if (rows.length === 0) {
    return (
      <EmptyState
        title="لا توجد بيانات"
        description="لم يتم العثور على سجلات تطابق هذا القسم حتى الآن."
      />
    );
  }

  if (tab === "profiles") {
    return (
      <WorkspacePanel>
        <DataTable headers={["الاسم", "البريد", "الدور", "المنظمة", "التحقق", "الحالة"]}>
          {rows.map((row) => (
            <tr key={value(row, "id")} className="border-b border-slate-100 last:border-b-0">
              <td className="px-4 py-3 font-black text-slate-900">{value(row, "name")}</td>
              <td className="px-4 py-3 text-sm font-semibold text-slate-600">{value(row, "email")}</td>
              <td className="px-4 py-3 text-sm font-semibold text-slate-600">{labelForRole(value(row, "role", ""))}</td>
              <td className="px-4 py-3 text-sm font-semibold text-slate-600">{value(row, "organizationName")}</td>
              <td className="px-4 py-3"><StatusBadge value={value(row, "verificationStatus", "none")} /></td>
              <td className="px-4 py-3"><StatusBadge value={String(row.isActive ? "active" : "inactive")} /></td>
            </tr>
          ))}
        </DataTable>
      </WorkspacePanel>
    );
  }

  if (tab === "memberships") {
    return (
      <WorkspacePanel>
        <DataTable headers={["المنظمة", "نوع المنظمة", "المستخدم", "الدور", "الحالة", "آخر تحديث"]}>
          {rows.map((row) => (
            <tr key={value(row, "id")} className="border-b border-slate-100 last:border-b-0">
              <td className="px-4 py-3 font-black text-slate-900">{value(row, "organizationName")}</td>
              <td className="px-4 py-3 text-sm font-semibold text-slate-600">{labelForOwnerType(value(row, "ownerType"))}</td>
              <td className="px-4 py-3 text-sm font-semibold text-slate-600">
                {value(row, "profileName")}
                <div className="mt-1 text-xs text-slate-500">{value(row, "profileEmail")}</div>
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-slate-600">{value(row, "role")}</td>
              <td className="px-4 py-3"><StatusBadge value={value(row, "status")} /></td>
              <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatDateTime(Number(row.updatedAt ?? 0))}</td>
            </tr>
          ))}
        </DataTable>
      </WorkspacePanel>
    );
  }

  if (tab === "verification") {
    return (
      <WorkspacePanel>
        <DataTable headers={["المستخدم", "البريد", "الدور", "آخر طلب", "تاريخ الإرسال", "الحالة"]}>
          {rows.map((row) => (
            <tr key={value(row, "id")} className="border-b border-slate-100 last:border-b-0">
              <td className="px-4 py-3 font-black text-slate-900">{value(row, "name")}</td>
              <td className="px-4 py-3 text-sm font-semibold text-slate-600">{value(row, "email")}</td>
              <td className="px-4 py-3 text-sm font-semibold text-slate-600">{labelForRole(value(row, "role"))}</td>
              <td className="px-4 py-3 text-sm font-semibold text-slate-600">{value(row, "latestRequestId")}</td>
              <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatDateTime(Number(row.latestRequestSubmittedAt ?? 0))}</td>
              <td className="px-4 py-3"><StatusBadge value={value(row, "latestRequestStatus", value(row, "roleStatus", "none"))} /></td>
            </tr>
          ))}
        </DataTable>
      </WorkspacePanel>
    );
  }

  return (
    <WorkspacePanel>
      <DataTable headers={["المستخدم", "القناة", "الدور", "المنظمة", "التحقق", "التفاصيل"]}>
        {rows.map((row) => (
          <tr key={value(row, "userKey")} className="border-b border-slate-100 last:border-b-0">
            <td className="px-4 py-3">
              <div className="font-black text-slate-900">{value(row, "name")}</div>
              <div className="mt-1 text-xs font-semibold text-slate-500">{value(row, "email")}</div>
            </td>
            <td className="px-4 py-3 text-sm font-semibold text-slate-600">{labelForChannel(value(row, "channel", ""))}</td>
            <td className="px-4 py-3 text-sm font-semibold text-slate-600">{labelForRole(value(row, "role", "user"))}</td>
            <td className="px-4 py-3 text-sm font-semibold text-slate-600">{value(row, "organizationName")}</td>
            <td className="px-4 py-3"><StatusBadge value={value(row, "verificationStatus", "none")} /></td>
            <td className="px-4 py-3 text-sm font-black text-blue-600">
              <Link href={`/users/${encodeURIComponent(value(row, "userKey"))}`}>فتح الملف</Link>
            </td>
          </tr>
        ))}
      </DataTable>
    </WorkspacePanel>
  );
}
