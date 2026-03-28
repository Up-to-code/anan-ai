import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, type Infer, v } from "convex/values";
import { internalMutation, mutation, query } from "../../_generated/server";
import { createAssistantThread, listRecentThreads, listThreadMessages, saveConversationStep } from "../../ai_zone/services/assistantService";
import {
  clientThreadMessageValidator,
  clientThreadSummaryValidator,
  clientTranscriptSeedMessageValidator,
} from "./contracts";

const CLIENT_ASSISTANT_KIND = "anan_main_public" as const;
const CLIENT_ORCHESTRATOR_NAME = "client_web";

type StoredClientMessage = Infer<typeof clientThreadMessageValidator>;
type TranscriptSeedMessage = Infer<typeof clientTranscriptSeedMessageValidator>;

function getClientOwner(userId: string) {
  return {
    userId,
    ownerType: "user" as const,
  };
}

function readOptionalStringArray(value: unknown) {
  return Array.isArray(value) ? (value as string[]) : undefined;
}

function readOptionalProperties(value: unknown) {
  return Array.isArray(value) ? (value as StoredClientMessage["properties"]) : undefined;
}

function readOptionalCards(value: unknown) {
  return Array.isArray(value) ? (value as StoredClientMessage["cards"]) : undefined;
}

function mapStoredMessage(message: {
  _id: string;
  role: "assistant" | "user";
  content: string;
  createdAt: number;
  metadata?: unknown;
}): StoredClientMessage {
  const metadata = (message.metadata ?? {}) as Record<string, unknown>;
  return {
    id: message._id as never,
    role: message.role,
    text: message.content,
    createdAt: message.createdAt,
    properties: readOptionalProperties(metadata.properties),
    cards: readOptionalCards(metadata.cards),
    activePropertyId: typeof metadata.activePropertyId === "string" ? (metadata.activePropertyId as never) : undefined,
    requiresAuthForHandoff:
      typeof metadata.requiresAuthForHandoff === "boolean" ? metadata.requiresAuthForHandoff : undefined,
    suggestedPrompts: readOptionalStringArray(metadata.suggestedPrompts),
  };
}

function buildAssistantMetadata(message: TranscriptSeedMessage) {
  if (message.role !== "assistant") return undefined;
  return {
    properties: message.properties,
    cards: message.cards,
    activePropertyId: message.activePropertyId,
    requiresAuthForHandoff: message.requiresAuthForHandoff,
    suggestedPrompts: message.suggestedPrompts,
  };
}

async function requireAuthenticatedBuyer(ctx: { auth: unknown }, authReader: () => Promise<string | null>) {
  const userId = await authReader();
  if (!userId) {
    throw new ConvexError({ code: "UNAUTHORIZED", message: "Authentication required" });
  }
  return userId;
}

async function loadThreadPreview(ctx: any, threadId: string) {
  const messages = await ctx.db
    .query("assistantMessages")
    .withIndex("threadId", (q: any) => q.eq("threadId", threadId))
    .collect();
  const sorted = messages.sort((a: any, b: any) => a.createdAt - b.createdAt);
  return sorted.at(-1)?.content;
}

/**
 * WHY:   The client web history drawer needs authenticated saved buyer threads.
 * WHAT:  Lists recent persisted buyer threads scoped to the signed-in user.
 * HOW:   Reuses the shared assistant thread reader and filters to the public client assistant kind.
 */
export const listClientThreads = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(clientThreadSummaryValidator),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const threads = await listRecentThreads(
      ctx as never,
      getClientOwner(userId),
      CLIENT_ASSISTANT_KIND,
      args.limit ?? 12,
    );

    const summaries = await Promise.all(
      threads.map(async (thread) => ({
        id: thread._id,
        title: thread.title?.trim() || "Buyer conversation",
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt,
        preview: await loadThreadPreview(ctx, String(thread._id)),
      })),
    );

    return summaries;
  },
});

/**
 * WHY:   The client chat surface needs persisted messages when a saved thread is reopened.
 * WHAT:  Returns the authenticated user's stored buyer transcript for one thread.
 * HOW:   Delegates access control to the shared assistant thread reader and projects message metadata into client DTOs.
 */
