import DocsPage from "@/admin_zone/pages/DocsPage";

/**
 * WHY:   Convex is the platform backbone and needs a stable in-app reference page.
 * WHAT:  Renders the Convex handbook page.
 * HOW:   Delegates to the shared docs page orchestrator with the `convex` key.
 */
export default function DocsConvexRoute() {
  return <DocsPage pageKey="convex" />;
}

