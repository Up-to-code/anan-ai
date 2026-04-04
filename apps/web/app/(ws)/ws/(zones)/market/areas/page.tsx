import MarketPage from "../pages/MarketPage";
import AreasTab from "../pages/MarketPage/AreasTab";
import { loadMarketPageModel } from "../shared/lib/loadMarketPageModel";

/**
 * WHY:   Area analysis should be a route-backed market page so users can deep-link directly into neighborhood comparison.
 * WHAT:  Loads the shared market snapshot and renders the areas analysis route.
 * HOW:   Reuses the common market shell and the existing areas analysis component with the shared page model.
 */
export default async function MarketAreasRoute({
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
      actionPath="/ws/market/areas"
      intro={{
        title: "المناطق الساخنة",
        description: "تقرير يركز على المناطق الأعلى نشاطاً في السعودية أو داخل المدينة المحددة، مع المنتج الغالب والإشارة الأوضح.",
      }}
    >
      <AreasTab model={model} />
    </MarketPage>
  );
}
