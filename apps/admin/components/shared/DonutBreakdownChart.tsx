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
                borderRadius: 16,
                border: "1px solid var(--border)",
                backgroundColor: "var(--card)",
                boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value, name) => [formatChartNumber(value as number | string), String(name ?? "")]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-2xl border border-border/40 bg-muted/5 px-4 py-3 transition-colors hover:bg-muted/10">
            <div className="flex items-center gap-3 text-[13px] font-bold text-foreground">
              <span className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
              <span>{item.label}</span>
            </div>
            <span className="text-sm font-black tabular-nums tracking-tight text-foreground">{formatChartNumber(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
