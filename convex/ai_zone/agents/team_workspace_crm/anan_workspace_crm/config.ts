import { agentFactory } from "../../core";
import { AGENT_REGISTRY } from "../../anan_workspace/orchestrationConfig";

export const ananWorkspaceCrmDefinition = AGENT_REGISTRY.anan_workspace_crm;
export const ananWorkspaceCrm = agentFactory.create(ananWorkspaceCrmDefinition);
