import DocsPage from "@/admin_zone/pages/DocsPage";

/**
 * WHY:   Security and authorization docs need a stable route because most production incidents are permission and logical correctness failures.
 * WHAT:  Renders the security and authZ handbook page.
 * HOW:   Delegates to the shared docs page orchestrator with the `security` key.
 */
export default function DocsSecurityRoute() {
  return <DocsPage pageKey="security" />;
}

