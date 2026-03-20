import Link from "next/link";
import { getOrganizationsPageData } from "@/admin_zone/api/organizations";
import DataTable from "@/components/shared/DataTable";
import EmptyState from "@/components/shared/EmptyState";
import StatusBadge from "@/components/shared/StatusBadge";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { labelForOwnerType } from "@/lib/adminLabels";
import { formatDateTime, formatNumber } from "@/lib/format";

type OrganizationsPageProps = {
  tab?: "brokers" | "developers" | "memberships" | "invites";
};

function MembershipsTable({ items }: { items: Array<Record<string, unknown>> }) {
  return (
    <WorkspacePanel>
      <DataTable headers={["المنظمة", "النوع", "المستخدم", "الدور", "الحالة", "الإنشاء"]}>
        {items.map((item) => (
          <tr key={String(item.id)} className="border-b border-slate-100 last:border-b-0">
            <td className="px-4 py-3 font-black text-slate-900">{String(item.organizationName ?? "منظمة")}</td>
            <td className="px-4 py-3 text-sm font-semibold text-slate-600">{labelForOwnerType(String(item.ownerType ?? ""))}</td>
            <td className="px-4 py-3 text-sm font-semibold text-slate-600">{String((item.profile as Record<string, unknown> | null)?.name ?? "غير متوفر")}</td>
            <td className="px-4 py-3 text-sm font-semibold text-slate-600">{String(item.role ?? "غير متوفر")}</td>
            <td className="px-4 py-3"><StatusBadge value={String(item.status ?? "unknown")} /></td>
            <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatDateTime(Number(item.createdAt ?? 0))}</td>
          </tr>
        ))}
      </DataTable>
    </WorkspacePanel>
  );
}

function InvitesTable({ items }: { items: Array<Record<string, unknown>> }) {
  return (
    <WorkspacePanel>
      <DataTable headers={["المنظمة", "النوع", "البريد", "الدور", "الحالة", "ينتهي في"]}>
        {items.map((item) => (
          <tr key={String(item.id)} className="border-b border-slate-100 last:border-b-0">
            <td className="px-4 py-3 font-black text-slate-900">{String(item.organizationName ?? "منظمة")}</td>
            <td className="px-4 py-3 text-sm font-semibold text-slate-600">{labelForOwnerType(String(item.ownerType ?? ""))}</td>
            <td className="px-4 py-3 text-sm font-semibold text-slate-600">{String(item.email ?? "غير متوفر")}</td>
            <td className="px-4 py-3 text-sm font-semibold text-slate-600">{String(item.role ?? "غير متوفر")}</td>
            <td className="px-4 py-3"><StatusBadge value={String(item.status ?? "unknown")} /></td>
            <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatDateTime(Number(item.expiresAt ?? 0))}</td>
          </tr>
        ))}
      </DataTable>
    </WorkspacePanel>
  );
}

function OrganizationsTable({ items }: { items: Array<Record<string, unknown>> }) {
  return (
    <WorkspacePanel>
      <DataTable headers={["المنظمة", "الحالة", "الأعضاء", "الملفات", "العقارات", "الملف"]}>
        {items.map((item) => (
          <tr key={String(item.id)} className="border-b border-slate-100 last:border-b-0">
            <td className="px-4 py-3 font-black text-slate-900">{String(item.name ?? "منظمة")}</td>
            <td className="px-4 py-3"><StatusBadge value={String(item.isVerified ? "approved" : item.status ?? "pending")} /></td>
            <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatNumber(Number(item.membersCount ?? 0))}</td>
            <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatNumber(Number(item.linkedProfilesCount ?? 0))}</td>
            <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatNumber(Number(item.propertyCount ?? 0))}</td>
            <td className="px-4 py-3 text-sm font-black text-blue-600">
              <Link href={`/organizations/${encodeURIComponent(String(item.organizationKey ?? item.id))}`}>فتح المنظمة</Link>
            </td>
          </tr>
        ))}
      </DataTable>
    </WorkspacePanel>
  );
}

/**
 * WHY:   Organizations are now managed through dedicated Arabic tabs for brokers, developers, memberships, and invites.
 * WHAT:  Renders the requested organizations tab using joined admin read models from the backend.
 * HOW:   Loads the relevant organization dataset server-side and maps it into a focused table.
 */
export default async function OrganizationsPage({ tab = "brokers" }: OrganizationsPageProps) {
  const { rows } = await getOrganizationsPageData(tab);
  const items = rows as Array<Record<string, unknown>>;

  if (items.length === 0) {
    return <EmptyState title="لا توجد بيانات" description="لا توجد منظمات أو عضويات أو دعوات في هذا القسم حاليًا." />;
  }

  if (tab === "memberships") return <MembershipsTable items={items} />;
  if (tab === "invites") return <InvitesTable items={items} />;
  return <OrganizationsTable items={items} />;
}
