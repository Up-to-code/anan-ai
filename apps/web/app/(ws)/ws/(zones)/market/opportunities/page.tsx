import MarketPage from "../MarketPage";
import OpportunitiesTab from "../MarketPage/OpportunitiesTab";
import { loadMarketPageModel } from "../loadMarketPageModel";

/**
 * WHY:   Opportunity ranking should have its own route so the recommendation view can be linked and revisited directly.
 * WHAT:  Loads the shared market snapshot and renders the opportunities analysis route.
 * HOW:   Reuses the common market shell and the existing opportunities analysis component with the shared page model.
 */
export default async function MarketOpportunitiesRoute({
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
      actionPath="/ws/market/opportunities"
      intro={{
        eyebrow: "ذكاء السوق",
        title: "جدول الفرص",
        description: "ترتيب شفاف للفرص الحالية بحسب فجوة الطلب والمخزون ونقطة البيع الأوضح داخل كل مدينة وحي.",
      }}
    >
      <OpportunitiesTab model={model} />
    </MarketPage>
  );
}
