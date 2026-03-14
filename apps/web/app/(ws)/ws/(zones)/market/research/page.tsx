import MarketPage from "../MarketPage";
import ResearchKeywordsTab from "../MarketPage/ResearchKeywordsTab";
import { loadMarketPageModel } from "../loadMarketPageModel";

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
    windowDays?: string | string[];
  }>;
}) {
  const model = await loadMarketPageModel(searchParams);

  return (
    <MarketPage
      model={model}
      actionPath="/ws/market/research"
      intro={{
        eyebrow: "ذكاء السوق",
        title: "البحث والكلمات",
        description: "عرض مباشر للكلمات والموضوعات ونقاط البيع المتكررة داخل النطاق الحالي، مع آخر تحديث بحثي محفوظ.",
      }}
    >
      <ResearchKeywordsTab model={model} />
    </MarketPage>
  );
}
