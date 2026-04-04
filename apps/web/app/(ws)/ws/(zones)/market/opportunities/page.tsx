import MarketPage from "../pages/MarketPage";
import OpportunitiesTab from "../pages/MarketPage/OpportunitiesTab";
import { loadMarketPageModel } from "../shared/lib/loadMarketPageModel";

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
    dateFrom?: string | string[];
    dateTo?: string | string[];
    windowDays?: string | string[];
  }>;
}) {
  const model = await loadMarketPageModel(searchParams);

  return (
    <MarketPage
      model={model}
      actionPath="/ws/market/opportunities"
      intro={{
        title: "نتائج السوق",
        description: "قراءة عملية للفرص الحالية خلال الفترة المختارة مع ربطها بآخر بحث محفوظ يطابق نفس النطاق.",
      }}
    >
      <OpportunitiesTab model={model} />
    </MarketPage>
  );
}
