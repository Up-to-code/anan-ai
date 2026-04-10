import { getAuthUserId } from "../../_core/security/authIdentity";
import { ConvexError, type Infer, v } from "convex/values";
import { api, internal } from "../../_generated/api";
import { internalMutation, mutation, query } from "../../_generated/server";
import {
  createAssistantThread,
  getLatestThreadPreview,
  listRecentThreads,
  listThreadMessages,
  saveConversationStep,
} from "../../ai_zone/services/assistantService";
import { buildBuyerComparisonSnapshot } from "../../shared_logic/buyerComparisons";
import {
  clientThreadMessageValidator,
  clientThreadSummaryValidator,
  clientTranscriptSeedMessageValidator,
} from "./contracts";

const CLIENT_ASSISTANT_KIND = "anan_main_public" as const;
const CLIENT_ORCHESTRATOR_NAME = "client_web";
const buyerComparisonsInternal = (internal as Record<string, any>)["shared_logic/buyerComparisons"];

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

function readOptionalPropertyIds(value: unknown) {
  return Array.isArray(value) ? (value as StoredClientMessage["comparisonPropertyIds"]) : undefined;
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
    comparisonArtifactId:
      typeof metadata.comparisonArtifactId === "string" ? (metadata.comparisonArtifactId as never) : undefined,
    comparisonPropertyIds: readOptionalPropertyIds(metadata.comparisonPropertyIds),
    selectionSource:
      metadata.selectionSource === "ui_selected" ||
      metadata.selectionSource === "history_resolved" ||
      metadata.selectionSource === "text_resolved"
        ? metadata.selectionSource
        : undefined,
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
    comparisonArtifactId: message.comparisonArtifactId,
    comparisonPropertyIds: message.comparisonPropertyIds,
    selectionSource: message.selectionSource,
  };
}

async function hydrateStoredMessages(args: {
  ctx: any;
  threadId?: string;
  messages: Array<{
    _id: string;
    role: "assistant" | "user";
    content: string;
    createdAt: number;
    metadata?: unknown;
  }>;
}) {
  const artifactCache = new Map<string, Promise<any>>();
  const propertyCache = new Map<string, Promise<any>>();

  const loadArtifact = async (artifactId: string) => {
    if (!artifactCache.has(artifactId)) {
      artifactCache.set(
        artifactId,
        args.ctx.runQuery(
          buyerComparisonsInternal.getBuyerComparisonArtifactInternal,
          {
            artifactId,
            threadId: args.threadId,
          },
        ),
      );
    }
    return artifactCache.get(artifactId);
  };

  const loadProperty = async (propertyId: string) => {
    if (!propertyCache.has(propertyId)) {
      propertyCache.set(
        propertyId,
        args.ctx.runQuery(
          api.user_zone.web.properties.getPropertyDetail,
          { propertyId },
        ),
      );
    }
    return propertyCache.get(propertyId);
  };

  return Promise.all(
    args.messages.map(async (message) => {
      const mapped = mapStoredMessage(message);
      if (!mapped.comparisonArtifactId) return mapped;

      const artifact = await loadArtifact(String(mapped.comparisonArtifactId));
      if (!artifact) return mapped;

      const liveProperties = await Promise.all(
        (artifact.propertyIds as string[]).map((propertyId) => loadProperty(propertyId)),
      );
      const snapshot =
        liveProperties.every(Boolean) && liveProperties.length >= 2
          ? buildBuyerComparisonSnapshot({
              locale: artifact.locale,
              properties: liveProperties as any,
              selectionSource: artifact.selectionSource,
            }).snapshot
          : artifact.snapshot;

      return {
        ...mapped,
        text: snapshot.message,
        properties: snapshot.properties,
        cards: snapshot.cards,
        activePropertyId: snapshot.activePropertyId,
        suggestedPrompts: snapshot.suggestedPrompts,
      } satisfies StoredClientMessage;
    }),
  );
}

async function requireAuthenticatedBuyer(ctx: { auth: unknown }, authReader: () => Promise<string | null>) {
  const userId = await authReader();
  if (!userId) {
    throw new ConvexError({ code: "UNAUTHORIZED", message: "Authentication required" });
  }
  return userId;
}

async function buildClientThreadSummaries(ctx: any, threads: Array<{
  _id: string;
  title?: string;
  createdAt: number;
  updatedAt: number;
}>) {
  return Promise.all(
    threads.map(async (thread) => ({
      id: thread._id as never,
      title: thread.title?.trim() || "Buyer conversation",
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
      preview: await getLatestThreadPreview(ctx, thread._id as never),
    })),
  );
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

    return buildClientThreadSummaries(ctx, threads as any);
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

    return hydrateStoredMessages({
      ctx,
      threadId: args.threadId ? String(args.threadId) : undefined,
      messages: messages as any,
    });
  },
});

/**
 * WHY:   The buyer web and mobile surfaces should hydrate saved-thread state with one live query instead of separate thread-list and message reads.
 * WHAT:  Returns recent saved buyer threads plus the active thread transcript for the requested thread id.
 * HOW:   Uses the indexed assistant thread/message service helpers and projects the payload into the existing client DTO contracts.
 */
export const getClientAssistantState = query({
  args: {
    threadId: v.optional(v.id("assistantThreads")),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    recentThreads: v.array(clientThreadSummaryValidator),
    activeMessages: v.array(clientThreadMessageValidator),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        recentThreads: [],
        activeMessages: [],
      };
    }

    const owner = getClientOwner(userId);
    const [threads, messages] = await Promise.all([
      listRecentThreads(
        ctx as never,
        owner,
        CLIENT_ASSISTANT_KIND,
        args.limit ?? 12,
      ),
      listThreadMessages(
        ctx as never,
        owner,
        args.threadId,
        CLIENT_ASSISTANT_KIND,
      ),
    ]);

    return {
      recentThreads: await buildClientThreadSummaries(ctx, threads as any),
      activeMessages: await hydrateStoredMessages({
        ctx,
        threadId: args.threadId ? String(args.threadId) : undefined,
        messages: messages as any,
      }),
    };
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
