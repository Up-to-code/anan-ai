import { getAnalyticsPageData } from "@/admin_zone/api/analytics";
import { convexAdminPropertiesRepository } from "@/server/infrastructure/convex/adminPropertiesRepository";
import { requireAdminPageSession } from "@/lib/serverSession";
import DataTable from "@/components/shared/DataTable";
import EmptyState from "@/components/shared/EmptyState";
import InlineBarChart from "@/components/shared/InlineBarChart";
import StatusBadge from "@/components/shared/StatusBadge";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { formatCurrency, formatNumber } from "@/lib/format";

type PropertiesPageProps = {
  tab?: "all" | "brokers" | "developers" | "status";
};

function PropertiesStatusPanel(args: {
  data: {
    total: number;
    statusBreakdown: Record<string, number>;
    ownerBreakdown: Record<string, number>;
    trend: Array<{ label: string; value: number }>;
  };
}) {
  return (
    <div className="max-w-2xl">
      <WorkspacePanel className="space-y-4">
        <div className="text-sm font-black text-blue-600">توزيع الحالة</div>
        <InlineBarChart
          items={[
            { label: "متاح", value: args.data.statusBreakdown.available ?? 0, tone: "primary" },
            { label: "محجوز", value: args.data.statusBreakdown.reserved ?? 0, tone: "neutral" },
            { label: "مباع", value: args.data.statusBreakdown.sold ?? 0, tone: "danger" },
            { label: "غير محدد", value: args.data.statusBreakdown.unspecified ?? 0, tone: "neutral" },
          ]}
        />
      </WorkspacePanel>
    </div>
  );
}

function PropertiesTable({ rows }: { rows: Array<Record<string, unknown>> }) {
  return (
    <WorkspacePanel>
      <DataTable headers={["العقار", "العنوان", "السعر", "الغرف", "المالك", "الحالة"]}>
        {rows.map((row) => (
          <tr key={String(row._id)} className="border-b border-slate-100 last:border-b-0">
            <td className="px-4 py-3 font-black text-slate-900">{String(row.title ?? "عقار")}</td>
            <td className="px-4 py-3 text-sm font-semibold text-slate-600">{String(row.address ?? "غير متوفر")}</td>
            <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatCurrency(Number(row.price ?? 0))}</td>
            <td className="px-4 py-3 text-sm font-semibold text-slate-600">
              {formatNumber(Number(row.beds ?? 0))} / {formatNumber(Number(row.baths ?? 0))}
            </td>
            <td className="px-4 py-3 text-sm font-semibold text-slate-600">{row.brokerId ? "وسيط" : row.REDId ? "مطور" : "غير محدد"}</td>
            <td className="px-4 py-3"><StatusBadge value={String(row.status ?? "unknown")} /></td>
          </tr>
        ))}
      </DataTable>
    </WorkspacePanel>
  );
}

/**
 * WHY:   Properties are now split into simple route-backed tabs so each view answers one inventory question.
 * WHAT:  Renders all properties, broker-owned properties, developer-owned properties, or status breakdowns.
 * HOW:   Uses the existing properties repository and property analytics payload to keep the UI simple and focused.
 */
export default async function PropertiesPage({ tab = "all" }: PropertiesPageProps) {
  const session = await requireAdminPageSession("/properties");
  const result = await convexAdminPropertiesRepository.list(session.token, {
    paginationOpts: { numItems: 120, cursor: null },
  });
  const rows = result.page as Array<Record<string, unknown>>;

  if (tab === "status") {
    const analytics = await getAnalyticsPageData("inventory");
    const data = analytics.data as unknown as {
      inventory: {
        total: number;
        statusBreakdown: Record<string, number>;
        ownerBreakdown: Record<string, number>;
        trend: Array<{ label: string; value: number }>;
      };
    };
    return <PropertiesStatusPanel data={data.inventory} />;
  }

  const filteredRows =
    tab === "brokers"
      ? rows.filter((row) => Boolean(row.brokerId))
      : tab === "developers"
        ? rows.filter((row) => Boolean(row.REDId))
        : rows;

  if (filteredRows.length === 0) {
    return <EmptyState title="لا توجد عقارات" description="لم يتم العثور على عقارات ضمن هذا التصنيف." />;
  }

  return <PropertiesTable rows={filteredRows} />;
}