export const getClientThreadMessages = query({
  args: {
    threadId: v.optional(v.id("assistantThreads")),
  },
  returns: v.array(clientThreadMessageValidator),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const messages = await listThreadMessages(
      ctx as never,
      getClientOwner(userId),
      args.threadId,
      CLIENT_ASSISTANT_KIND,
    );

    return messages.map(mapStoredMessage);
  },
});

/**
 * WHY:   The buyer UI sometimes needs a durable thread id before additional turns are sent.
 * WHAT:  Creates an empty persisted client assistant thread for the current signed-in buyer.
 * HOW:   Uses the shared assistant thread creator with the public buyer assistant kind.
 */
export const createClientThread = mutation({
  args: {
    title: v.optional(v.string()),
  },
  returns: v.object({
    threadId: v.id("assistantThreads"),
  }),
  handler: async (ctx, args) => {
    const userId = await requireAuthenticatedBuyer(ctx, () => getAuthUserId(ctx));
    return createAssistantThread(ctx as never, {
      owner: getClientOwner(userId),
      assistantKind: CLIENT_ASSISTANT_KIND,
      orchestratorName: CLIENT_ORCHESTRATOR_NAME,
      mode: "qa",
      title: args.title?.trim() || "Buyer conversation",
    });
  },
});

/**
 * WHY:   Guest conversations should survive the sign-in redirect and become part of the buyer's saved history.
 * WHAT:  Persists a client transcript into a new authenticated assistant thread.
 * HOW:   Creates one buyer-owned thread, writes the ordered transcript, and returns the resulting thread id.
 */
export const seedClientThreadFromTranscript = mutation({
  args: {
    title: v.optional(v.string()),
    messages: v.array(clientTranscriptSeedMessageValidator),
  },
  returns: v.object({
    threadId: v.id("assistantThreads"),
  }),
  handler: async (ctx, args) => {
    const userId = await requireAuthenticatedBuyer(ctx, () => getAuthUserId(ctx));
    const resolvedTitle =
      args.title?.trim() ||
      args.messages.find((message) => message.role === "user")?.text.slice(0, 80) ||
      "Buyer conversation";

    const created = await createAssistantThread(ctx as never, {
      owner: getClientOwner(userId),
      assistantKind: CLIENT_ASSISTANT_KIND,
      orchestratorName: CLIENT_ORCHESTRATOR_NAME,
      mode: "qa",
      title: resolvedTitle,
    });

    const now = Date.now();
    for (const [index, message] of args.messages.entries()) {
      await ctx.db.insert("assistantMessages", {
        threadId: created.threadId,
        role: message.role,
        content: message.text,
        mode: "qa",
        metadata: buildAssistantMetadata(message),
        createdAt: now + index,
      });
    }

    await ctx.db.patch(created.threadId, {
      title: resolvedTitle,
      updatedAt: now + args.messages.length,
      mode: "qa",
      assistantKind: CLIENT_ASSISTANT_KIND,
      orchestratorName: CLIENT_ORCHESTRATOR_NAME,
    });

    return created;
  },
});

/**
 * WHY:   The deterministic web assistant action still needs a write path into saved buyer conversations.
 * WHAT:  Persists one client assistant turn into the shared assistant thread tables.
 * HOW:   Wraps the shared save helper with the fixed buyer owner and assistant-kind metadata.
 */
export const persistClientConversationTurn = internalMutation({
  args: {
    threadId: v.optional(v.id("assistantThreads")),
    userId: v.string(),
    userMessage: v.string(),
    userMessageMetadata: v.optional(v.any()),
    assistantMessage: v.string(),
    assistantMetadata: v.optional(v.any()),
  },
  returns: v.object({
    threadId: v.id("assistantThreads"),
    userMessageId: v.optional(v.id("assistantMessages")),
    assistantMessageId: v.id("assistantMessages"),
  }),
  handler: async (ctx, args) => {
    const saved = await saveConversationStep(ctx as never, {
      ...args,
      ownerType: "user",
      mode: "qa",
      assistantKind: CLIENT_ASSISTANT_KIND,
      orchestratorName: CLIENT_ORCHESTRATOR_NAME,
    });
    return {
      ...saved,
      userMessageId: saved.userMessageId ?? undefined,
    };
  },
});
