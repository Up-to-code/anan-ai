import { redirect } from "next/navigation";
import OrganizationOnboarding from "../_components/OrganizationOnboarding";
import WorkspaceDashboard from "./_components/WorkspaceDashboard";
import { requireWorkspaceData } from "../_lib/workspaceData";
import { getAnanProThread } from "@/server/domains/workspace/ananPro/service";
import { listIncomingOrganizationInvitesForCurrentUser } from "@/server/domains/auth/organizations/service";
import { normalizeDomainError } from "@/server/contracts/errors";

export const dynamic = "force-dynamic";

type WorkspacePageProps = {
  searchParams: Promise<{
    orgError?: string;
    threadId?: string;
    newThread?: string;
    onboarding?: string;
  }>;
};

/**
 * WHY:   `/ws` is the primary authenticated entry point for all three workspace audiences.
 * WHAT:  Renders either onboarding (no organization yet) or the workspace dashboard with an optional selected thread.
 * HOW:   Forces dynamic rendering (session/headers), requires auth before loading optional thread state, and avoids noisy unauthorized errors.
 */
export default async function WorkspacePage({ searchParams }: WorkspacePageProps) {
  const { orgError, threadId, newThread, onboarding } = await searchParams;
  let workspace: Awaited<ReturnType<typeof requireWorkspaceData>>;
  try {
    workspace = await requireWorkspaceData("/ws");
  } catch (error) {
    const domainError = normalizeDomainError(error);
    if (domainError.code === "UPSTREAM_UNAVAILABLE") {
      return (
        <section className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-3xl border border-amber-200 bg-amber-50 p-5 text-right">
            <h1 className="text-base font-black text-amber-900">تعذر تحميل مساحة العمل الآن</h1>
            <p className="mt-2 text-sm font-semibold text-amber-800">{domainError.message}</p>
            <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
              <a
                href="/ws"
                className="border border-amber-300 bg-white px-4 py-2 text-[10px] font-black tracking-[0.16em] text-amber-900"
              >
                إعادة المحاولة
              </a>
            </div>
          </div>
        </section>
      );
    }
    throw error;
  }

  const shouldRenderOnboarding =
    workspace.onboarding.needsOrganization || onboarding === "verification";
  const canCreateOrganization = workspace.session.role !== "admin";
  const organizationCreationDisabledReason = canCreateOrganization
    ? undefined
    : "هذا الحساب لا يملك صلاحية إنشاء جهة جديدة. تواصل مع مسؤول النظام أو سجّل الخروج لتبديل الحساب.";

  if (shouldRenderOnboarding) {
    const incomingInvites = await listIncomingOrganizationInvitesForCurrentUser();
    return (
      <OrganizationOnboarding
        user={workspace.user}
        suggestedOrganizationType={workspace.onboarding.suggestedOrganizationType}
        audience={workspace.audience}
        incomingInvites={incomingInvites}
        canCreateOrganization={canCreateOrganization}
        organizationCreationDisabledReason={organizationCreationDisabledReason}
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

  const shouldStartDraft = newThread === "1" || !threadId;
  let selectedThreadId: string | null = null;
  let ananProThread = null;

  if (!shouldStartDraft) {
    ananProThread = await getAnanProThread(threadId);
    if (!ananProThread) {
      redirect("/ws");
    }
    selectedThreadId = threadId ?? null;
  }

  return (
    <WorkspaceDashboard
      initialThread={ananProThread}
      initialSelectedThreadId={selectedThreadId}
      user={workspace.user}
    />
  );
}
