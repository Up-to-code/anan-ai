import DocsPage from "@/admin_zone/pages/DocsPage";

/**
 * WHY:   UI docs should stay route-backed so design and code references are linkable for developers.
 * WHAT:  Renders the UI components docs page.
 * HOW:   Delegates to the shared docs page orchestrator with the `ui` key.
 */
export default function DocsUiRoute() {
  return <DocsPage pageKey="ui" />;
}
