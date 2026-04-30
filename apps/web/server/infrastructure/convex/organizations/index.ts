import { mutationRef, queryRef, voidMutationRef } from "@anan/convex-adapters/repository";
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
    const organizations = await queryRef<Awaited<ReturnType<OrganizationsRepository["listForCurrentUser"]>>>(
      token,
      agenciesApi.listCurrentOrganizations,
    );
    return organizations;
  },

  async createForCurrentUser(token, input) {
    const result = await mutationRef<{
      organization: Awaited<ReturnType<OrganizationsRepository["createForCurrentUser"]>>;
    }>(token, agenciesApi.createOrganizationForCurrentUser, {
      ...input,
    });
    return result.organization;
  },

  async getCurrentOrganization(token) {
    try {
      return await queryRef<CurrentOrganizationResult>(token, agenciesApi.getCurrentOrganization);
    } catch (error) {
      if (isOrganizationAccessError(error)) {
        return { organization: null, membership: null, accessError: true };
      }
      throw error;
    }
  },

  async updateCurrentOrganization(token, input) {
    return mutationRef<Awaited<ReturnType<OrganizationsRepository["updateCurrentOrganization"]>>>(
      token,
      agenciesApi.updateCurrentOrganization,
      input,
    );
  },

  async listCurrentTeamMembers(token) {
    return queryRef<Awaited<ReturnType<OrganizationsRepository["listCurrentTeamMembers"]>>>(
      token,
      agenciesApi.listCurrentTeamMembers,
    );
  },

  async listCurrentTeamInvites(token) {
    return queryRef<Awaited<ReturnType<OrganizationsRepository["listCurrentTeamInvites"]>>>(
      token,
      agenciesApi.listCurrentTeamInvites,
    );
  },

  async createCurrentTeamInvite(token, input) {
    return mutationRef<Awaited<ReturnType<OrganizationsRepository["createCurrentTeamInvite"]>>>(
      token,
      agenciesApi.createTeamInviteForCurrentUser,
      input,
    );
  },

  async cancelCurrentTeamInvite(token, inviteId) {
    await voidMutationRef(token, agenciesApi.cancelTeamInviteForCurrentUser, { inviteId });
  },

  async updateCurrentTeamMemberRole(token, { membershipId, input }) {
    await voidMutationRef(token, agenciesApi.updateMembershipRoleForCurrentUser, {
      membershipId,
      ...input,
    });
  },

  async acceptCurrentTeamInvite(authToken, inviteToken) {
    await voidMutationRef(authToken, agenciesApi.acceptTeamInviteForCurrentUser, {
      token: inviteToken,
    });
  },

  async searchDirectoryExact(token, query) {
    return queryRef<Awaited<ReturnType<OrganizationsRepository["searchDirectoryExact"]>>>(
      token,
      agenciesApi.searchOrganizationDirectoryExact,
      { query },
    );
  },

  async listOffersDirectoryProfiles(token, role) {
    try {
      return await queryRef<Awaited<ReturnType<OrganizationsRepository["listOffersDirectoryProfiles"]>>>(
        token,
        agenciesApi.listOffersDirectoryProfiles,
        {
          role,
        },
      );
    } catch (error) {
      if (isOrganizationAccessError(error)) {
        return [];
      }
      throw error;
    }
  },
  async listOfferOrganizationsDirectory(token, role) {
    try {
      return await queryRef<Awaited<ReturnType<OrganizationsRepository["listOfferOrganizationsDirectory"]>>>(
        token,
        agenciesApi.listOfferOrganizationsDirectory,
        {
          role,
        },
      );
    } catch (error) {
      if (isOrganizationAccessError(error)) {
        return [];
      }
      throw error;
    }
  },
  async getOrganizationPublicProfile(token, type, slug) {
    try {
      return await queryRef<Awaited<ReturnType<OrganizationsRepository["getOrganizationPublicProfile"]>>>(
        token,
        agenciesApi.getOrganizationPublicProfile,
        {
          type,
          slug,
        },
      );
    } catch (error) {
      if (isOrganizationAccessError(error)) {
        return null;
      }
      throw error;
    }
  },
  async listIncomingTeamInvites(token) {
    return queryRef<Awaited<ReturnType<OrganizationsRepository["listIncomingTeamInvites"]>>>(
      token,
      agenciesApi.listIncomingTeamInvitesForCurrentUser,
    );
  },

  async cancelIncomingTeamInvite(token, inviteId) {
    await voidMutationRef(token, agenciesApi.cancelIncomingTeamInviteForCurrentUser, { inviteId });
  },
};
