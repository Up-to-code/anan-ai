import AnalyticsPage from "@/admin_zone/pages/AnalyticsPage";

type AnalyticsInventoryRouteProps = {
  searchParams: Promise<{ range?: "30d" | "90d" }>;
};

/**
 * WHY:   Inventory analytics remains a first-class admin view after the grouped analytics refactor.
 * WHAT:  Resolves the selected range and renders the inventory analytics page.
 * HOW:   Forwards the normalized `range` value into the shared analytics orchestrator.
 */
export default async function AnalyticsInventoryRoute({ searchParams }: AnalyticsInventoryRouteProps) {
  const { range } = await searchParams;
  return <AnalyticsPage tab="inventory" range={range === "30d" ? "30d" : "90d"} />;
}
