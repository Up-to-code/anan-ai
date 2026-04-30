import { mutationRef, queryRef } from "@anan/convex-adapters/repository";
import { organizationProfilesApi } from "./api";
import type {
  BootstrapOrganizationProfileInput,
  OrganizationProfilesRepository,
} from "./types";

export type {
  BootstrapOrganizationProfileInput,
  OrganizationProfilesRepository,
} from "./types";

/**
 * WHY:   Better Auth becomes the org authority, but Convex still owns app-specific org metadata and compatibility bridges.
 * WHAT:  Repository adapter for the org-profile bridge functions in Convex.
 * HOW:   Calls the shared `organizationProfiles` capability with the current Convex auth token.
 */
export const convexOrganizationProfilesRepository: OrganizationProfilesRepository = {
  async listByOrganizationIds(token, organizationIds) {
    if (organizationIds.length === 0) {
      return [];
    }

    return queryRef<Awaited<ReturnType<OrganizationProfilesRepository["listByOrganizationIds"]>>>(
      token,
      organizationProfilesApi.listOrganizationProfilesByIds,
      { organizationIds },
    );
  },

  async getCurrent(token) {
    return queryRef<Awaited<ReturnType<OrganizationProfilesRepository["getCurrent"]>>>(
      token,
      organizationProfilesApi.getCurrentOrganizationProfile,
    );
  },

  async getById(token, organizationId) {
    return queryRef<Awaited<ReturnType<OrganizationProfilesRepository["getById"]>>>(
      token,
      organizationProfilesApi.getOrganizationProfileById,
      { organizationId },
    );
  },

  async bootstrapCurrent(token, input) {
    return mutationRef<Awaited<ReturnType<OrganizationProfilesRepository["bootstrapCurrent"]>>>(
      token,
      organizationProfilesApi.bootstrapCurrentOrganizationProfile,
      input,
    );
  },

  async syncCurrent(token) {
    return mutationRef<Awaited<ReturnType<OrganizationProfilesRepository["syncCurrent"]>>>(
      token,
      organizationProfilesApi.syncCurrentOrganizationProfile,
    );
  },

  async updateCurrent(token, input) {
    return mutationRef<Awaited<ReturnType<OrganizationProfilesRepository["updateCurrent"]>>>(
      token,
      organizationProfilesApi.updateCurrentOrganizationProfile,
      input,
    );
  },
};
