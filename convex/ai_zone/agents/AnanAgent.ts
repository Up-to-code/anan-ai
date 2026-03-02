/**
 * AnanAgent.ts — Configurable Base Agent Class
 *
 * WHY:   Every agent in the Anan system (anan_search, anan_finance, etc.)
 *        needs the same core setup: LLM model, tools, instructions, retry
 *        logic, and token tracking. Without a base class, every agent would
 *        duplicate this boilerplate.
 * WHAT:  A single class that wraps @convex-dev/agent with Anan-specific
 *        defaults. You create a new agent by instantiating this class
 *        with a config object — no subclassing needed.
 * HOW:   Stores config, provides a run() method that handles the full
 *        lifecycle: execute → retry on failure → track tokens → return result.
 *
 * TO CREATE A NEW AGENT:
 *   import { AnanAgent } from "../../AnanAgent";
 *   export const myAgent = new AnanAgent({
 *     name: "anan_myagent",
 *     description: "Does something specific",
 *     tools: { myTool },
 *     instructions: "You are a specialist in...",
 *   });
 *
 * TO EDIT AN EXISTING AGENT:
 *   - Change behavior: edit the instructions in the agent's instructions.ts
 *   - Add a tool: create a file in the agent's tools/ folder, add it to config
 *   - Change model: set modelOverride in the config
 *   - Change retry logic: set retryConfig in the config
 */

import { generateText } from "ai";
import { getChatModel } from "../../shared_logic/lib/providers";
import {
    withRetry,
    DEFAULT_RETRY_CONFIG,
    FALLBACK_MODEL,
    type AgentError,
} from "./shared/errorHandler";
import { extractTokenUsageFromResult } from "./shared/tokenTracker";

// ─── Configuration Interface ──────────────────────────────────────────────────

/**
 * AnanAgentConfig — Everything needed to create an agent.
 *
 * WHY:   One interface to configure any agent. No guessing what parameters
 *        are available — it's all typed and documented here.
 */
export interface AnanAgentConfig {
    /**
     * Unique agent name, must start with "anan_".
     * Used in: token tracking, error logging, orchestrator dispatch.
     * @example "anan_search"
     */
    name: string;

    /**
     * Human-readable description of what this agent does.
     * Used by: the orchestrator to decide which agents to dispatch.
     * @example "Searches properties by criteria, location, and price range"
     */
    description: string;

    /**
     * Override the default LLM model from config.ts.
     * Useful for agents that need a more powerful (or cheaper) model.
     * @example "google/gemini-2.5-pro"
     */
    modelOverride?: string;

    /**
     * Maximum reasoning steps before the agent stops.
     * Higher = more thorough but slower and more expensive.
     * @default 4
     */
    maxSteps?: number;

    /**
     * LLM temperature (0 = deterministic, 1 = creative).
     * Search agents should use low temp; creative agents can use higher.
     * @default 0.3
     */
    temperature?: number;

    /**
     * Agent-specific tools — functions the agent can call.
     * Each tool should be a function with a clear JSDoc description.
     * @example { searchProperties: searchPropertiesTool, filterByArea: filterTool }
     */
    tools: Record<string, any>;

    /**
     * System prompt — defines the agent's personality, rules, and behavior.
     * This is the most impactful configuration: it determines HOW the agent
     * thinks and responds. Edit this to change the agent's behavior.
     */
    instructions: string;

    /**
     * Which RAG namespace to use for context retrieval.
     * Most agents use "production". anan_trainer uses "recommendation".
     * @default "production"
     */
    ragNamespace?: string;

    /**
     * Whether to track token usage for this agent.
     * Should be true for all production agents. False only for testing.
     * @default true
     */
    enableTokenTracking?: boolean;

    /**
     * Custom retry configuration. Overrides DEFAULT_RETRY_CONFIG.
     * Set higher maxRetries for critical agents, lower for optional ones.
     */
    retryConfig?: typeof DEFAULT_RETRY_CONFIG;
}

// ─── Agent Result Type ────────────────────────────────────────────────────────

/**
 * AnanAgentResult — The output of every agent execution.
 *
 * WHY:   The orchestrator needs a standard shape to merge results
 *        from multiple agents.
 */
