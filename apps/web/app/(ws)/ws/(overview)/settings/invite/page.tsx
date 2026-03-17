import { redirect } from "next/navigation";

/**
 * WHY:   Existing deep links still point to `/ws/settings/invite` and should remain valid.
 * WHAT:  Redirects the legacy invite route to the canonical members tab URL.
 * HOW:   Uses a server redirect so all invite flows resolve to the unified tabbed settings page.
 */
export default async function WorkspaceInviteMemberPage() {
  redirect("/ws/settings?tab=members");
}
