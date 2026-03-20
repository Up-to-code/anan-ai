"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type KeywordRow = {
  label: string;
  count: number;
  source: "query" | "feature" | "derived_topic";
};

type MarketKeywordTableProps = {
  title: string;
  rows: KeywordRow[];
};

function getSourceLabel(source: KeywordRow["source"]): string {
  switch (source) {
    case "query":
      return "استعلام";
    case "feature":
      return "خاصية";
    default:
      return "موضوع مشتق";
  }
}

/**
 * Custom tooltip to show the exact count and translated source.
 */
function KeywordTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload as KeywordRow;
    return (
      <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-4 rounded-xl shadow-xl text-right max-w-xs">
        <p className="mb-3 text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          {data.label}
        </p>
        <div className="space-y-2 text-xs font-semibold text-slate-600">
          <p className="flex justify-between items-center gap-4"><span className="text-slate-400">العدد:</span> <span className="text-blue-600">{data.count.toLocaleString("en-US")}</span></p>
          <p className="flex justify-between items-center gap-4"><span className="text-slate-400">المصدر:</span> <span className="text-slate-900">{getSourceLabel(data.source)}</span></p>
        </div>
      </div>
    );
  }
  return null;
}

/**
 * WHY:   Keyword and topic analysis requires graphical representation of frequency to spot dominant trends instantly.
 * WHAT:  Renders a horizontal BarChart for the keyword/topic ranking.
 * HOW:   Accepts pre-filtered rows and maps them to a responsive Recharts graphic.
 */
export default function MarketKeywordTable({ title, rows }: MarketKeywordTableProps) {
  if (rows.length === 0) {
    return (
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 p-5 text-right bg-slate-50/50">
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
        </div>
        <div className="p-12 text-center flex flex-col items-center justify-center">
          <div className="text-sm font-bold text-slate-400">لا توجد كلمات أو موضوعات مطابقة لهذا النطاق.</div>
        </div>
      </section>
    );
  }

  // Calculate dynamic height based on number of rows so the bars don't get squished
  const chartHeight = Math.max(300, rows.length * 40 + 60);

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="border-b border-slate-100 p-5 text-right bg-slate-50/50">
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
      </div>
      <div className="w-full p-6 pt-6 pb-6 flex-1" dir="rtl">
        <div style={{ height: chartHeight, width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={rows}
              layout="vertical"
              margin={{ top: 0, right: 30, left: 100, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={true} vertical={false} />
              <XAxis
                type="number"
                axisLine={{ stroke: "#e2e8f0", strokeWidth: 1 }}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
              />
              <YAxis
                type="category"
                dataKey="label"
                axisLine={{ stroke: "#e2e8f0", strokeWidth: 1 }}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                width={120}
              />
              <Tooltip content={<KeywordTooltip />} cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 0, 0, 4]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
