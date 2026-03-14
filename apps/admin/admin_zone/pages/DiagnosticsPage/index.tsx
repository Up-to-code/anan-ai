import { getAdminDiagnosticsPageData } from "@/admin_zone/api/diagnostics";
import EmptyState from "@/components/shared/EmptyState";
import InlineBarChart from "@/components/shared/InlineBarChart";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { formatPercent } from "@/lib/format";

type DiagnosticsPageProps = {
  searchParams: {
    range?: "day" | "week" | "month";
  };
};

/**
 * WHY:   Platform operations needs a dedicated view for runtime health and failure rates.
 * WHAT:  Renders one focused panel: the error rate metrics and search activity chart.
 * HOW:   Loads the diagnostic datasets server-side and projects into one unified workspace panel.
 */
export default async function DiagnosticsPage({ searchParams }: DiagnosticsPageProps) {
  const range = searchParams.range ?? "week";
  const data = await getAdminDiagnosticsPageData(range);

  const searchItems = data.searchActivity.labels.map((label, index) => ({
    label,
    value: (data.searchActivity.successSeries[index] ?? 0) + (data.searchActivity.failedSeries[index] ?? 0),
    tone: (data.searchActivity.failedSeries[index] ?? 0) > 0 ? "danger" as const : "primary" as const,
  }));

  return (
    <div className="space-y-6">
      <WorkspacePanel className="space-y-6">
        <form className="flex items-center gap-4">
          <select name="range" defaultValue={range} className="h-10 border-2 border-slate-100 px-4 text-sm font-semibold text-slate-700">
            <option value="day">يوم</option>
            <option value="week">أسبوع</option>
            <option value="month">شهر</option>
          </select>
          <button type="submit" className="h-10 border-2 border-blue-600 bg-blue-600 px-5 text-[11px] font-black uppercase tracking-[0.18em] text-white">
            تطبيق
          </button>
        </form>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="border-2 border-slate-100 bg-white p-6">
            <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">إجمالي الأحداث</div>
            <div className="mt-3 text-4xl font-black text-slate-900">{data.errorRate.total}</div>
          </div>
          <div className="border-2 border-slate-100 bg-white p-6">
            <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">الأخطاء</div>
            <div className="mt-3 text-4xl font-black text-rose-600">{data.errorRate.errors}</div>
          </div>
          <div className="border-2 border-slate-100 bg-white p-6">
            <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">معدل الأخطاء</div>
            <div className="mt-3 text-4xl font-black text-slate-900">{formatPercent(data.errorRate.rate)}</div>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.22em] text-blue-600 mb-4">نشاط البحث</div>
          {searchItems.length > 0 ? (
            <InlineBarChart items={searchItems} />
          ) : (
            <EmptyState title="لا يوجد نشاط" description="لم يتم تسجيل نشاط بحث ضمن الفترة المحددة." />
          )}
        </div>
      </WorkspacePanel>
    </div>
  );
}
