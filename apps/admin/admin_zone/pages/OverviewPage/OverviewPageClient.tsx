"use client";

import { useMemo, useState } from "react";
import AdminRangeControl from "@/components/shared/AdminRangeControl";
import { AdminInput } from "@/components/shared/AdminFieldControls";
import DonutBreakdownChart from "@/components/shared/DonutBreakdownChart";
import LineTrendChart from "@/components/shared/LineTrendChart";
import MetricBarChart from "@/components/shared/MetricBarChart";
import SectionScaffold from "@/components/shared/SectionScaffold";
import StatCard from "@/components/shared/StatCard";
import StatusBadge from "@/components/shared/StatusBadge";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { overviewTabs } from "@/lib/adminSectionTabs";
import { formatNumber, formatDateTime } from "@/lib/format";
import type { ActivityFeedItem, OverviewChartPoint, OverviewMetric, QueueItem } from "@/admin_zone/mocks/types";
import type { ModelRecord } from "@/admin_zone/mocks/types";

type OverviewPageClientProps = {
  range: "30d" | "90d";
  metrics: OverviewMetric[];
  chart: OverviewChartPoint[];
  activities: ActivityFeedItem[];
  queue: QueueItem[];
  models: ModelRecord[];
};

/**
 * WHY:   The Admin Overview must feel premium, spacious, and "Nexus" grade.
 * WHAT:  Modernizes the dashboard layout with increased breathability and high-contrast typography.
 * HOW:   Uses p-12 for primary panels, rounded-[40px] for key containers, and Cairo-black for all headers.
 */
