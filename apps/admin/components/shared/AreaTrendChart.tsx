"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { type ChartDatum, type ChartSeries, formatChartNumber } from "@/components/shared/chartTypes";

type AreaTrendChartProps = {
  data: ChartDatum[];
  series: ChartSeries[];
  className?: string;
  height?: number;
};

/**
 * WHY:   Some admin trends read better as filled volume rather than only line strokes.
 * WHAT:  Renders a reusable multi-series area chart with the same admin tooltip and axis treatment.
 * HOW:   Keeps the plotting direction left-to-right while formatting values in Arabic numerals.
 */
export default function AreaTrendChart({
  data,
  series,
  className,
  height = 280,
}: AreaTrendChartProps) {
  return (
    <div className={cn("w-full", className)} dir="ltr">
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
            <CartesianGrid stroke="#c4c4c4" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} width={40} />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #c4c4c4",
                backgroundColor: "#ffffff",
                boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
              }}
              formatter={(value, name) => [formatChartNumber(value as number | string), String(name ?? "")]}
            />
            {series.map((item) => (
              <Area
                key={item.dataKey}
                type="monotone"
                dataKey={item.dataKey}
                name={item.label}
                stroke={item.color}
                fill={item.color}
                fillOpacity={0.16}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
