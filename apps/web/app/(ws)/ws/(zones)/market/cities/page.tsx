import MarketPage from "../pages/MarketPage";
import CitiesTab from "../pages/MarketPage/CitiesTab";
import { loadMarketPageModel } from "../shared/lib/loadMarketPageModel";

/**
 * WHY:   Cities analysis should be a first-class market page so switching categories updates the URL and preserves workspace navigation behavior.
 * WHAT:  Loads the shared market snapshot and renders the city comparison analysis route.
 * HOW:   Reuses the common market shell and the existing cities analysis component with the shared page model.
 */
export default async function MarketCitiesRoute({
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
      actionPath="/ws/market/cities"
      intro={{
        title: "تحليل المدن",
        description: "مقارنة مباشرة بين المدن داخل النطاق الحالي مع عبارات بحث محفوظة تساعد على قراءة الحركة في كل مدينة.",
      }}
    >
      <CitiesTab model={model} />
    </MarketPage>
  );
}
