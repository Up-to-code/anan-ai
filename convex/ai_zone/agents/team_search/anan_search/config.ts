import { agentFactory } from "../../core";
import { AGENT_REGISTRY } from "../../anan/orchestrationConfig";

export const ananSearchDefinition = AGENT_REGISTRY.anan_search;
export const ananSearch = agentFactory.create(ananSearchDefinition);
