import DocsPage from "@/admin_zone/pages/DocsPage";

/**
 * WHY:   The architecture route should render one focused handbook page instead of duplicating docs layout code.
 * WHAT:  Renders the platform architecture docs page.
 * HOW:   Delegates content rendering to the shared docs page orchestrator with the `architecture` key.
 */
export default function DocsArchitectureRoute() {
  return <DocsPage pageKey="architecture" />;
}
