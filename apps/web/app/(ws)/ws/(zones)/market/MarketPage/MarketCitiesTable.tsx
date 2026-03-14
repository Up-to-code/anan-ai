type MarketCityRow = {
  city: string;
  demandSignals: number;
  researchRuns: number;
  inventoryCount: number;
  averagePriceLabel: string | null;
};

/**
 * WHY:   Developers need a ranked view of which Saudi cities show the strongest demand relative to available inventory.
 * WHAT:  Renders the city-level market table ordered by aggregated demand signals.
 * HOW:   Accepts already-filtered rows so tabs can control local search and sorting without duplicating the table markup.
 */
export default function MarketCitiesTable({
  rows,
  title = "المدن الأعلى طلباً",
  description,
}: {
  rows: MarketCityRow[];
  title?: string;
  description?: string;
}) {
  return (
    <section className="border border-slate-200 bg-white">
      <div className="border-b border-slate-100 p-4 text-right">
        <h2 className="text-base font-black text-slate-950">{title}</h2>
        {description ? <p className="mt-1 text-sm font-medium text-slate-500">{description}</p> : null}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-right">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-xs font-black text-slate-500">المدينة</th>
              <th className="px-4 py-3 text-xs font-black text-slate-500">إشارات الطلب</th>
              <th className="px-4 py-3 text-xs font-black text-slate-500">أبحاث محفوظة</th>
              <th className="px-4 py-3 text-xs font-black text-slate-500">المخزون</th>
              <th className="px-4 py-3 text-xs font-black text-slate-500">متوسط السعر</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm font-medium text-slate-500">
                  لا توجد مدن قابلة للعرض ضمن هذا النطاق.
                </td>
              </tr>
            ) : (
              rows.map((city) => (
                <tr key={city.city} className="border-t border-slate-100">
                  <td className="px-4 py-4 text-sm font-black text-slate-950">{city.city}</td>
                  <td className="px-4 py-4 text-sm font-bold text-slate-700">{city.demandSignals.toLocaleString("en-US")}</td>
                  <td className="px-4 py-4 text-sm font-bold text-slate-700">{city.researchRuns.toLocaleString("en-US")}</td>
                  <td className="px-4 py-4 text-sm font-bold text-slate-700">{city.inventoryCount.toLocaleString("en-US")}</td>
                  <td className="px-4 py-4 text-sm font-bold text-slate-700">{city.averagePriceLabel ?? "غير كافٍ"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
