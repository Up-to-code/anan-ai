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
 * WHY:   The new admin needs one overview screen that summarizes platform activity, AI usage, and review queues.
 * WHAT:  Renders KPI cards, an editable active-users chart, recent activity, and operational queue summaries.
 * HOW:   Uses local UI state only for chart target editing while all list and metric content comes from the mock repository.
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
        color: ["#2563eb", "#0f766e", "#a16207", "#7c3aed", "#dc2626", "#0891b2"][index % 6],
      })),
    [models],
  );

  return (
    <SectionScaffold
      eyebrow="نظرة عامة"
      title="لوحة التحكم"
      description="ملخص تشغيلي بسيط لآخر فترة زمنية مع متابعة النشاط، العروض، واستهلاك النماذج."
      tabs={overviewTabs}
    >
      <div className="flex items-center justify-end">
        <AdminRangeControl />
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]">
        <WorkspacePanel className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">المستخدمون النشطون يوميًا</h2>
              <p className="mt-1 text-sm text-slate-500">عرض يومي لعدد المستخدمين النشطين خلال {range === "30d" ? "آخر 30 يومًا" : "آخر 90 يومًا"}.</p>
            </div>
            <div className="w-full max-w-[220px]">
              <label className="mb-2 block text-xs text-slate-500">تعديل خط الهدف</label>
              <AdminInput type="number" value={target} onChange={(event) => setTarget(Number(event.target.value) || 0)} />
            </div>
          </div>
          <LineTrendChart
            data={chartData}
            series={[
              { dataKey: "activeUsers", label: "المستخدمون النشطون", color: "#2563eb" },
              { dataKey: "target", label: "الهدف", color: "#94a3b8" },
            ]}
            height={320}
          />
        </WorkspacePanel>

        <WorkspacePanel className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">توزيع استهلاك النماذج</h2>
            <p className="mt-1 text-sm text-slate-500">حصة كل نموذج من التوكنز المستخدمة خلال الفترة الحالية.</p>
          </div>
          <DonutBreakdownChart data={modelShareData} height={220} />
        </WorkspacePanel>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <WorkspacePanel className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">آخر الأنشطة</h2>
            <p className="mt-1 text-sm text-slate-500">بطاقات سريعة لأحدث الإشارات التشغيلية في النظام.</p>
          </div>
          <div className="space-y-3">
            {activities.map((item) => (
              <div key={item.id} className="rounded-[8px] border border-border bg-white px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium text-slate-900">{item.title}</div>
                    <div className="mt-1 text-sm text-slate-600">{item.subtitle}</div>
                    <div className="mt-2 text-xs text-slate-500">{formatDateTime(item.createdAt)}</div>
                  </div>
                  <StatusBadge value={item.status} />
                </div>
              </div>
            ))}
          </div>
        </WorkspacePanel>

        <WorkspacePanel className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">طوابير العمل</h2>
            <p className="mt-1 text-sm text-slate-500">إشارات تحتاج متابعة بشرية أو قرارًا تشغيليًا.</p>
          </div>
          <MetricBarChart
            data={queueChartData}
            series={[{ dataKey: "count", label: "العناصر", color: "#1f2937" }]}
            horizontal
            height={240}
          />
          <div className="space-y-3">
            {queue.map((item) => (
              <div key={item.id} className="rounded-[8px] border border-border bg-slate-50 px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium text-slate-900">{item.label}</div>
                    <div className="mt-1 text-sm text-slate-600">{item.note}</div>
                  </div>
                  <StatusBadge value={item.status} />
                </div>
              </div>
            ))}
          </div>
        </WorkspacePanel>
      </section>
    </SectionScaffold>
  );
}
