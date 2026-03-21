import AnalyticsPage from "@/admin_zone/pages/AnalyticsPage";

type AnalyticsExecutiveRouteProps = {
  searchParams: Promise<{ range?: "30d" | "90d" }>;
};

/**
 * WHY:   The grouped analytics surface starts with an executive summary view.
 * WHAT:  Resolves the selected range and renders the executive analytics page.
 * HOW:   Awaits search params and forwards a normalized range into `AnalyticsPage`.
 */
export default async function AnalyticsExecutiveRoute({ searchParams }: AnalyticsExecutiveRouteProps) {
  const { range } = await searchParams;
  return <AnalyticsPage tab="executive" range={range === "30d" ? "30d" : "90d"} />;
}
