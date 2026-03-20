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

type OpportunityRow = {
  city: string;
  area: string;
  priority: "high" | "medium" | "watch";
  demandSignals: number;
  researchRuns: number;
  inventoryCount: number;
  dominantProductType: string | null;
  strongestSellingPoint: string | null;
  reason: string;
};

type MarketOpportunityTableProps = {
  rows: OpportunityRow[];
  priorityLabels: Record<"high" | "medium" | "watch", string>;
  title?: string;
};

/**
 * Custom tooltip to show the ranking rationale and extra qualitative data.
 */
function OpportunityTooltip({ active, payload, label, priorityLabels }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload as OpportunityRow;
    return (
      <div className="border-2 border-slate-900 bg-white p-4 text-right shadow-none max-w-sm">
        <div className="mb-3 flex items-center justify-between border-b-2 border-slate-900 pb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-1 border-2 border-blue-200">
            {priorityLabels[data.priority]}
          </span>
          <p className="text-xs font-black uppercase tracking-widest text-slate-900">
            {data.area} ({data.city})
          </p>
        </div>
        <div className="space-y-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-600">
          <p className="border-l-2 border-slate-200 pl-2 leading-relaxed text-slate-900 mb-2">
            {data.reason}
          </p>
          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t-2 border-slate-100">
            <p><span className="text-blue-600 block mb-0.5">الطلب والأبحاث</span> {data.demandSignals.toLocaleString("en-US")} / {data.researchRuns.toLocaleString("en-US")}</p>
            <p><span className="text-slate-900 block mb-0.5">المخزون</span> {data.inventoryCount.toLocaleString("en-US")}</p>
            <p><span className="text-slate-900 block mb-0.5">المنتج</span> {data.dominantProductType ?? "غير واضح"}</p>
            <p><span className="text-slate-900 block mb-0.5">أفضل ميزة</span> {data.strongestSellingPoint ?? "غير واضح"}</p>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

/**
 * WHY:   Opportunity ranking must stay transparent so users can see the signals behind each recommendation.
 * WHAT:  Renders a BarChart illustrating the top opportunities while hiding the rationale inside an interactive Tooltip.
 * HOW:   Accepts rows and priority config to render a Sharp styling compliant graph.
 */
export default function MarketOpportunityTable({
  rows,
  priorityLabels,
  title = "أفضل الفرص الحالية",
}: MarketOpportunityTableProps) {
  if (rows.length === 0) {
    return (
      <section className="border-2 border-slate-900 bg-white">
        <div className="border-b-2 border-slate-900 p-4 text-right">
          <h2 className="text-base font-black uppercase tracking-widest text-slate-900">{title}</h2>
        </div>
        <div className="p-8 text-center text-xs font-black uppercase tracking-widest text-slate-500">
          لا توجد فرص واضحة ضمن هذا النطاق حالياً.
        </div>
      </section>
    );
  }

  const chartData = rows.map(r => ({
    ...r,
    displayName: `${r.area} (${r.city})`,
  }));

  return (
    <section className="border-2 border-slate-900 bg-white">
      <div className="border-b-2 border-slate-900 p-4 text-right">
        <h2 className="text-base font-black uppercase tracking-widest text-slate-900">{title}</h2>
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
              <Tooltip content={<OpportunityTooltip priorityLabels={priorityLabels} />} cursor={{ fill: "#f1f5f9" }} />
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
