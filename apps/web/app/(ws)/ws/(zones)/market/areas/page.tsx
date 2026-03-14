import MarketPage from "../MarketPage";
import AreasTab from "../MarketPage/AreasTab";
import { loadMarketPageModel } from "../loadMarketPageModel";

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
    windowDays?: string | string[];
  }>;
}) {
  const model = await loadMarketPageModel(searchParams);

  return (
    <MarketPage
      model={model}
      actionPath="/ws/market/areas"
      intro={{
        eyebrow: "ذكاء السوق",
        title: "جدول الأحياء",
        description: "صفحة مركزة على الأحياء داخل النطاق المحدد، مع مقارنة مباشرة بين الطلب والمخزون والمنتج الغالب في كل حي.",
      }}
    >
      <AreasTab model={model} />
    </MarketPage>
  );
}
