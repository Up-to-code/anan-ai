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
  if (rows.length === 0) {
    return (
      <section className="border-2 border-slate-900 bg-white">
        <div className="border-b-2 border-slate-900 p-4 text-right">
          <h2 className="text-base font-black uppercase tracking-widest text-slate-900">{title}</h2>
          {description ? <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-600">{description}</p> : null}
        </div>
        <div className="p-8 text-center text-xs font-black uppercase tracking-widest text-slate-500">
          لا توجد مدن قابلة للعرض ضمن هذا النطاق.
        </div>
      </section>
    );
  }

  return (
    <section className="border-2 border-slate-900 bg-white">
      <div className="border-b-2 border-slate-900 p-4 text-right">
        <h2 className="text-base font-black uppercase tracking-widest text-slate-900">{title}</h2>
        {description ? <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-600">{description}</p> : null}
      </div>
      <div className="h-[400px] w-full p-4 pt-8 pb-8" dir="rtl">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="city"
              axisLine={{ stroke: "#0f172a", strokeWidth: 2 }}
              tickLine={{ stroke: "#0f172a", strokeWidth: 2 }}
              tick={{ fill: "#0f172a", fontSize: 10, fontWeight: 900 }}
            />
            <YAxis
              axisLine={{ stroke: "#0f172a", strokeWidth: 2 }}
              tickLine={{ stroke: "#0f172a", strokeWidth: 2 }}
              tick={{ fill: "#0f172a", fontSize: 10, fontWeight: 900 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "2px solid #0f172a",
                borderRadius: "0px",
                fontWeight: 900,
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
              itemStyle={{ color: "#0f172a" }}
              cursor={{ fill: "#f1f5f9" }}
            />
            <Legend wrapperStyle={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase" }} />
            <Bar dataKey="demandSignals" name="إشارات الطلب" fill="#2563eb" radius={[0, 0, 0, 0]} />
            <Bar dataKey="inventoryCount" name="المخزون" fill="#0f172a" radius={[0, 0, 0, 0]} />
            <Bar dataKey="researchRuns" name="أبحاث محفوظة" fill="#94a3b8" radius={[0, 0, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
