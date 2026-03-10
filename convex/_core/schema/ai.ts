/**
 * ai.ts — AI System Schema Tables
 *
 * WHY:   The multi-agent system needs persistent tables for:
 *        1. Token usage tracking (admin cost analysis)
 *        2. RAG entry management (production vs recommendation)
 *        3. Per-user knowledge base (agent memory)
 * WHAT:  Defines three tables: aiTokenUsage, aiRAGEntries, userKnowledgeBase.
 * HOW:   Imported by schema.ts and merged into the main Convex schema.
 *
 * EDIT GUIDE:
 * - To add a field: add it below and run `npx convex dev`
 * - To add an index: add .index() and redeploy
 */

import { defineTable } from "convex/server";
import { v } from "convex/values";

const aiTables = {
    /**
     * aiTokenUsage — Tracks every LLM call across all agents.
     *
     * WHY:  Admin needs to see how much each agent costs, which model
     *       burns the most tokens, and how to optimize spending.
     * WHAT: One row per LLM call with input/output token counts.
     * HOW:  Written by tokenTracker.ts after every agent execution.
     *       Queried by admin_zone for analytics dashboards.
     */
    aiTokenUsage: defineTable({
        /** Agent that made this call (e.g. "anan_search") */
        agentName: v.string(),
        /** Team that owns the agent (e.g. "team_search") */
        teamName: v.optional(v.string()),
        /** Prompt definition version used for this call */
        promptVersion: v.optional(v.string()),
        /** LLM model used (e.g. "google/gemini-2.5-flash") */
        modelName: v.string(),
        /** Number of tokens in the prompt/input */
        inputTokens: v.number(),
        /** Number of tokens in the completion/output */
        outputTokens: v.number(),
        /** Total tokens (input + output) for quick aggregation */
        totalTokens: v.number(),
        /** Estimated cost in USD based on model pricing */
        estimatedCostUSD: v.optional(v.number()),
        /** User who triggered this call (if applicable) */
        userId: v.optional(v.string()),
        /** Conversation thread ID (if applicable) */
        threadId: v.optional(v.string()),
        /** Channel that triggered the call */
        channel: v.optional(v.string()),
        /** Role used for orchestration access */
        role: v.optional(v.string()),
        /** Whether an error occurred during this call */
        errorOccurred: v.optional(v.boolean()),
        /** Timestamp of this usage record */
        createdAt: v.number(),
    })
        .index("agentName", ["agentName"])
        .index("createdAt", ["createdAt"])
        .index("agentName_createdAt", ["agentName", "createdAt"])
        .index("teamName_createdAt", ["teamName", "createdAt"]),

    aiOrchestrationUsage: defineTable({
        orchestratorName: v.string(),
        role: v.string(),
        channel: v.optional(v.string()),
        userId: v.optional(v.string()),
        threadId: v.optional(v.string()),
        agentsDispatched: v.array(v.string()),
        successfulAgents: v.array(v.string()),
        failedAgents: v.array(v.string()),
        totalInputTokens: v.number(),
        totalOutputTokens: v.number(),
        totalTokens: v.number(),
        createdAt: v.number(),
    })
        .index("createdAt", ["createdAt"])
        .index("orchestratorName_createdAt", ["orchestratorName", "createdAt"]),

    /**
     * aiRAGEntries — Tracks RAG content in both production and recommendation.
     *
     * WHY:  anan_trainer suggests new training data. Admin reviews it.
     *       Approved entries move from "recommendation" to "production".
     *       This table tracks the lifecycle of every RAG entry.
     * WHAT: One row per RAG content piece with status tracking.
     * HOW:  Written by anan_trainer (status: pending).
     *       Updated by admin (status: approved/rejected).
     *       When approved → also added to production RAG namespace.
     */
    aiRAGEntries: defineTable({
        /** Which RAG namespace this belongs to */
        ragType: v.union(v.literal("production"), v.literal("recommendation")),
        /** Short title/label for this entry */
        title: v.string(),
        /** The actual content/training text */
        content: v.string(),
        /** Content category (e.g. "properties", "finance", "areas") */
        category: v.optional(v.string()),
        /** Target audience for this content */
        target: v.union(
            v.literal("user"),
            v.literal("broker"),
            v.literal("RED"),
            v.literal("all"),
        ),
        /** Review status lifecycle */
        status: v.union(
            v.literal("pending"),
            v.literal("approved"),
            v.literal("rejected"),
        ),
        /** Which agent suggested this entry (e.g. "anan_trainer") */
        suggestedBy: v.optional(v.string()),
        /** Admin who reviewed this entry */
        reviewedBy: v.optional(v.string()),
        /** When this entry was created */
        createdAt: v.number(),
        /** When this entry was reviewed */
        reviewedAt: v.optional(v.number()),
    })
        .index("ragType_status", ["ragType", "status"])
        .index("createdAt", ["createdAt"]),

    /**
     * userKnowledgeBase — Per-user memory for agent context.
     *
     * WHY:  The AI agent needs to remember things about each user
     *       across sessions: preferred areas, budget, past interactions.
     *       Without this, the agent asks the same questions every time.
     * WHAT: Key-value store per user with importance weighting.
     * HOW:  Written by anan_memory agent during/after conversations.
     *       Read by anan_knowledge before every response to inject context.
     */
    userKnowledgeBase: defineTable({
        /** User this knowledge belongs to */
        userId: v.string(),
        /** Knowledge key (e.g. "preferred_area", "budget_range") */
        key: v.string(),
        /** Human-readable summary of this knowledge */
        summary: v.string(),
        /** Structured data value (any shape) */
        value: v.any(),
        /** Importance score 0-1 for RAG weighting (1 = most important) */
        importance: v.number(),
        /** Which agent wrote this (e.g. "anan_memory") */
        source: v.string(),
        /** When this was first created */
        createdAt: v.number(),
        /** When this was last updated */
        updatedAt: v.number(),
    })
        .index("userId", ["userId"])
        .index("userId_key", ["userId", "key"]),
};

export default aiTables;
