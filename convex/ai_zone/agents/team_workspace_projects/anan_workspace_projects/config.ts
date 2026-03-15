import { agentFactory } from "../../core";
import { AGENT_REGISTRY } from "../../anan_workspace/orchestrationConfig";

export const ananWorkspaceProjectsDefinition = AGENT_REGISTRY.anan_workspace_projects;
export const ananWorkspaceProjects = agentFactory.create(ananWorkspaceProjectsDefinition);
