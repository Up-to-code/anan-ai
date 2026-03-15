import { agentFactory } from "../../core";
import { AGENT_REGISTRY } from "../../anan_workspace/orchestrationConfig";

export const ananWorkspaceOffersDefinition = AGENT_REGISTRY.anan_workspace_offers;
export const ananWorkspaceOffers = agentFactory.create(ananWorkspaceOffersDefinition);
