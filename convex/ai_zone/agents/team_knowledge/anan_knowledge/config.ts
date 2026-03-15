import { agentFactory } from "../../core";
import { AGENT_REGISTRY } from "../../anan/orchestrationConfig";

export const ananKnowledgeDefinition = AGENT_REGISTRY.anan_knowledge;
export const ananKnowledge = agentFactory.create(ananKnowledgeDefinition);
