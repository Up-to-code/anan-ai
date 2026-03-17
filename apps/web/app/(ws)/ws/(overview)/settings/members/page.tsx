import { redirect } from "next/navigation";

/**
 * WHY:   Existing deep links still point to `/ws/settings/members` and should remain valid.
 * WHAT:  Redirects the legacy members route to the canonical tabbed settings URL.
 * HOW:   Uses a server redirect so clients and crawlers always resolve to one source of truth.
 */
export default async function WorkspaceMembersPage() {
  redirect("/ws/settings?tab=members");
}
