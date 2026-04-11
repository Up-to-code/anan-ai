import { AsyncLocalStorage } from "node:async_hooks";
import {
  BUILT_IN_TOOLS,
  OpenMultiAgent,
  defineTool,
  type AgentConfig as OpenMultiAgentAgentConfig,
  type OrchestratorEvent,
  type TeamRunResult,
  type ToolDefinition,
} from "@jackchen_me/open-multi-agent";
import type { ActionCtx } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { getAgentLLMConfig } from "../agents/config";
import type { TeamDefinition } from "../agents/core/types";
import { buildSystemPrompt } from "../agents/core/promptPolicy";
import { composeToolMap } from "../agents/core/toolRegistry";
import type { OrchestratorId, ToolFactoryMap } from "../agents/types";
import { TEAM_REGISTRY as DEFAULT_TEAM_REGISTRY } from "../agents/anan/orchestrationConfig";
import { TOOL_CATALOG as DEFAULT_TOOL_CATALOG } from "../agents/anan/orchestrationCatalog";
import { TEAM_REGISTRY as WORKSPACE_TEAM_REGISTRY } from "../agents/anan_workspace/orchestrationConfig";
import { FALLBACK_MESSAGES } from "../agents/shared/errorHandler";
import type {
  WorkspaceStreamStageEvent,
  WorkspaceStructuredOutput,
} from "../agents/anan_workspace/types";
import { z } from "zod";

type AssistantRole = "user" | "broker" | "RED" | "admin";

type PromptBudgetMeta = {
  contextTokens: number;
  memoryTokens: number;
  ragTokens: number;
  historyTokens: number;
  totalContextTokens: number;
  budgetCap: number;
  cacheHit: boolean;
  includedBlocks: string[];
  droppedBlocks: string[];
};

export type AssistantSurfaceRuntimeInput = {
  surface: "default" | "workspace";
  ctx: ActionCtx;
  prompt: string;
  role: AssistantRole;
  userId: string;
  threadId?: string;
  channel?: "app" | "whatsapp" | "web";
  ragContext?: string;
  promptBudgetMeta?: PromptBudgetMeta;
  streamSessionId?: string;
  onStageEvent?: (event: WorkspaceStreamStageEvent) => void | Promise<void>;
  onTextDelta?: (delta: string) => void | Promise<void>;
  onStreamCancelledCheck?: () => boolean | Promise<boolean>;
};

export type AssistantSurfaceRuntimeResult = {
  output: string;
  cancelled?: boolean;
  structured?: WorkspaceStructuredOutput;
  runtime: "open-multi-agent";
};

type SurfaceRuntimeTeamConfig = {
  surface: AssistantSurfaceRuntimeInput["surface"];
  orchestratorId: OrchestratorId;
  orchestratorName: string;
  teamName: string;
  teamRegistry: Record<string, TeamDefinition>;
  toolDescriptions: Record<string, string>;
};

type RuntimeScope = {
  ctx: ActionCtx;
  runtime: {
    prompt: string;
    context?: string;
    userId: string;
    orchestratorId: OrchestratorId;
    threadId?: string;
    channel?: "app" | "whatsapp" | "web";
    role?: AssistantRole;
  };
};

type OpenMultiAgentLikeResult = {
  success: boolean;
  output: string;
  tokenUsage: {
    input_tokens: number;
    output_tokens: number;
  };
  messages: unknown[];
  toolCalls: unknown[];
  structured?: unknown;
};

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const DEFAULT_RUNTIME_CONFIG: SurfaceRuntimeTeamConfig = {
  surface: "default",
  orchestratorId: "anan",
  orchestratorName: "anan_orchestrator",
  teamName: "anan-default",
  teamRegistry: DEFAULT_TEAM_REGISTRY,
  toolDescriptions: Object.fromEntries(
    Object.entries(DEFAULT_TOOL_CATALOG).map(([key, value]) => [key, value.description]),
  ),
};
const WORKSPACE_RUNTIME_CONFIG: SurfaceRuntimeTeamConfig = {
  surface: "workspace",
  orchestratorId: "anan_workspace",
  orchestratorName: "anan_workspace_orchestrator",
  teamName: "anan-workspace",
  teamRegistry: WORKSPACE_TEAM_REGISTRY,
  toolDescriptions: {},
};
const runtimeScopeStorage = new AsyncLocalStorage<RuntimeScope>();
const registeredToolNames = new Set<string>(BUILT_IN_TOOLS.map((tool) => tool.name));

