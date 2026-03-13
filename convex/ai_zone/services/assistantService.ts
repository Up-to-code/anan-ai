/**
 * assistantService.ts — AI Zone Service Layer
 *
 * All complex DB logic, identity resolution, and orchestration for the
 * AI assistant live here. The root controller (assistant.ts) stays thin.
 */
import type { QueryCtx, ActionCtx } from "../../_generated/server";
import type { Id, Doc } from "../../_generated/dataModel";
import { ConvexError } from "convex/values";
import { orchestrate } from "../agents/anan";
import { apiRefs, internalRefs } from "../../shared_logic/lib/generatedApiRefs";
import {
    findProfileForResolvedIdentity,
    requireResolvedIdentity,
} from "../../_core/security/identity";
import { resolveWorkspaceAgUiTurn } from "./agUi";

// ─── Types ────────────────────────────────────────────────────────────────────
export type AssistantOwner = {
    userId: string;
    ownerType: "broker" | "RED" | "user";
    ownerBrokerId?: Id<"brokers">;
    ownerREDId?: Id<"RED">;
};

// ─── Identity Resolution ──────────────────────────────────────────────────────
/**
 * Resolves the current user's identity and determines their owner type
 * (broker, RED, or standard user) from their profile.
 */
export async function resolveAssistantOwner(ctx: QueryCtx): Promise<AssistantOwner> {
    const identity = await requireResolvedIdentity(ctx);
    const profile = await findProfileForResolvedIdentity(ctx, identity);

    if (profile?.isActive === false) {
        throw new ConvexError({ code: "ACCOUNT_INACTIVE", message: "Account is deactivated" });
    }

    if (profile?.brokerId) {
        return { userId: identity.authUserId, ownerType: "broker", ownerBrokerId: profile.brokerId };
    }
    if (profile?.REDId) {
        return { userId: identity.authUserId, ownerType: "RED", ownerREDId: profile.REDId };
    }
    return { userId: identity.authUserId, ownerType: "user" };
}

/**
 * Safe version that returns null instead of throwing when unauthenticated.
 */
export async function resolveAssistantOwnerSafe(ctx: QueryCtx): Promise<AssistantOwner | null> {
    try {
        return await resolveAssistantOwner(ctx);
    } catch {
        return null;
    }
}

// ─── Thread Operations ────────────────────────────────────────────────────────
/**
 * Fetches the most recent assistant thread for a given user.
 */
export async function getLatestThread(
    ctx: QueryCtx,
    userId: string,
    assistantKind?: "default" | "anan_pro",
): Promise<Doc<"assistantThreads"> | null> {
    const threads = await ctx.db
        .query("assistantThreads")
        .withIndex("userId", (q: any) => q.eq("userId", userId))
        .collect();
    const filtered = assistantKind
        ? threads.filter((thread) => (thread.assistantKind ?? "default") === assistantKind)
        : threads;
    if (filtered.length === 0) return null;
    return filtered.sort((a, b) => b.updatedAt - a.updatedAt)[0];
}

/**
 * Returns recent assistant threads for the current user and assistant kind.
 */
export async function listRecentThreads(
    ctx: QueryCtx,
    userId: string,
    assistantKind?: "default" | "anan_pro",
    limit = 6,
) {
    const threads = await ctx.db
        .query("assistantThreads")
        .withIndex("userId", (q: any) => q.eq("userId", userId))
        .collect();

    return threads
        .filter((thread) => !assistantKind || (thread.assistantKind ?? "default") === assistantKind)
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, limit);
}

// ─── Message Operations ───────────────────────────────────────────────────────
/**
 * Lists all messages for a thread, verifying ownership first.
 */
export async function listThreadMessages(
    ctx: QueryCtx,
    owner: AssistantOwner,
    threadId?: Id<"assistantThreads">,
    assistantKind?: "default" | "anan_pro",
) {
    const thread = threadId
        ? await ctx.db.get(threadId)
        : await getLatestThread(ctx, owner.userId, assistantKind);
    if (!thread || thread.userId !== owner.userId) return [];
    if (assistantKind && (thread.assistantKind ?? "default") !== assistantKind) return [];
    return ctx.db
        .query("assistantMessages")
        .withIndex("threadId", (q) => q.eq("threadId", thread._id))
        .collect();
}

/**
 * Internal helper to fetch a specific message content by ID.
 * Used by durable workflows which only receive the message ID.
 */
export async function getMessageContent(
    ctx: QueryCtx,
    messageId: Id<"assistantMessages">
): Promise<Doc<"assistantMessages"> | null> {
    return ctx.db.get(messageId);
}

// ─── Orchestration ────────────────────────────────────────────────────────────
/**
 * Core orchestration logic: resolves context, gathers knowledge,
 * runs the multi-agent orchestrator, and persists the conversation step.
 *
 * WHY:   This is where user messages enter the AI pipeline.
 * WHAT:  Resolves identity → fetches context → calls orchestrate() → saves result.
 * HOW:   Uses the anan orchestrator and registry-driven team dispatch,
 *        so there is no per-role custom orchestration builder.
 */
