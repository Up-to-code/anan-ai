import UsersPage from "@/admin_zone/pages/UsersPage";

/**
 * WHY:   The users route should remain a thin handoff into the dedicated users page module.
 * WHAT:  Renders the default users tab.
 * HOW:   Hands off directly to the `UsersPage` orchestrator.
 */
export default function UsersRoute() {
  return <UsersPage />;
}