function resolveSurfaceRuntimeConfig(
  surface: AssistantSurfaceRuntimeInput["surface"],
): SurfaceRuntimeTeamConfig {
  return surface === "workspace" ? WORKSPACE_RUNTIME_CONFIG : DEFAULT_RUNTIME_CONFIG;
}

function getRoleTeams(
  teamRegistry: Record<string, TeamDefinition>,
  role: AssistantRole,
): TeamDefinition[] {
  return Object.values(teamRegistry).filter((team) => team.allowedRoles.includes(role));
}

function buildAgentRuntimeGoal(input: AssistantSurfaceRuntimeInput) {
  return input.prompt.trim();
}

function buildOpenMultiAgentConfig(config: SurfaceRuntimeTeamConfig, onProgress?: (event: OrchestratorEvent) => void) {
  const llm = getAgentLLMConfig(config.orchestratorId);
  return new OpenMultiAgent({
    defaultProvider: "openai",
    defaultModel: llm.model,
    defaultBaseURL: OPENROUTER_BASE_URL,
    defaultApiKey: llm.apiKey,
    maxConcurrency: 4,
    onProgress,
  });
}

function teamAgentMap(teamDefinitions: TeamDefinition[]) {
  const agentToTeam = new Map<string, string>();
  for (const team of teamDefinitions) {
    for (const agent of team.agents) {
      agentToTeam.set(agent.name, team.id);
    }
  }
  return agentToTeam;
}

function buildOpenMultiAgentAgents(
  config: SurfaceRuntimeTeamConfig,
  teamDefinitions: TeamDefinition[],
): OpenMultiAgentAgentConfig[] {
  const llm = getAgentLLMConfig(config.orchestratorId);
  return teamDefinitions.flatMap((team) =>
    team.agents.map((agent) => {
      const toolKeys = Object.keys(composeToolMap(agent.toolBundles, agent.tools ?? {}));
      return {
        name: agent.name,
        model: agent.modelPolicy?.modelOverride ?? llm.model,
        provider: "openai",
        baseURL: OPENROUTER_BASE_URL,
        apiKey: llm.apiKey,
        systemPrompt: buildSystemPrompt(agent.prompt),
        maxTurns: agent.runtimePolicy?.maxSteps ?? 4,
        temperature: agent.modelPolicy?.temperature ?? 0.3,
        tools: toolKeys.length > 0 ? toolKeys : undefined,
      } satisfies OpenMultiAgentAgentConfig;
    }),
  );
}

