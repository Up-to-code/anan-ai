import { queryRef, voidMutationRef } from "@anan/convex-adapters/repository";
import { organizationAssetsApi } from "./api";
import type { OrganizationAssetsRepository } from "./types";

export type {
  AttachOrganizationAssetsInput,
  ListOrganizationAssetsInput,
  MarkEntityAssetsPendingDeleteInput,
  OrganizationAssetsRepository,
} from "./types";

export const convexOrganizationAssetsRepository: OrganizationAssetsRepository = {
  async listOrganizationAssets(token, input) {
    return queryRef<Awaited<ReturnType<OrganizationAssetsRepository["listOrganizationAssets"]>>>(
      token,
      organizationAssetsApi.listOrganizationAssets,
      input,
    );
  },
  async attachOrganizationAssets(token, input) {
    await voidMutationRef(token, organizationAssetsApi.attachOrganizationAssets, input);
  },
  async markEntityAssetsPendingDelete(token, input) {
    await voidMutationRef(token, organizationAssetsApi.markEntityAssetsPendingDelete, input);
  },
  async listProjectAssetsForViewer(token, propertyId) {
    return queryRef<Awaited<ReturnType<OrganizationAssetsRepository["listProjectAssetsForViewer"]>>>(
      token,
      organizationAssetsApi.listProjectAssetsForViewer,
      { propertyId },
    );
  },
};