export async function handleAssistantMessage(
    ctx: ActionCtx,
    args: {
        message: string;
        threadId?: Id<"assistantThreads">;
        assistantKind?: "default" | "anan_pro";
        orchestratorName?: string;
        promptPrefix?: string;
    },
): Promise<{
    ok: true;
    threadId: string;
    mode: "qa" | "action";
    output: string;
    messageId: string;
}> {
    // 1. Resolve thread & owner via query
    const { thread, owner } = await ctx.runQuery(
        (args.assistantKind === "anan_pro"
            ? apiRefs["ai_zone/assistantPro"].getThread
            : apiRefs["ai_zone/assistant"].getThread),
        {},
    );

    // 2. Get entitlement (determines qa vs action mode)
    const entitlement = await ctx.runQuery(
        apiRefs["shared_logic/subscriptions/index"].getAssistantEntitlement,
        {},
    );
    const mode = entitlement.mode;

    // 3. Retrieve company knowledge for context
    const knowledge = await ctx.runQuery(
        apiRefs["shared_logic/knowledge/index"].retrieveCompanyKnowledge,
        { query: args.message, limit: 3 },
    );

    const knowledgeContext =
        knowledge.length > 0
            ? `\n\n[Company Knowledge]\n${knowledge
                .map(
                    (k: { title: string; category?: string | null; excerpt: string }) =>
                        `- ${k.title}${k.category ? ` (${k.category})` : ""}: ${k.excerpt}`,
                )
                .join("\n")}`
            : "";

    // 4. Build the prompt based on mode
    const basePrompt =
        mode === "qa"
            ? `${args.promptPrefix ? `${args.promptPrefix}\n\n` : ""}${args.message}\n\n[Policy: QA-only mode. Answer questions only. Do not execute actions.]${knowledgeContext}`
            : `${args.promptPrefix ? `${args.promptPrefix}\n\n` : ""}${args.message}${knowledgeContext}`;

    // 5. Map ownerType to orchestrator role
    const roleMap: Record<string, "user" | "broker" | "RED" | "admin"> = {
        broker: "broker",
        RED: "RED",
        user: "user",
    };

    // 6. Run the multi-agent orchestrator
    const result = await orchestrate({
        ctx,
        prompt: basePrompt,
        role: roleMap[owner.ownerType] ?? "user",
        userId: owner.userId,
        threadId: (args.threadId ?? thread?._id) as string | undefined,
        ragContext: knowledgeContext || undefined,
        channel: "app",
    });

    const assistantUiTurn = args.assistantKind === "anan_pro"
        ? resolveWorkspaceAgUiTurn(args.message, result.output)
        : null;

    // 7. Persist the conversation step
    const saved = await ctx.runMutation(
        internalRefs["ai_zone/assistant"]._saveConversationStep,
        {
            threadId: args.threadId ?? thread?._id,
            userId: owner.userId,
            ownerType: owner.ownerType,
            ownerBrokerId: owner.ownerBrokerId,
            ownerREDId: owner.ownerREDId,
            userMessage: args.message,
            assistantMessage: result.output,
            assistantMetadata: assistantUiTurn ? { uiTurn: assistantUiTurn } : undefined,
            mode,
            assistantKind: args.assistantKind,
            orchestratorName: args.orchestratorName,
        },
    );

    return {
        ok: true,
        threadId: saved.threadId,
        mode,
        output: result.output,
        messageId: saved.assistantMessageId,
    };
}

/**
 * Persists a conversation step: creates a thread if needed,
 * saves both user and assistant messages, and updates the thread timestamp.
 */
export async function saveConversationStep(
    ctx: any, // MutationCtx
    args: {
        threadId?: Id<"assistantThreads">;
        userId: string;
        ownerType: "broker" | "RED" | "user";
        ownerBrokerId?: Id<"brokers">;
        ownerREDId?: Id<"RED">;
        userMessage: string;
        assistantMessage: string;
        assistantMetadata?: Record<string, unknown>;
        mode: "qa" | "action";
        assistantKind?: "default" | "anan_pro";
        orchestratorName?: string;
    },
) {
    const now = Date.now();

    const threadId =
        args.threadId ??
        (await ctx.db.insert("assistantThreads", {
            userId: args.userId,
            ownerType: args.ownerType,
            ownerBrokerId: args.ownerBrokerId,
            ownerREDId: args.ownerREDId,
            mode: args.mode,
            assistantKind: args.assistantKind ?? "default",
            orchestratorName: args.orchestratorName,
            title: args.userMessage.slice(0, 80),
            createdAt: now,
            updatedAt: now,
        }));

    const userMessageId = await ctx.db.insert("assistantMessages", {
        threadId,
        role: "user",
        content: args.userMessage,
        mode: args.mode,
        createdAt: now,
    });

    const assistantMessageId = await ctx.db.insert("assistantMessages", {
        threadId,
        role: "assistant",
        content: args.assistantMessage,
        mode: args.mode,
        metadata: args.assistantMetadata,
        createdAt: now + 1,
    });

    await ctx.db.patch(threadId, {
        updatedAt: now,
        mode: args.mode,
        assistantKind: args.assistantKind ?? "default",
        orchestratorName: args.orchestratorName,
    });

    return { threadId, userMessageId, assistantMessageId };
}
