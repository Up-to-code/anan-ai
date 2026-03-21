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

type MetricBarChartProps = {
  data: Array<Record<string, number | string>>;
  series: Array<{ dataKey: string; label: string; color: string }>;
  className?: string;
  height?: number;
  horizontal?: boolean;
  valueFormatter?: (value: number) => string;
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
  valueFormatter,
}: MetricBarChartProps) {
  return (
    <div className={cn("w-full", className)} dir="ltr">
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout={horizontal ? "vertical" : "horizontal"}
            margin={horizontal ? { top: 0, right: 12, left: 30, bottom: 0 } : { top: 8, right: 12, left: 0, bottom: 0 }}
            barGap={8}
          >
            <CartesianGrid stroke="#e7e5e4" vertical={false} />
            {horizontal ? (
              <>
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: "#57534e", fontSize: 12 }} />
                <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#57534e", fontSize: 12 }} width={96} />
              </>
            ) : (
              <>
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#57534e", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#57534e", fontSize: 12 }} width={34} />
              </>
            )}
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #d6d3d1",
                backgroundColor: "#ffffff",
                boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
              }}
              formatter={(value, name) => {
                const numericValue = Number(value ?? 0);
                return [valueFormatter ? valueFormatter(numericValue) : numericValue, String(name ?? "")];
              }}
            />
            {series.map((item) => (
              <Bar
                key={item.dataKey}
                dataKey={item.dataKey}
                name={item.label}
                fill={item.color}
                radius={horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]}
                maxBarSize={horizontal ? 24 : 36}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
