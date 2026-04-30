import { mutationRef, queryRef, voidMutationRef } from "@anan/convex-adapters/repository";
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
    return queryRef<Awaited<ReturnType<BrokerZoneRepository["getOverview"]>>>(
      token,
      brokerOverviewApi.countPropertiesByBrokerId,
      { brokerId },
    );
  },

  async listProperties(token, brokerId, filters) {
    return queryRef<Awaited<ReturnType<BrokerZoneRepository["listProperties"]>>>(
      token,
      brokerPropertiesApi.listByBrokerId,
      {
        brokerId,
        ...filters,
      },
    );
  },

  async getProperty(token, id) {
    return queryRef<Awaited<ReturnType<BrokerZoneRepository["getProperty"]>>>(
      token,
      brokerPropertiesApi.getById,
      { id },
    );
  },

  async createProperty(token, brokerId, input) {
    return mutationRef<Awaited<ReturnType<BrokerZoneRepository["createProperty"]>>>(
      token,
      brokerPropertiesApi.create,
      {
        brokerId,
        ...input,
      },
    );
  },

  async updateProperty(token, id, patch) {
    await voidMutationRef(token, brokerPropertiesApi.update, {
      id,
      ...patch,
    });
  },

  async deleteProperty(token, id) {
    await voidMutationRef(token, brokerPropertiesApi.remove, { id });
  },

  async publishProperty(token, id) {
    return mutationRef<Awaited<ReturnType<BrokerZoneRepository["publishProperty"]>>>(
      token,
      brokerPropertiesApi.publish,
      { id },
    );
  },
};
