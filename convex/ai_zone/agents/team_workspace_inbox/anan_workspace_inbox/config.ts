import { agentFactory } from "../../core";
import { AGENT_REGISTRY } from "../../anan_workspace/orchestrationConfig";

export const ananWorkspaceInboxDefinition = AGENT_REGISTRY.anan_workspace_inbox;
export const ananWorkspaceInbox = agentFactory.create(ananWorkspaceInboxDefinition);
