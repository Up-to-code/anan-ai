/**
 * ragInstances.ts — Production & Recommendation RAG Instances
 *
 * WHY:   We need two separate RAG namespaces:
 *        1. Production RAG — confirmed training data used by all agents.
 *        2. Recommendation RAG — agent-suggested data pending admin review.
 *        Plus per-user knowledge base namespaces for personal memory.
 * WHAT:  Creates and exports RAG helper functions that wrap the Convex RAG
 *        component with our namespace and filter conventions.
 * HOW:   Uses @convex-dev/rag with filtered search. Namespaces separate
 *        production data from recommendations. Filters allow targeting
 *        content to specific roles (user, broker, RED, admin).
 *
 * EDIT GUIDE:
 * - To add a new filter: add to RAG_FILTER_NAMES and FilterTypes
 * - To change embedding model: update textEmbeddingModel in createRAGInstance
 * - To add a new namespace: create a new constant and helper function
 */

import { RAG } from "@convex-dev/rag";
import type { ComponentApi as RagComponentApi } from "@convex-dev/rag/_generated/component.js";
import { components } from "../../../_generated/api";
import { getEmbeddingModel } from "../../../shared_logic/lib/providers";
import type { ActionCtx } from "../../../_generated/server";

// ─── Namespace Constants ──────────────────────────────────────────────────────

/**
 * RAG_NAMESPACES — All RAG namespace names used across the system.
 *
 * WHY:   Centralizing namespace names prevents typos and makes it easy
 *        to see all namespaces at a glance.
 */
export const RAG_NAMESPACES = {
    /** Confirmed, admin-approved training data. Used by all agents. */
    PRODUCTION: "rag_production",
    /** Agent-suggested data awaiting admin review. */
    RECOMMENDATION: "rag_recommendation",
    /** Prefix for per-user knowledge. Append userId: `kb_${userId}` */
    USER_KB_PREFIX: "kb_",
} as const;

// ─── Filter Types ─────────────────────────────────────────────────────────────

/**
 * FilterTypes — Type-safe filter definitions for RAG search.
 *
 * WHY:   Filters let us target content to specific roles or categories.
 *        E.g., broker-only training data won't pollute user search results.
 */
type FilterTypes = {
    /** Content category: "properties", "finance", "areas", "general" */
    category: string;
    /** Target audience: "user", "broker", "RED", "all" */
    target: string;
    /** Content type: "training", "faq", "market_data", "user_memory" */
    contentType: string;
};

const RAG_FILTER_NAMES: (keyof FilterTypes)[] = [
    "category",
    "target",
    "contentType",
];

// ─── RAG Instance ─────────────────────────────────────────────────────────────

/**
 * createRAGInstance — Creates a configured RAG instance.
 *
 * WHY:   We reuse the same RAG component from convex.config.ts,
 *        but need typed filters and our embedding model.
 * WHAT:  Returns a RAG instance ready for add/search operations.
 * HOW:   Wraps @convex-dev/rag with our filter names and embedding config.
 *
 * @returns Configured RAG instance
 */
function createRAGInstance() {
    return new RAG<FilterTypes>(components.rag as unknown as RagComponentApi, {
        textEmbeddingModel: getEmbeddingModel(),
        embeddingDimension: 1536,
        filterNames: RAG_FILTER_NAMES,
    });
}

/** Lazy singleton RAG instance */
let ragInstance: ReturnType<typeof createRAGInstance> | null = null;

function getRAG() {
    if (!ragInstance) ragInstance = createRAGInstance();
    return ragInstance;
}

// ─── Production RAG Operations ────────────────────────────────────────────────

/**
 * searchProductionRAG — Searches the confirmed production training data.
 *
 * WHY:   Agents need context from approved training data when answering.
 * WHAT:  Semantic search against the production namespace with role filtering.
 * HOW:   Calls rag.search() with namespace="rag_production" and optional
 *        target filter to only return content relevant to the user's role.
 *
 * @param ctx - Convex action context
 * @param query - The search query text
 * @param target - Target audience filter ("user", "broker", "RED", "all")
 * @param limit - Max results to return (default: 5)
 * @returns Search results with text, scores, and metadata
 */
