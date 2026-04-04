import type { WorkspaceMarketPageModel } from "../../types/marketTypes";
import MarketChartPanel from "./MarketChartPanel";
import MarketKeywordTable from "./MarketKeywordTable";
import MarketLatestResearch from "./MarketLatestResearch";
import MarketSellingPoints from "./MarketSellingPoints";

/**
 * WHY:   The research route is the dedicated place for saved keyword help and repeated market language.
 * WHAT:  Renders related saved searches, top repeated keywords/topics, selling points, and the latest research run.
 * HOW:   Splits the route into a main column of helper tables plus a side panel for the newest research evidence.
 */
export default function ResearchKeywordsTab({ model }: { model: WorkspaceMarketPageModel }) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <MarketChartPanel
          title="Keyword reach"
          description="رسم يوضح تكرار الكلمات الأبرز في السوق الحالي."
          data={model.chartSeries.keywordCounts.map((row) => ({
            label: row.label,
            count: row.count,
          }))}
          xKey="label"
          series={[{ key: "count", label: "التكرار", color: "#1d4ed8" }]}
          kind="bar"
        />
        <MarketChartPanel
          title="Saved search helper"
          description="رسم يوضح أكثر العبارات المحفوظة تكراراً داخل نفس النطاق."
          data={model.keywordInsights.relatedSearches.slice(0, 8).map((row) => ({
            label: row.label,
            count: row.count,
          }))}
          xKey="label"
          series={[{ key: "count", label: "المرات", color: "#0f172a" }]}
          kind="bar"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="grid gap-6">
          <MarketKeywordTable
            title="مساعد الكلمات"
            description="عبارات بحث محفوظة من الأبحاث السابقة وسجلات البحث داخل نفس النطاق."
          rows={model.keywordInsights.relatedSearches}
        />
        <MarketKeywordTable title="الكلمات المتكررة" rows={model.keywordInsights.topKeywords} />
        <MarketKeywordTable title="الموضوعات المتكررة" rows={model.keywordInsights.topTopics} />
        <MarketSellingPoints items={model.sellingPoints} />
        </div>
        <MarketLatestResearch latestUpdate={model.latestUpdate} />
      </div>
    </div>
  );
}
