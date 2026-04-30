import { publicMutationRef, publicQueryRef } from "@anan/convex-adapters/repository";
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
    const deals = await publicQueryRef<Awaited<ReturnType<CrmRepository["listByBrokerId"]>>>(
      crmApi.listDealsByBrokerId,
      { brokerId },
    );
    return deals.map(mapDealIds);
  },

  async listByRedId(redId) {
    const deals = await publicQueryRef<Awaited<ReturnType<CrmRepository["listByRedId"]>>>(
      crmApi.listDealsByRedId,
      { REDId: redId },
    );
    return deals.map(mapDealIds);
  },

  async listPageByBrokerId(brokerId, paginationOpts) {
    const result = await publicQueryRef<Awaited<ReturnType<CrmRepository["listPageByBrokerId"]>>>(
      crmApi.listDealsPageByBrokerId,
      {
        brokerId,
        paginationOpts,
      },
    );
    return mapPaginatedDeals(result);
  },

  async listPageByRedId(redId, paginationOpts) {
    const result = await publicQueryRef<Awaited<ReturnType<CrmRepository["listPageByRedId"]>>>(
      crmApi.listDealsPageByRedId,
      {
        REDId: redId,
        paginationOpts,
      },
    );
    return mapPaginatedDeals(result);
  },

  async listByPropertyId(propertyId) {
    const deals = await publicQueryRef<Awaited<ReturnType<CrmRepository["listByPropertyId"]>>>(
      crmApi.listDealsByPropertyId,
      { propertyId },
    );
    return deals.map(mapDealIds);
  },

  async listClientsByBrokerId(brokerId) {
    return publicQueryRef<Awaited<ReturnType<CrmRepository["listClientsByBrokerId"]>>>(
      crmApi.listClientsByBrokerId,
      { brokerId },
    );
  },

  async listClientsByRedId(redId) {
    return publicQueryRef<Awaited<ReturnType<CrmRepository["listClientsByRedId"]>>>(
      crmApi.listClientsByRedId,
      { REDId: redId },
    );
  },

  async getClientById(clientId) {
    return publicQueryRef<Awaited<ReturnType<CrmRepository["getClientById"]>>>(
      crmApi.getClientById,
      { clientId },
    );
  },

  async listBrokerSelectorOptions() {
    return publicQueryRef<Awaited<ReturnType<CrmRepository["listBrokerSelectorOptions"]>>>(
      crmApi.listBrokerSelectorOptions,
    );
  },

  async getById(dealId) {
    const deal = await publicQueryRef<Awaited<ReturnType<CrmRepository["getById"]>>>(
      crmApi.getDealById,
      { dealId },
    );
    return mapDealDetail(deal);
  },

  async create({ brokerId, redId, lastUpdatedBy, input }) {
    return publicMutationRef<Awaited<ReturnType<CrmRepository["create"]>>>(crmApi.createDeal, {
      ...input,
      propertyId: input.propertyId,
      crmClientId: input.crmClientId,
      relatedBrokerId: input.relatedBrokerId,
      brokerId,
      REDId: redId,
      lastUpdatedBy,
    });
  },

  async update({ lastUpdatedBy, dealId, title, description, value, nextFollowUpAt, stage, contactName, contactPhone, propertyId, relationType, crmClientId, relatedBrokerId, notes }) {
    await publicMutationRef(crmApi.updateDeal, {
      dealId,
      title,
      description,
      value,
      nextFollowUpAt,
      stage,
      relationType,
      crmClientId,
      relatedBrokerId,
      contactName,
      contactPhone,
      propertyId,
      notes,
      lastUpdatedBy,
    });
  },

  async updateStage({ lastUpdatedBy, dealId, stage }) {
    await publicMutationRef(crmApi.updateDealStage, {
      dealId,
      stage,
      lastUpdatedBy,
    });
  },

  async updateFollowUp({ lastUpdatedBy, dealId, nextFollowUpAt }) {
    await publicMutationRef(crmApi.updateDealFollowUp, {
      dealId,
      nextFollowUpAt,
      lastUpdatedBy,
    });
  },

  async updateNotes({ lastUpdatedBy, dealId, notes }) {
    await publicMutationRef(crmApi.updateDealNotes, {
      dealId,
      notes,
      lastUpdatedBy,
    });
  },

  async archive({ archivedAt, lastUpdatedBy, dealId }) {
    await publicMutationRef(crmApi.archiveDeal, {
      dealId,
      archivedAt,
      archivedBy: lastUpdatedBy,
      lastUpdatedBy,
    });
  },

  async addDocument({ lastUpdatedBy, dealId, document }) {
    await publicMutationRef(crmApi.addDealDocument, {
      dealId,
      document,
      lastUpdatedBy,
    });
  },
};
