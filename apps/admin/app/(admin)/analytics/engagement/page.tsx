import AnalyticsPage from "@/admin_zone/pages/AnalyticsPage";

type AnalyticsEngagementRouteProps = {
  searchParams: Promise<{ range?: "30d" | "90d" }>;
};

/**
 * WHY:   Engagement analytics groups message and active-user signals into one focused view.
 * WHAT:  Resolves the shared time window and renders the engagement analytics page.
 * HOW:   Normalizes `range` before passing it into the analytics orchestrator.
 */
export default async function AnalyticsEngagementRoute({ searchParams }: AnalyticsEngagementRouteProps) {
  const { range } = await searchParams;
  return <AnalyticsPage tab="engagement" range={range === "30d" ? "30d" : "90d"} />;
}
