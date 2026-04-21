import { fetchMutation, fetchQuery } from "convex/nextjs";
import { agenciesApi } from "./api";
import {
  unwrapBroker,
  unwrapBrokers,
  unwrapClient,
  unwrapClients,
  unwrapDeal,
  unwrapDeals,
  unwrapProperties,
  unwrapProperty,
} from "./mappers";
import type { OrganizationApiKeysRepository } from "./types";

export type { OrganizationApiKeysRepository } from "./types";

function withOptionalOrigin<T extends Record<string, unknown>>(payload: T, origin?: string) {
  if (origin === undefined) {
    return payload;
  }
  return { ...payload, origin };
}

/**
 * WHY:   Organization API keys need the same repository boundary as the rest of the web server layer.
 * WHAT:  Convex-backed repository for manager-facing key management and machine API resource access.
 * HOW:   Uses the shared agencies repository surface for session-bound management flows and hash-authenticated machine operations.
 */
export const convexOrganizationApiKeysRepository: OrganizationApiKeysRepository = {
  async listCurrentOrganizationApiKeys(token) {
    return fetchQuery(agenciesApi.listCurrentOrganizationApiKeys as never, {} as never, { token }) as ReturnType<
      OrganizationApiKeysRepository["listCurrentOrganizationApiKeys"]
    >;
  },

  async createCurrentOrganizationApiKey(token, input) {
    return fetchMutation(agenciesApi.createCurrentOrganizationApiKey as never, input as never, { token }) as ReturnType<
      OrganizationApiKeysRepository["createCurrentOrganizationApiKey"]
    >;
  },

  async revokeCurrentOrganizationApiKey(token, keyId, now) {
    await fetchMutation(agenciesApi.revokeCurrentOrganizationApiKey as never, { keyId, now } as never, { token });
  },

  async listClientsByApiKey(secretHash, now, origin) {
    const response = await fetchMutation(
      agenciesApi.listClientsByApiKey as never,
      withOptionalOrigin({ secretHash, now }, origin) as never,
    );
    return unwrapClients(response);
  },

  async createClientByApiKey(secretHash, input, now, origin) {
    const response = await fetchMutation(
      agenciesApi.createClientByApiKey as never,
      withOptionalOrigin({ secretHash, now, ...input }, origin) as never,
    );
    return unwrapClient(response);
  },

  async updateClientByApiKey(secretHash, clientId, input, now, origin) {
    const response = await fetchMutation(agenciesApi.updateClientByApiKey as never, {
      ...withOptionalOrigin({ secretHash, now, clientId, ...input }, origin),
    } as never);
    return unwrapClient(response);
  },

  async deleteClientByApiKey(secretHash, clientId, now, origin) {
    await fetchMutation(
      agenciesApi.deleteClientByApiKey as never,
      withOptionalOrigin({ secretHash, now, clientId }, origin) as never,
    );
  },

  async listPropertiesByApiKey(secretHash, now, origin) {
    const response = await fetchMutation(
      agenciesApi.listPropertiesByApiKey as never,
      withOptionalOrigin({ secretHash, now }, origin) as never,
    );
    return unwrapProperties(response);
  },

  async createPropertyByApiKey(secretHash, input, now, origin) {
    const response = await fetchMutation(
      agenciesApi.createPropertyByApiKey as never,
      withOptionalOrigin({ secretHash, now, ...input }, origin) as never,
    );
    return unwrapProperty(response);
  },

  async updatePropertyByApiKey(secretHash, propertyId, input, now, origin) {
    const response = await fetchMutation(agenciesApi.updatePropertyByApiKey as never, {
      ...withOptionalOrigin({ secretHash, now, propertyId, ...input }, origin),
    } as never);
    return unwrapProperty(response);
  },

  async deletePropertyByApiKey(secretHash, propertyId, now, origin) {
    await fetchMutation(
      agenciesApi.deletePropertyByApiKey as never,
      withOptionalOrigin({ secretHash, now, propertyId }, origin) as never,
    );
  },

  async listDealsByApiKey(secretHash, now, origin) {
    const response = await fetchMutation(
      agenciesApi.listDealsByApiKey as never,
      withOptionalOrigin({ secretHash, now }, origin) as never,
    );
    return unwrapDeals(response);
  },

  async createDealByApiKey(secretHash, input, now, origin) {
    const response = await fetchMutation(
      agenciesApi.createDealByApiKey as never,
      withOptionalOrigin({ secretHash, now, ...input }, origin) as never,
    );
    return unwrapDeal(response);
  },

  async updateDealByApiKey(secretHash, dealId, input, now, origin) {
    const response = await fetchMutation(agenciesApi.updateDealByApiKey as never, {
      ...withOptionalOrigin({ secretHash, now, dealId, ...input }, origin),
    } as never);
    return unwrapDeal(response);
  },

  async deleteDealByApiKey(secretHash, dealId, now, origin) {
    await fetchMutation(
      agenciesApi.deleteDealByApiKey as never,
      withOptionalOrigin({ secretHash, now, dealId }, origin) as never,
    );
  },

  async listBrokersByApiKey(secretHash, now, origin) {
    const response = await fetchMutation(
      agenciesApi.listBrokersByApiKey as never,
      withOptionalOrigin({ secretHash, now }, origin) as never,
    );
    return unwrapBrokers(response);
  },

  async getBrokerByApiKey(secretHash, brokerId, now, origin) {
    const response = await fetchMutation(
      agenciesApi.getBrokerByApiKey as never,
      withOptionalOrigin({ secretHash, now, brokerId }, origin) as never,
    );
    return unwrapBroker(response);
  },
};
