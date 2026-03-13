import DiagnosticsPage from "@/admin_zone/pages/DiagnosticsPage";

type DiagnosticsRouteProps = {
  searchParams: Promise<{
    range?: "day" | "week" | "month";
  }>;
};

/**
 * WHY:   Diagnostics routing should remain a thin handoff into the diagnostics page module.
 * WHAT:  Renders the admin diagnostics page for the requested time range.
 * HOW:   Resolves the search params and forwards them to `DiagnosticsPage`.
 */
export default async function DiagnosticsRoute({ searchParams }: DiagnosticsRouteProps) {
  return <DiagnosticsPage searchParams={await searchParams} />;
}
