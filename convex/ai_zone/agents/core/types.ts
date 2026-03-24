import type { ActionCtx } from "../../../_generated/server";
import type { Tool } from "ai";
import type { AgentRuntimeContext, ToolFactoryMap } from "../types";
import type { RetryConfig } from "../shared/errorHandler";

export type AgentRole = "user" | "broker" | "RED" | "admin";

export type PromptBlock = {
  key: string;
  content: string;
};

export type PromptDefinition = {
  version: string;
  identity: string;
  scope: string[];
  toolUsage: string[];
  output: string[];
  safety: string[];
  extra?: PromptBlock[];
};

export type AgentModelPolicy = {
  modelOverride?: string;
  temperature?: number;
};

export type AgentRuntimePolicy = {
  maxSteps?: number;
  enableTokenTracking?: boolean;
  retryConfig?: Partial<RetryConfig>;
  failureMode?: "soft" | "hard";
};

export type ToolBundleDefinition = {
  name: string;
  tools: ToolFactoryMap;
};

export type AgentDefinition = {
  name: string;
  description: string;
  team: string;
  allowedRoles: AgentRole[];
  prompt: PromptDefinition;
  modelPolicy?: AgentModelPolicy;
  runtimePolicy?: AgentRuntimePolicy;
  tools?: ToolFactoryMap;
  toolBundles?: ToolBundleDefinition[];
  ragNamespace?: string;
};

export type TeamDefinition = {
  id: string;
  allowedRoles: AgentRole[];
  failureMode?: "soft" | "hard";
  toolBundles?: ToolBundleDefinition[];
  agents: AgentDefinition[];
};

export type ResolvedAgentDefinition = AgentDefinition & {
  tools: ToolFactoryMap;
};

export type ToolSet = Record<string, Tool>;

export type ToolResolver = (
  ctx: ActionCtx,
  runtime: AgentRuntimeContext,
  tools: ToolFactoryMap,
) => ToolSet;