export interface AnanAgentResult {
    /** Whether the agent succeeded */
    ok: boolean;
    /** The agent's text output */
    output: string;
    /** Which agent produced this result */
    agentName: string;
    /** Token usage statistics */
    tokenUsage: {
        inputTokens: number;
        outputTokens: number;
    };
    /** Error details if the agent failed */
    error?: AgentError;
}

// ─── Agent Class ──────────────────────────────────────────────────────────────

/**
 * AnanAgent — The configurable base class for all Anan AI agents.
 *
 * WHY:   Eliminates boilerplate. One class handles model selection, retries,
 *        token tracking, and error handling for every agent in the system.
 * WHAT:  Wraps the LLM call lifecycle with Anan-specific conventions.
 * HOW:   Stores config on construction. run() executes: build prompt →
 *        call LLM with retry → extract tokens → return standardized result.
 *
 * LIFECYCLE:
 *   1. Orchestrator calls agent.run(prompt, context)
 *   2. AnanAgent builds the full prompt (instructions + context + user input)
 *   3. Calls generateText() wrapped in withRetry()
 *   4. If success → extracts tokens, returns AnanAgentResult { ok: true }
 *   5. If all retries fail → returns AnanAgentResult { ok: false, error }
 */
export class AnanAgent {
    /** The agent's configuration — immutable after construction */
    public readonly config: AnanAgentConfig;

    constructor(config: AnanAgentConfig) {
        if (!config.name.startsWith("anan_")) {
            throw new Error(
                `Agent name must start with "anan_". Got: "${config.name}"`,
            );
        }
        this.config = {
            maxSteps: 4,
            temperature: 0.3,
            ragNamespace: "production",
            enableTokenTracking: true,
            ...config,
        };
    }

    /**
     * run — Execute this agent with the given prompt and context.
     *
     * WHY:   This is the single entry point for running any agent.
     *        The orchestrator calls this method for each dispatched agent.
     * WHAT:  Builds the prompt, calls the LLM, handles retries and errors,
     *        and returns a standardized result.
     * HOW:   1. Prepend instructions to the prompt
     *        2. Call generateText() wrapped in withRetry()
     *        3. If all retries fail, try the fallback model
     *        4. Extract token usage from the result
     *        5. Return AnanAgentResult
     *
     * @param prompt - The user's message or sub-task from the orchestrator
     * @param context - Optional additional context (RAG results, user memory)
     * @returns AnanAgentResult — always returns, never throws
     *
     * @example
     * const result = await ananSearch.run("ابحث عن شقق في الرياض");
     * if (result.ok) console.log(result.output);
     */
    async run(prompt: string, context?: string): Promise<AnanAgentResult> {
        const fullPrompt = [
            this.config.instructions,
            context ? `\n[Context]\n${context}` : "",
            `\n[User Message]\n${prompt}`,
        ].join("\n");

        const retryConfig = this.config.retryConfig ?? DEFAULT_RETRY_CONFIG;

        // Attempt with primary model
        try {
            const model = getChatModel(this.config.modelOverride);
            const result = await withRetry(
                () =>
                    generateText({
                        model,
                        prompt: fullPrompt,
                        temperature: this.config.temperature,
                    }),
                this.config.name,
                retryConfig,
            );

            const tokenUsage = extractTokenUsageFromResult(result);

            return {
                ok: true,
                output: result.text,
                agentName: this.config.name,
                tokenUsage,
            };
        } catch (primaryError) {
            // Attempt with fallback model
            try {
                console.warn(
                    `[${this.config.name}] Primary model failed. Trying fallback: ${FALLBACK_MODEL}`,
                );
                const fallbackModel = getChatModel(FALLBACK_MODEL);
                const result = await generateText({
                    model: fallbackModel,
                    prompt: fullPrompt,
                    temperature: this.config.temperature,
                });

                const tokenUsage = extractTokenUsageFromResult(result);

                return {
                    ok: true,
                    output: result.text,
                    agentName: this.config.name,
                    tokenUsage,
                };
            } catch (fallbackError) {
                // Both primary and fallback failed
                const error = primaryError as AgentError;
                return {
                    ok: false,
                    output: "",
                    agentName: this.config.name,
                    tokenUsage: { inputTokens: 0, outputTokens: 0 },
                    error: error.agentName
                        ? error
                        : {
                            agentName: this.config.name,
                            message: String(primaryError),
                            retryable: false,
                            attemptsMade: retryConfig.maxRetries + 1,
                        },
                };
            }
        }
    }
}
