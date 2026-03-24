import { teamMembers } from "@/admin_zone/mocks/data";
import TeamSettingsClient from "./TeamSettingsClient";

/**
 * WHY:   The team settings route should remain a thin wrapper around the mocked invite and permissions UI.
 * WHAT:  Loads the mock team-members list and renders the team settings page.
 * HOW:   Delegates all local update behavior to the client component.
 */
export default function TeamSettingsPage() {
  return <TeamSettingsClient members={teamMembers} />;
}

