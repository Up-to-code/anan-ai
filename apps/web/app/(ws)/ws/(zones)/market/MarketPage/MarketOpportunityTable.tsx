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

type TooltipPayload<Row> = {
  payload: Row;
};

type TooltipProps<Row> = {
  active?: boolean;
  payload?: TooltipPayload<Row>[];
  priorityLabels: Record<"high" | "medium" | "watch", string>;
};

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
function OpportunityTooltip({ active, payload, priorityLabels }: TooltipProps<OpportunityRow>) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="max-w-sm rounded-lg border border-slate-200 bg-white/95 p-5 text-right shadow-xl backdrop-blur-md">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <span className={`rounded-md px-2 py-1 text-[10px] font-bold ${
            data.priority === 'high' ? 'bg-red-50 text-red-600 border border-red-200' :
            data.priority === 'medium' ? 'bg-orange-50 text-orange-600 border border-orange-200' :
            'bg-blue-50 text-blue-600 border border-blue-200'
          }`}>
            {priorityLabels[data.priority]}
          </span>
          <p className="text-sm font-bold text-slate-900">
            {data.area} <span className="text-slate-400 text-xs">({data.city})</span>
          </p>
        </div>
        <div className="space-y-3 text-xs font-semibold text-slate-600">
          <p className="mb-3 rounded-s-md bg-slate-50 p-2 pr-3 leading-relaxed text-slate-700 border-r-2 border-blue-500">
            {data.reason}
          </p>
          <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100">
            <div><span className="text-slate-400 block mb-1 text-[10px]">الطلب والأبحاث</span> <span className="text-blue-600">{data.demandSignals.toLocaleString("en-US")}</span> / {data.researchRuns.toLocaleString("en-US")}</div>
            <div><span className="text-slate-400 block mb-1 text-[10px]">المخزون</span> <span className="text-slate-900">{data.inventoryCount.toLocaleString("en-US")}</span></div>
            <div><span className="text-slate-400 block mb-1 text-[10px]">المنتج الغالب</span> <span className="text-slate-800 leading-snug break-words">{data.dominantProductType ?? "غير واضح"}</span></div>
            <div><span className="text-slate-400 block mb-1 text-[10px]">أفضل ميزة</span> <span className="text-slate-800 leading-snug break-words">{data.strongestSellingPoint ?? "غير واضح"}</span></div>
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
      <section className="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5 text-right bg-slate-50/50">
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
        </div>
        <div className="p-12 text-center flex flex-col items-center justify-center">
          <div className="text-sm font-bold text-slate-400">لا توجد فرص واضحة ضمن هذا النطاق حالياً.</div>
        </div>
      </section>
    );
  }

  const chartData = rows.map((row) => ({
    ...row,
    displayName: `${row.area} (${row.city})`,
  }));

  return (
    <section className="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5 text-right bg-slate-50/50">
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
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
              <Tooltip content={<OpportunityTooltip priorityLabels={priorityLabels} />} cursor={{ fill: "#f8fafc" }} />
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
