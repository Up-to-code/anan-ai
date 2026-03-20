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

type MarketAreaRow = {
  city: string;
  area: string;
  demandSignals: number;
  inventoryCount: number;
  averagePriceLabel: string | null;
  topProductType: string | null;
  topSignalLabel: string | null;
};

type MarketAreasTableProps = {
  rows: MarketAreaRow[];
  showCityColumn: boolean;
  title?: string;
  description?: string;
};

/**
 * Custom tooltip to show the extra text fields (Product Type, Top Signal, Price)
 */
function AreaTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload as MarketAreaRow;
    return (
      <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-4 rounded-xl shadow-xl text-right max-w-xs">
        <p className="mb-3 text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          {data.city ? `${data.city} - ` : ""}{label}
        </p>
        <div className="space-y-2 text-xs font-semibold text-slate-600">
          <p className="flex justify-between items-center"><span className="text-slate-400">إشارات الطلب:</span> <span className="text-blue-600">{data.demandSignals.toLocaleString("en-US")}</span></p>
          <p className="flex justify-between items-center"><span className="text-slate-400">المخزون:</span> <span className="text-slate-900">{data.inventoryCount.toLocaleString("en-US")}</span></p>
          <div className="h-px bg-slate-100 my-2"></div>
          <p className="flex justify-between items-center"><span className="text-slate-400">متوسط السعر:</span> <span className="text-slate-900">{data.averagePriceLabel ?? "غير كافٍ"}</span></p>
          <p className="flex flex-col gap-1 mt-2">
            <span className="text-[10px] text-slate-400">المنتج الغالب:</span>
            <span className="text-slate-800 leading-snug">{data.topProductType ?? "غير واضح"}</span>
          </p>
          <p className="flex flex-col gap-1 mt-1">
            <span className="text-[10px] text-slate-400">الإشارة الأوضح:</span>
            <span className="text-slate-800 leading-snug">{data.topSignalLabel ?? "غير واضح"}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
}

/**
 * WHY:   Developers need district-level graphical clarity on where demand concentrates.
 * WHAT:  Renders a Recharts BarChart comparing demand vs. inventory for specific areas.
 * HOW:   Replaces the old HTML table with an interactive chart, utilizing custom tooltips to retain qualitative data.
 */
export default function MarketAreasTable({
  rows,
  showCityColumn,
  title = "الأحياء الأعلى نشاطاً",
  description,
}: MarketAreasTableProps) {
  if (rows.length === 0) {
    return (
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 p-5 text-right bg-slate-50/50">
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          {description ? <p className="mt-1 text-xs font-medium text-slate-500">{description}</p> : null}
        </div>
        <div className="p-12 text-center flex flex-col items-center justify-center">
          <div className="text-sm font-bold text-slate-400">لا توجد أحياء مطابقة لهذا النطاق.</div>
        </div>
      </section>
    );
  }

  // If showing cross-city areas, we might want "Hittin (Riyadh)"
  const chartData = rows.map(r => ({
    ...r,
    displayName: showCityColumn ? `${r.area} (${r.city})` : r.area,
  }));

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 p-5 text-right bg-slate-50/50">
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        {description ? <p className="mt-1 text-xs font-medium text-slate-500">{description}</p> : null}
      </div>
      <div className="overflow-x-auto overflow-y-hidden custom-scrollbar">
        <div className="h-[400px] min-w-[900px] p-6 pt-8 pb-8" dir="rtl">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              barGap={2}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="displayName"
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
              <Tooltip content={<AreaTooltip />} cursor={{ fill: "#f8fafc" }} />
              <Legend wrapperStyle={{ fontSize: "11px", fontWeight: 600, color: "#64748b", paddingTop: "20px" }} />
              <Bar dataKey="demandSignals" name="إشارات الطلب" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="inventoryCount" name="المخزون" fill="#0f172a" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
