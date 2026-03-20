import { fetchMutation, fetchQuery } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";
import type {
  DirectorySearchResult,
  CreateOrganizationInput,
  CreateOrganizationInviteInput,
  IncomingOrganizationInvite,
  OffersDirectoryProfile,
  OrganizationInviteSummary,
  OrganizationMembershipSummary,
  OrganizationSummary,
  OfferOrganizationSummary,
  OrganizationPublicProfile,
  OrganizationTeamMember,
  UpdateOrganizationInput,
  UpdateOrganizationMemberRoleInput,
} from "@/server/contracts/organizations";

type OrganizationsApiRefs = {
  listCurrentOrganizations: unknown;
  createOrganizationForCurrentUser: unknown;
  getCurrentOrganization: unknown;
  updateCurrentOrganization: unknown;
  listCurrentTeamMembers: unknown;
  listCurrentTeamInvites: unknown;
  createTeamInviteForCurrentUser: unknown;
  cancelTeamInviteForCurrentUser: unknown;
  updateMembershipRoleForCurrentUser: unknown;
  acceptTeamInviteForCurrentUser: unknown;
  searchOrganizationDirectoryExact: unknown;
  listOffersDirectoryProfiles: unknown;
  listOfferOrganizationsDirectory: unknown;
  listIncomingTeamInvitesForCurrentUser: unknown;
  cancelIncomingTeamInviteForCurrentUser: unknown;
  listOrganizationsByAuthUserId: unknown;
  createOrganizationForAuthUser: unknown;
  listTeamMembersByOwner: unknown;
  listTeamInvitesByOwner: unknown;
  createTeamInviteForOwner: unknown;
  cancelTeamInviteForOwner: unknown;
  acceptTeamInviteForAuthUser: unknown;
  getOrganizationPublicProfile: unknown;
};

const agenciesApi = (apiUnsafe[
  "shared_logic/agencies/repositories"
]) as OrganizationsApiRefs;

const organizationAccessMessages = [
  "Organization owner profile required",
  "Organization membership required",
  "Tenant organization required",
  "Tenant organization link required",
  "Broker organization link required",
  "Developer organization link required",
];

function isOrganizationAccessError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  return organizationAccessMessages.some((entry) => message.includes(entry));
}

/**
 * WHY:   Organization reads and writes are the first business operations moving behind the Next.js gateway.
 * WHAT:  Repository contract for listing and creating organizations for the current session user.
 * HOW:   Implementations accept the current Convex auth token and return stable organization DTOs.
 */
export type OrganizationsRepository = {
  listForCurrentUser(token: string): Promise<OrganizationSummary[]>;
  createForCurrentUser(token: string, input: CreateOrganizationInput): Promise<OrganizationSummary>;
  getCurrentOrganization(token: string): Promise<{
    organization: OrganizationSummary | null;
    membership: OrganizationMembershipSummary | null;
    accessError?: true;
  } | null>;
  updateCurrentOrganization(token: string, input: UpdateOrganizationInput): Promise<OrganizationSummary>;
  listCurrentTeamMembers(token: string): Promise<OrganizationTeamMember[]>;
  listCurrentTeamInvites(token: string): Promise<OrganizationInviteSummary[]>;
  createCurrentTeamInvite(token: string, input: CreateOrganizationInviteInput): Promise<string>;
  cancelCurrentTeamInvite(token: string, inviteId: string): Promise<void>;
  updateCurrentTeamMemberRole(token: string, args: { membershipId: string; input: UpdateOrganizationMemberRoleInput }): Promise<void>;
  acceptCurrentTeamInvite(authToken: string, inviteToken: string): Promise<void>;
  searchDirectoryExact(token: string, query: string): Promise<DirectorySearchResult[]>;
  listOffersDirectoryProfiles(token: string, role: "broker" | "developer"): Promise<OffersDirectoryProfile[]>;
  listOfferOrganizationsDirectory(token: string, role: "broker" | "developer"): Promise<OfferOrganizationSummary[]>;
  getOrganizationPublicProfile(token: string, type: "broker" | "developer", slug: string): Promise<OrganizationPublicProfile | null>;
  listIncomingTeamInvites(token: string): Promise<IncomingOrganizationInvite[]>;
  cancelIncomingTeamInvite(token: string, inviteId: string): Promise<void>;
};