function serializeToolResult(value: unknown): string {
  if (typeof value === "string") return value;
  if (value == null) return "null";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function jsonSchemaToZod(schema: unknown): z.ZodTypeAny {
  if (!schema || typeof schema !== "object") {
    return z.any();
  }

  const definition = schema as Record<string, unknown>;

  if (Array.isArray(definition.anyOf) && definition.anyOf.length > 0) {
    const variants = definition.anyOf.map((item) => jsonSchemaToZod(item));
    if (variants.length === 1) return variants[0] ?? z.any();
    return z.union(variants as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]);
  }

  if (Array.isArray(definition.enum) && definition.enum.length > 0) {
    const enumValues = definition.enum.filter((value): value is string => typeof value === "string");
    if (enumValues.length === definition.enum.length && enumValues.length > 0) {
      return z.enum(enumValues as [string, ...string[]]);
    }
    return z.any().refine((value) => (definition.enum as unknown[]).includes(value));
  }

  if ("const" in definition) {
    return z.any().refine((value) => value === definition.const);
  }

  switch (definition.type) {
    case "string":
      return typeof definition.format === "string" && definition.format === "url"
        ? z.string().url()
        : z.string();
    case "number":
      return z.number();
    case "integer":
      return z.number().int();
    case "boolean":
      return z.boolean();
    case "null":
      return z.null();
    case "array":
      return z.array(jsonSchemaToZod(definition.items));
    case "object": {
      const properties =
        definition.properties && typeof definition.properties === "object"
          ? (definition.properties as Record<string, unknown>)
          : {};
      const required = new Set(
        Array.isArray(definition.required)
          ? definition.required.filter((value): value is string => typeof value === "string")
          : [],
      );
      const shape = Object.fromEntries(
        Object.entries(properties).map(([key, value]) => {
          const propertySchema = jsonSchemaToZod(value);
          return [key, required.has(key) ? propertySchema : propertySchema.optional()];
        }),
      );
      const objectSchema = z.object(shape);
      return definition.additionalProperties === false ? objectSchema.strict() : objectSchema.catchall(z.any());
    }
    default:
      return z.any();
  }
}

function resolveCurrentRuntimeScope(): RuntimeScope {
  const scope = runtimeScopeStorage.getStore();
  if (!scope) {
    throw new Error("Open Multi-Agent tool invoked outside the active runtime scope.");
  }
  return scope;
}

function createOpenMultiAgentToolDefinition(
  toolName: string,
  toolFactory: ToolFactoryMap[string],
  description?: string,
): ToolDefinition<any> {
  const resolvedTool =
    typeof toolFactory === "function"
      ? toolFactory(
          {} as ActionCtx,
          {
            prompt: "",
            userId: "tool-probe",
            orchestratorId: "anan",
          },
        )
      : null;
  const inputSchema =
    resolvedTool && typeof resolvedTool === "object" && "inputSchema" in resolvedTool
      ? jsonSchemaToZod((resolvedTool as { inputSchema?: { jsonSchema?: unknown } }).inputSchema?.jsonSchema)
      : z.object({}).passthrough();

  return defineTool({
    name: toolName,
    description:
      description ??
      (resolvedTool && typeof resolvedTool === "object" && "description" in resolvedTool
        ? String((resolvedTool as { description?: unknown }).description ?? toolName)
        : toolName),
    inputSchema,
    execute: async (input) => {
      const scope = resolveCurrentRuntimeScope();
      const activeTool =
        typeof toolFactory === "function"
          ? toolFactory(scope.ctx, scope.runtime)
          : toolFactory;
      const result =
        activeTool && typeof activeTool === "object" && "execute" in activeTool
          ? await (activeTool as unknown as { execute: (payload: Record<string, unknown>) => Promise<unknown> }).execute(
              input as Record<string, unknown>,
            )
          : null;
      return {
        data: serializeToolResult(result),
        isError:
          Boolean(
            result &&
              typeof result === "object" &&
              (("ok" in (result as Record<string, unknown>) &&
                (result as Record<string, unknown>).ok === false) ||
                "error" in (result as Record<string, unknown>)),
          ) || undefined,
      };
    },
  });
}

function ensureRegisteredTools(config: SurfaceRuntimeTeamConfig, teamDefinitions: TeamDefinition[]) {
  for (const team of teamDefinitions) {
    for (const agent of team.agents) {
      const tools = composeToolMap(agent.toolBundles, agent.tools ?? {});
      for (const [toolName, toolFactory] of Object.entries(tools)) {
        if (registeredToolNames.has(toolName)) continue;
        BUILT_IN_TOOLS.push(
          createOpenMultiAgentToolDefinition(
            toolName,
            toolFactory,
            config.toolDescriptions[toolName],
          ),
        );
        registeredToolNames.add(toolName);
      }
    }
  }
}

