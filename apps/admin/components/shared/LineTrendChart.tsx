"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { type ChartDatum, type ChartSeries, formatChartNumber } from "@/components/shared/chartTypes";

type LineTrendChartProps = {
  data: ChartDatum[];
  series: ChartSeries[];
  className?: string;
  height?: number;
};

/**
 * WHY:   Admin analytics need one reusable line-chart primitive instead of many page-specific chart implementations.
 * WHAT:  Renders a multi-series line chart with a shared visual treatment and tooltip styling.
 * HOW:   Accepts normalized day-based rows and maps each series config to a Recharts `Line`.
 */
export default function LineTrendChart({
  data,
  series,
  className,
  height = 260,
}: LineTrendChartProps) {
  return (
    <div className={cn("w-full", className)} dir="ltr">
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontWeight: "bold" }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontWeight: "bold" }} width={40} />
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
              <Line
                key={item.dataKey}
                type="monotone"
                dataKey={item.dataKey}
                name={item.label}
                stroke={item.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
