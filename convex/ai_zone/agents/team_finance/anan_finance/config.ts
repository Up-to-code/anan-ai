import { agentFactory } from "../../core";
import { AGENT_REGISTRY } from "../../anan/orchestrationConfig";

export const ananFinanceDefinition = AGENT_REGISTRY.anan_finance;
export const ananFinance = agentFactory.create(ananFinanceDefinition);
