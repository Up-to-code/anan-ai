import OverviewPage from "@/admin_zone/pages/OverviewPage";

type OverviewRouteProps = {
  searchParams: Promise<{ range?: "30d" | "90d" }>;
};

/**
 * WHY:   The overview route should stay thin and pass only the selected range into the overview page module.
 * WHAT:  Renders the new mocked admin overview.
 * HOW:   Resolves the App Router search params and normalizes the `range` query string.
 */
export default async function OverviewRoute({ searchParams }: OverviewRouteProps) {
  const { range } = await searchParams;
  return <OverviewPage range={range === "90d" ? "90d" : "30d"} />;
}

