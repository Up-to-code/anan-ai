import { agentFactory } from "../../core";
import { AGENT_REGISTRY } from "../../anan/orchestrationConfig";

export const ananBanksDefinition = AGENT_REGISTRY.anan_banks;
export const ananBanks = agentFactory.create(ananBanksDefinition);
