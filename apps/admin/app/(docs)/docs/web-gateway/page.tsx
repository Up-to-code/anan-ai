import DocsPage from "@/admin_zone/pages/DocsPage";

/**
 * WHY:   Web backend gateway layering prevents scattered Convex calls and keeps SSR/perf rules consistent.
 * WHAT:  Renders the web gateway handbook page.
 * HOW:   Delegates to the shared docs page orchestrator with the `webGateway` key.
 */
export default function DocsWebGatewayRoute() {
  return <DocsPage pageKey="webGateway" />;
}

