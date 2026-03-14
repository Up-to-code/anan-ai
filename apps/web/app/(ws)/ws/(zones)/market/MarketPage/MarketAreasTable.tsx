type MarketAreaRow = {
  city: string;
  area: string;
  demandSignals: number;
  inventoryCount: number;
  averagePriceLabel: string | null;
  topProductType: string | null;
  topSignalLabel: string | null;
};

/**
 * WHY:   After choosing a city, developers need district-level clarity on where demand and product fit concentrate.
 * WHAT:  Renders the area table for the selected scope, including dominant product type and strongest repeated signal.
 * HOW:   Accepts already-filtered rows and a city-visibility flag so overview and detailed tabs can reuse the same markup.
 */
export default function MarketAreasTable({
  rows,
  showCityColumn,
  title = "الأحياء الأعلى نشاطاً",
  description,
}: {
  rows: MarketAreaRow[];
  showCityColumn: boolean;
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
        <table className="w-full min-w-[980px] text-right">
          <thead className="bg-slate-50">
            <tr>
              {showCityColumn && <th className="px-4 py-3 text-xs font-black text-slate-500">المدينة</th>}
              <th className="px-4 py-3 text-xs font-black text-slate-500">الحي</th>
              <th className="px-4 py-3 text-xs font-black text-slate-500">إشارات الطلب</th>
              <th className="px-4 py-3 text-xs font-black text-slate-500">المخزون</th>
              <th className="px-4 py-3 text-xs font-black text-slate-500">متوسط السعر</th>
              <th className="px-4 py-3 text-xs font-black text-slate-500">المنتج الغالب</th>
              <th className="px-4 py-3 text-xs font-black text-slate-500">الإشارة الأوضح</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={showCityColumn ? 7 : 6} className="px-4 py-8 text-center text-sm font-medium text-slate-500">
                  لا توجد أحياء مطابقة لهذا النطاق.
                </td>
              </tr>
            ) : (
              rows.map((area) => (
                <tr key={`${area.city}-${area.area}`} className="border-t border-slate-100">
                  {showCityColumn && <td className="px-4 py-4 text-sm font-bold text-slate-700">{area.city}</td>}
                  <td className="px-4 py-4 text-sm font-black text-slate-950">{area.area}</td>
                  <td className="px-4 py-4 text-sm font-bold text-slate-700">{area.demandSignals.toLocaleString("en-US")}</td>
                  <td className="px-4 py-4 text-sm font-bold text-slate-700">{area.inventoryCount.toLocaleString("en-US")}</td>
                  <td className="px-4 py-4 text-sm font-bold text-slate-700">{area.averagePriceLabel ?? "غير كافٍ"}</td>
                  <td className="px-4 py-4 text-sm font-bold text-slate-700">{area.topProductType ?? "غير واضح"}</td>
                  <td className="px-4 py-4 text-sm font-bold text-slate-700">{area.topSignalLabel ?? "غير واضح"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
