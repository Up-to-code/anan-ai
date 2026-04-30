import { createRepositoryRefs } from "@anan/convex-adapters/repository";
import { apiUnsafe } from "@/lib/convexApi";

export type OrganizationProfilesApiRefs = {
  listOrganizationProfilesByIds: unknown;
  getCurrentOrganizationProfile: unknown;
  getOrganizationProfileById: unknown;
  bootstrapCurrentOrganizationProfile: unknown;
  syncCurrentOrganizationProfile: unknown;
  updateCurrentOrganizationProfile: unknown;
};

export const organizationProfilesApi =
  createRepositoryRefs<OrganizationProfilesApiRefs>(apiUnsafe, "shared_logic/organizationProfiles");
