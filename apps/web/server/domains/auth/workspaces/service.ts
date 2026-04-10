import { requireSessionContext, type ResolvedSession } from "@/server/auth/session";
import type { OrganizationMembershipSummary, OrganizationSummary } from "@/server/contracts/organizations";
import type { ProfileSummary } from "@/server/contracts/profiles";
import type { SessionContext, SessionUser } from "@/server/contracts/session";
import { toSessionUser } from "@/server/contracts/session";
import { cache } from "react";
import {
  getOrganizationOwnerContext,
  resolveSuggestedOrganizationType,
  resolveVisibleZoneKeys,
  resolveWorkspaceAudience,
  resolveWorkspaceCapabilities,
  type WorkspaceBehavior,
} from "@/server/contracts/workspace";
import {
  type OrganizationsRepository,
} from "@/server/infrastructure/convex/organizations";
import { clerkOrganizationsRepository } from "@/server/infrastructure/clerk/organizations";

export type WorkspaceSnapshot = {
  user: SessionUser;
  session: SessionContext;
  profile: ProfileSummary | null;
  organizations: OrganizationSummary[];
};

type WorkspacesServiceDependencies = {
  requireSession: () => Promise<ResolvedSession>;
  organizationsRepository: OrganizationsRepository;
};

const defaultDependencies: WorkspacesServiceDependencies = {
  requireSession: requireSessionContext,
  organizationsRepository: clerkOrganizationsRepository,
};

async function loadWorkspaceState(
  dependencies: WorkspacesServiceDependencies,
): Promise<{
  session: ResolvedSession;
  organizations: OrganizationSummary[];
  currentOrganization: {
    organization: OrganizationSummary | null;
    membership: OrganizationMembershipSummary | null;
    accessError?: true;
  } | null;
}> {
  const session = await dependencies.requireSession();
  const [organizations, currentOrganization] = await Promise.all([
    dependencies.organizationsRepository.listForCurrentUser(session.token),
    dependencies.organizationsRepository.getCurrentOrganization(session.token),
  ]);

  return { session, organizations, currentOrganization };
}

const loadWorkspaceStateCached = cache(async () => loadWorkspaceState(defaultDependencies));

export async function getWorkspaceBehaviorForCurrentUser(
  dependencies: WorkspacesServiceDependencies = defaultDependencies,
): Promise<WorkspaceBehavior> {
  const { session, organizations, currentOrganization } =
    dependencies === defaultDependencies
      ? await loadWorkspaceStateCached()
      : await loadWorkspaceState(dependencies);
  const accessError = currentOrganization?.accessError === true;
  const primaryOrganization = accessError
    ? null
    : (currentOrganization?.organization ?? organizations[0] ?? null);
  const orderedOrganizations = primaryOrganization
    ? [primaryOrganization, ...organizations.filter((org) => org.id !== primaryOrganization.id)]
    : organizations;
  const audience = resolveWorkspaceAudience({ role: session.context.role, organizationType: primaryOrganization?.type, requestedRole: session.profile?.requestedRole });
  const visibleZoneKeys = resolveVisibleZoneKeys(audience);
  const suggestedOrganizationType = resolveSuggestedOrganizationType({
    role: session.context.role,
    requestedRole: session.profile?.requestedRole,
    organizationType: primaryOrganization?.type,
  });
  return {
    user: toSessionUser(session.context),
    session: session.context,
    profile: session.profile,
    organizations: orderedOrganizations,
    primaryOrganization,
    audience,
    ownerContext: getOrganizationOwnerContext(primaryOrganization),
    visibleZoneKeys,
    capabilities: resolveWorkspaceCapabilities(visibleZoneKeys),
    onboarding: {
      needsOrganization: primaryOrganization === null,
      suggestedOrganizationType,
    },
  };
}

/**
 * WHY:   The workspace shell needs one composed payload instead of separate direct Convex calls from page files.
 * WHAT:  Returns the current workspace user, session context, profile, and linked organizations.
 * HOW:   Resolves the authenticated session once, then fetches organizations through the repository adapter.
 */
export async function getWorkspaceSnapshotForCurrentUser(
  dependencies: WorkspacesServiceDependencies = defaultDependencies,
): Promise<WorkspaceSnapshot> {
  const behavior = await getWorkspaceBehaviorForCurrentUser(dependencies);

  return {
    user: behavior.user,
    session: behavior.session,
    profile: behavior.profile,
    organizations: behavior.organizations,
  };
}

/**
 * WHY:   Sidebar rendering should not know about the full workspace snapshot contract.
 * WHAT:  Returns the minimal current-user data needed by the workspace shell sidebar.
 * HOW:   Builds on the shared workspace snapshot and narrows the response to user + organizations.
 */
export async function getWorkspaceSidebarDataForCurrentUser(
  dependencies: WorkspacesServiceDependencies = defaultDependencies,
): Promise<Pick<WorkspaceSnapshot, "user" | "organizations">> {
  const behavior = await getWorkspaceBehaviorForCurrentUser(dependencies);
  return {
    user: behavior.user,
    organizations: behavior.organizations,
  };
}
