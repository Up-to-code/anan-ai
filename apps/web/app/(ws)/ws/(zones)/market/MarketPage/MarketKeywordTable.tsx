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
      <div className="border-2 border-slate-900 bg-white p-3 text-right shadow-none">
        <p className="mb-2 text-xs font-black uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-2">
          {data.label}
        </p>
        <div className="space-y-1 text-[10px] font-bold uppercase tracking-widest text-slate-600">
          <p><span className="text-blue-600">العدد:</span> {data.count.toLocaleString("en-US")}</p>
          <p><span className="text-slate-900">المصدر:</span> {getSourceLabel(data.source)}</p>
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
      <section className="border-2 border-slate-900 bg-white">
        <div className="border-b-2 border-slate-900 p-4 text-right">
          <h2 className="text-base font-black uppercase tracking-widest text-slate-900">{title}</h2>
        </div>
        <div className="p-8 text-center text-xs font-black uppercase tracking-widest text-slate-500">
          لا توجد كلمات أو موضوعات مطابقة لهذا النطاق.
        </div>
      </section>
    );
  }

  // Calculate dynamic height based on number of rows so the bars don't get squished
  const chartHeight = Math.max(300, rows.length * 40 + 60);

  return (
    <section className="border-2 border-slate-900 bg-white">
      <div className="border-b-2 border-slate-900 p-4 text-right">
        <h2 className="text-base font-black uppercase tracking-widest text-slate-900">{title}</h2>
      </div>
      <div className="w-full p-4 pt-6 pb-6" dir="rtl">
        <div style={{ height: chartHeight, width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={rows}
              layout="vertical"
              margin={{ top: 0, right: 30, left: 100, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={true} vertical={false} />
              <XAxis
                type="number"
                axisLine={{ stroke: "#0f172a", strokeWidth: 2 }}
                tickLine={{ stroke: "#0f172a", strokeWidth: 2 }}
                tick={{ fill: "#0f172a", fontSize: 10, fontWeight: 900 }}
              />
              <YAxis
                type="category"
                dataKey="label"
                axisLine={{ stroke: "#0f172a", strokeWidth: 2 }}
                tickLine={{ stroke: "#0f172a", strokeWidth: 2 }}
                tick={{ fill: "#0f172a", fontSize: 10, fontWeight: 900 }}
                width={90}
              />
              <Tooltip content={<KeywordTooltip />} cursor={{ fill: "#f1f5f9" }} />
              <Bar dataKey="count" fill="#2563eb" radius={[0, 0, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
