import type { WorkspaceMarketPageModel } from "../marketTypes";
import MarketAreasTable from "./MarketAreasTable";
import MarketCitiesTable from "./MarketCitiesTable";
import MarketLatestResearch from "./MarketLatestResearch";
import MarketMiniBarChart from "./MarketMiniBarChart";
import MarketOpportunityTable from "./MarketOpportunityTable";
import MarketSellingPoints from "./MarketSellingPoints";

/**
 * WHY:   The market landing page still needs realistic content behind the coming-soon state so users understand the planned scope.
 * WHAT:  Renders a dense overview preview using the live market snapshot, charts, tables, and latest research.
 * HOW:   Reuses the existing server-rendered market sections and trims rows where needed so the preview stays scannable behind the blur overlay.
 */
export default function MarketOverviewPreview({ model }: { model: WorkspaceMarketPageModel }) {
  return (
    <div className="grid gap-6 p-6 lg:p-8">
      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div className="grid gap-6">
          <MarketCitiesTable
            rows={model.topCities.slice(0, 5)}
            title="المدن الأعلى طلباً"
            description="نظرة أولية على المدن الأوضح من حيث إشارات الطلب والأبحاث والمخزون."
          />
          <MarketAreasTable
            rows={model.topAreas.slice(0, 5)}
            showCityColumn={!model.filters.city}
            title="الأحياء الأعلى نشاطاً"
            description="عينة من الأحياء المتكررة ضمن النطاق الحالي مع المنتج الغالب ونقطة البيع الأوضح."
          />
        </div>

        <div className="grid gap-6">
          <MarketMiniBarChart
            title="الطلب حسب المدينة"
            items={model.compactCharts.cityDemand.map((item) => ({
              label: item.label,
              value: item.demandSignals,
              secondaryValue: item.inventoryCount,
              secondaryLabel: `المخزون ${item.inventoryCount?.toLocaleString("en-US") ?? "0"}`,
            }))}
          />
          <MarketLatestResearch latestUpdate={model.latestUpdate} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
        <div className="grid gap-6">
          <MarketOpportunityTable
            rows={model.opportunities.slice(0, 4)}
            priorityLabels={model.priorityLabels}
            title="الفرص الحالية"
          />
          <MarketSellingPoints
            items={model.sellingPoints.slice(0, 6)}
            title="نقاط البيع المتكررة"
          />
        </div>

        <div className="grid gap-6">
          <MarketMiniBarChart
            title="أبرز الكلمات والاهتمامات"
            items={model.compactCharts.keywordCounts.map((item) => ({
              label: item.label,
              value: item.count,
            }))}
          />
          <MarketMiniBarChart
            title="الطلب حسب الحي"
            items={model.compactCharts.areaDemand.map((item) => ({
              label: item.label,
              value: item.demandSignals,
              secondaryValue: item.inventoryCount,
              secondaryLabel: `المخزون ${item.inventoryCount?.toLocaleString("en-US") ?? "0"}`,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
