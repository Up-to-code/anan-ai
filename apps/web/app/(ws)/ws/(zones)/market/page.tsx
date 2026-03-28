import MarketPage from "./MarketPage";
import OverviewTab from "./MarketPage/OverviewTab";
import { loadMarketPageModel } from "./loadMarketPageModel";

export const dynamic = "force-dynamic";

type MarketPageProps = {
  searchParams: Promise<{
    city?: string | string[];
    area?: string | string[];
    query?: string | string[];
    dateFrom?: string | string[];
    dateTo?: string | string[];
    windowDays?: string | string[];
  }>;
};

/**
 * WHY:   The overview route should preserve the real dashboard even while the whole market zone stays under development.
 * WHAT:  Loads the shared market snapshot and renders the real overview content inside the shared market shell.
 * HOW:   Lets the shared market page apply the temporary under-development overlay across all market routes.
 */
export default async function WorkspaceMarketRoute({ searchParams }: MarketPageProps) {
  const model = await loadMarketPageModel(searchParams);

  return (
    <MarketPage
      model={model}
      actionPath="/ws/market"
      intro={{
        title: "تحليل السوق",
        description: "واجهة ذكاء السوق كاملة محفوظة في الخلفية، وتظهر الآن بطبقة مؤقتة حتى يحين موعد التطوير الكامل.",
      }}
    >
      <OverviewTab model={model} />
    </MarketPage>
  );
}