function extractWorkspaceQuestionsFromText(text: string): string[] {
  return text
    .split(/\n+/)
    .map((line) => line.trim().replace(/^\d+[.)-]\s*/, ""))
    .filter(Boolean)
    .filter((line) => line.includes("?") || line.includes("؟"))
    .map((line) => (line.endsWith("?") || line.endsWith("؟") ? line : `${line}؟`))
    .filter((line, index, items) => items.indexOf(line) === index)
    .slice(0, 8);
}

function toWorkspaceStructuredOutput(text: string): WorkspaceStructuredOutput {
  return {
    questions: extractWorkspaceQuestionsFromText(text),
  };
}

function buildRuntimeScope(input: AssistantSurfaceRuntimeInput, orchestratorId: OrchestratorId): RuntimeScope {
  return {
    ctx: input.ctx,
    runtime: {
      prompt: input.prompt,
      context: input.ragContext,
      userId: input.userId,
      orchestratorId,
      threadId: input.threadId,
      channel: input.channel,
      role: input.role,
    },
  };
}

function toOpenMultiAgentResult(result: TeamRunResult): {
  output: string;
  dispatchedAgentNames: string[];
  agentResults: Array<{
    agentName: string;
    teamName?: string;
    promptVersion?: string;
    success: boolean;
    output: string;
    tokenUsage: { inputTokens: number; outputTokens: number };
  }>;
  totalTokenUsage: { inputTokens: number; outputTokens: number };
  success: boolean;
} {
  const dispatchedAgentNames: string[] = [];
  const agentResults: Array<{
    agentName: string;
    teamName?: string;
    promptVersion?: string;
    success: boolean;
    output: string;
    tokenUsage: { inputTokens: number; outputTokens: number };
  }> = [];

  for (const [agentName, agentResult] of result.agentResults.entries()) {
    if (agentName === "coordinator") continue;
    dispatchedAgentNames.push(agentName);
    const typedResult = agentResult as OpenMultiAgentLikeResult;
    agentResults.push({
      agentName,
      success: typedResult.success,
      output: typedResult.output,
      tokenUsage: {
        inputTokens: typedResult.tokenUsage.input_tokens,
        outputTokens: typedResult.tokenUsage.output_tokens,
      },
    });
  }

  const coordinatorOutput =
    (result.agentResults.get("coordinator") as OpenMultiAgentLikeResult | undefined)?.output ??
    agentResults
      .filter((item) => item.success && item.output.trim().length > 0)
      .map((item) => item.output.trim())
      .join("\n\n");

  return {
    output: coordinatorOutput || FALLBACK_MESSAGES.totalFailure,
    dispatchedAgentNames,
    agentResults,
    totalTokenUsage: {
      inputTokens: result.totalTokenUsage.input_tokens,
      outputTokens: result.totalTokenUsage.output_tokens,
    },
    success: result.success,
  };
}

