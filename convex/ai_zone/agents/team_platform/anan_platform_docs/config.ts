import { agentFactory } from "../../core";
import { AGENT_REGISTRY } from "../../anan/orchestrationConfig";

export const ananPlatformDocsDefinition = AGENT_REGISTRY.anan_platform_docs;
export const ananPlatformDocs = agentFactory.create(ananPlatformDocsDefinition);
