import AnalyticsPage from "@/admin_zone/pages/AnalyticsPage";

/**
 * WHY:   The command-center analytics route should stay as a thin route handoff.
 * WHAT:  Renders the admin analytics page.
 * HOW:   Delegates presentation and mock data composition to the analytics page orchestrator.
 */
export default function AnalyticsRoute() {
  return <AnalyticsPage />;
}
