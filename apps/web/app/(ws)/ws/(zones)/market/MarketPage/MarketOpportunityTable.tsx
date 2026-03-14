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

/**
 * WHY:   Opportunity ranking must stay transparent so users can see the signals behind each recommendation.
 * WHAT:  Renders the reusable opportunities table for overview previews and the dedicated opportunities tab.
 * HOW:   Accepts rows plus the page-level priority label map and shows the ranking rationale directly in the table.
 */
export default function MarketOpportunityTable({
  rows,
  priorityLabels,
  title = "أفضل الفرص الحالية",
}: {
  rows: OpportunityRow[];
  priorityLabels: Record<"high" | "medium" | "watch", string>;
  title?: string;
}) {
  return (
    <section className="border border-slate-200 bg-white">
      <div className="border-b border-slate-100 p-4 text-right">
        <h2 className="text-base font-black text-slate-950">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-right">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-xs font-black text-slate-500">الأولوية</th>
              <th className="px-4 py-3 text-xs font-black text-slate-500">المدينة</th>
              <th className="px-4 py-3 text-xs font-black text-slate-500">الحي</th>
              <th className="px-4 py-3 text-xs font-black text-slate-500">المنتج الغالب</th>
              <th className="px-4 py-3 text-xs font-black text-slate-500">أوضح نقطة بيع</th>
              <th className="px-4 py-3 text-xs font-black text-slate-500">شدة البحث</th>
              <th className="px-4 py-3 text-xs font-black text-slate-500">المخزون</th>
              <th className="px-4 py-3 text-xs font-black text-slate-500">سبب الترتيب</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm font-medium text-slate-500">
                  لا توجد فرص واضحة ضمن هذا النطاق حالياً.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={`${row.city}-${row.area}`} className="border-t border-slate-100 align-top">
                  <td className="px-4 py-4 text-sm font-black text-slate-950">{priorityLabels[row.priority]}</td>
                  <td className="px-4 py-4 text-sm font-bold text-slate-700">{row.city}</td>
                  <td className="px-4 py-4 text-sm font-black text-slate-950">{row.area}</td>
                  <td className="px-4 py-4 text-sm font-bold text-slate-700">{row.dominantProductType ?? "غير واضح"}</td>
                  <td className="px-4 py-4 text-sm font-bold text-slate-700">{row.strongestSellingPoint ?? "غير واضح"}</td>
                  <td className="px-4 py-4 text-sm font-bold text-slate-700">
                    {row.demandSignals.toLocaleString("en-US")} / {row.researchRuns.toLocaleString("en-US")}
                  </td>
                  <td className="px-4 py-4 text-sm font-bold text-slate-700">{row.inventoryCount.toLocaleString("en-US")}</td>
                  <td className="px-4 py-4 text-sm font-medium leading-6 text-slate-600">{row.reason}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
