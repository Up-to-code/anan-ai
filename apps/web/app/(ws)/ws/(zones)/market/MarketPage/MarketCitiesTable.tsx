"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type MarketCityRow = {
  city: string;
  demandSignals: number;
  researchRuns: number;
  inventoryCount: number;
  averagePriceLabel: string | null;
};

type MarketCitiesTableProps = {
  rows: MarketCityRow[];
  title?: string;
  description?: string;
};

/**
 * WHY:   Developers need a ranked graphical view of Saudi cities showing demand relative to inventory.
 * WHAT:  Renders a real BarChart representing the city-level market data instead of a text table.
 * HOW:   Accepts already-filtered rows and maps them to Recharts BarChart data properties.
 */
export default function MarketCitiesTable({
  rows,
  title = "المدن الأعلى طلباً",
  description,
}: MarketCitiesTableProps) {
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 p-5 text-right bg-slate-50/50">
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          {description ? <p className="mt-1 text-xs font-medium text-slate-500">{description}</p> : null}
        </div>
        <div className="p-12 pl-12 text-center flex flex-col items-center justify-center">
          <div className="text-sm font-bold text-slate-400">لا توجد مدن قابلة للعرض ضمن هذا النطاق.</div>
        </div>
      </section>

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="border-b border-slate-100 p-5 text-right bg-slate-50/50">
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        {description ? <p className="mt-1 text-xs font-medium text-slate-500">{description}</p> : null}
      </div>
      <div className="h-[400px] w-full p-6 pt-8 pb-8 flex-1" dir="rtl">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            barGap={2}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="city"
              axisLine={{ stroke: "#e2e8f0", strokeWidth: 1 }}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
              dx={-10}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
                fontWeight: 600,
                fontSize: "12px",
                padding: "12px",
              }}
              itemStyle={{ color: "#334155", paddingBottom: "4px" }}
              cursor={{ fill: "#f8fafc" }}
            />
            <Legend wrapperStyle={{ fontSize: "11px", fontWeight: 600, color: "#64748b", paddingTop: "20px" }} />
            <Bar dataKey="demandSignals" name="إشارات الطلب" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="inventoryCount" name="المخزون" fill="#0f172a" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="researchRuns" name="أبحاث محفوظة" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
