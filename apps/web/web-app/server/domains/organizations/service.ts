import { requireSessionContext, type ResolvedSession } from "@/server/auth/session";
import { DomainError, normalizeDomainError } from "@/server/contracts/errors";
import {
  createOrganizationInputSchema,
  type CreateOrganizationInput,
  type CreateOrganizationInviteInput,
  type DirectorySearchResult,
  type IncomingOrganizationInvite,
  type OffersDirectoryProfile,
  type OrganizationInviteSummary,
  type OrganizationMembershipSummary,
  type OrganizationSummary,
  type OrganizationTeamMember,
  type UpdateOrganizationInput,
  type UpdateOrganizationMemberRoleInput,
  updateOrganizationInputSchema,
  updateOrganizationMemberRoleInputSchema,
} from "@/server/contracts/organizations";
import { resolveSuggestedOrganizationType } from "@/server/contracts/workspace";
import {
  convexOrganizationsRepository,
  type OrganizationsRepository,
} from "@/server/infrastructure/convex/organizationsRepository";

type OrganizationsServiceDependencies = {
  requireSession: () => Promise<ResolvedSession>;
  organizationsRepository: OrganizationsRepository;
};

const defaultDependencies: OrganizationsServiceDependencies = {
  requireSession: requireSessionContext,
  organizationsRepository: convexOrganizationsRepository,
};

/**
 * WHY:   Workspace pages and API routes both need one gateway-owned organization listing path.
 * WHAT:  Returns the organizations linked to the current authenticated user.
 * HOW:   Requires the session once, then delegates listing to the repository adapter with the current token.
 */
export async function listOrganizationsForCurrentUser(
  dependencies: OrganizationsServiceDependencies = defaultDependencies,
): Promise<OrganizationSummary[]> {
  const session = await dependencies.requireSession();
  return dependencies.organizationsRepository.listForCurrentUser(session.token);
}

/**
 * WHY:   Organization onboarding is the first business mutation moved behind the Next.js gateway.
 * WHAT:  Validates the create payload, enforces gateway-level access rules, and creates the organization.
 * HOW:   Parses the payload with Zod, blocks admin sessions up front, then delegates to the Convex repository.
 */
export async function createOrganizationForCurrentUser(
  input: unknown,
  dependencies: OrganizationsServiceDependencies = defaultDependencies,
): Promise<OrganizationSummary> {
  const parsed = createOrganizationInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new DomainError({
      code: "INVALID_ARGUMENT",
      message: parsed.error.issues[0]?.message ?? "Invalid organization payload",
      status: 400,
    });
  }

  const session = await dependencies.requireSession();
  if (session.context.role === "admin") {
    throw new DomainError({
      code: "FORBIDDEN",
      message: "Admin accounts cannot create an organization from this flow",
      status: 403,
    });
  }

  try {
    const organizationType =
      (parsed.data as CreateOrganizationInput).type ??
      resolveSuggestedOrganizationType({
        role: session.context.role,
        requestedRole: session.profile?.requestedRole,
      });

    return await dependencies.organizationsRepository.createForCurrentUser(session.token, {
      name: parsed.data.name,
      type: organizationType,
    });
  } catch (error) {
    throw normalizeDomainError(error);
  }
}

export async function getCurrentOrganizationForCurrentUser(
  dependencies: OrganizationsServiceDependencies = defaultDependencies,
): Promise<{ organization: OrganizationSummary; membership: OrganizationMembershipSummary } | null> {
  const session = await dependencies.requireSession();
  return dependencies.organizationsRepository.getCurrentOrganization(session.token);
}

export async function updateCurrentOrganizationForCurrentUser(
  input: unknown,
  dependencies: OrganizationsServiceDependencies = defaultDependencies,
): Promise<OrganizationSummary> {
  const parsed = updateOrganizationInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new DomainError({
      code: "INVALID_ARGUMENT",
      message: parsed.error.issues[0]?.message ?? "Invalid organization payload",
      status: 400,
    });
  }

  const session = await dependencies.requireSession();
  return dependencies.organizationsRepository.updateCurrentOrganization(session.token, parsed.data as UpdateOrganizationInput);
}

export async function listCurrentOrganizationTeamMembers(
  dependencies: OrganizationsServiceDependencies = defaultDependencies,
): Promise<OrganizationTeamMember[]> {
  const session = await dependencies.requireSession();
  return dependencies.organizationsRepository.listCurrentTeamMembers(session.token);
}

export async function listCurrentOrganizationTeamInvites(
  dependencies: OrganizationsServiceDependencies = defaultDependencies,
): Promise<OrganizationInviteSummary[]> {
  const session = await dependencies.requireSession();
  return dependencies.organizationsRepository.listCurrentTeamInvites(session.token);
}

export async function createCurrentOrganizationInvite(
  input: CreateOrganizationInviteInput,
  dependencies: OrganizationsServiceDependencies = defaultDependencies,
): Promise<string> {
  const session = await dependencies.requireSession();
  return dependencies.organizationsRepository.createCurrentTeamInvite(session.token, input);
}

export async function cancelCurrentOrganizationInvite(
  inviteId: string,
  dependencies: OrganizationsServiceDependencies = defaultDependencies,
): Promise<void> {
  const session = await dependencies.requireSession();
  await dependencies.organizationsRepository.cancelCurrentTeamInvite(session.token, inviteId);
}

export async function acceptCurrentOrganizationInvite(
  token: string,
  dependencies: OrganizationsServiceDependencies = defaultDependencies,
): Promise<void> {
  const session = await dependencies.requireSession();
  await dependencies.organizationsRepository.acceptCurrentTeamInvite(session.token, token);
}

export async function updateCurrentOrganizationMemberRole(
  membershipId: string,
  input: unknown,
  dependencies: OrganizationsServiceDependencies = defaultDependencies,
): Promise<void> {
  const parsed = updateOrganizationMemberRoleInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new DomainError({
      code: "INVALID_ARGUMENT",
      message: parsed.error.issues[0]?.message ?? "Invalid member payload",
      status: 400,
    });
  }

  const session = await dependencies.requireSession();
  await dependencies.organizationsRepository.updateCurrentTeamMemberRole(session.token, {
    membershipId,
    input: parsed.data as UpdateOrganizationMemberRoleInput,
  });
}

export async function searchCurrentOrganizationDirectoryExact(
  query: string,
  dependencies: OrganizationsServiceDependencies = defaultDependencies,
): Promise<DirectorySearchResult[]> {
  const session = await dependencies.requireSession();
  return dependencies.organizationsRepository.searchDirectoryExact(session.token, query.trim());
}

export async function listCurrentOrganizationOffersDirectory(
  role: "broker" | "developer",
  dependencies: OrganizationsServiceDependencies = defaultDependencies,
): Promise<OffersDirectoryProfile[]> {
  const session = await dependencies.requireSession();
  return dependencies.organizationsRepository.listOffersDirectoryProfiles(session.token, role);
}

export async function listIncomingOrganizationInvitesForCurrentUser(
  dependencies: OrganizationsServiceDependencies = defaultDependencies,
): Promise<IncomingOrganizationInvite[]> {
  const session = await dependencies.requireSession();
  return dependencies.organizationsRepository.listIncomingTeamInvites(session.token);
}

export async function cancelIncomingOrganizationInvite(
  inviteId: string,
  dependencies: OrganizationsServiceDependencies = defaultDependencies,
): Promise<void> {
  const session = await dependencies.requireSession();
  await dependencies.organizationsRepository.cancelIncomingTeamInvite(session.token, inviteId);
}
