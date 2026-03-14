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
  getOverview(redId: string): Promise<DeveloperOverviewSummary>;
  listProperties(redId: string, filters: PropertyListFilters): Promise<PaginatedPropertiesResult>;
  getProperty(id: string): Promise<PropertyDetail | null>;
  createProperty(redId: string, input: CreatePropertyInput): Promise<string>;
  updateProperty(id: string, patch: UpdatePropertyInput): Promise<void>;
  deleteProperty(id: string): Promise<void>;
  publishProperty(id: string): Promise<PublishPropertyResult>;
};

/**
 * WHY:   RED server functions should not embed direct Convex transport details.
 * WHAT:  Repository adapter for RED overview and property persistence through internal Convex functions.
 * HOW:   Calls internal Convex queries/mutations and returns stable DTOs to the RED server layer.
 */
export const convexRedZoneRepository: RedZoneRepository = {
  async getOverview(REDId) {
    return fetchQuery(redOverviewApi.countPropertiesByRedId as never, {
      REDId: REDId as never,
    } as never);
  },

  async listProperties(REDId, filters) {
    return fetchQuery(redPropertiesApi.listByRedId as never, {
      REDId: REDId as never,
      ...filters,
    } as never) as Promise<PaginatedPropertiesResult>;
  },

  async getProperty(id) {
    return fetchQuery(redPropertiesApi.getById as never, {
      id: id as never,
    } as never) as Promise<PropertyDetail | null>;
  },

  async createProperty(REDId, input) {
    return fetchMutation(redPropertiesApi.create as never, {
      REDId: REDId as never,
      ...input,
    } as never) as Promise<string>;
  },

  async updateProperty(id, patch) {
    await fetchMutation(redPropertiesApi.update as never, {
      id: id as never,
      ...patch,
    } as never);
  },

  async deleteProperty(id) {
    await fetchMutation(redPropertiesApi.remove as never, {
      id: id as never,
    } as never);
  },

  async publishProperty(id) {
    return fetchMutation(redPropertiesApi.publish as never, {
      id: id as never,
    } as never) as Promise<PublishPropertyResult>;
  },
};
