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
  type OfferOrganizationSummary,
  type OrganizationPublicProfile,
  type OrganizationTeamMember,
  type UpdateOrganizationInput,
  type UpdateOrganizationMemberRoleInput,
  updateOrganizationInputSchema,
  updateOrganizationMemberRoleInputSchema,
} from "@/server/contracts/organizations";
import { resolveSuggestedOrganizationType } from "@/server/contracts/workspace";
import {
  type OrganizationsRepository,
} from "@/server/infrastructure/convex/organizations";
import { clerkOrganizationsRepository } from "@/server/infrastructure/clerk/organizations";
import {
  convexOrganizationProfilesRepository,
  type BootstrapOrganizationProfileInput,
} from "@/server/infrastructure/convex/organizationProfiles";

type OrganizationsServiceDependencies = {
  requireSession: () => Promise<ResolvedSession>;
  organizationsRepository: OrganizationsRepository;
  organizationProfilesRepository: typeof convexOrganizationProfilesRepository;
};

const defaultDependencies: OrganizationsServiceDependencies = {
  requireSession: requireSessionContext,
  organizationsRepository: clerkOrganizationsRepository,
  organizationProfilesRepository: convexOrganizationProfilesRepository,
};

export async function listOrganizationsForCurrentUser(
  dependencies: OrganizationsServiceDependencies = defaultDependencies,
): Promise<OrganizationSummary[]> {
  const session = await dependencies.requireSession();
  return dependencies.organizationsRepository.listForCurrentUser(session.token);
}

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

/**
 * WHY:   Custom Clerk org creation flows still need to bootstrap app-owned metadata and the legacy owner bridge.
 * WHAT:  Upserts the current active organization's local Convex profile after Clerk creates and activates it.
 * HOW:   Validates the payload against the existing create schema, then delegates to the org-profile bridge repository.
 */
export async function bootstrapCurrentOrganizationFromClerk(
  input: BootstrapOrganizationProfileInput,
  dependencies: OrganizationsServiceDependencies = defaultDependencies,
): Promise<OrganizationSummary> {
  const parsed = createOrganizationInputSchema.safeParse({
    name: input.name,
    type: input.type,
  });
  if (!parsed.success) {
    throw new DomainError({
      code: "INVALID_ARGUMENT",
      message: parsed.error.issues[0]?.message ?? "Invalid organization payload",
      status: 400,
    });
  }

  const session = await dependencies.requireSession();
  return dependencies.organizationProfilesRepository.bootstrapCurrent(session.token, input);
}

/**
 * WHY:   Switching the active Clerk organization should immediately rebind the legacy workspace owner context.
 * WHAT:  Syncs the current Convex org-profile bridge from the active Clerk organization claim.
 * HOW:   Resolves the current authenticated session and delegates to the org-profile repository mutation.
 */
export async function syncCurrentOrganizationFromClerk(
  dependencies: OrganizationsServiceDependencies = defaultDependencies,
) {
  const session = await dependencies.requireSession();
  return dependencies.organizationProfilesRepository.syncCurrent(session.token);
}

export async function getCurrentOrganizationForCurrentUser(
  dependencies: OrganizationsServiceDependencies = defaultDependencies,
): Promise<{
  organization: OrganizationSummary | null;
  membership: OrganizationMembershipSummary | null;
  accessError?: true;
} | null> {
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

export async function listCurrentOrganizationOffersCompanyDirectory(
  role: "broker" | "developer",
  dependencies: OrganizationsServiceDependencies = defaultDependencies,
): Promise<OfferOrganizationSummary[]> {
  const session = await dependencies.requireSession();
  return dependencies.organizationsRepository.listOfferOrganizationsDirectory(session.token, role);
}

export async function getOrganizationPublicProfile(
  type: "broker" | "developer",
  slug: string,
  dependencies: OrganizationsServiceDependencies = defaultDependencies,
): Promise<OrganizationPublicProfile | null> {
  const session = await dependencies.requireSession();
  return dependencies.organizationsRepository.getOrganizationPublicProfile(session.token, type, slug);
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
