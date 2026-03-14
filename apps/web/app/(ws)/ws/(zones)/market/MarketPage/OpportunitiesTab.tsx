import type { WorkspaceMarketPageModel } from "../marketTypes";
import MarketMiniBarChart from "./MarketMiniBarChart";
import MarketOpportunityTable from "./MarketOpportunityTable";

/**
 * WHY:   Opportunity ranking should stay explainable inside a table-first route instead of an overview composite.
 * WHAT:  Renders the ranked opportunity table with one compact demand-versus-supply chart beside it.
 * HOW:   Uses the server-ranked opportunities directly and keeps the route fully SSR.
 */
export default function OpportunitiesTab({ model }: { model: WorkspaceMarketPageModel }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <MarketOpportunityTable rows={model.opportunities} priorityLabels={model.priorityLabels} />
      <MarketMiniBarChart
        title="الطلب مقابل المخزون"
        items={model.opportunities.slice(0, 8).map((item) => ({
          label: `${item.city} / ${item.area}`,
          value: item.demandSignals,
          secondaryValue: item.inventoryCount,
          secondaryLabel: `المخزون ${item.inventoryCount.toLocaleString("en-US")}`,
        }))}
      />
    </div>
  );
}
