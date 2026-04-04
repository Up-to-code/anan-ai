import type { WorkspaceMarketPageModel } from "../../types/marketTypes";
import MarketChartPanel from "./MarketChartPanel";
import MarketCitiesTable from "./MarketCitiesTable";
import MarketKeywordTable from "./MarketKeywordTable";

/**
 * WHY:   City analysis remains a focused deep link for comparing demand and inventory across Saudi cities.
 * WHAT:  Renders the city ranking plus a small helper section showing the strongest saved search phrases.
 * HOW:   Uses the shared page model directly so the route stays URL-driven and server rendered.
 */
export default function CitiesTab({ model }: { model: WorkspaceMarketPageModel }) {
  return (
    <div className="grid gap-6">
      <MarketChartPanel
        title="City performance"
        description="عرض بصري لمقارنة المدن الأعلى نشاطاً داخل الفترة المحددة."
        data={model.topCities.map((row) => ({
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
      <MarketCitiesTable
        rows={model.topCities}
        description="يعرض هذا التقرير المدن الأوضح داخل النطاق الزمني الحالي ويقارن بين الطلب والأبحاث والمخزون الحالي."
      />
      <MarketKeywordTable
        title="عبارات تساعد على قراءة المدن"
        description="هذه العبارات جاءت من أبحاث محفوظة وسجلات بحث مرتبطة بنفس النطاق."
        rows={model.keywordInsights.relatedSearches.slice(0, 6)}
      />
    </div>
  );
}
