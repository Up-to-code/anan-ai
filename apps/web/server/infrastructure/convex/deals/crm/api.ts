import { apiUnsafe } from "@/lib/convexApi";

export type CrmApiRefs = {
  listDealsByBrokerId: unknown;
  listDealsByRedId: unknown;
  listDealsPageByBrokerId: unknown;
  listDealsPageByRedId: unknown;
  listDealsByPropertyId: unknown;
  listClientsByBrokerId: unknown;
  listClientsByRedId: unknown;
  getClientById: unknown;
  listBrokerSelectorOptions: unknown;
  getDealById: unknown;
  createDeal: unknown;
  updateDeal: unknown;
  updateDealStage: unknown;
  updateDealFollowUp: unknown;
  updateDealNotes: unknown;
  archiveDeal: unknown;
  addDealDocument: unknown;
};

export const crmApi = apiUnsafe["shared_logic/crm/repositories"] as CrmApiRefs;
