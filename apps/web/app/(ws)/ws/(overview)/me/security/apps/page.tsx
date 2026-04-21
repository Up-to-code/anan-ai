import { redirect } from "next/navigation";
import { buildWorkspaceOrganizationAppsPath, buildWorkspaceSecurityAppsPath, getAuthenticatedSession } from "@/lib/serverSession";

/**
 * WHY:   Existing personal connected-app deep links must keep working after the move to organization-owned app connections.
 * WHAT:  Redirects the legacy account-app route into the organization settings apps tab.
 * HOW:   Preserves auth gating so signed-out users still return to the right workspace destination after sign-in.
 */
export default async function WorkspaceSecurityAppsPage() {
  const { token } = await getAuthenticatedSession();
  const destination = buildWorkspaceOrganizationAppsPath("legacy-account-apps");
  if (!token) {
    redirect(`/signin?returnTo=${encodeURIComponent(buildWorkspaceSecurityAppsPath())}`);
  }
  redirect(destination);
}
