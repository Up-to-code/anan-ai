import MarketPage from "../pages/MarketPage";
import ResearchKeywordsTab from "../pages/MarketPage/ResearchKeywordsTab";
import { loadMarketPageModel } from "../shared/lib/loadMarketPageModel";

/**
 * WHY:   Research and keyword analysis should be directly addressable so users can return to scoped market-intelligence queries.
 * WHAT:  Loads the shared market snapshot and renders the research-and-keywords analysis route.
 * HOW:   Reuses the common market shell and the existing research analysis component with the shared page model.
 */
export default async function MarketResearchRoute({
  searchParams,
}: {
  searchParams: Promise<{
    city?: string | string[];
    area?: string | string[];
    query?: string | string[];
    dateFrom?: string | string[];
    dateTo?: string | string[];
    windowDays?: string | string[];
  }>;
}) {
  const model = await loadMarketPageModel(searchParams);

  return (
    <MarketPage
      model={model}
      actionPath="/ws/market/research"
      intro={{
        title: "مساعد الكلمات",
        description: "كلمات وعبارات بحث محفوظة، موضوعات متكررة، ونقاط بيع تساعد على متابعة السوق داخل نفس النطاق.",
      }}
    >
      <ResearchKeywordsTab model={model} />
    </MarketPage>
  );
}
