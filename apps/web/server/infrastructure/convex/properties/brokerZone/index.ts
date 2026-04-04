import { fetchMutation, fetchQuery } from "convex/nextjs";
import { brokerOverviewApi, brokerPropertiesApi } from "./api";
import type { BrokerZoneRepository } from "./types";

export type { BrokerZoneRepository } from "./types";

/**
 * WHY:   Broker server functions should not embed direct Convex transport details.
 * WHAT:  Repository adapter for broker overview and property persistence through internal Convex functions.
 * HOW:   Calls internal Convex queries/mutations and returns stable DTOs to the broker server layer.
 */
export const convexBrokerZoneRepository: BrokerZoneRepository = {
  async getOverview(token, brokerId) {
    return fetchQuery(brokerOverviewApi.countPropertiesByBrokerId as never, {
      brokerId: brokerId as never,
    } as never, { token }) as ReturnType<BrokerZoneRepository["getOverview"]>;
  },

  async listProperties(token, brokerId, filters) {
    return fetchQuery(brokerPropertiesApi.listByBrokerId as never, {
      brokerId: brokerId as never,
      ...filters,
    } as never, { token }) as ReturnType<BrokerZoneRepository["listProperties"]>;
  },

  async getProperty(token, id) {
    return fetchQuery(brokerPropertiesApi.getById as never, {
      id: id as never,
    } as never, { token }) as ReturnType<BrokerZoneRepository["getProperty"]>;
  },

  async createProperty(token, brokerId, input) {
    return fetchMutation(brokerPropertiesApi.create as never, {
      brokerId: brokerId as never,
      ...input,
    } as never, { token }) as ReturnType<BrokerZoneRepository["createProperty"]>;
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
    } as never, { token }) as ReturnType<BrokerZoneRepository["publishProperty"]>;
  },
};
