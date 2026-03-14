import DocsPage from "@/admin_zone/pages/DocsPage";

/**
 * WHY:   Internal developers need a route-backed workflow guide that is easy to revisit without entering the admin shell.
 * WHAT:  Renders the workflow handbook page.
 * HOW:   Delegates to the shared docs page orchestrator with the `workflow` key.
 */
export default function DocsWorkflowRoute() {
  return <DocsPage pageKey="workflow" />;
}
