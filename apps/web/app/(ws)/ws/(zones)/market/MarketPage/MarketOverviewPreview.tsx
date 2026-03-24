import type { WorkspaceMarketPageModel } from "../marketTypes";
import MarketAreasTable from "./MarketAreasTable";
import MarketCitiesTable from "./MarketCitiesTable";
import MarketLatestResearch from "./MarketLatestResearch";
import MarketOpportunityTable from "./MarketOpportunityTable";
import MarketSellingPoints from "./MarketSellingPoints";
import MarketKeywordTable from "./MarketKeywordTable";

/**
 * WHY:   The market landing page still needs realistic content behind the coming-soon state so users understand the planned scope.
 * WHAT:  Renders a dense overview preview using the live market snapshot, charts, and latest research.
 * HOW:   Reuses the existing server-rendered market sections and trims rows where needed so the preview stays scannable.
 */
export default function MarketOverviewPreview({ model }: { model: WorkspaceMarketPageModel }) {
  // We explicitly show MarketKeywordTable to replace the deleted keywords pseudo-chart
  const keywordRows = model.compactCharts.keywordCounts.map(item => ({
    label: item.label,
    count: item.count,
    source: "query" as const,
  }));

  return (
    <div className="grid gap-6 p-6 lg:p-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
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

        <div className="flex flex-col gap-6">
          <MarketLatestResearch latestUpdate={model.latestUpdate} />
          <MarketSellingPoints
            items={model.sellingPoints.slice(0, 6)}
            title="نقاط البيع المتكررة"
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <MarketOpportunityTable
          rows={model.opportunities.slice(0, 4)}
          priorityLabels={model.priorityLabels}
          title="الفرص الحالية"
        />
        <MarketKeywordTable
          title="أبرز الكلمات والاهتمامات"
          rows={keywordRows.slice(0, 10)}
        />
      </div>
    </div>
  );
}
