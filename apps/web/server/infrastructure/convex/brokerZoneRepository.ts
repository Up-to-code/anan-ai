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
  getOverview(token: string, brokerId: string): Promise<BrokerOverviewSummary>;
  listProperties(token: string, brokerId: string, filters: PropertyListFilters): Promise<PaginatedPropertiesResult>;
  getProperty(token: string, id: string): Promise<PropertyDetail | null>;
  createProperty(token: string, brokerId: string, input: CreatePropertyInput): Promise<string>;
  updateProperty(token: string, id: string, patch: UpdatePropertyInput): Promise<void>;
  deleteProperty(token: string, id: string): Promise<void>;
  publishProperty(token: string, id: string): Promise<PublishPropertyResult>;
};

/**
 * WHY:   Broker server functions should not embed direct Convex transport details.
 * WHAT:  Repository adapter for broker overview and property persistence through internal Convex functions.
 * HOW:   Calls internal Convex queries/mutations and returns stable DTOs to the broker server layer.
 */
export const convexBrokerZoneRepository: BrokerZoneRepository = {
  async getOverview(token, brokerId) {
    return fetchQuery(brokerOverviewApi.countPropertiesByBrokerId as never, {
      brokerId: brokerId as never,
    } as never, { token });
  },

  async listProperties(token, brokerId, filters) {
    return fetchQuery(brokerPropertiesApi.listByBrokerId as never, {
      brokerId: brokerId as never,
      ...filters,
    } as never, { token }) as Promise<PaginatedPropertiesResult>;
  },

  async getProperty(token, id) {
    return fetchQuery(brokerPropertiesApi.getById as never, {
      id: id as never,
    } as never, { token }) as Promise<PropertyDetail | null>;
  },

  async createProperty(token, brokerId, input) {
    return fetchMutation(brokerPropertiesApi.create as never, {
      brokerId: brokerId as never,
      ...input,
    } as never, { token }) as Promise<string>;
  },

  async updateProperty(token, id, patch) {
    await fetchMutation(brokerPropertiesApi.update as never, {
      id: id as never,
      ...patch,
    } as never, { token });
  },

  async deleteProperty(token, id) {
    await fetchMutation(brokerPropertiesApi.remove as never, {
      id: id as never,
    } as never, { token });
  },

  async publishProperty(token, id) {
    return fetchMutation(brokerPropertiesApi.publish as never, {
      id: id as never,
    } as never, { token }) as Promise<PublishPropertyResult>;
  },
};
