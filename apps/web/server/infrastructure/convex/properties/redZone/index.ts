import { fetchMutation, fetchQuery } from "convex/nextjs";
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
    return fetchQuery(redOverviewApi.countPropertiesByRedId as never, {
      REDId: REDId as never,
    } as never, { token }) as ReturnType<RedZoneRepository["getOverview"]>;
  },

  async listProperties(token, REDId, filters) {
    return fetchQuery(redPropertiesApi.listByRedId as never, {
      REDId: REDId as never,
      ...filters,
    } as never, { token }) as ReturnType<RedZoneRepository["listProperties"]>;
  },

  async getProperty(token, id) {
    return fetchQuery(redPropertiesApi.getById as never, {
      id: id as never,
    } as never, { token }) as ReturnType<RedZoneRepository["getProperty"]>;
  },

  async createProperty(token, REDId, input) {
    return fetchMutation(redPropertiesApi.create as never, {
      REDId: REDId as never,
      ...input,
    } as never, { token }) as ReturnType<RedZoneRepository["createProperty"]>;
  },

  async updateProperty(token, id, patch) {
    await fetchMutation(redPropertiesApi.update as never, {
      id: id as never,
      ...patch,
    } as never, { token });
  },

  async deleteProperty(token, id) {
    await fetchMutation(redPropertiesApi.remove as never, {
      id: id as never,
    } as never, { token });
  },

  async publishProperty(token, id) {
    return fetchMutation(redPropertiesApi.publish as never, {
      id: id as never,
    } as never, { token }) as ReturnType<RedZoneRepository["publishProperty"]>;
  },
};
