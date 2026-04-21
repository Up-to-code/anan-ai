import type { ComponentType } from "react";
import AgApprovalFooter from "../AgApprovalFooter";
import AgAreaHeatCard from "../AgAreaHeatCard";
import AgConstraintSummary from "../AgConstraintSummary";
import AgDataList from "../AgDataList";
import AgExecutionResultCard from "../AgExecutionResultCard";
import AgFieldRequestList from "../AgFieldRequestList";
import AgFilterSummary from "../AgFilterSummary";
import AgLatestUpdateCard from "../AgLatestUpdateCard";
import AgMarketInsightCard from "../AgMarketInsightCard";
import AgMissingDataPrompt from "../AgMissingDataPrompt";
import AgOfferPublishDraft from "../AgOfferPublishDraft";
import AgOfferSendDraft from "../AgOfferSendDraft";
import AgPersonRelationCard from "../AgPersonRelationCard";
import AgProjectCreateDraft from "../AgProjectCreateDraft";
import AgProjectUnitSelector from "../AgProjectUnitSelector";
import AgTargetSummary from "../AgTargetSummary";
import AgThreadUpdateCard from "../AgThreadUpdateCard";
import type { AgUiComponentId } from "./types";

const asRegistryComponent = (
  component: unknown,
): ComponentType<Record<string, unknown>> =>
  component as ComponentType<Record<string, unknown>>;

export const AG_UI_COMPONENT_REGISTRY: Record<
  AgUiComponentId,
  ComponentType<Record<string, unknown>>
> = {
  project_create_draft: asRegistryComponent(AgProjectCreateDraft),
  offer_publish_draft: asRegistryComponent(AgOfferPublishDraft),
  offer_send_draft: asRegistryComponent(AgOfferSendDraft),
  thread_update: asRegistryComponent(AgThreadUpdateCard),
  project_unit_selector: asRegistryComponent(AgProjectUnitSelector),
  person_relation: asRegistryComponent(AgPersonRelationCard),
  approval_footer: asRegistryComponent(AgApprovalFooter),
  execution_result: asRegistryComponent(AgExecutionResultCard),
  field_request_list: asRegistryComponent(AgFieldRequestList),
  latest_update: asRegistryComponent(AgLatestUpdateCard),
  market_insight: asRegistryComponent(AgMarketInsightCard),
  area_heat: asRegistryComponent(AgAreaHeatCard),
  constraint_summary: asRegistryComponent(AgConstraintSummary),
  missing_data_prompt: asRegistryComponent(AgMissingDataPrompt),
  data_list: asRegistryComponent(AgDataList),
  filter_summary: asRegistryComponent(AgFilterSummary),
  target_summary: asRegistryComponent(AgTargetSummary),
};
