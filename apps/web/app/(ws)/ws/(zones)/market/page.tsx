import MarketPage from "./pages/MarketPage";
import OverviewTab from "./pages/MarketPage/OverviewTab";
import { loadMarketPageModel } from "./shared/lib/loadMarketPageModel";
import { getWorkspaceLocaleContext } from "../../_lib/workspaceLocale";

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
  const { dictionary } = await getWorkspaceLocaleContext();
  const model = await loadMarketPageModel(searchParams);

  return (
    <MarketPage
      model={model}
      actionPath="/ws/market"
      intro={{
        title: dictionary.market.title,
        description: dictionary.market.description,
      }}
      labels={{
        analyzeMarket: dictionary.market.analyzeMarket,
        scope: dictionary.market.scope,
        range: dictionary.market.range,
        topKeyword: dictionary.market.topKeyword,
        noClearSignal: dictionary.market.noClearSignal,
        mockDataBanner: dictionary.market.mockDataBanner,
      }}
    >
      <OverviewTab model={model} />
    </MarketPage>
  );
}
