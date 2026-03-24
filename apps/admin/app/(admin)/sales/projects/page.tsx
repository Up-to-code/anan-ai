import SalesProjectsPage from "@/admin_zone/pages/SalesProjectsPage";

/**
 * WHY:   Sales project routing should remain a thin entrypoint.
 * WHAT:  Renders the projects sales page.
 * HOW:   Delegates all UI work to the page orchestrator.
 */
export default function SalesProjectsRoute() {
  return <SalesProjectsPage />;
}

