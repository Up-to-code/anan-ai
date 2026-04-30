import { mutationRef, publicMutationRef, queryRef, voidMutationRef, withOptionalOrigin } from "@anan/convex-adapters/repository";
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

/**
 * WHY:   Organization API keys need the same repository boundary as the rest of the web server layer.
 * WHAT:  Convex-backed repository for manager-facing key management and machine API resource access.
 * HOW:   Uses the shared agencies repository surface for session-bound management flows and hash-authenticated machine operations.
 */
export const convexOrganizationApiKeysRepository: OrganizationApiKeysRepository = {
  async listCurrentOrganizationApiKeys(token) {
    return queryRef<Awaited<ReturnType<OrganizationApiKeysRepository["listCurrentOrganizationApiKeys"]>>>(
      token,
      agenciesApi.listCurrentOrganizationApiKeys,
    );
  },

  async createCurrentOrganizationApiKey(token, input) {
    return mutationRef<Awaited<ReturnType<OrganizationApiKeysRepository["createCurrentOrganizationApiKey"]>>>(
      token,
      agenciesApi.createCurrentOrganizationApiKey,
      input,
    );
  },

  async revokeCurrentOrganizationApiKey(token, keyId, now) {
    await voidMutationRef(token, agenciesApi.revokeCurrentOrganizationApiKey, { keyId, now });
  },

  async listClientsByApiKey(secretHash, now, origin) {
    const response = await publicMutationRef(agenciesApi.listClientsByApiKey, withOptionalOrigin({ secretHash, now }, origin));
    return unwrapClients(response);
  },

  async createClientByApiKey(secretHash, input, now, origin) {
    const response = await publicMutationRef(
      agenciesApi.createClientByApiKey,
      withOptionalOrigin({ secretHash, now, ...input }, origin),
    );
    return unwrapClient(response);
  },

  async updateClientByApiKey(secretHash, clientId, input, now, origin) {
    const response = await publicMutationRef(agenciesApi.updateClientByApiKey, {
      ...withOptionalOrigin({ secretHash, now, clientId, ...input }, origin),
    });
    return unwrapClient(response);
  },

  async deleteClientByApiKey(secretHash, clientId, now, origin) {
    await publicMutationRef(agenciesApi.deleteClientByApiKey, withOptionalOrigin({ secretHash, now, clientId }, origin));
  },

  async listPropertiesByApiKey(secretHash, now, origin) {
    const response = await publicMutationRef(agenciesApi.listPropertiesByApiKey, withOptionalOrigin({ secretHash, now }, origin));
    return unwrapProperties(response);
  },

  async createPropertyByApiKey(secretHash, input, now, origin) {
    const response = await publicMutationRef(
      agenciesApi.createPropertyByApiKey,
      withOptionalOrigin({ secretHash, now, ...input }, origin),
    );
    return unwrapProperty(response);
  },

  async updatePropertyByApiKey(secretHash, propertyId, input, now, origin) {
    const response = await publicMutationRef(agenciesApi.updatePropertyByApiKey, {
      ...withOptionalOrigin({ secretHash, now, propertyId, ...input }, origin),
    });
    return unwrapProperty(response);
  },

  async deletePropertyByApiKey(secretHash, propertyId, now, origin) {
    await publicMutationRef(agenciesApi.deletePropertyByApiKey, withOptionalOrigin({ secretHash, now, propertyId }, origin));
  },

  async listDealsByApiKey(secretHash, now, origin) {
    const response = await publicMutationRef(agenciesApi.listDealsByApiKey, withOptionalOrigin({ secretHash, now }, origin));
    return unwrapDeals(response);
  },

  async createDealByApiKey(secretHash, input, now, origin) {
    const response = await publicMutationRef(agenciesApi.createDealByApiKey, withOptionalOrigin({ secretHash, now, ...input }, origin));
    return unwrapDeal(response);
  },

  async updateDealByApiKey(secretHash, dealId, input, now, origin) {
    const response = await publicMutationRef(agenciesApi.updateDealByApiKey, {
      ...withOptionalOrigin({ secretHash, now, dealId, ...input }, origin),
    });
    return unwrapDeal(response);
  },

  async deleteDealByApiKey(secretHash, dealId, now, origin) {
    await publicMutationRef(agenciesApi.deleteDealByApiKey, withOptionalOrigin({ secretHash, now, dealId }, origin));
  },

  async listBrokersByApiKey(secretHash, now, origin) {
    const response = await publicMutationRef(agenciesApi.listBrokersByApiKey, withOptionalOrigin({ secretHash, now }, origin));
    return unwrapBrokers(response);
  },

  async getBrokerByApiKey(secretHash, brokerId, now, origin) {
    const response = await publicMutationRef(agenciesApi.getBrokerByApiKey, withOptionalOrigin({ secretHash, now, brokerId }, origin));
    return unwrapBroker(response);
  },
};
