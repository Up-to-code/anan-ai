import DocsPage from "@/admin_zone/pages/DocsPage";

/**
 * WHY:   Mobile has different constraints and wiring rules and needs an in-app reference page.
 * WHAT:  Renders the mobile handbook page.
 * HOW:   Delegates to the shared docs page orchestrator with the `mobile` key.
 */
export default function DocsMobileRoute() {
  return <DocsPage pageKey="mobile" />;
}

