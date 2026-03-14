import MarketPage from "../MarketPage";
import CitiesTab from "../MarketPage/CitiesTab";
import { loadMarketPageModel } from "../loadMarketPageModel";

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
    windowDays?: string | string[];
  }>;
}) {
  const model = await loadMarketPageModel(searchParams);

  return (
    <MarketPage
      model={model}
      actionPath="/ws/market/cities"
      intro={{
        eyebrow: "ذكاء السوق",
        title: "جدول المدن",
        description: "ترتيب واضح للمدن بحسب إشارات الطلب والأبحاث والمخزون داخل نفس النطاق، بدون صفحة تمهيدية منفصلة.",
      }}
    >
      <CitiesTab model={model} />
    </MarketPage>
  );
}
