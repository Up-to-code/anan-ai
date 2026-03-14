import DocsPage from "@/admin_zone/pages/DocsPage";

/**
 * WHY:   Capability docs should be reachable as a standalone developer docs page.
 * WHAT:  Renders the capability ownership docs page.
 * HOW:   Delegates to the docs page orchestrator with the `capabilities` key.
 */
export default function DocsCapabilitiesRoute() {
  return <DocsPage pageKey="capabilities" />;
}
