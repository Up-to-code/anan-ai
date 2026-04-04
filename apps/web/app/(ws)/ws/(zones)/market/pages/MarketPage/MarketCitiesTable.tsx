import MarketPanel from "./MarketPanel";

type MarketCityRow = {
  city: string;
  demandSignals: number;
  researchRuns: number;
  inventoryCount: number;
  averagePriceLabel: string | null;
};

function renderBarWidth(value: number, maxValue: number): string {
  const width = maxValue <= 0 ? 0 : Math.max(8, Math.round((value / maxValue) * 100));
  return `${Math.min(width, 100)}%`;
}

/**
 * WHY:   City comparison is still a core market behavior, but it should read like a usable report instead of a decorative chart.
 * WHAT:  Renders a city ranking table with a compact inline demand bar for quick scanning.
 * HOW:   Uses server-rendered rows and relative widths derived from the highest demand value in the current result set.
 */
export default function MarketCitiesTable({
  rows,
  title = "ترتيب المدن",
  description,
}: {
  rows: MarketCityRow[];
  title?: string;
  description?: string;
}) {
  if (rows.length === 0) {
    return (
      <MarketPanel title={title} description={description}>
        <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-300">لا توجد مدن مطابقة لهذا النطاق.</div>
      </MarketPanel>
    );
  }

  const maxDemand = Math.max(...rows.map((row) => row.demandSignals), 1);

  return (
    <MarketPanel title={title} description={description}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-right dark:divide-slate-800">
          <thead>
            <tr className="text-sm text-slate-500 dark:text-slate-400">
              <th className="py-3 font-medium">المدينة</th>
              <th className="py-3 font-medium">الطلب</th>
              <th className="py-3 font-medium">الأبحاث</th>
              <th className="py-3 font-medium">المخزون الحالي</th>
              <th className="py-3 font-medium">متوسط السعر</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((row) => (
              <tr key={row.city} className="align-top text-sm text-slate-700 dark:text-slate-200">
                <td className="py-3 font-medium text-slate-950 dark:text-slate-100">{row.city}</td>
                <td className="py-3">
                  <div className="min-w-40">
                    <div className="flex items-center justify-between gap-3">
                      <span>{row.demandSignals.toLocaleString("en-US")}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-slate-900 dark:bg-slate-100"
                          style={{ width: renderBarWidth(row.demandSignals, maxDemand) }}
                        />
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3">{row.researchRuns.toLocaleString("en-US")}</td>
                <td className="py-3">{row.inventoryCount.toLocaleString("en-US")}</td>
                <td className="py-3">{row.averagePriceLabel ?? "غير كافٍ"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MarketPanel>
  );
}
