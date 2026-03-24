import type { ActionCtx } from "../../../_generated/server";
import { internal } from "../../../_generated/api";
import { stepCountIs } from "ai";
import { getChatModel } from "../../../shared_logic/lib/providers";
import { cachedGenerateText } from "../../../shared_logic/llmCache";
import { getAgentLLMConfigSafe } from "../config";
import { DEFAULT_RETRY_CONFIG, FALLBACK_MODEL, withRetry, type AgentError, type RetryConfig } from "../shared/errorHandler";
import { extractTokenUsageFromResult } from "../shared/tokenTracker";
import type { AgentRuntimeContext } from "../types";
import { buildSystemPrompt } from "./promptPolicy";
import { resolveTools } from "./toolRegistry";
import type { AgentDefinition } from "./types";

export interface ConfiguredAgentResult {
  ok: boolean;
  output: string;
  agentName: string;
  tokenUsage: {
    inputTokens: number;
    outputTokens: number;
  };
  error?: AgentError;
}

/**
 * WHY:   All agents should share one execution path for prompts, tool wiring, retries, and analytics.
 * WHAT:  Executes a declarative `AgentDefinition` through the shared runtime.
 * HOW:   Builds the system prompt, resolves tools, runs the model, and records analytics automatically.
 */
export class BaseConfiguredAgent {
  public readonly definition: AgentDefinition;

  constructor(definition: AgentDefinition) {
    if (!definition.name.startsWith("anan_")) {
      throw new Error(`Agent name must start with "anan_". Got: "${definition.name}"`);
    }
    this.definition = definition;
  }

  async run(ctx: ActionCtx, runtime: AgentRuntimeContext): Promise<ConfiguredAgentResult> {
    const modelName =
      this.definition.modelPolicy?.modelOverride ??
      getAgentLLMConfigSafe(runtime.orchestratorId)?.model ??
      "unknown";
    const retryConfig: RetryConfig = {
      ...DEFAULT_RETRY_CONFIG,
      ...(this.definition.runtimePolicy?.retryConfig ?? {}),
    };
    const systemPrompt = buildSystemPrompt(this.definition.prompt);
    const fullPrompt = [
      systemPrompt,
      runtime.context ? `\n[Context]\n${runtime.context}` : "",
      `\n[User Message]\n${runtime.prompt}`,
    ].join("\n");

    try {
      const model = getChatModel(this.definition.modelPolicy?.modelOverride, runtime.orchestratorId);
      const tools = resolveTools(ctx, runtime, this.definition.tools ?? {});
      const result = await withRetry(
        () =>
          cachedGenerateText(
            ctx,
            {
              // NOTE: `cachedGenerateText` is typed against a transitive `@ai-sdk/provider` version.
              // We cast the model here to keep typing localized until dependencies are unified.
              model: model as any,
              prompt: fullPrompt,
              temperature: this.definition.modelPolicy?.temperature ?? 0.3,
              stopWhen: stepCountIs(this.definition.runtimePolicy?.maxSteps ?? 4),
              toolChoice: "auto",
              tools,
            },
            {
              modelName,
              tags: ["agent", this.definition.name, `team:${this.definition.team}`],
              metadata: {
                agent: this.definition.name,
                team: this.definition.team,
                promptVersion: this.definition.prompt.version,
              },
            },
          ),
        this.definition.name,
        retryConfig,
      );

      const tokenUsage = extractTokenUsageFromResult(result);
      await trackAgentUsage(ctx, {
        agentName: this.definition.name,
        teamName: this.definition.team,
        promptVersion: this.definition.prompt.version,
        modelName,
        inputTokens: tokenUsage.inputTokens,
        outputTokens: tokenUsage.outputTokens,
        userId: runtime.userId,
        threadId: runtime.threadId,
        channel: runtime.channel,
        role: runtime.role,
        errorOccurred: false,
      });

      return {
        ok: true,
        output: result.text,
        agentName: this.definition.name,
        tokenUsage,
      };
    } catch (primaryError) {
      try {
        const model = getChatModel(FALLBACK_MODEL, runtime.orchestratorId);
        const tools = resolveTools(ctx, runtime, this.definition.tools ?? {});
        const result = await cachedGenerateText(
          ctx,
          {
            model: model as any,
            prompt: fullPrompt,
            temperature: this.definition.modelPolicy?.temperature ?? 0.3,
            stopWhen: stepCountIs(this.definition.runtimePolicy?.maxSteps ?? 4),
            toolChoice: "auto",
            tools,
          },
          {
            modelName: FALLBACK_MODEL,
            tags: ["agent", this.definition.name, `team:${this.definition.team}`, "fallback"],
            metadata: {
              agent: this.definition.name,
              team: this.definition.team,
              promptVersion: this.definition.prompt.version,
              fallback: true,
            },
          },
        );

        const tokenUsage = extractTokenUsageFromResult(result);
        await trackAgentUsage(ctx, {
          agentName: this.definition.name,
          teamName: this.definition.team,
          promptVersion: this.definition.prompt.version,
          modelName: FALLBACK_MODEL,
          inputTokens: tokenUsage.inputTokens,
          outputTokens: tokenUsage.outputTokens,
          userId: runtime.userId,
          threadId: runtime.threadId,
          channel: runtime.channel,
          role: runtime.role,
          errorOccurred: false,
        });

        return {
          ok: true,
          output: result.text,
          agentName: this.definition.name,
          tokenUsage,
        };
      } catch (fallbackError) {
        await trackAgentUsage(ctx, {
          agentName: this.definition.name,
          teamName: this.definition.team,
          promptVersion: this.definition.prompt.version,
          modelName,
          inputTokens: 0,
          outputTokens: 0,
          userId: runtime.userId,
          threadId: runtime.threadId,
          channel: runtime.channel,
          role: runtime.role,
          errorOccurred: true,
        });

        return {
          ok: false,
          output: "",
          agentName: this.definition.name,
          tokenUsage: { inputTokens: 0, outputTokens: 0 },
          error: {
            agentName: this.definition.name,
            message: String(primaryError),
            retryable: false,
            attemptsMade: retryConfig.maxRetries + 1,
          },
        };
      }
    }
  }
}

async function trackAgentUsage(
  ctx: ActionCtx,
  params: {
    agentName: string;
    teamName: string;
    promptVersion: string;
    modelName: string;
    inputTokens: number;
    outputTokens: number;
    userId?: string;
    threadId?: string;
    channel?: string;
    role?: string;
    errorOccurred?: boolean;
  },
) {
  try {
    await ctx.runMutation(
      internal.ai_zone.agents.shared.tokenTrackerActions.trackTokenUsageInternal,
      params,
    );
  } catch (err) {
    console.warn("[anan] Token tracking failed (non-critical):", err);
  }
}
