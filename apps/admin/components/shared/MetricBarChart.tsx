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
            <CartesianGrid stroke="#c4c4c4" vertical={false} />
            {horizontal ? (
              <>
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} width={112} />
              </>
            ) : (
              <>
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} width={40} />
              </>
            )}
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #c4c4c4",
                backgroundColor: "#ffffff",
                boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
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
                radius={horizontal ? [0, 8, 8, 0] : [8, 8, 0, 0]}
                maxBarSize={horizontal ? 24 : 36}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