async function trackOpenMultiAgentAnalytics(args: {
  ctx: ActionCtx;
  config: SurfaceRuntimeTeamConfig;
  input: AssistantSurfaceRuntimeInput;
  teamDefinitions: TeamDefinition[];
  result: ReturnType<typeof toOpenMultiAgentResult>;
}) {
  const { ctx, config, input, result } = args;
  const teamByAgent = Object.fromEntries(
    args.teamDefinitions.flatMap((team) => team.agents.map((agent) => [agent.name, team.id])),
  ) as Record<string, string>;
  const promptVersionByAgent = Object.fromEntries(
    args.teamDefinitions.flatMap((team) => team.agents.map((agent) => [agent.name, agent.prompt.version])),
  ) as Record<string, string>;
  const modelByAgent = Object.fromEntries(
    args.teamDefinitions.flatMap((team) =>
      team.agents.map((agent) => [
        agent.name,
        agent.modelPolicy?.modelOverride ?? getAgentLLMConfig(config.orchestratorId).model,
      ]),
    ),
  ) as Record<string, string>;

  for (const agentResult of result.agentResults) {
    try {
      await ctx.runMutation(
        internal.ai_zone.agents.shared.tokenTrackerActions.trackTokenUsageInternal,
        {
          agentName: agentResult.agentName,
          teamName: teamByAgent[agentResult.agentName],
          promptVersion: promptVersionByAgent[agentResult.agentName],
          modelName: modelByAgent[agentResult.agentName] ?? getAgentLLMConfig(config.orchestratorId).model,
          inputTokens: agentResult.tokenUsage.inputTokens,
          outputTokens: agentResult.tokenUsage.outputTokens,
          userId: input.userId,
          threadId: input.threadId,
          channel: input.channel,
          role: input.role,
          errorOccurred: !agentResult.success,
        },
      );
    } catch (error) {
      console.warn("[openMultiAgent] Token tracking failed (non-critical):", error);
    }
  }

  try {
    await ctx.runMutation(
      internal.ai_zone.agents.shared.orchestrationTrackerActions.trackOrchestrationUsageInternal as any,
      {
        orchestratorName: config.orchestratorName,
        role: input.role,
        channel: input.channel,
        userId: input.userId,
        threadId: input.threadId,
        agentsDispatched: result.dispatchedAgentNames,
        successfulAgents: result.agentResults.filter((item) => item.success).map((item) => item.agentName),
        failedAgents: result.agentResults.filter((item) => !item.success).map((item) => item.agentName),
        totalInputTokens: result.totalTokenUsage.inputTokens,
        totalOutputTokens: result.totalTokenUsage.outputTokens,
        contextTokens: input.promptBudgetMeta?.contextTokens,
        memoryTokens: input.promptBudgetMeta?.memoryTokens,
        ragTokens: input.promptBudgetMeta?.ragTokens,
        historyTokens: input.promptBudgetMeta?.historyTokens,
        cacheHit: input.promptBudgetMeta?.cacheHit,
      },
    );
  } catch (error) {
    console.warn("[openMultiAgent] Orchestration analytics failed (non-critical):", error);
  }
}

function createWorkspaceProgressEmitter(args: {
  onStageEvent?: AssistantSurfaceRuntimeInput["onStageEvent"];
  teamDefinitions: TeamDefinition[];
}) {
  const { onStageEvent, teamDefinitions } = args;
  const agentToTeam = teamAgentMap(teamDefinitions);
  return async (event: OrchestratorEvent) => {
    if (!onStageEvent) return;
    if (event.type === "task_start" && event.agent) {
      await onStageEvent({
        phase: "team_started",
        status: "running",
        teamId: agentToTeam.get(event.agent),
        agentName: event.agent,
        details: { taskId: event.task },
        timestamp: Date.now(),
      });
      return;
    }

    if ((event.type === "task_complete" || event.type === "error") && event.agent) {
      const success =
        event.type === "task_complete" &&
        typeof event.data === "object" &&
        event.data != null &&
        "success" in (event.data as Record<string, unknown>)
          ? Boolean((event.data as Record<string, unknown>).success)
          : false;
      await onStageEvent({
        phase: "team_done",
        status: success ? "completed" : "failed",
        teamId: agentToTeam.get(event.agent),
        agentName: event.agent,
        details:
          event.type === "error"
            ? { taskId: event.task, error: serializeToolResult(event.data) }
            : { taskId: event.task },
        timestamp: Date.now(),
      });
    }
  };
}

async function emitWorkspaceStage(
  input: AssistantSurfaceRuntimeInput,
  phase: WorkspaceStreamStageEvent["phase"],
  extra: Omit<Partial<WorkspaceStreamStageEvent>, "phase" | "timestamp"> = {},
) {
  if (!input.onStageEvent || input.surface !== "workspace") return;
  await input.onStageEvent({
    phase,
    timestamp: Date.now(),
    ...(extra as object),
  });
}

