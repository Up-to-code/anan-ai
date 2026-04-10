import { apiUnsafe } from "@/lib/convexApi";

export type OrganizationProfilesApiRefs = {
  listOrganizationProfilesByIds: unknown;
  getCurrentOrganizationProfile: unknown;
  bootstrapCurrentOrganizationProfile: unknown;
  syncCurrentOrganizationProfile: unknown;
  updateCurrentOrganizationProfile: unknown;
};

export const organizationProfilesApi =
  apiUnsafe["shared_logic/organizationProfiles"] as OrganizationProfilesApiRefs;
