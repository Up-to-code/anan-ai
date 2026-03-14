import { fetchMutation, fetchQuery } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";
import type {
  BrokerOverviewSummary,
  CreatePropertyInput,
  PaginatedPropertiesResult,
  PropertyDetail,
  PropertyListFilters,
  PublishPropertyResult,
  UpdatePropertyInput,
} from "@/server/contracts/properties";

type BrokerInternalRefs = {
  countPropertiesByBrokerId: unknown;
  listByBrokerId: unknown;
  getById: unknown;
  create: unknown;
  update: unknown;
  remove: unknown;
  publish: unknown;
};

const brokerOverviewApi = (apiUnsafe["broker_zone/overview"]) as BrokerInternalRefs;
const brokerPropertiesApi = (apiUnsafe["broker_zone/properties"]) as BrokerInternalRefs;

export type BrokerZoneRepository = {
  getOverview(brokerId: string): Promise<BrokerOverviewSummary>;
  listProperties(brokerId: string, filters: PropertyListFilters): Promise<PaginatedPropertiesResult>;
  getProperty(id: string): Promise<PropertyDetail | null>;
  createProperty(brokerId: string, input: CreatePropertyInput): Promise<string>;
  updateProperty(id: string, patch: UpdatePropertyInput): Promise<void>;
  deleteProperty(id: string): Promise<void>;
  publishProperty(id: string): Promise<PublishPropertyResult>;
};

/**
 * WHY:   Broker server functions should not embed direct Convex transport details.
 * WHAT:  Repository adapter for broker overview and property persistence through internal Convex functions.
 * HOW:   Calls internal Convex queries/mutations and returns stable DTOs to the broker server layer.
 */
export const convexBrokerZoneRepository: BrokerZoneRepository = {
  async getOverview(brokerId) {
    return fetchQuery(brokerOverviewApi.countPropertiesByBrokerId as never, {
      brokerId: brokerId as never,
    } as never);
  },

  async listProperties(brokerId, filters) {
    return fetchQuery(brokerPropertiesApi.listByBrokerId as never, {
      brokerId: brokerId as never,
      ...filters,
    } as never) as Promise<PaginatedPropertiesResult>;
  },

  async getProperty(id) {
    return fetchQuery(brokerPropertiesApi.getById as never, {
      id: id as never,
    } as never) as Promise<PropertyDetail | null>;
  },

  async createProperty(brokerId, input) {
    return fetchMutation(brokerPropertiesApi.create as never, {
      brokerId: brokerId as never,
      ...input,
    } as never) as Promise<string>;
  },

  async updateProperty(id, patch) {
    await fetchMutation(brokerPropertiesApi.update as never, {
      id: id as never,
      ...patch,
    } as never);
  },

  async deleteProperty(id) {
    await fetchMutation(brokerPropertiesApi.remove as never, {
      id: id as never,
    } as never);
  },

  async publishProperty(id) {
    return fetchMutation(brokerPropertiesApi.publish as never, {
      id: id as never,
    } as never) as Promise<PublishPropertyResult>;
  },
};
