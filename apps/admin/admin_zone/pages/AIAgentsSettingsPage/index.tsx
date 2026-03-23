import { agentTeams } from "@/admin_zone/mocks/data";
import AgentsSettingsClient from "./AgentsSettingsClient";

/**
 * WHY:   The agent settings route should only load the mock team configuration and delegate interaction logic.
 * WHAT:  Renders the mocked agent-teams settings page.
 * HOW:   Passes the static agent team list into the client component for local state updates.
 */
export default function AIAgentsSettingsPage() {
  return <AgentsSettingsClient teams={agentTeams} />;
}

