import { mutationRef, queryRef, voidMutationRef } from "@anan/convex-adapters/repository";
import { redOverviewApi, redPropertiesApi } from "./api";
import type { RedZoneRepository } from "./types";

export type { RedZoneRepository } from "./types";

/**
 * WHY:   RED server functions should not embed direct Convex transport details.
 * WHAT:  Repository adapter for RED overview and property persistence through internal Convex functions.
 * HOW:   Calls internal Convex queries/mutations and returns stable DTOs to the RED server layer.
 */
export const convexRedZoneRepository: RedZoneRepository = {
  async getOverview(token, REDId) {
    return queryRef<Awaited<ReturnType<RedZoneRepository["getOverview"]>>>(
      token,
      redOverviewApi.countPropertiesByRedId,
      { REDId },
    );
  },

  async listProperties(token, REDId, filters) {
    return queryRef<Awaited<ReturnType<RedZoneRepository["listProperties"]>>>(
      token,
      redPropertiesApi.listByRedId,
      { REDId, ...filters },
    );
  },

  async getProperty(token, id) {
    return queryRef<Awaited<ReturnType<RedZoneRepository["getProperty"]>>>(
      token,
      redPropertiesApi.getById,
      { id },
    );
  },

  async createProperty(token, REDId, input) {
    return mutationRef<Awaited<ReturnType<RedZoneRepository["createProperty"]>>>(
      token,
      redPropertiesApi.create,
      { REDId, ...input },
    );
  },

  async updateProperty(token, id, patch) {
    await voidMutationRef(token, redPropertiesApi.update, { id, ...patch });
  },

  async deleteProperty(token, id) {
    await voidMutationRef(token, redPropertiesApi.remove, { id });
  },

  async publishProperty(token, id) {
    return mutationRef<Awaited<ReturnType<RedZoneRepository["publishProperty"]>>>(
      token,
      redPropertiesApi.publish,
      { id },
    );
  },
};
