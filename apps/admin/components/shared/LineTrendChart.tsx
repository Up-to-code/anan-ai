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

type ChartSeries = {
  dataKey: string;
  label: string;
  color: string;
};

type LineTrendChartProps = {
  data: Array<Record<string, number | string>>;
  series: ChartSeries[];
  className?: string;
  height?: number;
  valueFormatter?: (value: number) => string;
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
  valueFormatter,
}: LineTrendChartProps) {
  return (
    <div className={cn("w-full", className)} dir="ltr">
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#e7e5e4" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#57534e", fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#57534e", fontSize: 12 }} width={34} />
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
              <Line
                key={item.dataKey}
                type="monotone"
                dataKey={item.dataKey}
                name={item.label}
                stroke={item.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
