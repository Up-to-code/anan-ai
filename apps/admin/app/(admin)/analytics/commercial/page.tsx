import AnalyticsPage from "@/admin_zone/pages/AnalyticsPage";

type AnalyticsCommercialRouteProps = {
  searchParams: Promise<{ range?: "30d" | "90d" }>;
};

/**
 * WHY:   Commercial analytics needs its own route focused on funnel, pipeline, and offer quality.
 * WHAT:  Resolves the selected range and renders the commercial analytics page.
 * HOW:   Passes the normalized `range` value into the shared analytics page module.
 */
export default async function AnalyticsCommercialRoute({ searchParams }: AnalyticsCommercialRouteProps) {
  const { range } = await searchParams;
  return <AnalyticsPage tab="commercial" range={range === "30d" ? "30d" : "90d"} />;
}
