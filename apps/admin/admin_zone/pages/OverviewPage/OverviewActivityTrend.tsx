"use client";

import { useMemo, useState } from "react";
import { AdminInput } from "@/components/shared/AdminFieldControls";
import LineTrendChart from "@/components/shared/LineTrendChart";
import { formatNumber } from "@/lib/format";
import type { OverviewChartPoint } from "@/admin_zone/mocks/types";

type OverviewActivityTrendProps = {
  chart: OverviewChartPoint[];
  range: "30d" | "90d";
  initialTarget: number;
};

/**
 * WHY:   Only the target editor needs client state, not the entire overview surface.
 * WHAT:  Hosts the editable target input and the activity trend chart as a focused client widget.
 * HOW:   Keeps the page itself server-rendered while recomputing the target overlay line locally.
 */
export default function OverviewActivityTrend({
  chart,
  range,
  initialTarget,
}: OverviewActivityTrendProps) {
  const [target, setTarget] = useState(initialTarget);
  const chartData = useMemo(() => chart.map((point) => ({ ...point, target })), [chart, target]);

  return (
    <>
      <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4">
          <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-slate-50 uppercase">اتجاه النشاط</h2>
          <p className="text-[13px] font-black leading-relaxed text-slate-400 uppercase tracking-[.25em]">
            Active audience over the last {range}
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[24px] border border-slate-100 bg-slate-50/70 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/30">
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">أعلى قيمة نشاط</div>
              <div className="mt-3 text-lg font-black tracking-tight text-slate-900 dark:text-slate-50">
                {formatNumber(Math.max(...chart.map((point) => point.activeUsers)))}
              </div>
            </div>
            <div className="rounded-[24px] border border-slate-100 bg-slate-50/70 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/30">
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">الهدف الحالي</div>
              <div className="mt-3 text-lg font-black tracking-tight text-slate-900 dark:text-slate-50">
                {formatNumber(target)}
              </div>
            </div>
            <div className="rounded-[24px] border border-slate-100 bg-slate-50/70 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/30">
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">آخر نقطة</div>
              <div className="mt-3 text-lg font-black tracking-tight text-slate-900 dark:text-slate-50">
                {formatNumber(chart[chart.length - 1]?.activeUsers ?? 0)}
              </div>
            </div>
          </div>
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
    </>
  );
}
