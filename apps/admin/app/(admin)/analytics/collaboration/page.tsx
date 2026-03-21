import AnalyticsPage from "@/admin_zone/pages/AnalyticsPage";

type AnalyticsCollaborationRouteProps = {
  searchParams: Promise<{ range?: "30d" | "90d" }>;
};

/**
 * WHY:   Collaboration analytics now groups broker-developer link quality into one dedicated route.
 * WHAT:  Resolves the selected range and renders the collaboration analytics page.
 * HOW:   Passes the normalized range into the shared analytics page module.
 */
export default async function AnalyticsCollaborationRoute({ searchParams }: AnalyticsCollaborationRouteProps) {
  const { range } = await searchParams;
  return <AnalyticsPage tab="collaboration" range={range === "30d" ? "30d" : "90d"} />;
}
