import type { WorkspaceMarketPageModel } from "../marketTypes";
import MarketKeywordTable from "./MarketKeywordTable";
import MarketLatestResearch from "./MarketLatestResearch";
import MarketSellingPoints from "./MarketSellingPoints";

/**
 * WHY:   Research analysis should stay table-first now that the market zone opens directly on data pages.
 * WHAT:  Renders keyword and topic tables with selling-point analysis plus one latest-research panel.
 * HOW:   Presents the already-scoped server snapshot directly, keeping the page simple and fully SSR.
 */
export default function ResearchKeywordsTab({ model }: { model: WorkspaceMarketPageModel }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="grid gap-6">
        <MarketKeywordTable title="الكلمات الأكثر تكراراً" rows={model.keywordInsights.topKeywords} />
        <MarketKeywordTable title="الموضوعات والأنماط المتكررة" rows={model.keywordInsights.topTopics} />
        <MarketSellingPoints items={model.sellingPoints} />
      </div>
      <MarketLatestResearch latestUpdate={model.latestUpdate} />
    </div>
  );
}
