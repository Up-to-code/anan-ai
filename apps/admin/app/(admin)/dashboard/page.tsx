import DashboardPage from "@/admin_zone/pages/DashboardPage";

type DashboardRouteProps = {
  searchParams: Promise<{ range?: "30d" | "90d" }>;
};

/**
 * WHY:   The dashboard route should stay thin while still respecting the shared time-window query string.
 * WHAT:  Resolves the selected range and renders the rebuilt dashboard page module.
 * HOW:   Awaits the App Router search params and forwards the normalized range to `DashboardPage`.
 */
export default async function DashboardRoute({ searchParams }: DashboardRouteProps) {
  const { range } = await searchParams;
  return <DashboardPage range={range === "30d" ? "30d" : "90d"} />;
}
