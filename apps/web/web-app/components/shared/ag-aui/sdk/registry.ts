import type { ComponentType } from "react";
import AgApprovalFooter from "../AgApprovalFooter";
import AgAreaHeatCard from "../AgAreaHeatCard";
import AgConstraintSummary from "../AgConstraintSummary";
import AgExecutionResultCard from "../AgExecutionResultCard";
import AgFieldRequestList from "../AgFieldRequestList";
import AgLatestUpdateCard from "../AgLatestUpdateCard";
import AgMarketInsightCard from "../AgMarketInsightCard";
import AgMissingDataPrompt from "../AgMissingDataPrompt";
import AgOfferPublishDraft from "../AgOfferPublishDraft";
import AgOfferSendDraft from "../AgOfferSendDraft";
import AgPersonRelationCard from "../AgPersonRelationCard";
import AgProjectCreateDraft from "../AgProjectCreateDraft";
import AgProjectUnitSelector from "../AgProjectUnitSelector";
import AgThreadUpdateCard from "../AgThreadUpdateCard";
import type { AgUiComponentId } from "./types";

export const AG_UI_COMPONENT_REGISTRY: Record<
  AgUiComponentId,
  ComponentType<Record<string, unknown>>
> = {
  project_create_draft: AgProjectCreateDraft as ComponentType<Record<string, unknown>>,
  offer_publish_draft: AgOfferPublishDraft as ComponentType<Record<string, unknown>>,
  offer_send_draft: AgOfferSendDraft as ComponentType<Record<string, unknown>>,
  thread_update: AgThreadUpdateCard as ComponentType<Record<string, unknown>>,
  project_unit_selector: AgProjectUnitSelector as ComponentType<Record<string, unknown>>,
  person_relation: AgPersonRelationCard as ComponentType<Record<string, unknown>>,
  approval_footer: AgApprovalFooter as ComponentType<Record<string, unknown>>,
  execution_result: AgExecutionResultCard as ComponentType<Record<string, unknown>>,
  field_request_list: AgFieldRequestList as ComponentType<Record<string, unknown>>,
  latest_update: AgLatestUpdateCard as ComponentType<Record<string, unknown>>,
  market_insight: AgMarketInsightCard as ComponentType<Record<string, unknown>>,
  area_heat: AgAreaHeatCard as ComponentType<Record<string, unknown>>,
  constraint_summary: AgConstraintSummary as ComponentType<Record<string, unknown>>,
  missing_data_prompt: AgMissingDataPrompt as ComponentType<Record<string, unknown>>,
};
