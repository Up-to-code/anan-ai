import { agentFactory } from "../../core";
import { AGENT_REGISTRY } from "../../anan/orchestrationConfig";

export const ananMemoryDefinition = AGENT_REGISTRY.anan_memory;
export const ananMemory = agentFactory.create(ananMemoryDefinition);
