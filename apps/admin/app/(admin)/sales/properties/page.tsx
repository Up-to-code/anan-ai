import SalesPropertiesPage from "@/admin_zone/pages/SalesPropertiesPage";

/**
 * WHY:   The sales properties route should remain a thin route handoff.
 * WHAT:  Renders the mocked properties page.
 * HOW:   Delegates directly to the properties page orchestrator.
 */
export default function SalesPropertiesRoute() {
  return <SalesPropertiesPage />;
}

