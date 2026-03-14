import type { WorkspaceMarketPageModel } from "../marketTypes";
import MarketAreasTable from "./MarketAreasTable";
import MarketMiniBarChart from "./MarketMiniBarChart";

/**
 * WHY:   Area analysis should feel like a direct drill-down table after the market overview was removed.
 * WHAT:  Renders the scoped area table with one compact demand-versus-supply chart beside it.
 * HOW:   Uses only server-provided rows and route filters, so the full section stays SSR.
 */
export default function AreasTab({ model }: { model: WorkspaceMarketPageModel }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <MarketAreasTable
        rows={model.topAreas}
        showCityColumn={!model.filters.city}
        description="يعرض هذا الجدول أكثر الأحياء ظهوراً في الطلب داخل النطاق المحدد، مع مقارنة مباشرة بالمخزون ونقطة البيع الأوضح."
      />
      <MarketMiniBarChart
        title="إشارات الطلب حسب الحي"
        items={model.topAreas.slice(0, 8).map((item) => ({
          label: model.filters.city ? item.area : `${item.city} / ${item.area}`,
          value: item.demandSignals,
          secondaryValue: item.inventoryCount,
          secondaryLabel: `المخزون ${item.inventoryCount.toLocaleString("en-US")}`,
        }))}
      />
    </div>
  );
}