/**
 * WHY:   All assistant callers should go through one multi-agent runtime seam regardless of surface.
 * WHAT:  Builds the Open Multi-Agent team for the requested surface, executes it, and maps the result
 *        back to the assistant contract used by mobile, web, and WhatsApp.
 * HOW:   Resolves the surface config, registers bridged Convex tools, runs `OpenMultiAgent.runTeam()`,
 *        and preserves workspace stream/analytics side effects outside the library boundary.
 */
export async function runAssistantSurfaceRuntime(
  input: AssistantSurfaceRuntimeInput,
): Promise<AssistantSurfaceRuntimeResult> {
  const config = resolveSurfaceRuntimeConfig(input.surface);
  const teamDefinitions = getRoleTeams(config.teamRegistry, input.role);

  if (teamDefinitions.length === 0) {
    return {
      output: FALLBACK_MESSAGES.orchestratorFailure,
      structured: input.surface === "workspace" ? { questions: [] } : undefined,
      runtime: "open-multi-agent",
    };
  }

  ensureRegisteredTools(config, teamDefinitions);

  if (input.surface === "workspace") {
    await emitWorkspaceStage(input, "intent_started", { status: "running" });
    await emitWorkspaceStage(input, "intent_done", {
      status: "completed",
      details: { selectedTeams: teamDefinitions.map((team) => team.id) },
    });
    await emitWorkspaceStage(input, "merge_started", { status: "running" });
  }

  const progressEmitter = createWorkspaceProgressEmitter({
    onStageEvent: input.onStageEvent,
    teamDefinitions,
  });
  const orchestrator = buildOpenMultiAgentConfig(config, (event) => {
    void progressEmitter(event);
  });
  const team = orchestrator.createTeam(`${config.teamName}-${Date.now()}`, {
    name: config.teamName,
    agents: buildOpenMultiAgentAgents(config, teamDefinitions),
    sharedMemory: true,
    maxConcurrency: Math.max(1, Math.min(4, teamDefinitions.length)),
  });

  try {
    const runtimeResult = await runtimeScopeStorage.run(
      buildRuntimeScope(input, config.orchestratorId),
      () => orchestrator.runTeam(team, buildAgentRuntimeGoal(input)),
    );
    const normalizedResult = toOpenMultiAgentResult(runtimeResult);
    const cancelled =
      input.surface === "workspace" && input.onStreamCancelledCheck
        ? await input.onStreamCancelledCheck()
        : false;
    await trackOpenMultiAgentAnalytics({
      ctx: input.ctx,
      config,
      input,
      teamDefinitions,
      result: normalizedResult,
    });

    if (input.surface === "workspace") {
      await emitWorkspaceStage(input, "merge_done", {
        status: cancelled ? "failed" : "completed",
        details: {
          outputLength: normalizedResult.output.length,
          selectedTeams: teamDefinitions.map((team) => team.id),
          cancelled,
        },
      });
    }

    return {
      output: normalizedResult.output,
      cancelled: cancelled || undefined,
      structured:
        input.surface === "workspace"
          ? toWorkspaceStructuredOutput(normalizedResult.output)
          : undefined,
      runtime: "open-multi-agent",
    };
  } catch (error) {
    console.warn("[openMultiAgent] Runtime execution failed:", error);
    if (input.surface === "workspace") {
      await emitWorkspaceStage(input, "merge_done", {
        status: "failed",
        details: { error: error instanceof Error ? error.message : String(error) },
      });
    }
    return {
      output: FALLBACK_MESSAGES.orchestratorFailure,
      structured: input.surface === "workspace" ? { questions: [] } : undefined,
      runtime: "open-multi-agent",
    };
  }
}

/**
 * WHY:   Runtime tests need stable access to the pure adapter helpers without executing the full orchestration path.
 * WHAT:  Exposes helper functions used by the focused runtime unit tests only.
 * HOW:   Groups the pure mapping utilities behind a single exported object.
 */
export const __testing = {
  buildOpenMultiAgentAgents,
  jsonSchemaToZod,
  resolveSurfaceRuntimeConfig,
  toWorkspaceStructuredOutput,
};
