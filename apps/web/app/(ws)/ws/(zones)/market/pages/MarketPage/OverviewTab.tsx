import type { WorkspaceMarketPageModel } from "../../types/marketTypes";
import MarketAreasTable from "./MarketAreasTable";
import MarketChartPanel from "./MarketChartPanel";
import MarketCitiesTable from "./MarketCitiesTable";
import MarketKeywordTable from "./MarketKeywordTable";
import MarketLatestResearch from "./MarketLatestResearch";
import MarketOpportunityTable from "./MarketOpportunityTable";
import MarketResultsSummary from "./MarketResultsSummary";
import MarketSellingPoints from "./MarketSellingPoints";

/**
 * WHY:   `/ws/market` is now the real overview hub and should combine the most useful market answers in one page.
 * WHAT:  Renders the summary, latest saved results, hot areas, city ranking, opportunities, and keyword helper preview.
 * HOW:   Reuses the rebuilt table-first panels and trims long datasets to keep the overview page focused.
 */
export default function OverviewTab({ model }: { model: WorkspaceMarketPageModel }) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <MarketChartPanel
          title="حركة المدن"
          description="مقارنة بين الطلب والأبحاث والمخزون على مستوى المدن داخل نفس الفترة."
          data={model.topCities.slice(0, 8).map((row) => ({
            label: row.city,
            demandSignals: row.demandSignals,
            researchRuns: row.researchRuns,
            inventoryCount: row.inventoryCount,
          }))}
          xKey="label"
          series={[
            { key: "demandSignals", label: "الطلب", color: "#0f172a" },
            { key: "researchRuns", label: "الأبحاث", color: "#475569" },
            { key: "inventoryCount", label: "المخزون", color: "#94a3b8" },
          ]}
        />
        <MarketChartPanel
          title="توزيع الكلمات"
          description="أكثر الكلمات التي تتكرر داخل الأبحاث والاهتمامات في النطاق الحالي."
          data={model.compactCharts.keywordCounts.map((row) => ({
            label: row.label,
            count: row.count,
          }))}
          xKey="label"
          series={[{ key: "count", label: "التكرار", color: "#1d4ed8" }]}
          kind="bar"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <MarketResultsSummary model={model} />
        <MarketLatestResearch latestUpdate={model.latestUpdate} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <MarketAreasTable
          rows={model.topAreas.slice(0, 10)}
          showCityColumn={!model.filters.city}
          title={model.filters.city ? `المناطق الساخنة في ${model.headline.selectedCityLabel}` : "المناطق الساخنة في السعودية"}
          description="جدول المناطق الأكثر نشاطاً مع المقارنة بين الطلب والمخزون الحالي ونقطة البيع الأوضح."
        />
        <MarketCitiesTable
          rows={model.topCities.slice(0, 8)}
          title="مقارنة المدن"
          description="صف سريع للمدن الأعلى نشاطاً داخل الفترة المختارة."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <MarketOpportunityTable
          rows={model.opportunities.slice(0, 5)}
          priorityLabels={model.priorityLabels}
          title="فرص السوق"
        />
        <MarketKeywordTable
          title="مساعد الكلمات"
          description="عبارات بحث محفوظة تساعدك في متابعة السوق داخل هذا النطاق."
          rows={model.keywordInsights.relatedSearches.slice(0, 8)}
        />
        <MarketSellingPoints
          items={model.sellingPoints.slice(0, 8)}
          description="أكثر النقاط التي تتكرر داخل الأبحاث والمخزون الحالي."
        />
      </div>
    </div>
  );
}
