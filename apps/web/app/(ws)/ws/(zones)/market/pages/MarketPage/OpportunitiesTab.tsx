import type { WorkspaceMarketPageModel } from "../../types/marketTypes";
import MarketChartPanel from "./MarketChartPanel";
import MarketLatestResearch from "./MarketLatestResearch";
import MarketOpportunityTable from "./MarketOpportunityTable";

/**
 * WHY:   Opportunity analysis is most useful when paired with the latest saved research behind the ranking.
 * WHAT:  Renders the date-scoped opportunity table and the newest supporting research panel.
 * HOW:   Keeps both sections in one route so users can see ranking and evidence side by side.
 */
export default function OpportunitiesTab({ model }: { model: WorkspaceMarketPageModel }) {
  return (
    <div className="grid gap-6">
      <MarketChartPanel
        title="Opportunity comparison"
        description="مخطط سريع لمقارنة الطلب والمخزون داخل الفرص الحالية."
        data={model.opportunities.map((row) => ({
          label: row.area,
          demandSignals: row.demandSignals,
          inventoryCount: row.inventoryCount,
        }))}
        xKey="label"
        series={[
          { key: "demandSignals", label: "الطلب", color: "#0f172a" },
          { key: "inventoryCount", label: "المخزون", color: "#94a3b8" },
        ]}
        kind="bar"
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <MarketOpportunityTable rows={model.opportunities} priorityLabels={model.priorityLabels} />
        <MarketLatestResearch latestUpdate={model.latestUpdate} />
      </div>
    </div>
  );
}
