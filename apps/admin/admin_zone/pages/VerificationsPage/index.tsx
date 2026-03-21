import Link from "next/link";
import { getVerificationsPageData } from "@/admin_zone/api/verifications";
import DataTable from "@/components/shared/DataTable";
import EmptyState from "@/components/shared/EmptyState";
import MetricBarChart from "@/components/shared/MetricBarChart";
import StatCard from "@/components/shared/StatCard";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { labelForVerificationType } from "@/lib/adminLabels";
import { formatDateTime, formatNumber } from "@/lib/format";

type VerificationsPageProps = {
  tab?: "new" | "in_review" | "approved" | "rejected";
};

/**
 * WHY:   Verification review is a core governance queue and should expose both queue health and row-level drill-downs.
 * WHAT:  Renders verification summary cards, a status distribution chart, and the filtered request table.
 * HOW:   Loads the shared summary plus the current tab rows on the server and projects them into the rebuilt panel layout.
 */
export default async function VerificationsPage({ tab = "new" }: VerificationsPageProps) {
  const { rows, summary } = await getVerificationsPageData(tab);
  const items = rows as Array<Record<string, unknown>>;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="جديد" value={formatNumber(summary.new)} />
        <StatCard label="قيد المراجعة" value={formatNumber(summary.inReview)} />
        <StatCard label="معتمد" value={formatNumber(summary.approved)} />
        <StatCard label="مرفوض" value={formatNumber(summary.rejected)} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <WorkspacePanel className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">توزيع حالات التحقق</h2>
            <p className="mt-1 text-sm text-slate-500">لقطة سريعة لحجم الطلبات عبر مراحل المراجعة المختلفة.</p>
          </div>
          <MetricBarChart
            data={[
              { label: "جديد", value: summary.new },
              { label: "قيد المراجعة", value: summary.inReview },
              { label: "معتمد", value: summary.approved },
              { label: "مرفوض", value: summary.rejected },
            ]}
            series={[{ dataKey: "value", label: "الطلبات", color: "#1f2937" }]}
            horizontal
            height={220}
            valueFormatter={(value) => formatNumber(value)}
          />
        </WorkspacePanel>

        <WorkspacePanel className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">طلبات المراجعة</h2>
            <p className="mt-1 text-sm text-slate-500">فتح الطلبات ومتابعة المستندات من قائمة واحدة.</p>
          </div>
          {items.length > 0 ? (
            <DataTable headers={["الجهة", "النوع", "المنظمة", "المستندات", "تاريخ الإرسال", "المراجعة"]}>
              {items.map((item) => (
                <tr key={String(item._id)} className="border-b border-stone-200 last:border-b-0">
                  <td className="px-4 py-3 font-medium text-slate-900">{String(item.subjectName ?? "طلب تحقق")}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{labelForVerificationType(String(item.requestType ?? "user"))}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{String(item.organizationName ?? "غير متوفر")}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{formatNumber(Number(item.documentsCount ?? 0))}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{formatDateTime(Number(item.submittedAt ?? 0))}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    <Link href={`/verifications/${encodeURIComponent(String(item._id))}`}>فتح الطلب</Link>
                  </td>
                </tr>
              ))}
            </DataTable>
          ) : (
            <EmptyState title="لا توجد طلبات" description="لا توجد طلبات تحقق في هذا التصنيف حاليًا." />
          )}
        </WorkspacePanel>
      </section>
    </div>
  );
}
