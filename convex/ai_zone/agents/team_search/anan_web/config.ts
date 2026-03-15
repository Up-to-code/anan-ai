import { agentFactory } from "../../core";
import { AGENT_REGISTRY } from "../../anan/orchestrationConfig";

export const ananWebDefinition = AGENT_REGISTRY.anan_web;
export const ananWeb = agentFactory.create(ananWebDefinition);
