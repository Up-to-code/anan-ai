export type AgUiCardDefinition = {
  id: string;
  componentId:
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
  props: Record<string, unknown>;
};

export type AgUiConversationTurn = {
  objective: string;
  targetZone: string;
  action: {
    id: string;
    title: string;
    zone: "projects" | "offers" | "crm" | "market";
    fields: string[];
  };
  draft?: {
    actionId: string;
    title: string;
    description: string;
    fields: Record<string, string>;
    missingFields: string[];
    zone: "projects" | "offers" | "crm" | "market";
    state: "draft" | "collecting" | "ready" | "executing" | "completed" | "failed";
  };
  executionState?: "draft" | "collecting" | "ready" | "executing" | "completed" | "failed";
  cards: AgUiCardDefinition[];
  assistantText: string;
  followupQuestion?: string;
};

