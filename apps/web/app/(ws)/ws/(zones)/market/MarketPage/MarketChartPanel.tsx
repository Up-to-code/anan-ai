"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import MarketPanel from "./MarketPanel";

type ChartSeries = {
  key: string;
  label: string;
  color: string;
};

type ChartRow = Record<string, string | number | undefined>;

/**
 * WHY:   The redesigned market pages need real analytical charts instead of reading like stacked report cards only.
 * WHAT:  Renders a reusable line or bar chart panel for city, area, keyword, and opportunity comparisons.
 * HOW:   Accepts serializable data rows plus lightweight series config and keeps the chart styling consistent across routes.
 */
export default function MarketChartPanel({
  title,
  description,
  data,
  series,
  xKey,
  kind = "line",
  height = 280,
}: {
  title: string;
  description?: string;
  data: ChartRow[];
  series: ChartSeries[];
  xKey: string;
  kind?: "line" | "bar";
  height?: number;
}) {
  if (data.length === 0) {
    return (
      <MarketPanel title={title} description={description}>
        <div className="py-12 text-center text-sm text-slate-500">لا توجد بيانات كافية لرسم هذا المخطط.</div>
      </MarketPanel>
    );
  }

  const ChartComponent = kind === "bar" ? BarChart : LineChart;

  return (
    <MarketPanel title={title} description={description}>
      <div className="h-[280px] min-w-0 w-full md:h-[320px]" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={240} minHeight={220}>
          <ChartComponent data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey={xKey}
              tick={{ fill: "#64748b", fontSize: 12 }}
              axisLine={{ stroke: "#cbd5e1" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #cbd5e1",
                boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
              }}
            />
            <Legend wrapperStyle={{ paddingTop: 18, fontSize: "12px" }} />
            {series.map((item) =>
              kind === "bar" ? (
                <Bar
                  key={item.key}
                  dataKey={item.key}
                  name={item.label}
                  fill={item.color}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                />
              ) : (
                <Line
                  key={item.key}
                  type="monotone"
                  dataKey={item.key}
                  name={item.label}
                  stroke={item.color}
                  strokeWidth={2.5}
                  dot={{ r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              ),
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    </MarketPanel>
  );
}
