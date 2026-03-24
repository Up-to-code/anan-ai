"use client";

import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { cn } from "@/lib/utils";
import { formatChartNumber } from "@/components/shared/chartTypes";

type DonutBreakdownChartProps = {
  data: Array<{ label: string; value: number; color: string }>;
  className?: string;
  height?: number;
};

/**
 * WHY:   Distribution views such as model share and burn share need a compact chart that is not another line plot.
 * WHAT:  Renders a donut chart with an inline legend.
 * HOW:   Uses Recharts pie primitives with Arabic numeric formatting and a shared tooltip style.
 */
export default function DonutBreakdownChart({
  data,
  className,
  height = 280,
}: DonutBreakdownChartProps) {
  return (
    <div className={cn("grid gap-4 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)]", className)}>
      <div style={{ height }} dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius={60} outerRadius={92} paddingAngle={2}>
              {data.map((item) => (
                <Cell key={item.label} fill={item.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #c4c4c4",
                backgroundColor: "#ffffff",
                boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
              }}
              formatter={(value, name) => [formatChartNumber(value as number | string), String(name ?? "")]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-[8px] border border-border bg-slate-50 px-3 py-2.5">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span>{item.label}</span>
            </div>
            <span className="text-sm font-medium text-slate-900">{formatChartNumber(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
