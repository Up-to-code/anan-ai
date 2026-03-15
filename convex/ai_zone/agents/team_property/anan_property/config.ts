import { agentFactory } from "../../core";
import { AGENT_REGISTRY } from "../../anan/orchestrationConfig";

export const ananPropertyDefinition = AGENT_REGISTRY.anan_property;
export const ananProperty = agentFactory.create(ananPropertyDefinition);
