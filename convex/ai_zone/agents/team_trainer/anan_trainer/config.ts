import { agentFactory } from "../../core";
import { AGENT_REGISTRY } from "../../anan/orchestrationConfig";

export const ananTrainerDefinition = AGENT_REGISTRY.anan_trainer;
export const ananTrainer = agentFactory.create(ananTrainerDefinition);
