import type { WorkspaceMarketPageModel } from "../../types/marketTypes";
import MarketAreasTable from "./MarketAreasTable";
import MarketChartPanel from "./MarketChartPanel";
import MarketSellingPoints from "./MarketSellingPoints";

/**
 * WHY:   The hot-areas route should answer the user's main area-ranking question without extra route noise.
 * WHAT:  Renders the scoped hot-areas table and the strongest repeated selling points in that scope.
 * HOW:   Reuses shared server-backed sections and automatically narrows by city when a city filter is active.
 */
export default function AreasTab({ model }: { model: WorkspaceMarketPageModel }) {
  return (
    <div className="grid gap-6">
      <MarketChartPanel
        title="Area momentum"
        description="مخطط يقارن بين الطلب والمخزون على مستوى المناطق الأعلى نشاطاً."
        data={model.topAreas.slice(0, 10).map((row) => ({
          label: row.area,
          demandSignals: row.demandSignals,
          inventoryCount: row.inventoryCount,
        }))}
        xKey="label"
        series={[
          { key: "demandSignals", label: "الطلب", color: "#0f172a" },
          { key: "inventoryCount", label: "المخزون", color: "#94a3b8" },
        ]}
      />
      <MarketAreasTable
        rows={model.topAreas}
        showCityColumn={!model.filters.city}
        title={model.filters.city ? `المناطق الساخنة في ${model.headline.selectedCityLabel}` : "المناطق الساخنة في السعودية"}
        description="الجدول يعتمد على إشارات الطلب والأبحاث خلال الفترة المختارة، مع إبقاء المخزون معبراً عن العرض الحالي."
      />
      <MarketSellingPoints
        items={model.sellingPoints}
        title="أهم الإشارات داخل المناطق الحالية"
      />
    </div>
  );
}
