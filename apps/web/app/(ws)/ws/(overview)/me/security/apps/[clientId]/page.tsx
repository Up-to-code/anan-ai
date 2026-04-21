import { redirect } from "next/navigation";
import { buildWorkspaceOrganizationAppsPath, buildWorkspaceSecurityAppsPath, getAuthenticatedSession } from "@/lib/serverSession";

type WorkspaceSecurityDetailPageProps = { params: Promise<{ clientId: string }> };

/**
 * WHY:   Legacy connected-app detail links should still land users in the new organization-owned app management flow.
 * WHAT:  Redirects the old personal detail route to the organization apps tab.
 * HOW:   Keeps the original path as the sign-in return target, then forwards authenticated users into org settings.
 */
export default async function WorkspaceSecurityDetailPage({ params }: WorkspaceSecurityDetailPageProps) {
  const { clientId } = await params;
  const requestedPath = buildWorkspaceSecurityAppsPath(clientId);
  const { token } = await getAuthenticatedSession();
  if (!token) {
    redirect(`/signin?returnTo=${encodeURIComponent(requestedPath)}`);
  }
  redirect(buildWorkspaceOrganizationAppsPath("legacy-account-apps"));
}
