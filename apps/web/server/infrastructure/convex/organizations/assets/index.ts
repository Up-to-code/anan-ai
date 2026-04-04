import { fetchMutation, fetchQuery } from "convex/nextjs";
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
    return fetchQuery(organizationAssetsApi.listOrganizationAssets as never, input as never, {
      token,
    }) as ReturnType<OrganizationAssetsRepository["listOrganizationAssets"]>;
  },
  async attachOrganizationAssets(token, input) {
    await fetchMutation(organizationAssetsApi.attachOrganizationAssets as never, input as never, {
      token,
    });
  },
  async markEntityAssetsPendingDelete(token, input) {
    await fetchMutation(organizationAssetsApi.markEntityAssetsPendingDelete as never, input as never, {
      token,
    });
  },
  async listProjectAssetsForViewer(token, propertyId) {
    return fetchQuery(organizationAssetsApi.listProjectAssetsForViewer as never, { propertyId } as never, {
      token,
    }) as ReturnType<OrganizationAssetsRepository["listProjectAssetsForViewer"]>;
  },
};
