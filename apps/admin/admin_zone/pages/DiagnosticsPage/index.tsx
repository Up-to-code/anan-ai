import LineTrendChart from "@/components/shared/LineTrendChart";
import MetricBarChart from "@/components/shared/MetricBarChart";
import StatCard from "@/components/shared/StatCard";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { getAdminDiagnosticsPageData } from "@/admin_zone/api/diagnostics";
import { formatPercent } from "@/lib/format";

type DiagnosticsPageProps = {
  searchParams: {
    range?: "day" | "week" | "month";
  };
};

function buildSearchTrend(data: Awaited<ReturnType<typeof getAdminDiagnosticsPageData>>) {
  return data.searchActivity.labels.map((label, index) => ({
    label,
    success: data.searchActivity.successSeries[index] ?? 0,
    failed: data.searchActivity.failedSeries[index] ?? 0,
  }));
}

/**
 * WHY:   Diagnostics should feel like part of the rebuilt admin instead of an old isolated chart page.
 * WHAT:  Renders runtime health cards plus trend and breakdown charts for search and error activity.
 * HOW:   Loads the diagnostics datasets server-side and maps them into the shared chart primitives.
 */
export default async function DiagnosticsPage({ searchParams }: DiagnosticsPageProps) {
  const range = searchParams.range ?? "week";
  const data = await getAdminDiagnosticsPageData(range);
  const searchTrend = buildSearchTrend(data);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="إجمالي الأحداث" value={String(data.errorRate.total)} />
        <StatCard label="الأخطاء" value={String(data.errorRate.errors)} />
        <StatCard label="معدل الأخطاء" value={formatPercent(data.errorRate.rate)} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <WorkspacePanel className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">اتجاه نشاط البحث</h2>
              <p className="mt-1 text-sm text-slate-500">مقارنة بين العمليات الناجحة والفاشلة خلال النطاق المحدد.</p>
            </div>
            <form className="flex items-center gap-2">
              <select name="range" defaultValue={range} className="h-10 rounded-md border border-stone-300 bg-white px-3 text-sm">
                <option value="day">يوم</option>
                <option value="week">أسبوع</option>
                <option value="month">شهر</option>
              </select>
              <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                تطبيق
              </button>
            </form>
          </div>
          <LineTrendChart
            data={searchTrend}
            series={[
              { dataKey: "success", label: "ناجح", color: "#15803d" },
              { dataKey: "failed", label: "فاشل", color: "#be123c" },
            ]}
          />
        </WorkspacePanel>

        <WorkspacePanel className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">توزيع القنوات</h2>
            <p className="mt-1 text-sm text-slate-500">حجم استخدام واتساب، التطبيق، والويب داخل إشارات التشخيص.</p>
          </div>
          <MetricBarChart
            data={[
              { label: "واتساب", value: data.channelDistribution.whatsapp },
              { label: "التطبيق", value: data.channelDistribution.app },
              { label: "الويب", value: data.channelDistribution.web },
            ]}
            series={[{ dataKey: "value", label: "القنوات", color: "#1f2937" }]}
          />
        </WorkspacePanel>
      </section>
    </div>
  );
}
