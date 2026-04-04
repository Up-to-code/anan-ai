import { apiUnsafe } from "@/lib/convexApi";

export type AgenciesApiRefs = {
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

export const agenciesApi = apiUnsafe["shared_logic/agencies/repositories/apiKeys"] as AgenciesApiRefs;
