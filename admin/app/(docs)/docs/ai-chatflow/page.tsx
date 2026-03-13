import DocsPage from "@/admin_zone/pages/DocsPage";

/**
 * WHY:   AI and chatflow documentation needs a dedicated route because it spans workspace, channel, mobile, and admin touchpoints.
 * WHAT:  Renders the AI chatflow handbook page.
 * HOW:   Delegates to the shared docs page orchestrator with the `aiChatflow` key.
 */
export default function DocsAiChatflowRoute() {
  return <DocsPage pageKey="aiChatflow" />;
}
