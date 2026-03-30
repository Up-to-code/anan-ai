import type { LastSearchSummary } from "../memory/repository/shared";

export type BuyerChannel = "whatsapp" | "app" | "web";
export type BuyerChannelState = "idle" | "search_results" | "property_selected" | "handoff_ready";

export type BuyerQualification = {
  monthlySalary?: number;
  downPayment?: number;
  preferredYears?: number;
  employmentStatus?: string;
  notes?: string;
};

export type BuyerStateRecordInput = {
  channel: BuyerChannel;
  userId: string;
  threadId?: string;
  state: BuyerChannelState;
  selectedPropertyId?: string;
  lastResultPropertyIds: string[];
  lastSearchQuery?: string;
  qualification?: BuyerQualification;
  createdAt: number;
  updatedAt: number;
};

export type BuyerStateSnapshot = {
  state: BuyerChannelState;
  lastSearchQuery?: string;
  selectedPropertyId?: string;
  lastResultPropertyIds: string[];
  qualification?: BuyerQualification;
};

export type BuyerSummaryCollection = {
  buyerProfileSummary?: string;
  activePropertySummary?: string;
  searchJourneySummary?: string;
  financeQualificationSummary?: string;
};

export type BuyerMemoryContext = {
  summary: string;
  preferences: Array<any>;
  constraints: Array<any>;
  recentInteractions: Array<any>;
  lastSearchSummary: LastSearchSummary | null;
};

export type KnowledgeSnippet = {
  title: string;
  category?: string;
  excerpt: string;
};
