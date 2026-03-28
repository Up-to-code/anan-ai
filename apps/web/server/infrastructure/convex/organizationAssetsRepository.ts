import { fetchMutation, fetchQuery } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";
import type { OrganizationAsset } from "@/server/contracts/properties";

type OrganizationAssetsApiRefs = {
  listOrganizationAssets: unknown;
  attachOrganizationAssets: unknown;
  markEntityAssetsPendingDelete: unknown;
  listProjectAssetsForViewer: unknown;
};

const organizationAssetsApi = apiUnsafe["shared_logic/organizationAssets"] as OrganizationAssetsApiRefs;

export type OrganizationAssetsRepository = {
  listOrganizationAssets(
    token: string,
    input: {
      attachedEntityType?: "project" | "conversation" | "offer";
      attachedEntityId?: string;
      lifecycleState?: "active" | "archived" | "pending_delete" | "deleted";
      limit?: number;
    },
  ): Promise<OrganizationAsset[]>;
  attachOrganizationAssets(
    token: string,
    input: {
      keys: string[];
      attachedEntityType: "project" | "conversation" | "offer";
      attachedEntityId: string;
      visibilityScope: "organization" | "project_private_share" | "public_project";
    },
  ): Promise<void>;
  markEntityAssetsPendingDelete(
    token: string,
    input: {
      attachedEntityType: "project" | "conversation" | "offer";
      attachedEntityId: string;
      deletionReason?: string;
      scheduledDeletionAt?: number;
    },
  ): Promise<void>;
  listProjectAssetsForViewer(token: string, propertyId: string): Promise<OrganizationAsset[]>;
};

export const convexOrganizationAssetsRepository: OrganizationAssetsRepository = {
  async listOrganizationAssets(token, input) {
    return fetchQuery(organizationAssetsApi.listOrganizationAssets as never, input as never, {
      token,
    }) as Promise<OrganizationAsset[]>;
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
    }) as Promise<OrganizationAsset[]>;
  },
};
