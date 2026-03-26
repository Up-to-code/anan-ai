"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { type ChartDatum, type ChartSeries, formatChartNumber } from "@/components/shared/chartTypes";

type MetricBarChartProps = {
  data: ChartDatum[];
  series: ChartSeries[];
  className?: string;
  height?: number;
  horizontal?: boolean;
};

/**
 * WHY:   Queue, funnel, and category comparisons repeat across the rebuilt admin surface.
 * WHAT:  Renders a reusable bar chart in either horizontal or vertical orientation.
 * HOW:   Maps normalized `label` rows and one or more metric series into a shared Recharts bar chart.
 */
export default function MetricBarChart({
  data,
  series,
  className,
  height = 280,
  horizontal = false,
}: MetricBarChartProps) {
  return (
    <div className={cn("w-full", className)} dir="ltr">
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout={horizontal ? "vertical" : "horizontal"}
            margin={horizontal ? { top: 0, right: 12, left: 30, bottom: 0 } : { top: 8, right: 12, left: 0, bottom: 8 }}
            barGap={8}
          >
            <CartesianGrid stroke="var(--border)" vertical={false} />
            {horizontal ? (
              <>
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontWeight: "bold" }} />
                <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontWeight: "bold" }} width={112} />
              </>
            ) : (
              <>
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontWeight: "bold" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontWeight: "bold" }} width={40} />
              </>
            )}
            <Tooltip
              contentStyle={{
                borderRadius: 16,
                border: "1px solid var(--border)",
                backgroundColor: "var(--card)",
                boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value, name) => {
                return [formatChartNumber(value as number | string), String(name ?? "")];
              }}
            />
            {series.map((item) => (
              <Bar
                key={item.dataKey}
                dataKey={item.dataKey}
                name={item.label}
                fill={item.color}
                radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
                maxBarSize={horizontal ? 24 : 36}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
