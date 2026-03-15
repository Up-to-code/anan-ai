import { agentFactory } from "../../core";
import { AGENT_REGISTRY } from "../../anan_workspace/orchestrationConfig";

export const ananWorkspaceOrgDefinition = AGENT_REGISTRY.anan_workspace_org;
export const ananWorkspaceOrg = agentFactory.create(ananWorkspaceOrgDefinition);
