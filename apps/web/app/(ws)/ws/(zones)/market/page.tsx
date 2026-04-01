import { cookies } from "next/headers";
import MarketPage from "./MarketPage";
import OverviewTab from "./MarketPage/OverviewTab";
import { loadMarketPageModel } from "./loadMarketPageModel";
import { getWebDictionary } from "@/lib/i18n";
import { resolveLocale, WEB_LOCALE_COOKIE } from "@/lib/locale";

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
  const cookieStore = await cookies();
  const dictionary = getWebDictionary(resolveLocale(cookieStore.get(WEB_LOCALE_COOKIE)?.value));
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
