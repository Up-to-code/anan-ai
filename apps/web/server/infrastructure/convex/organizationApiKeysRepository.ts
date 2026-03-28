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
  listClientsByApiKey(secretHash: string, now: number): Promise<OrgApiClientRecord[]>;
  createClientByApiKey(secretHash: string, input: OrgApiClientInput, now: number): Promise<OrgApiClientRecord>;
  updateClientByApiKey(secretHash: string, clientId: string, input: OrgApiClientUpdateInput, now: number): Promise<OrgApiClientRecord>;
  deleteClientByApiKey(secretHash: string, clientId: string, now: number): Promise<void>;
  listPropertiesByApiKey(secretHash: string, now: number): Promise<OrgApiPropertyRecord[]>;
  createPropertyByApiKey(secretHash: string, input: OrgApiPropertyInput, now: number): Promise<OrgApiPropertyRecord>;
  updatePropertyByApiKey(secretHash: string, propertyId: string, input: OrgApiPropertyUpdateInput, now: number): Promise<OrgApiPropertyRecord>;
  deletePropertyByApiKey(secretHash: string, propertyId: string, now: number): Promise<void>;
  listDealsByApiKey(secretHash: string, now: number): Promise<OrgApiDealRecord[]>;
  createDealByApiKey(secretHash: string, input: OrgApiDealInput, now: number): Promise<OrgApiDealRecord>;
  updateDealByApiKey(secretHash: string, dealId: string, input: OrgApiDealUpdateInput, now: number): Promise<OrgApiDealRecord>;
  deleteDealByApiKey(secretHash: string, dealId: string, now: number): Promise<void>;
  listBrokersByApiKey(secretHash: string, now: number): Promise<OrgApiBrokerRecord[]>;
  getBrokerByApiKey(secretHash: string, brokerId: string, now: number): Promise<OrgApiBrokerRecord>;
};

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

  async listClientsByApiKey(secretHash, now) {
    const response = await fetchMutation(agenciesApi.listClientsByApiKey as never, { secretHash, now } as never);
    return (response as { clients: OrgApiClientRecord[] }).clients;
  },

  async createClientByApiKey(secretHash, input, now) {
    const response = await fetchMutation(agenciesApi.createClientByApiKey as never, { secretHash, now, ...input } as never);
    return (response as { client: OrgApiClientRecord }).client;
  },

  async updateClientByApiKey(secretHash, clientId, input, now) {
    const response = await fetchMutation(agenciesApi.updateClientByApiKey as never, {
      secretHash,
      now,
      clientId,
      ...input,
    } as never);
    return (response as { client: OrgApiClientRecord }).client;
  },

  async deleteClientByApiKey(secretHash, clientId, now) {
    await fetchMutation(agenciesApi.deleteClientByApiKey as never, { secretHash, now, clientId } as never);
  },

  async listPropertiesByApiKey(secretHash, now) {
    const response = await fetchMutation(agenciesApi.listPropertiesByApiKey as never, { secretHash, now } as never);
    return (response as { properties: OrgApiPropertyRecord[] }).properties;
  },

  async createPropertyByApiKey(secretHash, input, now) {
    const response = await fetchMutation(agenciesApi.createPropertyByApiKey as never, { secretHash, now, ...input } as never);
    return (response as { property: OrgApiPropertyRecord }).property;
  },

  async updatePropertyByApiKey(secretHash, propertyId, input, now) {
    const response = await fetchMutation(agenciesApi.updatePropertyByApiKey as never, {
      secretHash,
      now,
      propertyId,
      ...input,
    } as never);
    return (response as { property: OrgApiPropertyRecord }).property;
  },

  async deletePropertyByApiKey(secretHash, propertyId, now) {
    await fetchMutation(agenciesApi.deletePropertyByApiKey as never, { secretHash, now, propertyId } as never);
  },

  async listDealsByApiKey(secretHash, now) {
    const response = await fetchMutation(agenciesApi.listDealsByApiKey as never, { secretHash, now } as never);
    return (response as { deals: OrgApiDealRecord[] }).deals;
  },

  async createDealByApiKey(secretHash, input, now) {
    const response = await fetchMutation(agenciesApi.createDealByApiKey as never, { secretHash, now, ...input } as never);
    return (response as { deal: OrgApiDealRecord }).deal;
  },

  async updateDealByApiKey(secretHash, dealId, input, now) {
    const response = await fetchMutation(agenciesApi.updateDealByApiKey as never, {
      secretHash,
      now,
      dealId,
      ...input,
    } as never);
    return (response as { deal: OrgApiDealRecord }).deal;
  },

  async deleteDealByApiKey(secretHash, dealId, now) {
    await fetchMutation(agenciesApi.deleteDealByApiKey as never, { secretHash, now, dealId } as never);
  },

  async listBrokersByApiKey(secretHash, now) {
    const response = await fetchMutation(agenciesApi.listBrokersByApiKey as never, { secretHash, now } as never);
    return (response as { brokers: OrgApiBrokerRecord[] }).brokers;
  },

  async getBrokerByApiKey(secretHash, brokerId, now) {
    const response = await fetchMutation(agenciesApi.getBrokerByApiKey as never, { secretHash, now, brokerId } as never);
    return (response as { broker: OrgApiBrokerRecord }).broker;
  },
};
