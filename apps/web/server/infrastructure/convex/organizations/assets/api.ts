import { createRepositoryRefs } from "@anan/convex-adapters/repository";
import { apiUnsafe } from "@/lib/convexApi";

export type OrganizationAssetsApiRefs = {
  listOrganizationAssets: unknown;
  attachOrganizationAssets: unknown;
  markEntityAssetsPendingDelete: unknown;
  listProjectAssetsForViewer: unknown;
};

export const organizationAssetsApi = createRepositoryRefs<OrganizationAssetsApiRefs>(apiUnsafe, "shared_logic/organizationAssets");