export default function OverviewPageClient({ range, metrics, chart, activities, queue, models }: OverviewPageClientProps) {
  const [target, setTarget] = useState(220);

  const chartData = useMemo(
    () => chart.map((point) => ({ ...point, target })),
    [chart, target],
  );
  const queueChartData = useMemo(
    () => queue.map((item) => ({ label: item.label, count: item.count })),
    [queue],
  );
  const modelShareData = useMemo(
    () =>
      models.map((model, index) => ({
        label: model.name,
        value: model.monthlyTokens,
        color: ["var(--chart-blue)", "var(--chart-teal)", "var(--chart-amber)", "var(--chart-purple)", "var(--chart-rose)", "var(--chart-cyan)"][index % 6],
      })),
    [models],
  );

  return (
    <SectionScaffold
      eyebrow="عنـان مـانـور"
      title="مركز العمليات"
      description="الملخص التشغيلي الذكي للمنصة. تتبع النشاط، العروض النقية، واستهلاك الذكاء الاصطناعي."
      tabs={overviewTabs}
    >
      <div className="flex items-center justify-end pb-4 font-black">
        <AdminRangeControl />
      </div>

      {/* KPI Section */}
      <section className="grid gap-10 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <StatCard
            key={metric.key}
            label={metric.label}
            value={formatNumber(metric.value)}
            delta={metric.delta}
            hint={metric.hint}
          />
        ))}
      </section>

      {/* Main Charts Section */}
      <section className="grid gap-12 xl:grid-cols-[minmax(0,1.6fr)_minmax(380px,0.8fr)] mt-8">
        <WorkspacePanel className="rounded-[40px] p-12 flex flex-col gap-10 border-slate-100 bg-white shadow-[0_8px_32px_-4px_rgba(0,0,0,0.04)] dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-slate-50 uppercase">المستخدمون النشطون</h2>
              <p className="text-[13px] font-black leading-relaxed text-slate-400 uppercase tracking-[.25em]">Daily active users • last {range}</p>
            </div>
            <div className="w-full max-w-[260px] p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/10 border border-slate-100 dark:border-slate-800">
              <label className="mb-4 block text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">تعديل الهدف</label>
              <AdminInput 
                type="number" 
                value={target} 
                onChange={(event) => setTarget(Number(event.target.value) || 0)}
                className="rounded-full border-slate-200 bg-white dark:bg-slate-900 font-black h-12 px-6"
              />
            </div>
          </div>
          <div className="flex-1 min-h-[400px]">
            <LineTrendChart
              data={chartData}
              series={[
                { dataKey: "activeUsers", label: "النشطون", color: "#2563EB" },
                { dataKey: "target", label: "المستهدف", color: "rgba(148, 163, 184, 0.15)" },
              ]}
              height={400}
            />
          </div>
        </WorkspacePanel>

        <WorkspacePanel className="rounded-[40px] p-12 flex flex-col gap-10 border-slate-100 bg-white/50 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="space-y-4">
            <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-slate-50 uppercase">النماذج</h2>
            <p className="text-[13px] font-black leading-relaxed text-slate-400 uppercase tracking-[.25em]">Token consumption</p>
          </div>
          <div className="flex-1 flex items-center justify-center min-h-[300px]">
            <DonutBreakdownChart data={modelShareData} height={300} />
          </div>
          <div className="grid gap-4 pt-8 border-t border-slate-100 dark:border-slate-800">
            {modelShareData.map(item => (
              <div key={item.label} className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.2em]">
                <span className="text-slate-400">{item.label}</span>
                <span className="text-slate-900 dark:text-slate-50 font-black">{formatNumber(item.value)}</span>
              </div>
            ))}
          </div>
        </WorkspacePanel>
      </section>

      {/* Feed & Queues Section */}
      <section className="grid gap-12 lg:grid-cols-2 mt-4">
        <WorkspacePanel className="rounded-[40px] p-12 flex flex-col gap-10 border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900/50 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-3">
              <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-slate-50 uppercase">آخر الأنشطة</h2>
              <p className="text-[13px] font-black leading-relaxed text-slate-400 uppercase tracking-[.25em]">Live Platform Feed</p>
            </div>
            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
          </div>
          <div className="grid gap-6">
            {activities.map((item) => (
              <div key={item.id} className="group relative overflow-hidden rounded-[32px] border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-transparent p-8 transition-all hover:bg-white hover:shadow-xl hover:border-blue-100 dark:hover:bg-slate-800/10">
                <div className="flex items-start justify-between gap-6">
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="text-[17px] font-black tracking-tight text-slate-900 dark:text-slate-50 group-hover:text-blue-600 transition-colors truncate">{item.title}</div>
                    <div className="text-[13px] font-bold text-slate-400 line-clamp-1">{item.subtitle}</div>
                    <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{formatDateTime(item.createdAt)}</div>
                  </div>
                  <StatusBadge value={item.status} />
                </div>
              </div>
            ))}
          </div>
        </WorkspacePanel>

        <WorkspacePanel className="rounded-[40px] p-12 flex flex-col gap-10 border-slate-100 bg-slate-50/30 dark:border-slate-800 dark:bg-slate-950/20">
          <div className="space-y-3">
            <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-slate-50 uppercase">المراجعة التشغيلية</h2>
            <p className="text-[13px] font-black leading-relaxed text-slate-400 uppercase tracking-[.25em]">Operational focus queue</p>
          </div>
          <div className="min-h-[300px] p-8 rounded-[32px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
            <MetricBarChart
              data={queueChartData}
              series={[{ dataKey: "count", label: "البنود", color: "#2563EB" }]}
              horizontal
              height={300}
            />
          </div>
          <div className="grid gap-6">
            {queue.map((item) => (
              <div key={item.id} className="group rounded-[32px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 transition-all hover:shadow-lg">
                <div className="flex items-center justify-between gap-6 text-right">
                  <div className="space-y-2 flex-1">
                    <div className="text-[16px] font-black tracking-tight text-slate-900 dark:text-slate-50">{item.label}</div>
                    <div className="text-[12px] font-bold text-slate-400 italic opacity-60">{item.note}</div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-2xl font-black text-slate-900 dark:text-slate-50 tabular-nums">{item.count}</span>
                    <StatusBadge value={item.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </WorkspacePanel>
      </section>
    </SectionScaffold>
  );
}
