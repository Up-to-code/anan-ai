import { knowledgeItems } from "@/admin_zone/mocks/data";
import KnowledgeSettingsClient from "./KnowledgeSettingsClient";

/**
 * WHY:   The knowledge settings route should stay a thin wrapper around the mocked moderation UI.
 * WHAT:  Loads the mock knowledge items and renders the knowledge settings page.
 * HOW:   Passes the static dataset to the client component for local-only state transitions.
 */
export default function AIKnowledgeSettingsPage() {
  return <KnowledgeSettingsClient items={knowledgeItems} />;
}