/**
 * WHY:   Convex remains the system of record while the Next.js gateway owns HTTP and business orchestration.
 * WHAT:  Convex-backed organization repository implementation.
 * HOW:   Calls internal owner-id and auth-user-id repository functions and projects the results into stable DTOs.
 */
export const convexOrganizationsRepository: OrganizationsRepository = {
  async listForCurrentUser(token) {
    const organizations = (await fetchQuery(agenciesApi.listCurrentOrganizations as never, {} as never, { token })) as OrganizationSummary[];
    return organizations;
  },

  async createForCurrentUser(token, input) {
    const result = (await fetchMutation(agenciesApi.createOrganizationForCurrentUser as never, {
      ...input,
    } as never, { token })) as {
      organization: OrganizationSummary;
    };
    return result.organization;
  },

  async getCurrentOrganization(token) {
    try {
      return (await fetchQuery(agenciesApi.getCurrentOrganization as never, {} as never, { token })) as {
        organization: OrganizationSummary | null;
        membership: OrganizationMembershipSummary | null;
        accessError?: true;
      } | null;
    } catch (error) {
      if (isOrganizationAccessError(error)) {
        return { organization: null, membership: null, accessError: true };
      }
      throw error;
    }
  },

  async updateCurrentOrganization(token, input) {
    return fetchMutation(agenciesApi.updateCurrentOrganization as never, input as never, { token }) as Promise<OrganizationSummary>;
  },

  async listCurrentTeamMembers(token) {
    return fetchQuery(agenciesApi.listCurrentTeamMembers as never, {} as never, { token }) as Promise<OrganizationTeamMember[]>;
  },

  async listCurrentTeamInvites(token) {
    return fetchQuery(agenciesApi.listCurrentTeamInvites as never, {} as never, { token }) as Promise<OrganizationInviteSummary[]>;
  },

  async createCurrentTeamInvite(token, input) {
    return fetchMutation(agenciesApi.createTeamInviteForCurrentUser as never, input as never, { token }) as Promise<string>;
  },

  async cancelCurrentTeamInvite(token, inviteId) {
    await fetchMutation(agenciesApi.cancelTeamInviteForCurrentUser as never, {
      inviteId: inviteId as never,
    } as never, { token });
  },

  async updateCurrentTeamMemberRole(token, { membershipId, input }) {
    await fetchMutation(agenciesApi.updateMembershipRoleForCurrentUser as never, {
      membershipId: membershipId as never,
      ...input,
    } as never, { token });
  },

  async acceptCurrentTeamInvite(authToken, inviteToken) {
    await fetchMutation(agenciesApi.acceptTeamInviteForCurrentUser as never, {
      token: inviteToken,
    } as never, { token: authToken });
  },

  async searchDirectoryExact(token, query) {
    return fetchQuery(agenciesApi.searchOrganizationDirectoryExact as never, {
      query,
    } as never, { token }) as Promise<DirectorySearchResult[]>;
  },

  async listOffersDirectoryProfiles(token, role) {
    try {
      return fetchQuery(agenciesApi.listOffersDirectoryProfiles as never, {
        role,
      } as never, { token }) as Promise<OffersDirectoryProfile[]>;
    } catch (error) {
      if (isOrganizationAccessError(error)) {
        return [];
      }
      throw error;
    }
  },
  async listOfferOrganizationsDirectory(token, role) {
    try {
      return fetchQuery(agenciesApi.listOfferOrganizationsDirectory as never, {
        role,
      } as never, { token }) as Promise<OfferOrganizationSummary[]>;
    } catch (error) {
      if (isOrganizationAccessError(error)) {
        return [];
      }
      throw error;
    }
  },
  async getOrganizationPublicProfile(token, type, slug) {
    try {
      return fetchQuery(agenciesApi.getOrganizationPublicProfile as never, {
        type,
        slug,
      } as never, { token }) as Promise<OrganizationPublicProfile | null>;
    } catch (error) {
      if (isOrganizationAccessError(error)) {
        return null;
      }
      throw error;
    }
  },
  async listIncomingTeamInvites(token) {
    return fetchQuery(agenciesApi.listIncomingTeamInvitesForCurrentUser as never, {} as never, {
      token,
    }) as Promise<IncomingOrganizationInvite[]>;
  },

  async cancelIncomingTeamInvite(token, inviteId) {
    await fetchMutation(agenciesApi.cancelIncomingTeamInviteForCurrentUser as never, {
      inviteId: inviteId as never,
    } as never, { token });
  },
};
