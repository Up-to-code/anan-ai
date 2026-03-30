import { fetchMutation, fetchQuery } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";
import type {
  CreatePropertyInput,
  DeveloperOverviewSummary,
  PaginatedPropertiesResult,
  PropertyDetail,
  PropertyListFilters,
  PublishPropertyResult,
  UpdatePropertyInput,
} from "@/server/contracts/properties";

type RedInternalRefs = {
  countPropertiesByRedId: unknown;
  listByRedId: unknown;
  getById: unknown;
  create: unknown;
  update: unknown;
  remove: unknown;
  publish: unknown;
};

const redOverviewApi = (apiUnsafe["red_zone/overview"]) as RedInternalRefs;
const redPropertiesApi = (apiUnsafe["red_zone/properties"]) as RedInternalRefs;

export type RedZoneRepository = {
  getOverview(token: string, redId: string): Promise<DeveloperOverviewSummary>;
  listProperties(token: string, redId: string, filters: PropertyListFilters): Promise<PaginatedPropertiesResult>;
  getProperty(token: string, id: string): Promise<PropertyDetail | null>;
  createProperty(token: string, redId: string, input: CreatePropertyInput): Promise<string>;
  updateProperty(token: string, id: string, patch: UpdatePropertyInput): Promise<void>;
  deleteProperty(token: string, id: string): Promise<void>;
  publishProperty(token: string, id: string): Promise<PublishPropertyResult>;
};

/**
 * WHY:   RED server functions should not embed direct Convex transport details.
 * WHAT:  Repository adapter for RED overview and property persistence through internal Convex functions.
 * HOW:   Calls internal Convex queries/mutations and returns stable DTOs to the RED server layer.
 */
export const convexRedZoneRepository: RedZoneRepository = {
  async getOverview(token, REDId) {
    return fetchQuery(redOverviewApi.countPropertiesByRedId as never, {
      REDId: REDId as never,
    } as never, { token });
  },

  async listProperties(token, REDId, filters) {
    return fetchQuery(redPropertiesApi.listByRedId as never, {
      REDId: REDId as never,
      ...filters,
    } as never, { token }) as Promise<PaginatedPropertiesResult>;
  },

  async getProperty(token, id) {
    return fetchQuery(redPropertiesApi.getById as never, {
      id: id as never,
    } as never, { token }) as Promise<PropertyDetail | null>;
  },

  async createProperty(token, REDId, input) {
    return fetchMutation(redPropertiesApi.create as never, {
      REDId: REDId as never,
      ...input,
    } as never, { token }) as Promise<string>;
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
    } as never, { token }) as Promise<PublishPropertyResult>;
  },
};
