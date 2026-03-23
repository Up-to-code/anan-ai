import type { WorkspaceMarketPageModel } from "../marketTypes";
import MarketOpportunityTable from "./MarketOpportunityTable";

/**
 * WHY:   Opportunity ranking uses robust programmatic charts instead of an overview composite.
 * WHAT:  Renders the ranked opportunity visualization.
 * HOW:   Uses the server-ranked opportunities directly and keeps the route fully SSR.
 */
export default function OpportunitiesTab({ model }: { model: WorkspaceMarketPageModel }) {
  return (
    <div className="grid gap-6">
      <MarketOpportunityTable rows={model.opportunities} priorityLabels={model.priorityLabels} />
    </div>
  );
}
