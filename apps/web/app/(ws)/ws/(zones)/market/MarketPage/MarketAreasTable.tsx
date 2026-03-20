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
      <div className="border-2 border-slate-900 bg-white p-3 text-right shadow-none">
        <p className="mb-2 text-xs font-black uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-2">
          {data.city ? `${data.city} - ` : ""}{label}
        </p>
        <div className="space-y-1 text-[10px] font-bold uppercase tracking-widest text-slate-600">
          <p><span className="text-blue-600">إشارات الطلب:</span> {data.demandSignals.toLocaleString("en-US")}</p>
          <p><span className="text-slate-900">المخزون:</span> {data.inventoryCount.toLocaleString("en-US")}</p>
          <p className="pt-2"><span className="text-slate-900 font-black">متوسط السعر:</span> {data.averagePriceLabel ?? "غير كافٍ"}</p>
          <p><span className="text-slate-900 font-black">المنتج الغالب:</span> {data.topProductType ?? "غير واضح"}</p>
          <p><span className="text-slate-900 font-black">الإشارة الأوضح:</span> {data.topSignalLabel ?? "غير واضح"}</p>
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
      <section className="border-2 border-slate-900 bg-white">
        <div className="border-b-2 border-slate-900 p-4 text-right">
          <h2 className="text-base font-black uppercase tracking-widest text-slate-900">{title}</h2>
          {description ? <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-600">{description}</p> : null}
        </div>
        <div className="p-8 text-center text-xs font-black uppercase tracking-widest text-slate-500">
          لا توجد أحياء مطابقة لهذا النطاق.
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
    <section className="border-2 border-slate-900 bg-white">
      <div className="border-b-2 border-slate-900 p-4 text-right">
        <h2 className="text-base font-black uppercase tracking-widest text-slate-900">{title}</h2>
        {description ? <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-600">{description}</p> : null}
      </div>
      <div className="overflow-x-auto">
        <div className="h-[400px] min-w-[980px] p-4 pt-8 pb-8" dir="rtl">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="displayName"
                axisLine={{ stroke: "#0f172a", strokeWidth: 2 }}
                tickLine={{ stroke: "#0f172a", strokeWidth: 2 }}
                tick={{ fill: "#0f172a", fontSize: 10, fontWeight: 900 }}
              />
              <YAxis
                axisLine={{ stroke: "#0f172a", strokeWidth: 2 }}
                tickLine={{ stroke: "#0f172a", strokeWidth: 2 }}
                tick={{ fill: "#0f172a", fontSize: 10, fontWeight: 900 }}
              />
              <Tooltip content={<AreaTooltip />} cursor={{ fill: "#f1f5f9" }} />
              <Legend wrapperStyle={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase" }} />
              <Bar dataKey="demandSignals" name="إشارات الطلب" fill="#2563eb" radius={[0, 0, 0, 0]} />
              <Bar dataKey="inventoryCount" name="المخزون" fill="#0f172a" radius={[0, 0, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
