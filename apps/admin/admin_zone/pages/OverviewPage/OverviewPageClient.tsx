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
import { formatDateTime, formatNumber } from "@/lib/format";
import type {
  ActivityFeedItem,
  OverviewChartPoint,
  OverviewCountPoint,
  OverviewDistributionPoint,
  OverviewMetric,
  QueueItem,
} from "@/admin_zone/mocks/types";

type OverviewPageClientProps = {
  range: "30d" | "90d";
  metrics: OverviewMetric[];
  chart: OverviewChartPoint[];
  activities: ActivityFeedItem[];
  queue: QueueItem[];
  partnerMix: OverviewDistributionPoint[];
  verificationPressure: OverviewCountPoint[];
  offerQueueMix: OverviewDistributionPoint[];
  userRoleDistribution: OverviewCountPoint[];
  models: OverviewDistributionPoint[];
};

/**
 * WHY:   The admin overview should immediately explain platform health and partner pressure before operators drill into entity-specific workflows.
 * WHAT:  Renders the command-center dashboard using shared summary cards plus standardized chart surfaces.
 * HOW:   Composes mock partner-ops datasets into the admin-local chart foundation and keeps the layout route-focused.
 */
export default function OverviewPageClient({
  range,
  metrics,
  chart,
  activities,
  queue,
  partnerMix,
  verificationPressure,
  offerQueueMix,
  userRoleDistribution,
  models,
}: OverviewPageClientProps) {
  const [target, setTarget] = useState(220);

  const chartData = useMemo(() => chart.map((point) => ({ ...point, target })), [chart, target]);
  const queueChartData = useMemo(() => queue.map((item) => ({ label: item.label, count: item.count })), [queue]);

  return (
    <SectionScaffold
      eyebrow="مركز القيادة"
      title="لوحة التحكم"
      description="لوحة تشغيل موحدة تركز على الشركاء، التوثيق، العروض، واستهلاك الذكاء الاصطناعي عبر بيانات تجريبية منظمة."
      tabs={overviewTabs}
    >
      <div className="flex items-center justify-end pb-4 font-black">
        <AdminRangeControl />
      </div>

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

      <section className="mt-8 grid gap-12 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.85fr)]">
        <WorkspacePanel className="rounded-[40px] border-slate-100 bg-white p-12 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.04)] dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-slate-50 uppercase">اتجاه النشاط</h2>
              <p className="text-[13px] font-black leading-relaxed text-slate-400 uppercase tracking-[.25em]">
                Active audience over the last {range}
              </p>
            </div>
            <div className="w-full max-w-[260px] rounded-3xl border border-slate-100 bg-slate-50 p-8 dark:border-slate-800 dark:bg-slate-800/10">
              <label className="mb-4 block text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">
                تعديل الهدف
              </label>
              <AdminInput
                type="number"
                value={target}
                onChange={(event) => setTarget(Number(event.target.value) || 0)}
                className="h-12 rounded-full border-slate-200 bg-white px-6 font-black dark:bg-slate-900"
              />
            </div>
          </div>
          <div className="mt-10 min-h-[400px]">
            <LineTrendChart
              data={chartData}
              series={[
                { dataKey: "activeUsers", label: "النشطون", color: "#2563EB" },
                { dataKey: "target", label: "المستهدف", color: "#94A3B8" },
              ]}
              height={400}
            />
          </div>
        </WorkspacePanel>

        <WorkspacePanel className="rounded-[40px] border-slate-100 bg-white/50 p-12 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="space-y-4">
            <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-slate-50 uppercase">نوع الشركاء</h2>
            <p className="text-[13px] font-black leading-relaxed text-slate-400 uppercase tracking-[.25em]">Partner mix</p>
          </div>
          <div className="mt-8 flex min-h-[300px] items-center justify-center">
            <DonutBreakdownChart data={partnerMix} height={300} />
          </div>
        </WorkspacePanel>
      </section>

      <section className="mt-4 grid gap-12 xl:grid-cols-3">
        <WorkspacePanel className="rounded-[40px] border-slate-100 bg-white p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="space-y-3">
            <h2 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-slate-50 uppercase">ضغط التوثيق</h2>
            <p className="text-[12px] font-black leading-relaxed text-slate-400 uppercase tracking-[.22em]">Verification pressure</p>
          </div>
          <div className="mt-8">
            <MetricBarChart
              data={verificationPressure}
              series={[{ dataKey: "count", label: "الحالات", color: "#2563EB" }]}
              horizontal
              height={280}
            />
          </div>
        </WorkspacePanel>

        <WorkspacePanel className="rounded-[40px] border-slate-100 bg-white p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="space-y-3">
            <h2 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-slate-50 uppercase">توزيع الأدوار</h2>
            <p className="text-[12px] font-black leading-relaxed text-slate-400 uppercase tracking-[.22em]">User roles</p>
          </div>
          <div className="mt-8">
            <MetricBarChart
              data={userRoleDistribution}
              series={[{ dataKey: "count", label: "المستخدمون", color: "#0F766E" }]}
              horizontal
              height={280}
            />
          </div>
        </WorkspacePanel>

        <WorkspacePanel className="rounded-[40px] border-slate-100 bg-white p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="space-y-3">
            <h2 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-slate-50 uppercase">حالة العروض</h2>
            <p className="text-[12px] font-black leading-relaxed text-slate-400 uppercase tracking-[.22em]">Offer review mix</p>
          </div>
          <div className="mt-8">
            <DonutBreakdownChart data={offerQueueMix} height={220} />
          </div>
        </WorkspacePanel>
      </section>

      <section className="mt-4 grid gap-12 lg:grid-cols-2">
        <WorkspacePanel className="rounded-[40px] border-slate-100 bg-white p-12 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-3">
              <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-slate-50 uppercase">آخر الأنشطة</h2>
              <p className="text-[13px] font-black leading-relaxed text-slate-400 uppercase tracking-[.25em]">Live platform feed</p>
            </div>
            <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse" />
          </div>
          <div className="mt-10 grid gap-6">
            {activities.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-[32px] border border-slate-100 bg-slate-50/50 p-8 transition-all hover:border-blue-100 hover:bg-white hover:shadow-xl dark:border-slate-800 dark:bg-transparent dark:hover:bg-slate-800/10"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="truncate text-[17px] font-black tracking-tight text-slate-900 transition-colors group-hover:text-blue-600 dark:text-slate-50">
                      {item.title}
                    </div>
                    <div className="line-clamp-1 text-[13px] font-bold text-slate-400">{item.subtitle}</div>
                    <div className="mt-4 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      {formatDateTime(item.createdAt)}
                    </div>
                  </div>
                  <StatusBadge value={item.status} />
                </div>
              </div>
            ))}
          </div>
        </WorkspacePanel>

        <WorkspacePanel className="rounded-[40px] border-slate-100 bg-slate-50/30 p-12 dark:border-slate-800 dark:bg-slate-950/20">
          <div className="space-y-3">
            <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-slate-50 uppercase">المراجعة التشغيلية</h2>
            <p className="text-[13px] font-black leading-relaxed text-slate-400 uppercase tracking-[.25em]">Operational focus queue</p>
          </div>
          <div className="mt-10 min-h-[300px] rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <MetricBarChart
              data={queueChartData}
              series={[{ dataKey: "count", label: "البنود", color: "#2563EB" }]}
              horizontal
              height={300}
            />
          </div>
          <div className="mt-8 grid gap-6">
            {queue.map((item) => (
              <div
                key={item.id}
                className="group rounded-[32px] border border-slate-100 bg-white p-8 transition-all hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between gap-6 text-right">
                  <div className="flex-1 space-y-2">
                    <div className="text-[16px] font-black tracking-tight text-slate-900 dark:text-slate-50">{item.label}</div>
                    <div className="text-[12px] font-bold italic text-slate-400 opacity-60">{item.note}</div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-2xl font-black tabular-nums text-slate-900 dark:text-slate-50">{item.count}</span>
                    <StatusBadge value={item.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </WorkspacePanel>
      </section>

      <section className="mt-4">
        <WorkspacePanel className="rounded-[40px] border-slate-100 bg-white/50 p-12 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="space-y-4">
            <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-slate-50 uppercase">استهلاك النماذج</h2>
            <p className="text-[13px] font-black leading-relaxed text-slate-400 uppercase tracking-[.25em]">Model consumption</p>
          </div>
          <div className="mt-8 flex min-h-[300px] items-center justify-center">
            <DonutBreakdownChart data={models} height={300} />
          </div>
        </WorkspacePanel>
      </section>
    </SectionScaffold>
  );
}
