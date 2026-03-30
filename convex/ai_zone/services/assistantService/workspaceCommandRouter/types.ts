import type { Id } from "../../../../_generated/dataModel";
import type {
  WorkspaceDeleteProjectConfirmationState,
  WorkspaceListActionState,
  WorkspaceOperatorFilter,
  WorkspaceOperatorListItem,
} from "../../../agents/anan_workspace/types";
import type { AgUiConversationTurn } from "../../agUi/types";
import type { WorkspaceActionState } from "../types";

export type WorkspaceDirectCommandKind =
  | "list_clients"
  | "list_projects"
  | "search_projects"
  | "delete_project"
  | "list_offers"
  | "search_offers";

export type WorkspaceDirectCommandResult = {
  assistantText: string;
  meta: Record<string, unknown>;
  uiTurn: AgUiConversationTurn | null;
  actionState: WorkspaceActionState | null;
};

export type DealStage = "new" | "contacted" | "negotiation" | "won" | "lost";

export type ParsedWorkspaceCommand =
  | { kind: "list_clients"; limit: number; todayOnly: boolean; stage?: DealStage; searchTerm?: string }
  | { kind: "list_projects" | "search_projects"; limit: number; searchTerm?: string }
  | { kind: "delete_project"; projectId?: string }
  | { kind: "list_offers" | "search_offers"; limit: number; searchTerm?: string };

export type PaginatedPage<T> = {
  page: T[];
};

export type ProjectSummary = {
  _id: string;
  title: string;
  address: string;
  price: number;
  status?: string;
  publicationState?: string;
  brokerId?: string;
  REDId?: string;
};

export type DealSummary = {
  id: string;
  title: string;
  stage: DealStage;
  value?: number;
  contactName?: string;
  contactPhone?: string;
  nextFollowUpAt?: number;
};

export type ClientSummary = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
};

export type EnrichedClientSummary = ClientSummary & {
  matchedDeal?: DealSummary;
};

export type OfferSummary = {
  id: string;
  price: number;
  status: string;
  publicationState?: string;
  visibility?: string;
  property?: {
    title?: string;
    address?: string;
  } | null;
  description?: string;
  message?: string;
};

export type ListActionState = WorkspaceListActionState;
export type DeleteConfirmationState = WorkspaceDeleteProjectConfirmationState;
export type OperatorFilter = WorkspaceOperatorFilter;
export type OperatorListItem = WorkspaceOperatorListItem;
export type PropertyId = Id<"properties">;
