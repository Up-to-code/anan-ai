import { apiUnsafe } from "@/lib/convexApi";

export type OrganizationAssetsApiRefs = {
  listOrganizationAssets: unknown;
  attachOrganizationAssets: unknown;
  markEntityAssetsPendingDelete: unknown;
  listProjectAssetsForViewer: unknown;
};

export const organizationAssetsApi = apiUnsafe["shared_logic/organizationAssets"] as OrganizationAssetsApiRefs;
