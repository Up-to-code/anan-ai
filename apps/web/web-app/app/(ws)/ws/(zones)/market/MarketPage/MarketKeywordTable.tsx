type KeywordRow = {
  label: string;
  count: number;
  source: "query" | "feature" | "derived_topic";
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
 * WHY:   Keyword and topic analysis should stay readable as data tables rather than clouds or decorative chips.
 * WHAT:  Renders the reusable keyword/topic ranking table used in the research tab.
 * HOW:   Accepts pre-filtered rows and maps the raw source enum into short Arabic labels.
 */
export default function MarketKeywordTable({
  title,
  rows,
}: {
  title: string;
  rows: KeywordRow[];
}) {
  return (
    <section className="border border-slate-200 bg-white">
      <div className="border-b border-slate-100 p-4 text-right">
        <h2 className="text-base font-black text-slate-950">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-right">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-xs font-black text-slate-500">الكلمة / الموضوع</th>
              <th className="px-4 py-3 text-xs font-black text-slate-500">العدد</th>
              <th className="px-4 py-3 text-xs font-black text-slate-500">المصدر</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-sm font-medium text-slate-500">
                  لا توجد كلمات أو موضوعات مطابقة لهذا النطاق.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={`${row.source}-${row.label}`} className="border-t border-slate-100">
                  <td className="px-4 py-4 text-sm font-black text-slate-950">{row.label}</td>
                  <td className="px-4 py-4 text-sm font-bold text-slate-700">{row.count.toLocaleString("en-US")}</td>
                  <td className="px-4 py-4 text-sm font-bold text-slate-700">{getSourceLabel(row.source)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
