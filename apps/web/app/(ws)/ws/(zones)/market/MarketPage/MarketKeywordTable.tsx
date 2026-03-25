import MarketPanel from "./MarketPanel";

type KeywordSource =
  | "query"
  | "feature"
  | "derived_topic"
  | "research_query"
  | "research_term"
  | "search_log";

type KeywordRow = {
  label: string;
  count: number;
  source: KeywordSource;
};

function getSourceLabel(source: KeywordSource): string {
  switch (source) {
    case "feature":
      return "ميزة";
    case "derived_topic":
      return "موضوع";
    case "research_query":
      return "بحث محفوظ";
    case "research_term":
      return "مصطلح بحث";
    case "search_log":
      return "سجل بحث";
    default:
      return "كلمة";
  }
}

/**
 * WHY:   Keyword helper data should stay simple and directly usable for market exploration.
 * WHAT:  Renders keyword or helper-query rows with count and source labels.
 * HOW:   Accepts mixed saved-data sources and presents them as a compact report table.
 */
export default function MarketKeywordTable({
  title,
  rows,
  description,
}: {
  title: string;
  rows: KeywordRow[];
  description?: string;
}) {
  if (rows.length === 0) {
    return (
      <MarketPanel title={title} description={description}>
        <div className="py-10 text-center text-sm text-slate-500">لا توجد نتائج مطابقة لهذا النطاق.</div>
      </MarketPanel>
    );
  }

  return (
    <MarketPanel title={title} description={description}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-right">
          <thead>
            <tr className="text-sm text-slate-500">
              <th className="py-3 font-medium">العبارة</th>
              <th className="py-3 font-medium">المصدر</th>
              <th className="py-3 font-medium">التكرار</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={`${row.source}-${row.label}`} className="text-sm text-slate-700">
                <td className="py-3 font-medium text-slate-950">{row.label}</td>
                <td className="py-3">{getSourceLabel(row.source)}</td>
                <td className="py-3">{row.count.toLocaleString("en-US")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MarketPanel>
  );
}
