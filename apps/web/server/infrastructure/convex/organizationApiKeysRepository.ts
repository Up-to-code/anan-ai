import { fetchMutation, fetchQuery } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";
import type {
  CreateOrganizationApiKeyInput,
  OrganizationApiKeySummary,
} from "@/server/contracts/organizationApiKeys";
import type {
  OrgApiBrokerRecord,
  OrgApiClientInput,
  OrgApiClientRecord,
  OrgApiClientUpdateInput,
  OrgApiDealInput,
  OrgApiDealRecord,
  OrgApiDealUpdateInput,
  OrgApiPropertyInput,
  OrgApiPropertyRecord,
  OrgApiPropertyUpdateInput,
} from "@/server/contracts/orgApi";

type AgenciesApiRefs = {
  listCurrentOrganizationApiKeys: unknown;
  createCurrentOrganizationApiKey: unknown;
  revokeCurrentOrganizationApiKey: unknown;
  listClientsByApiKey: unknown;
  createClientByApiKey: unknown;
  updateClientByApiKey: unknown;
  deleteClientByApiKey: unknown;
  listPropertiesByApiKey: unknown;
  createPropertyByApiKey: unknown;
  updatePropertyByApiKey: unknown;
  deletePropertyByApiKey: unknown;
  listDealsByApiKey: unknown;
  createDealByApiKey: unknown;
  updateDealByApiKey: unknown;
  deleteDealByApiKey: unknown;
  listBrokersByApiKey: unknown;
  getBrokerByApiKey: unknown;
};

const agenciesApi = apiUnsafe["shared_logic/agencies/repositories/apiKeys"] as AgenciesApiRefs;

export type OrganizationApiKeysRepository = {
  listCurrentOrganizationApiKeys(token: string): Promise<OrganizationApiKeySummary[]>;
  createCurrentOrganizationApiKey(
    token: string,
    input: CreateOrganizationApiKeyInput & { keyId: string; prefix: string; secretHash: string; now: number },
  ): Promise<OrganizationApiKeySummary>;
  revokeCurrentOrganizationApiKey(token: string, keyId: string, now: number): Promise<void>;
  listClientsByApiKey(secretHash: string, now: number, origin?: string): Promise<OrgApiClientRecord[]>;
  createClientByApiKey(secretHash: string, input: OrgApiClientInput, now: number, origin?: string): Promise<OrgApiClientRecord>;
  updateClientByApiKey(secretHash: string, clientId: string, input: OrgApiClientUpdateInput, now: number, origin?: string): Promise<OrgApiClientRecord>;
  deleteClientByApiKey(secretHash: string, clientId: string, now: number, origin?: string): Promise<void>;
  listPropertiesByApiKey(secretHash: string, now: number, origin?: string): Promise<OrgApiPropertyRecord[]>;
  createPropertyByApiKey(secretHash: string, input: OrgApiPropertyInput, now: number, origin?: string): Promise<OrgApiPropertyRecord>;
  updatePropertyByApiKey(secretHash: string, propertyId: string, input: OrgApiPropertyUpdateInput, now: number, origin?: string): Promise<OrgApiPropertyRecord>;
  deletePropertyByApiKey(secretHash: string, propertyId: string, now: number, origin?: string): Promise<void>;
  listDealsByApiKey(secretHash: string, now: number, origin?: string): Promise<OrgApiDealRecord[]>;
  createDealByApiKey(secretHash: string, input: OrgApiDealInput, now: number, origin?: string): Promise<OrgApiDealRecord>;
  updateDealByApiKey(secretHash: string, dealId: string, input: OrgApiDealUpdateInput, now: number, origin?: string): Promise<OrgApiDealRecord>;
  deleteDealByApiKey(secretHash: string, dealId: string, now: number, origin?: string): Promise<void>;
  listBrokersByApiKey(secretHash: string, now: number, origin?: string): Promise<OrgApiBrokerRecord[]>;
  getBrokerByApiKey(secretHash: string, brokerId: string, now: number, origin?: string): Promise<OrgApiBrokerRecord>;
};

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
    return fetchQuery(agenciesApi.listCurrentOrganizationApiKeys as never, {} as never, { token }) as Promise<OrganizationApiKeySummary[]>;
  },

  async createCurrentOrganizationApiKey(token, input) {
    return fetchMutation(agenciesApi.createCurrentOrganizationApiKey as never, input as never, { token }) as Promise<OrganizationApiKeySummary>;
  },

  async revokeCurrentOrganizationApiKey(token, keyId, now) {
    await fetchMutation(agenciesApi.revokeCurrentOrganizationApiKey as never, { keyId, now } as never, { token });
  },

  async listClientsByApiKey(secretHash, now, origin) {
    const response = await fetchMutation(
      agenciesApi.listClientsByApiKey as never,
      withOptionalOrigin({ secretHash, now }, origin) as never,
    );
    return (response as { clients: OrgApiClientRecord[] }).clients;
  },

  async createClientByApiKey(secretHash, input, now, origin) {
    const response = await fetchMutation(
      agenciesApi.createClientByApiKey as never,
      withOptionalOrigin({ secretHash, now, ...input }, origin) as never,
    );
    return (response as { client: OrgApiClientRecord }).client;
  },

  async updateClientByApiKey(secretHash, clientId, input, now, origin) {
    const response = await fetchMutation(agenciesApi.updateClientByApiKey as never, {
      ...withOptionalOrigin({ secretHash, now, clientId, ...input }, origin),
    } as never);
    return (response as { client: OrgApiClientRecord }).client;
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
    return (response as { properties: OrgApiPropertyRecord[] }).properties;
  },

  async createPropertyByApiKey(secretHash, input, now, origin) {
    const response = await fetchMutation(
      agenciesApi.createPropertyByApiKey as never,
      withOptionalOrigin({ secretHash, now, ...input }, origin) as never,
    );
    return (response as { property: OrgApiPropertyRecord }).property;
  },

  async updatePropertyByApiKey(secretHash, propertyId, input, now, origin) {
    const response = await fetchMutation(agenciesApi.updatePropertyByApiKey as never, {
      ...withOptionalOrigin({ secretHash, now, propertyId, ...input }, origin),
    } as never);
    return (response as { property: OrgApiPropertyRecord }).property;
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
    return (response as { deals: OrgApiDealRecord[] }).deals;
  },

  async createDealByApiKey(secretHash, input, now, origin) {
    const response = await fetchMutation(
      agenciesApi.createDealByApiKey as never,
      withOptionalOrigin({ secretHash, now, ...input }, origin) as never,
    );
    return (response as { deal: OrgApiDealRecord }).deal;
  },

  async updateDealByApiKey(secretHash, dealId, input, now, origin) {
    const response = await fetchMutation(agenciesApi.updateDealByApiKey as never, {
      ...withOptionalOrigin({ secretHash, now, dealId, ...input }, origin),
    } as never);
    return (response as { deal: OrgApiDealRecord }).deal;
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
    return (response as { brokers: OrgApiBrokerRecord[] }).brokers;
  },

  async getBrokerByApiKey(secretHash, brokerId, now, origin) {
    const response = await fetchMutation(
      agenciesApi.getBrokerByApiKey as never,
      withOptionalOrigin({ secretHash, now, brokerId }, origin) as never,
    );
    return (response as { broker: OrgApiBrokerRecord }).broker;
  },
};
