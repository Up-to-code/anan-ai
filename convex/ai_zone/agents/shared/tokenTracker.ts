/**
 * tokenTracker.ts — Global Token Usage Tracking
 *
 * WHY:   We need to know how much each agent costs, which model burns most
 *        tokens, and how to optimize spending. The admin dashboard needs
 *        real-time data for cost charts and burn rate analysis.
 * WHAT:  Provides a single function `trackTokenUsage()` that saves token
 *        counts to the `aiTokenUsage` table after every agent call.
 * HOW:   Each agent calls trackTokenUsage() in its run() completion handler.
 *        The function is fire-and-forget (errors are swallowed silently
 *        because token tracking is non-critical — it must never crash the
 *        user's request).
 *
 * EDIT GUIDE:
 * - To add new cost models: update COST_PER_MILLION_TOKENS
 * - To change what's tracked: update TrackTokenParams interface
 * - To query token data: use the admin_zone queries
 */

import { internal } from "../../../_generated/api";
import type { MutationCtx } from "../../../_generated/server";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * TrackTokenParams — Parameters for recording token usage.
 *
 * @param agentName - Which agent used the tokens (e.g. "anan_search")
 * @param modelName - Which LLM model was used (e.g. "google/gemini-2.5-flash")
 * @param inputTokens - Number of tokens in the prompt/input
 * @param outputTokens - Number of tokens in the completion/output
 * @param userId - (Optional) Who triggered this call
 * @param threadId - (Optional) Which conversation thread
 * @param errorOccurred - (Optional) Whether this call errored
 */
export interface TrackTokenParams {
    agentName: string;
    teamName?: string;
    promptVersion?: string;
    modelName: string;
    inputTokens: number;
    outputTokens: number;
    userId?: string;
    threadId?: string;
    channel?: string;
    role?: string;
    errorOccurred?: boolean;
    contextTokens?: number;
    memoryTokens?: number;
    ragTokens?: number;
    historyTokens?: number;
    cacheHit?: boolean;
}

// ─── Cost Estimation ──────────────────────────────────────────────────────────

/**
 * COST_PER_MILLION_TOKENS — Estimated USD cost per million tokens per model.
 *
 * WHY:   Admin needs dollar estimates for budgeting.
 * WHAT:  Lookup table: model name → { input cost, output cost } per 1M tokens.
 * HOW:   Prices from OpenRouter as of 2025.
 *
 * TO UPDATE: Add new model entries when switching models.
 */
const COST_PER_MILLION_TOKENS: Record<
    string,
    { input: number; output: number }
> = {
    "google/gemini-2.5-flash": { input: 0.15, output: 0.60 },
    "google/gemini-2.0-flash": { input: 0.10, output: 0.40 },
    "google/gemini-2.5-pro": { input: 1.25, output: 5.00 },
    "anthropic/claude-sonnet-4-20250514": { input: 3.00, output: 15.00 },
    "openai/gpt-4o-mini": { input: 0.15, output: 0.60 },
};

/**
 * estimateCostUSD — Calculates the estimated cost for a token usage.
 *
 * WHY:   Raw token counts don't tell the admin how much they're spending.
 * WHAT:  Converts token counts to USD using the cost table.
 * HOW:   (tokens / 1_000_000) * cost_per_million. Returns 0 if model unknown.
 *
 * @param modelName - The LLM model name
 * @param inputTokens - Input token count
 * @param outputTokens - Output token count
 * @returns Estimated cost in USD (may be 0 for unknown models)
 */
export function estimateCostUSD(
    modelName: string,
    inputTokens: number,
    outputTokens: number,
): number {
    const costs = COST_PER_MILLION_TOKENS[modelName];
    if (!costs) return 0;
    return (
        (inputTokens / 1_000_000) * costs.input +
        (outputTokens / 1_000_000) * costs.output
    );
}

// ─── Tracking Function ────────────────────────────────────────────────────────

// Persist token usage without ever blocking the main agent flow.
export async function trackTokenUsage(
    ctx: MutationCtx,
    params: TrackTokenParams,
): Promise<void> {
    try {
        const estimatedCostUSD = estimateCostUSD(
            params.modelName,
            params.inputTokens,
            params.outputTokens,
        );

        await ctx.db.insert("aiTokenUsage", {
            agentName: params.agentName,
            teamName: params.teamName,
            promptVersion: params.promptVersion,
            modelName: params.modelName,
            inputTokens: params.inputTokens,
            outputTokens: params.outputTokens,
            totalTokens: params.inputTokens + params.outputTokens,
            estimatedCostUSD,
            userId: params.userId,
            threadId: params.threadId,
            channel: params.channel,
            role: params.role,
            errorOccurred: params.errorOccurred ?? false,
            contextTokens: params.contextTokens,
            memoryTokens: params.memoryTokens,
            ragTokens: params.ragTokens,
            historyTokens: params.historyTokens,
            cacheHit: params.cacheHit,
            createdAt: Date.now(),
        });

        await ctx.scheduler.runAfter(
            0,
            internal.shared_logic.analytics.posthog.captureEvent,
            {
                event: "ai_token_usage_recorded",
                distinctId: params.userId?.trim() || (params.threadId?.trim() ? `thread:${params.threadId.trim()}` : undefined),
                properties: {
                    agentName: params.agentName,
                    teamName: params.teamName,
                    promptVersion: params.promptVersion,
                    modelName: params.modelName,
                    inputTokens: params.inputTokens,
                    outputTokens: params.outputTokens,
                    totalTokens: params.inputTokens + params.outputTokens,
                    estimatedCostUSD,
                    userId: params.userId,
                    threadId: params.threadId,
                    channel: params.channel,
                    role: params.role,
                    status: params.errorOccurred ? "failed" : "completed",
                    errorFlag: params.errorOccurred ?? false,
                    contextTokens: params.contextTokens,
                    memoryTokens: params.memoryTokens,
                    ragTokens: params.ragTokens,
                    historyTokens: params.historyTokens,
                    cacheHit: params.cacheHit,
                },
            },
        );
    } catch (error) {
        // Token tracking is non-critical. Log but never throw.
        console.error(
            `[tokenTracker] Failed to track tokens for ${params.agentName}:`,
            error,
        );
    }
}

/**
 * extractTokenUsageFromResult — Extracts token counts from AI SDK result.
 *
 * WHY:   Different AI SDKs return token usage in different shapes.
 *        This normalizes them into our standard format.
 * WHAT:  Reads .usage from the AI SDK generateText result.
 * HOW:   Tries common property paths used by Vercel AI SDK.
 *
 * @param result - The result object from generateText or similar
 * @returns Normalized input/output token counts
 */
export function extractTokenUsageFromResult(result: any): {
    inputTokens: number;
    outputTokens: number;
} {
    const usage = result?.usage ?? result?.experimental_providerMetadata?.usage;
    return {
        inputTokens: usage?.promptTokens ?? usage?.inputTokens ?? 0,
        outputTokens: usage?.completionTokens ?? usage?.outputTokens ?? 0,
    };
}
