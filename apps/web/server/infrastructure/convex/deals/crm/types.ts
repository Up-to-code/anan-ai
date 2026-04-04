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
