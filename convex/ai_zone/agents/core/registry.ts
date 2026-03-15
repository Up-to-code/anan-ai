import type { AgentDefinition, TeamDefinition } from "./types";
import type { ToolFactoryMap } from "../types";

export type ModelCatalogEntry = {
  id: string;
  description?: string;
  deprecated?: boolean;
};

export type ModelCatalog = {
  defaultModel: string;
  models: Record<string, ModelCatalogEntry>;
};

export type ToolCatalogEntry = {
  key: string;
  description: string;
  factory: ToolFactoryMap[string];
};

export type ToolCatalog = Record<string, ToolCatalogEntry>;

export type AgentConfigInput = Omit<AgentDefinition, "tools"> & {
  toolKeys?: string[];
  tools?: ToolFactoryMap;
};

/**
 * WHY:   Orchestration config must be validated in one place to prevent drift.
 * WHAT:  Provides helper builders for models, tools, agents, and teams.
 * HOW:   Validates required fields, resolves tool keys, and enforces allowlists.
 */
export function defineModels(catalog: ModelCatalog): ModelCatalog {
  if (!catalog.defaultModel) {
    throw new Error("Model catalog must define defaultModel.");
  }
  return catalog;
}

export function defineTools(catalog: ToolCatalog): ToolCatalog {
  return catalog;
}

export function defineAgentConfig(
  params: { modelCatalog: ModelCatalog; toolCatalog: ToolCatalog },
  input: AgentConfigInput,
): AgentDefinition {
  assertNonEmpty("agent.name", input.name);
  assertNonEmpty("agent.description", input.description);
  assertNonEmptyArray("agent.allowedRoles", input.allowedRoles);
  assertPrompt(input);

  const toolsFromKeys = resolveToolKeys(params.toolCatalog, input.toolKeys ?? []);
  const tools = { ...toolsFromKeys, ...(input.tools ?? {}) };

  const modelOverride = input.modelPolicy?.modelOverride;
  const resolvedModelOverride = modelOverride
    ? validateModelOverride(params.modelCatalog, modelOverride)
    : undefined;

  return {
    ...input,
    modelPolicy: {
      ...input.modelPolicy,
      modelOverride: resolvedModelOverride,
    },
    tools,
  };
}

export function defineTeamConfig(input: TeamDefinition): TeamDefinition {
  assertNonEmpty("team.id", input.id);
  assertNonEmptyArray("team.allowedRoles", input.allowedRoles);
  if (!input.agents || input.agents.length === 0) {
    throw new Error(`Team \"${input.id}\" must include at least one agent.`);
  }
  for (const agent of input.agents) {
    if (agent.team !== input.id) {
      throw new Error(
        `Team \"${input.id}\" includes agent \"${agent.name}\" with mismatched team \"${agent.team}\".`,
      );
    }
  }
  return input;
}

export function buildAgentRegistry(agents: AgentDefinition[]): Record<string, AgentDefinition> {
  const registry: Record<string, AgentDefinition> = {};
  for (const agent of agents) {
    if (registry[agent.name]) {
      throw new Error(`Duplicate agent name detected: ${agent.name}`);
    }
    registry[agent.name] = agent;
  }
  return registry;
}

export function buildTeamRegistry(teams: TeamDefinition[]): Record<string, TeamDefinition> {
  const registry: Record<string, TeamDefinition> = {};
  for (const team of teams) {
    if (registry[team.id]) {
      throw new Error(`Duplicate team id detected: ${team.id}`);
    }
    registry[team.id] = team;
  }
  return registry;
}

function assertNonEmpty(label: string, value?: string) {
  if (!value || value.trim().length === 0) {
    throw new Error(`${label} must be non-empty.`);
  }
}

function assertNonEmptyArray(label: string, value?: unknown[]) {
  if (!value || value.length === 0) {
    throw new Error(`${label} must be a non-empty array.`);
  }
}

function assertPrompt(input: AgentConfigInput) {
  const prompt = input.prompt;
  assertNonEmpty("prompt.identity", prompt.identity);
  assertNonEmptyArray("prompt.scope", prompt.scope);
  assertNonEmptyArray("prompt.toolUsage", prompt.toolUsage);
  assertNonEmptyArray("prompt.output", prompt.output);
  assertNonEmptyArray("prompt.safety", prompt.safety);
}

function resolveToolKeys(toolCatalog: ToolCatalog, toolKeys: string[]): ToolFactoryMap {
  const tools: ToolFactoryMap = {};
  for (const key of toolKeys) {
    const entry = toolCatalog[key];
    if (!entry) {
      throw new Error(`Tool key \"${key}\" is not registered in the tool catalog.`);
    }
    tools[key] = entry.factory;
  }
  return tools;
}

function validateModelOverride(modelCatalog: ModelCatalog, modelOverride: string): string | undefined {
  const allowedIds = new Set(
    Object.values(modelCatalog.models).map((entry) => entry.id),
  );
  if (allowedIds.has(modelOverride)) return modelOverride;
  if (modelCatalog.models[modelOverride]?.id) return modelCatalog.models[modelOverride].id;

  console.warn(
    `[anan] Model override \"${modelOverride}\" is not in the allowlist for this orchestrator. ` +
      `Falling back to default model.`,
  );
  return undefined;
}
