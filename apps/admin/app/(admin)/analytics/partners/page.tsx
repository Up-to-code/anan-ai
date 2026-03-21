import AnalyticsPage from "@/admin_zone/pages/AnalyticsPage";

type AnalyticsPartnersRouteProps = {
  searchParams: Promise<{ range?: "30d" | "90d" }>;
};

/**
 * WHY:   Partner health needs a dedicated grouped route after the analytics consolidation.
 * WHAT:  Resolves the selected range and renders the partners analytics page.
 * HOW:   Awaits search params and forwards the normalized window to `AnalyticsPage`.
 */
export default async function AnalyticsPartnersRoute({ searchParams }: AnalyticsPartnersRouteProps) {
  const { range } = await searchParams;
  return <AnalyticsPage tab="partners" range={range === "30d" ? "30d" : "90d"} />;
}
