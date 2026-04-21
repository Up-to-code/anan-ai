"use client";

import WorkspaceSignOutAction from "@/app/(ws)/ws/_components/WorkspaceSignOutAction";

/**
 * WHY:   Account management needs one explicit sign-out control without converting the whole page to a Client Component.
 * WHAT:  Keeps the legacy account-page export while delegating the actual sign-out UI/behavior to the shared workspace action component.
 * HOW:   Reuses `WorkspaceSignOutAction` so menu and page sign-out stay aligned in copy and behavior.
 */
export default function LogoutButton() {
  return <WorkspaceSignOutAction variant="button" />;
}
