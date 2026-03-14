import type { WorkspaceMarketPageModel } from "../marketTypes";
import MarketCitiesTable from "./MarketCitiesTable";
import MarketMiniBarChart from "./MarketMiniBarChart";

/**
 * WHY:   City comparison should read like a dense report page after the overview route was removed.
 * WHAT:  Renders the ranked city table with one compact demand-versus-inventory chart beside it.
 * HOW:   Uses the shared server-backed model directly so the route stays SSR and filter-driven.
 */
export default function CitiesTab({ model }: { model: WorkspaceMarketPageModel }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <MarketCitiesTable
        rows={model.topCities}
        description="ترتيب المدن يعتمد على إشارات الطلب المحفوظة ثم عدد الأبحاث ثم حجم المخزون المتاح في نفس المدينة."
      />
      <MarketMiniBarChart
        title="إشارات الطلب مقابل المخزون"
        items={model.topCities.slice(0, 8).map((item) => ({
          label: item.city,
          value: item.demandSignals,
          secondaryValue: item.inventoryCount,
          secondaryLabel: `المخزون ${item.inventoryCount.toLocaleString("en-US")}`,
        }))}
      />
    </div>
  );
}
