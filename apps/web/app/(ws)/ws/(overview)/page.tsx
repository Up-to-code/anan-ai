import OrganizationOnboarding from "../_components/OrganizationOnboarding";
import WorkspaceDashboard from "./_components/WorkspaceDashboard";
import { requireWorkspaceData } from "../_lib/workspaceData";
import { getAnanProThread } from "@/server/domains/ananPro/service";
import { listIncomingOrganizationInvitesForCurrentUser } from "@/server/domains/organizations/service";

export const dynamic = "force-dynamic";

type WorkspacePageProps = {
  searchParams: Promise<{
    orgError?: string;
    threadId?: string;
    onboarding?: string;
  }>;
};

/**
 * WHY:   `/ws` is the primary authenticated entry point for all three workspace audiences.
 * WHAT:  Renders either onboarding (no organization yet) or the workspace dashboard with an optional selected thread.
 * HOW:   Forces dynamic rendering (session/headers), requires auth before loading optional thread state, and avoids noisy unauthorized errors.
 */
export default async function WorkspacePage({ searchParams }: WorkspacePageProps) {
  const { orgError, threadId, onboarding } = await searchParams;
  const workspace = await requireWorkspaceData("/ws");
  const ananProThread = await getAnanProThread(threadId);

  const shouldRenderOnboarding =
    workspace.onboarding.needsOrganization || onboarding === "verification";

  if (shouldRenderOnboarding) {
    const incomingInvites = await listIncomingOrganizationInvitesForCurrentUser();
    return (
      <OrganizationOnboarding
        user={workspace.user}
        suggestedOrganizationType={workspace.onboarding.suggestedOrganizationType}
        audience={workspace.audience}
        incomingInvites={incomingInvites}
        errorMessage={orgError}
        initialStep={onboarding === "verification" ? 3 : 1}
        initialOrganization={
          workspace.primaryOrganization
            ? { id: workspace.primaryOrganization.id, type: workspace.primaryOrganization.type }
            : null
        }
      />
    );
  }

  return (
    <WorkspaceDashboard
      initialThread={ananProThread}
      initialSelectedThreadId={threadId ?? null}
    />
  );
}
