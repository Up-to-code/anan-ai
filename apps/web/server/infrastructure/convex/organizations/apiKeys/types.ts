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