export async function searchProductionRAG(
    ctx: ActionCtx,
    query: string,
    target?: string,
    limit = 5,
) {
    const rag = getRAG();
    const filters = target
        ? [{ name: "target" as const, value: target }]
        : undefined;

    return rag.search(ctx, {
        namespace: RAG_NAMESPACES.PRODUCTION,
        query,
        limit,
        ...(filters ? { filters } : {}),
    });
}

/**
 * addToProductionRAG — Adds confirmed content to the production namespace.
 *
 * WHY:   When admin approves a recommendation, it moves to production.
 *        Also used for initial training data seeding.
 * WHAT:  Inserts text with category and target filters into production RAG.
 * HOW:   Calls rag.add() with appropriate namespace and filter values.
 *
 * @param ctx - Convex action context
 * @param text - The content to add
 * @param category - Content category (e.g. "properties", "finance")
 * @param target - Target audience ("user", "broker", "RED", "all")
 */
export async function addToProductionRAG(
    ctx: ActionCtx,
    text: string,
    category: string,
    target: string,
) {
    const rag = getRAG();
    await rag.add(ctx, {
        namespace: RAG_NAMESPACES.PRODUCTION,
        text,
        filterValues: [
            { name: "category", value: category },
            { name: "target", value: target },
            { name: "contentType", value: "training" },
        ],
    });
}

// ─── Recommendation RAG Operations ────────────────────────────────────────────

/**
 * addToRecommendationRAG — Agent pushes suggested training data for review.
 *
 * WHY:   anan_trainer extracts useful data from conversations and suggests
 *        it as new training material. Admin must approve before it goes live.
 * WHAT:  Inserts text into the recommendation namespace.
 * HOW:   Same as production but different namespace. Admin dashboard
 *        shows pending entries for review.
 *
 * @param ctx - Convex action context
 * @param text - The suggested training content
 * @param category - Content category
 * @param target - Target audience
 */
export async function addToRecommendationRAG(
    ctx: ActionCtx,
    text: string,
    category: string,
    target: string,
) {
    const rag = getRAG();
    await rag.add(ctx, {
        namespace: RAG_NAMESPACES.RECOMMENDATION,
        text,
        filterValues: [
            { name: "category", value: category },
            { name: "target", value: target },
            { name: "contentType", value: "training" },
        ],
    });
}

// ─── User Knowledge Base Operations ───────────────────────────────────────────

/**
 * searchUserKnowledgeBase — Searches a specific user's personal memory.
 *
 * WHY:   The agent needs to remember user preferences, budget, areas, etc.
 *        across sessions without re-asking every time.
 * WHAT:  Semantic search in the user's personal namespace.
 * HOW:   Uses namespace="kb_{userId}" to isolate per-user data.
 *
 * @param ctx - Convex action context
 * @param userId - The user's ID (used as namespace suffix)
 * @param query - Search query
 * @param limit - Max results (default: 3)
 */
export async function searchUserKnowledgeBase(
    ctx: ActionCtx,
    userId: string,
    query: string,
    limit = 3,
) {
    const rag = getRAG();
    return rag.search(ctx, {
        namespace: `${RAG_NAMESPACES.USER_KB_PREFIX}${userId}`,
        query,
        limit,
    });
}

/**
 * saveToUserKnowledgeBase — Stores a fact in the user's personal memory.
 *
 * WHY:   anan_memory saves things like "prefers الرياض" or "budget 800K"
 *        so future conversations have context without re-asking.
 * WHAT:  Adds text to the user's personal RAG namespace.
 *
 * @param ctx - Convex action context
 * @param userId - The user's ID
 * @param text - The fact/preference to remember
 * @param category - Category (e.g. "preference", "budget", "area")
 */
export async function saveToUserKnowledgeBase(
    ctx: ActionCtx,
    userId: string,
    text: string,
    category: string,
) {
    const rag = getRAG();
    await rag.add(ctx, {
        namespace: `${RAG_NAMESPACES.USER_KB_PREFIX}${userId}`,
        text,
        filterValues: [
            { name: "category", value: category },
            { name: "contentType", value: "user_memory" },
            { name: "target", value: "user" },
        ],
    });
}
