import { fetchMutation, fetchQuery } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";
import type {
  AddDealDocumentInput,
  ArchiveDealInput,
  CreateDealInput,
  DealClientPreview,
  DealDetail,
  DealSelectorBroker,
  DealSelectorClient,
  DealSummary,
  PaginatedDealsResult,
  UpdateDealInput,
  UpdateDealFollowUpInput,
  UpdateDealNotesInput,
  UpdateDealStageInput,
} from "@/server/contracts/deals";

type CrmApiRefs = {
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

const crmApi = (apiUnsafe[
  "shared_logic/crm/repositories"
]) as CrmApiRefs;

export type CrmRepository = {
  listByBrokerId(brokerId: string): Promise<DealSummary[]>;
  listByRedId(redId: string): Promise<DealSummary[]>;
  listPageByBrokerId(brokerId: string, paginationOpts: { cursor: string | null; numItems: number }): Promise<PaginatedDealsResult>;
  listPageByRedId(redId: string, paginationOpts: { cursor: string | null; numItems: number }): Promise<PaginatedDealsResult>;
  listByPropertyId(propertyId: string): Promise<DealSummary[]>;
  listClientsByBrokerId(brokerId: string): Promise<DealSelectorClient[]>;
  listClientsByRedId(redId: string): Promise<DealSelectorClient[]>;
  getClientById(clientId: string): Promise<DealClientPreview | null>;
  listBrokerSelectorOptions(): Promise<DealSelectorBroker[]>;
  getById(dealId: string): Promise<DealDetail | null>;
  create(args: {
    brokerId?: string;
    redId?: string;
    lastUpdatedBy: string;
    input: CreateDealInput;
  }): Promise<string>;
  update(args: { lastUpdatedBy: string } & UpdateDealInput): Promise<void>;
  updateStage(args: { lastUpdatedBy: string } & UpdateDealStageInput): Promise<void>;
  updateFollowUp(args: { lastUpdatedBy: string } & UpdateDealFollowUpInput): Promise<void>;
  updateNotes(args: { lastUpdatedBy: string } & UpdateDealNotesInput): Promise<void>;
  archive(args: { archivedAt: number; lastUpdatedBy: string } & ArchiveDealInput): Promise<void>;
  addDocument(args: { lastUpdatedBy: string } & AddDealDocumentInput): Promise<void>;
};

function mapDealIds<T extends { id?: string; REDId?: string; brokerId?: string; propertyId?: string; offerId?: string }>(
  deal: T,
) {
  return {
    ...deal,
    redId: deal.REDId,
  };
}

function mapPaginatedDeals(result: PaginatedDealsResult): PaginatedDealsResult {
  return {
    ...result,
    page: result.page.map(mapDealIds),
  };
}

/**
 * WHY:   CRM server functions should not know about Convex transport or internal module paths.
 * WHAT:  Repository adapter for owner-scoped deal CRUD through internal Convex functions.
 * HOW:   Calls internal queries and mutations with resolved ids and returns stable deal DTOs.
 */
export const convexCrmRepository: CrmRepository = {
  async listByBrokerId(brokerId) {
    const deals = (await fetchQuery(crmApi.listDealsByBrokerId as never, {
      brokerId: brokerId as never,
    } as never)) as DealSummary[];
    return deals.map(mapDealIds);
  },

  async listByRedId(redId) {
    const deals = (await fetchQuery(crmApi.listDealsByRedId as never, {
      REDId: redId as never,
    })) as DealSummary[];
    return deals.map(mapDealIds);
  },

  async listPageByBrokerId(brokerId, paginationOpts) {
    const result = (await fetchQuery(crmApi.listDealsPageByBrokerId as never, {
      brokerId: brokerId as never,
      paginationOpts,
    } as never)) as PaginatedDealsResult;
    return mapPaginatedDeals(result);
  },

  async listPageByRedId(redId, paginationOpts) {
    const result = (await fetchQuery(crmApi.listDealsPageByRedId as never, {
      REDId: redId as never,
      paginationOpts,
    } as never)) as PaginatedDealsResult;
    return mapPaginatedDeals(result);
  },

  async listByPropertyId(propertyId) {
    const deals = (await fetchQuery(crmApi.listDealsByPropertyId as never, {
      propertyId: propertyId as never,
    })) as DealSummary[];
    return deals.map(mapDealIds);
  },

  async listClientsByBrokerId(brokerId) {
    return (await fetchQuery(crmApi.listClientsByBrokerId as never, {
      brokerId: brokerId as never,
    } as never)) as DealSelectorClient[];
  },

  async listClientsByRedId(redId) {
    return (await fetchQuery(crmApi.listClientsByRedId as never, {
      REDId: redId as never,
    } as never)) as DealSelectorClient[];
  },

  async getClientById(clientId) {
    return (await fetchQuery(crmApi.getClientById as never, {
      clientId: clientId as never,
    } as never)) as DealClientPreview | null;
  },

  async listBrokerSelectorOptions() {
    return (await fetchQuery(crmApi.listBrokerSelectorOptions as never, {} as never)) as DealSelectorBroker[];
  },

  async getById(dealId) {
    const deal = (await fetchQuery(crmApi.getDealById as never, {
      dealId: dealId as never,
    })) as DealDetail | null;
    return deal ? mapDealIds(deal) : null;
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
    } as never) as Promise<string>;
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
