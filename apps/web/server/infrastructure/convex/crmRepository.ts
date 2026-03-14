import { fetchMutation, fetchQuery } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";
import type {
  AddDealDocumentInput,
  CreateDealInput,
  DealDetail,
  DealSummary,
  UpdateDealNotesInput,
  UpdateDealStageInput,
} from "@/server/contracts/deals";

type CrmApiRefs = {
  listDealsByBrokerId: unknown;
  listDealsByRedId: unknown;
  listDealsByPropertyId: unknown;
  getDealById: unknown;
  createDeal: unknown;
  updateDealStage: unknown;
  updateDealNotes: unknown;
  addDealDocument: unknown;
};

const crmApi = (apiUnsafe[
  "shared_logic/crm/repositories"
]) as CrmApiRefs;

export type CrmRepository = {
  listByBrokerId(brokerId: string): Promise<DealSummary[]>;
  listByRedId(redId: string): Promise<DealSummary[]>;
  listByPropertyId(propertyId: string): Promise<DealSummary[]>;
  getById(dealId: string): Promise<DealDetail | null>;
  create(args: {
    brokerId?: string;
    redId?: string;
    lastUpdatedBy: string;
    input: CreateDealInput;
  }): Promise<string>;
  updateStage(args: { lastUpdatedBy: string } & UpdateDealStageInput): Promise<void>;
  updateNotes(args: { lastUpdatedBy: string } & UpdateDealNotesInput): Promise<void>;
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

  async listByPropertyId(propertyId) {
    const deals = (await fetchQuery(crmApi.listDealsByPropertyId as never, {
      propertyId: propertyId as never,
    })) as DealSummary[];
    return deals.map(mapDealIds);
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
      brokerId: brokerId as never,
      REDId: redId as never,
      lastUpdatedBy,
    } as never) as Promise<string>;
  },

  async updateStage({ lastUpdatedBy, dealId, stage }) {
    await fetchMutation(crmApi.updateDealStage as never, {
      dealId: dealId as never,
      stage,
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

  async addDocument({ lastUpdatedBy, dealId, document }) {
    await fetchMutation(crmApi.addDealDocument as never, {
      dealId: dealId as never,
      document: document as never,
      lastUpdatedBy,
    } as never);
  },
};
