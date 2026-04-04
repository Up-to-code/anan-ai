import { fetchMutation, fetchQuery } from "convex/nextjs";
import { agenciesApi } from "./api";
import type { CurrentOrganizationResult, OrganizationsRepository } from "./types";

export type { CurrentOrganizationResult, OrganizationsRepository } from "./types";

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
 * WHY:   Convex remains the system of record while the Next.js gateway owns HTTP and business orchestration.
 * WHAT:  Convex-backed organization repository implementation.
 * HOW:   Calls internal owner-id and auth-user-id repository functions and projects the results into stable DTOs.
 */
export const convexOrganizationsRepository: OrganizationsRepository = {
  async listForCurrentUser(token) {
    const organizations = (await fetchQuery(agenciesApi.listCurrentOrganizations as never, {} as never, { token })) as Awaited<ReturnType<OrganizationsRepository["listForCurrentUser"]>>;
    return organizations;
  },

  async createForCurrentUser(token, input) {
    const result = (await fetchMutation(agenciesApi.createOrganizationForCurrentUser as never, {
      ...input,
    } as never, { token })) as {
      organization: Awaited<ReturnType<OrganizationsRepository["createForCurrentUser"]>>;
    };
    return result.organization;
  },

  async getCurrentOrganization(token) {
    try {
      return (await fetchQuery(agenciesApi.getCurrentOrganization as never, {} as never, { token })) as CurrentOrganizationResult;
    } catch (error) {
      if (isOrganizationAccessError(error)) {
        return { organization: null, membership: null, accessError: true };
      }
      throw error;
    }
  },

  async updateCurrentOrganization(token, input) {
    return fetchMutation(agenciesApi.updateCurrentOrganization as never, input as never, { token }) as ReturnType<OrganizationsRepository["updateCurrentOrganization"]>;
  },

  async listCurrentTeamMembers(token) {
    return fetchQuery(agenciesApi.listCurrentTeamMembers as never, {} as never, { token }) as ReturnType<OrganizationsRepository["listCurrentTeamMembers"]>;
  },

  async listCurrentTeamInvites(token) {
    return fetchQuery(agenciesApi.listCurrentTeamInvites as never, {} as never, { token }) as ReturnType<OrganizationsRepository["listCurrentTeamInvites"]>;
  },

  async createCurrentTeamInvite(token, input) {
    return fetchMutation(agenciesApi.createTeamInviteForCurrentUser as never, input as never, { token }) as ReturnType<OrganizationsRepository["createCurrentTeamInvite"]>;
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
    } as never, { token }) as ReturnType<OrganizationsRepository["searchDirectoryExact"]>;
  },

  async listOffersDirectoryProfiles(token, role) {
    try {
      return fetchQuery(agenciesApi.listOffersDirectoryProfiles as never, {
        role,
      } as never, { token }) as ReturnType<OrganizationsRepository["listOffersDirectoryProfiles"]>;
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
      } as never, { token }) as ReturnType<OrganizationsRepository["listOfferOrganizationsDirectory"]>;
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
      } as never, { token }) as ReturnType<OrganizationsRepository["getOrganizationPublicProfile"]>;
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
    }) as ReturnType<OrganizationsRepository["listIncomingTeamInvites"]>;
  },

  async cancelIncomingTeamInvite(token, inviteId) {
    await fetchMutation(agenciesApi.cancelIncomingTeamInviteForCurrentUser as never, {
      inviteId: inviteId as never,
    } as never, { token });
  },
};
