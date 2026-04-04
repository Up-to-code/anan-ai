import { fetchMutation, fetchQuery } from "convex/nextjs";
import { crmApi } from "./api";
import { mapDealDetail, mapDealIds, mapPaginatedDeals } from "./mappers";
import type { CrmRepository } from "./types";

export type { CrmRepository } from "./types";

/**
 * WHY:   CRM server functions should not know about Convex transport or internal module paths.
 * WHAT:  Repository adapter for owner-scoped deal CRUD through internal Convex functions.
 * HOW:   Calls internal queries and mutations with resolved ids and returns stable deal DTOs.
 */
export const convexCrmRepository: CrmRepository = {
  async listByBrokerId(brokerId) {
    const deals = (await fetchQuery(crmApi.listDealsByBrokerId as never, {
      brokerId: brokerId as never,
    } as never)) as Awaited<ReturnType<CrmRepository["listByBrokerId"]>>;
    return deals.map(mapDealIds);
  },

  async listByRedId(redId) {
    const deals = (await fetchQuery(crmApi.listDealsByRedId as never, {
      REDId: redId as never,
    })) as Awaited<ReturnType<CrmRepository["listByRedId"]>>;
    return deals.map(mapDealIds);
  },

  async listPageByBrokerId(brokerId, paginationOpts) {
    const result = (await fetchQuery(crmApi.listDealsPageByBrokerId as never, {
      brokerId: brokerId as never,
      paginationOpts,
    } as never)) as Awaited<ReturnType<CrmRepository["listPageByBrokerId"]>>;
    return mapPaginatedDeals(result);
  },

  async listPageByRedId(redId, paginationOpts) {
    const result = (await fetchQuery(crmApi.listDealsPageByRedId as never, {
      REDId: redId as never,
      paginationOpts,
    } as never)) as Awaited<ReturnType<CrmRepository["listPageByRedId"]>>;
    return mapPaginatedDeals(result);
  },

  async listByPropertyId(propertyId) {
    const deals = (await fetchQuery(crmApi.listDealsByPropertyId as never, {
      propertyId: propertyId as never,
    })) as Awaited<ReturnType<CrmRepository["listByPropertyId"]>>;
    return deals.map(mapDealIds);
  },

  async listClientsByBrokerId(brokerId) {
    return (await fetchQuery(crmApi.listClientsByBrokerId as never, {
      brokerId: brokerId as never,
    } as never)) as ReturnType<CrmRepository["listClientsByBrokerId"]>;
  },

  async listClientsByRedId(redId) {
    return (await fetchQuery(crmApi.listClientsByRedId as never, {
      REDId: redId as never,
    } as never)) as ReturnType<CrmRepository["listClientsByRedId"]>;
  },

  async getClientById(clientId) {
    return (await fetchQuery(crmApi.getClientById as never, {
      clientId: clientId as never,
    } as never)) as ReturnType<CrmRepository["getClientById"]>;
  },

  async listBrokerSelectorOptions() {
    return (await fetchQuery(crmApi.listBrokerSelectorOptions as never, {} as never)) as ReturnType<CrmRepository["listBrokerSelectorOptions"]>;
  },

  async getById(dealId) {
    const deal = (await fetchQuery(crmApi.getDealById as never, {
      dealId: dealId as never,
    })) as Awaited<ReturnType<CrmRepository["getById"]>>;
    return mapDealDetail(deal);
  },

  async create({ brokerId, redId, lastUpdatedBy, input }) {
    return fetchMutation(crmApi.createDeal as never, {
      ...input,
      propertyId: input.propertyId as never,
      crmClientId: input.crmClientId as never,
      relatedBrokerId: input.relatedBrokerId as never,
      brokerId: brokerId as never,
      REDId: redId as never,
      lastUpdatedBy,
    } as never) as ReturnType<CrmRepository["create"]>;
  },

  async update({ lastUpdatedBy, dealId, title, description, value, nextFollowUpAt, stage, contactName, contactPhone, propertyId, relationType, crmClientId, relatedBrokerId, notes }) {
    await fetchMutation(crmApi.updateDeal as never, {
      dealId: dealId as never,
      title,
      description,
      value,
      nextFollowUpAt,
      stage,
      relationType,
      crmClientId: crmClientId as never,
      relatedBrokerId: relatedBrokerId as never,
      contactName,
      contactPhone,
      propertyId: propertyId as never,
      notes,
      lastUpdatedBy,
    } as never);
  },

  async updateStage({ lastUpdatedBy, dealId, stage }) {
    await fetchMutation(crmApi.updateDealStage as never, {
      dealId: dealId as never,
      stage,
      lastUpdatedBy,
    } as never);
  },

  async updateFollowUp({ lastUpdatedBy, dealId, nextFollowUpAt }) {
    await fetchMutation(crmApi.updateDealFollowUp as never, {
      dealId: dealId as never,
      nextFollowUpAt,
      lastUpdatedBy,
    } as never);
  },

  async updateNotes({ lastUpdatedBy, dealId, notes }) {
    await fetchMutation(crmApi.updateDealNotes as never, {
      dealId: dealId as never,
      notes,
      lastUpdatedBy,
    } as never);
  },

  async archive({ archivedAt, lastUpdatedBy, dealId }) {
    await fetchMutation(crmApi.archiveDeal as never, {
      dealId: dealId as never,
      archivedAt,
      archivedBy: lastUpdatedBy,
      lastUpdatedBy,
    } as never);
  },

  async addDocument({ lastUpdatedBy, dealId, document }) {
    await fetchMutation(crmApi.addDealDocument as never, {
      dealId: dealId as never,
      document: document as never,
      lastUpdatedBy,
    } as never);
  },
};
