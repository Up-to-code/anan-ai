import type { AgUiActionDefinition, AgUiDraftState, AgUiExecutionState } from "@/app/(ws)/ws/_lib/entities";

export type AgUiComponentId =
  | "project_create_draft"
  | "offer_publish_draft"
  | "offer_send_draft"
  | "thread_update"
  | "project_unit_selector"
  | "person_relation"
  | "approval_footer"
  | "execution_result"
  | "field_request_list"
  | "latest_update"
  | "market_insight"
  | "area_heat"
  | "constraint_summary"
  | "missing_data_prompt";

export type AgUiCardDefinition = {
  id: string;
  componentId: AgUiComponentId;
  props: Record<string, unknown>;
};

export type AgUiConversationTurn = {
  objective: string;
  targetZone: string;
  action: AgUiActionDefinition;
  draft?: AgUiDraftState;
  executionState?: AgUiExecutionState;
  cards: AgUiCardDefinition[];
  assistantText: string;
  followupQuestion?: string;
};
