import AnalyticsPage from "@/admin_zone/pages/AnalyticsPage";

type AnalyticsRouteProps = {
  searchParams: Promise<{ range?: "30d" | "90d" }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

/**
 * WHY:   The command-center analytics route should stay as a thin route handoff.
 * WHAT:  Renders the admin analytics page.
 * HOW:   Resolves the active range and delegates live data composition to the analytics page orchestrator.
 */
export default async function AnalyticsRoute({ searchParams }: AnalyticsRouteProps) {
  const { range } = await searchParams;
  return <AnalyticsPage range={range === "90d" ? "90d" : "30d"} />;
}
