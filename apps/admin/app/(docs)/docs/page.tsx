import DocsPage from "@/admin_zone/pages/DocsPage";

/**
 * WHY:   The docs landing route should stay thin and delegate all content selection to the docs page module.
 * WHAT:  Renders the internal handbook overview page.
 * HOW:   Passes the `overview` docs key into the shared docs orchestrator.
 */
export default function DocsOverviewRoute() {
  return <DocsPage pageKey="overview" />;
}
