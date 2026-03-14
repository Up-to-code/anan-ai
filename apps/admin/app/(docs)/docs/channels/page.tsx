import DocsPage from "@/admin_zone/pages/DocsPage";

/**
 * WHY:   Channel adapters are production ingress and need a stable in-app blueprint reference.
 * WHAT:  Renders the channels handbook page.
 * HOW:   Delegates to the shared docs page orchestrator with the `channels` key.
 */
export default function DocsChannelsRoute() {
  return <DocsPage pageKey="channels" />;
}

