import OrganizationOnboarding from "../_components/OrganizationOnboarding";
import WorkspaceDashboard from "./_components/WorkspaceDashboard";
import { requireWorkspaceData } from "../_lib/workspaceData";
import { getAnanProThread } from "@/server/domains/ananPro/service";

type WorkspacePageProps = {
  searchParams: Promise<{
    orgError?: string;
    threadId?: string;
  }>;
};

export default async function WorkspacePage({ searchParams }: WorkspacePageProps) {
  const resolvedSearchParams = searchParams;

  const [{ orgError, threadId }, workspace, ananProThread] = await Promise.all([
    resolvedSearchParams,
    requireWorkspaceData("/ws"),
    resolvedSearchParams.then(({ threadId }) => getAnanProThread(threadId)),
  ]);

  if (workspace.organizations.length === 0) {
    return (
      <OrganizationOnboarding
        user={workspace.user}
        suggestedOrganizationType={workspace.onboarding.suggestedOrganizationType}
        audience={workspace.audience}
        errorMessage={orgError}
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
