import type { Id } from "../../../_generated/dataModel";
import type {
  WorkspaceDeleteProjectConfirmationState,
  WorkspaceListActionState,
  WorkspaceProjectActionCandidate,
  WorkspaceProjectFieldKey,
} from "../../agents/anan_workspace/types";

export type AssistantOwner = {
  userId: string;
  ownerType: "broker" | "RED" | "user";
  ownerBrokerId?: Id<"brokers">;
  ownerREDId?: Id<"RED">;
};

export type WorkspaceUploadedFileReference = {
  key: string;
  url: string;
  name: string;
  size?: number;
  mime?: string;
};

export type AssistantKind = "default" | "anan_workspace" | "anan_pro";
export type PersistedAssistantKind = AssistantKind | "anan_main_public";
export type ThreadScope = "user" | "organization";

export type AssistantThreadRecord = {
  _id: string;
  userId: string;
  scope?: ThreadScope;
  ownerType: "broker" | "RED" | "user";
  ownerBrokerId?: Id<"brokers">;
  ownerREDId?: Id<"RED">;
  mode: "qa" | "action";
  channel?: "workspace" | "web" | "admin";
  orchestratorName?: string;
  assistantKind?: PersistedAssistantKind;
  title?: string;
  legacyThreadId?: Id<"assistantThreads">;
  createdAt: number;
  updatedAt: number;
};

export type AssistantMessageRecord = {
  _id: string;
  threadId: string;
  role: "user" | "assistant";
  content: string;
  mode: "qa" | "action";
  metadata?: Record<string, unknown>;
  legacyMessageId?: Id<"assistantMessages">;
  promptMessageId?: string;
  createdAt: number;
};

export type WorkspaceProjectFields = {
  name?: string;
  city?: string;
  district?: string;
  price?: number;
  rooms?: number;
  bathrooms?: number;
  description?: string;
};

export type WorkspaceProjectActionState = WorkspaceProjectActionCandidate & {
  type: "create_project";
  fields: WorkspaceProjectFields;
  projectId?: string;
  error?: string;
};

export type WorkspaceActionState =
  | WorkspaceProjectActionState
  | WorkspaceListActionState
  | WorkspaceDeleteProjectConfirmationState;

export const WORKSPACE_KINDS: AssistantKind[] = ["anan_workspace", "anan_pro"];

export const PROJECT_REQUIRED_FIELDS: WorkspaceProjectFieldKey[] = [
  "name",
  "city",
  "district",
  "price",
  "rooms",
  "bathrooms",
  "description",
];

export const FIELD_QUESTION_MAP: Record<WorkspaceProjectFieldKey, string> = {
  name: "ما اسم المشروع؟",
  city: "ما المدينة؟",
  district: "ما الحي أو المنطقة؟",
  price: "ما السعر المستهدف للمشروع؟",
  rooms: "كم عدد الغرف؟",
  bathrooms: "كم عدد الحمامات؟",
  description: "اكتب وصفاً مختصراً للمشروع.",
};
