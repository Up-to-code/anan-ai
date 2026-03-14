import DashboardPage from "@/admin_zone/pages/DashboardPage";

/**
 * WHY:   The dashboard route should stay thin and delegate all UI and data composition to its page module.
 * WHAT:  Renders the admin dashboard orchestrator.
 * HOW:   Imports and returns the `DashboardPage` module directly.
 */
export default function DashboardRoute() {
  return <DashboardPage />;
}
