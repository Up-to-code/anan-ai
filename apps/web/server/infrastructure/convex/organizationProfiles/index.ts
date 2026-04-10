import { fetchMutation, fetchQuery } from "convex/nextjs";
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
 * WHY:   Clerk becomes the org authority, but Convex still owns app-specific org metadata and compatibility bridges.
 * WHAT:  Repository adapter for the org-profile bridge functions in Convex.
 * HOW:   Calls the shared `organizationProfiles` capability with the current Convex auth token.
 */
export const convexOrganizationProfilesRepository: OrganizationProfilesRepository = {
  async listByOrganizationIds(token, organizationIds) {
    if (organizationIds.length === 0) {
      return [];
    }

    return fetchQuery(
      organizationProfilesApi.listOrganizationProfilesByIds as never,
      { organizationIds } as never,
      { token },
    ) as ReturnType<OrganizationProfilesRepository["listByOrganizationIds"]>;
  },

  async getCurrent(token) {
    return fetchQuery(
      organizationProfilesApi.getCurrentOrganizationProfile as never,
      {} as never,
      { token },
    ) as ReturnType<OrganizationProfilesRepository["getCurrent"]>;
  },

  async bootstrapCurrent(token, input) {
    return fetchMutation(
      organizationProfilesApi.bootstrapCurrentOrganizationProfile as never,
      input as never,
      { token },
    ) as ReturnType<OrganizationProfilesRepository["bootstrapCurrent"]>;
  },

  async syncCurrent(token) {
    return fetchMutation(
      organizationProfilesApi.syncCurrentOrganizationProfile as never,
      {} as never,
      { token },
    ) as ReturnType<OrganizationProfilesRepository["syncCurrent"]>;
  },

  async updateCurrent(token, input) {
    return fetchMutation(
      organizationProfilesApi.updateCurrentOrganizationProfile as never,
      input as never,
      { token },
    ) as ReturnType<OrganizationProfilesRepository["updateCurrent"]>;
  },
};
