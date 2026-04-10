import { getAuthUserId } from "../_core/security/authIdentity";
import { ConvexError, v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import { action, internalMutation, internalQuery, mutation, query } from "../_generated/server";
import { api, internal } from "../_generated/api";
import {
  createAssistantThread,
  getLatestThread,
  getThreadById,
  handleAssistantMessage,
  listThreadMessages,
  saveConversationStep,
  type AssistantOwner,
} from "./services/assistantService";
import { transcribeStoredVoiceNote } from "./services/voiceTranscriptionService";
import { compactAssistantResponse } from "./services/publicAssistantResponse";
import { synthesizeAssistantVoice as synthesizeAssistantVoiceAudio } from "./services/voiceSynthesisService";
import { issueChannelSession } from "../_core/security/channelAuth";
import { buildStructuredBuyerResponse } from "./services/publicBuyerResponse";
import { buildBuyerComparisonSnapshot } from "../shared_logic/buyerComparisons";
import {
  buildCompiledBuyerContextPayload,
  buyerQualificationValidator,
} from "../shared_logic/buyerContext";
import { selectRegenerateSource } from "./services/assistantService/promptComposer";
import { resolveAssistantEntitlementForCurrentProfile } from "../shared_logic/subscriptions/index";

const ASSISTANT_KIND = "anan_main_public" as const;
const ORCHESTRATOR_NAME = "anan_main_public_orchestrator";
const PUBLIC_CHANNEL = "main_assistant_web" as const;
const buyerComparisonsInternal = (internal as Record<string, any>)["shared_logic/buyerComparisons"];
const PROMPT_PREFIX = [
  "[Etijah Main Assistant System Prompt]",
  "Identity and purpose:",
  "You are the official AI assistant and public-facing agent for Etijah. The official website is https://www.etijah.online.",
  "Etijah and its systems, product architecture, and infrastructure were founded and programmed by Ahmed Mansour.",
  "If a user asks who created the company, who built the platform, who programmed the systems, or who the founder is, answer clearly and directly: Etijah is the company, and its founder and the programmer of its systems is Ahmed Mansour.",
  "Primary role:",
  "You represent the company, its platform, and its flagship real-estate AI infrastructure project.",
  "Your job is not only to answer feature questions, but to help people understand the identity, purpose, value, architecture, and strategic importance of the full system.",
  "You should be able to explain the old product, the current product direction, the core platform idea, why it matters, how it works, and why investors, developers, brokers, and buyers should care.",
  "Platform overview:",
  "Etijah is an AI infrastructure platform built specifically for real estate.",
  "It is not a traditional dashboard with heavy menus. It is a conversation-first system where natural language is the main interface.",
  "Users should be able to search, qualify leads, understand financing, coordinate sales, manage support, and operate workflows through conversation.",
  "The platform exists to unify data, sales, customer service, and marketing in one simple operating layer.",
  "Who you serve:",
  "For buyers and investors: help them discover properties, compare options, understand financing, estimate returns, and evaluate opportunities.",
  "For brokers: help them manage workflow, match inventory to clients, write follow-up messages, and support broker-to-broker collaboration when one broker has a client and another has matching inventory.",
  "For developers: help them understand market demand, trends, and live intelligence derived from platform conversations so they can make better pricing, positioning, and development decisions.",
  "Technical architecture:",
  "You operate within a hierarchical multi-agent architecture with a central orchestrator.",
  "The orchestrator analyzes intent, distributes work in parallel to specialized teams such as search, finance, and knowledge, and merges the results into one answer.",
  "The system continuously improves through a dual-RAG loop, where new facts from conversations can be extracted, reviewed, approved, and added back into the knowledge system.",
  "The ecosystem is connected through a unified API layer so the same core data can power web experiences, support systems, WhatsApp, and other channels without duplicated entry.",
  "Behavior rules:",
  "Be precise, professional, fast, and trustworthy.",
  "Be friendly and warm. You may be lightly witty or gently jokey sometimes, but never too much and never at the cost of clarity or credibility.",
  "Your vibe is calm, smooth, low-pressure, and confident.",
  "When the user writes in Arabic, respond in natural, high-quality Arabic tailored for the Middle East real-estate market.",
  "When the user writes in English, respond in clear professional English.",
  "Mirror the user's language unless they explicitly ask you to switch languages.",
  "When discussing Etijah's identity, always speak proudly and clearly about Etijah and Ahmed Mansour.",
  "When useful, explain not only what the system does, but why it was built this way and what strategic advantage this creates.",
  "Default response style:",
  "Use medium-compact responses, usually 2 to 5 short sentences unless the user asks for more depth.",
  "Give the main answer first, avoid filler, avoid bloated lists, and keep phrasing clean for fast rendering and text-to-speech playback.",
  "If the user is confused about the platform, product identity, architecture, or business value, answer like an expert advisor who deeply understands the entire system end to end.",
].join("\n");

type PublicSession = {
  guestId: string;
  authUserId: string;
  owner: AssistantOwner;
  thread: Doc<"assistantThreads"> | null;
  sessionToken: string;
  expiresAt: number;
};

type StoredBuyerMessage = {
  id: Id<"assistantMessages">;
  role: "assistant" | "user";
  text: string;
  createdAt: number;
  properties?: unknown[];
  cards?: unknown[];
  activePropertyId?: Id<"properties">;
  requiresAuthForHandoff?: boolean;
  suggestedPrompts?: string[];
  comparisonArtifactId?: Id<"buyerComparisonArtifacts">;
  comparisonPropertyIds?: Array<Id<"properties">>;
  selectionSource?: "ui_selected" | "history_resolved" | "text_resolved";
  buyerContext?: unknown;
};

function describeVoiceSynthesisFallback(error: unknown) {
  if (error instanceof ConvexError) {
    const payload = error.data;
    if (payload && typeof payload === "object") {
      const code = "code" in payload ? payload.code : undefined;
      const message = "message" in payload ? payload.message : undefined;
      if (code === "AUTH_CONFIGURATION_ERROR") {
        return "Voice replies are not configured in this environment yet.";
      }
      if (typeof message === "string" && message.trim()) {
        return message;
      }
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Voice replies are unavailable right now.";
}

function buildGuestAuthUserId(guestId: string) {
  return `channel:${PUBLIC_CHANNEL}:${guestId}`;
}

function readOptionalArray(value: unknown) {
  return Array.isArray(value) ? value : undefined;
}

function mapStoredMessage(message: {
  _id: Id<"assistantMessages">;
  role: "assistant" | "user";
  content: string;
  createdAt: number;
  metadata?: unknown;
}): StoredBuyerMessage {
  const metadata = (message.metadata ?? {}) as Record<string, unknown>;
  return {
    id: message._id,
    role: message.role,
    text: message.content,
    createdAt: message.createdAt,
    properties: readOptionalArray(metadata.properties),
    cards: readOptionalArray(metadata.cards),
    activePropertyId:
      typeof metadata.activePropertyId === "string"
        ? (metadata.activePropertyId as Id<"properties">)
        : undefined,
    requiresAuthForHandoff:
      typeof metadata.requiresAuthForHandoff === "boolean"
        ? metadata.requiresAuthForHandoff
        : undefined,
    suggestedPrompts: readOptionalArray(metadata.suggestedPrompts) as string[] | undefined,
    comparisonArtifactId:
      typeof metadata.comparisonArtifactId === "string"
        ? (metadata.comparisonArtifactId as Id<"buyerComparisonArtifacts">)
        : undefined,
    comparisonPropertyIds: readOptionalArray(metadata.comparisonPropertyIds) as
      | Array<Id<"properties">>
      | undefined,
    selectionSource:
      metadata.selectionSource === "ui_selected" ||
      metadata.selectionSource === "history_resolved" ||
      metadata.selectionSource === "text_resolved"
        ? metadata.selectionSource
        : undefined,
    buyerContext: metadata.buyerContext,
  };
}

async function hydrateStoredMessages(args: {
  ctx: any;
  threadId?: Id<"assistantThreads">;
  messages: Array<{
    _id: Id<"assistantMessages">;
    role: "assistant" | "user";
    content: string;
    createdAt: number;
    metadata?: unknown;
  }>;
}) {
  const artifactCache = new Map<string, Promise<any>>();
  const propertyCache = new Map<string, Promise<any>>();

  const loadArtifact = async (artifactId: Id<"buyerComparisonArtifacts">) => {
    const key = String(artifactId);
    if (!artifactCache.has(key)) {
      artifactCache.set(
        key,
        args.ctx.runQuery(
          buyerComparisonsInternal.getBuyerComparisonArtifactInternal,
          {
            artifactId,
            threadId: args.threadId,
          },
        ),
      );
    }
    return artifactCache.get(key);
  };

  const loadProperty = async (propertyId: Id<"properties">) => {
    const key = String(propertyId);
    if (!propertyCache.has(key)) {
      propertyCache.set(
        key,
        args.ctx.runQuery(
          (api as any)["user_zone/web/properties"].getPropertyDetail,
          { propertyId },
        ),
      );
    }
    return propertyCache.get(key);
  };

  return Promise.all(
    args.messages.map(async (message) => {
      const mapped = mapStoredMessage(message);
      if (!mapped.comparisonArtifactId) return mapped;

      const artifact = await loadArtifact(mapped.comparisonArtifactId);
      if (!artifact) return mapped;

      const liveProperties = await Promise.all(
        (artifact.propertyIds as Array<Id<"properties">>).map((propertyId) =>
          loadProperty(propertyId),
        ),
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
      };
    }),
  );
}

function sanitizeBuyerContext(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, any>;
  return {
    state: record.state ?? null,
    memory: {
      summary: record.memory?.summary ?? "",
      lastSearchSummary: record.memory?.lastSearchSummary ?? null,
    },
    summaries: record.summaries ?? {},
  };
}

async function ensureGuestUser(ctx: { db: any }, guestId: string) {
  const authUserId = buildGuestAuthUserId(guestId);
  const existing = await ctx.db
    .query("users")
    .withIndex("userId", (q: any) => q.eq("userId", guestId))
    .first();

  if (existing) {
    const nextPatch: Record<string, unknown> = {};
    if (existing.channel !== PUBLIC_CHANNEL) nextPatch.channel = PUBLIC_CHANNEL;
    if (existing.isAnonymous !== true) nextPatch.isAnonymous = true;
    if (Object.keys(nextPatch).length > 0) {
      await ctx.db.patch(existing._id, nextPatch);
    }
    return { authUserId, userId: existing._id } as const;
  }

  const userId = await ctx.db.insert("users", {
    userId: guestId,
    channel: PUBLIC_CHANNEL,
    isAnonymous: true,
    name: `Main Assistant Guest ${guestId.slice(-6)}`,
    displayName: "Main Assistant Guest",
  });

  return { authUserId, userId } as const;
}

async function resolvePublicSessionForRead(
  ctx: { db: any },
  args: {
    guestId: string;
    channelSessionToken: string;
    threadId?: Id<"assistantThreads">;
    startFresh?: boolean;
  },
): Promise<PublicSession> {
  const authUserId = buildGuestAuthUserId(args.guestId);
  const session = await ctx.db
    .query("channelSessions")
    .withIndex("authUserId_channel", (q: any) => q.eq("authUserId", authUserId).eq("channel", PUBLIC_CHANNEL))
    .first();

  if (!session || session.sessionToken !== args.channelSessionToken) {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "Invalid public assistant session.",
    });
  }

  if (session.expiresAt <= Date.now()) {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "Public assistant session expired.",
    });
  }

  const owner: AssistantOwner = {
    userId: authUserId,
    ownerType: "user",
  };

  const thread = args.threadId
    ? await getThreadById(ctx as any, owner, args.threadId, ASSISTANT_KIND)
    : args.startFresh
      ? null
      : await getLatestThread(ctx as any, owner, ASSISTANT_KIND);

  return {
    guestId: args.guestId,
    authUserId,
    owner,
    thread,
    sessionToken: session.sessionToken,
    expiresAt: session.expiresAt,
  };
}

async function resolveAuthenticatedSessionForRead(
  ctx: any,
  args: { threadId?: Id<"assistantThreads">; startFresh?: boolean },
) {
  const authUserId = await getAuthUserId(ctx as any);
  if (!authUserId) {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "Authentication required for saved buyer history.",
    });
  }

  const owner: AssistantOwner = {
    userId: authUserId,
    ownerType: "user",
  };

  const thread = args.threadId
    ? await getThreadById(ctx as any, owner, args.threadId, ASSISTANT_KIND)
    : args.startFresh
      ? null
      : await getLatestThread(ctx as any, owner, ASSISTANT_KIND);

  return {
    authUserId,
    owner,
    thread,
  };
}

async function resolveAssistantPublicSession(
  ctx: any,
  args: {
    guestId?: string;
    channelSessionToken?: string;
    threadId?: Id<"assistantThreads">;
    startFresh?: boolean;
  },
) {
  if (args.guestId && args.channelSessionToken) {
    return resolvePublicSessionForRead(ctx, {
      guestId: args.guestId,
      channelSessionToken: args.channelSessionToken,
      threadId: args.threadId,
      startFresh: args.startFresh,
    });
  }

  const authenticated = await resolveAuthenticatedSessionForRead(ctx, {
    threadId: args.threadId,
    startFresh: args.startFresh,
  });

  return {
    ...authenticated,
    guestId: undefined,
    sessionToken: undefined,
    expiresAt: undefined,
  };
}

/**
 * WHY:   The public assistant needs a durable guest identity without browser auth.
 * WHAT:  Creates or refreshes an anonymous guest session backed by the shared channelSessions table.
 * HOW:   Ensures a guest user row exists, then issues a channel session token for `main_assistant_web`.
 */
export const bootstrapSession = mutation({
  args: {
    guestId: v.optional(v.string()),
  },
  returns: v.object({
    guestId: v.string(),
    channelSessionToken: v.string(),
    expiresAt: v.number(),
    threadId: v.optional(v.id("assistantThreads")),
  }),
  handler: async (ctx, args) => {
    const guestId = args.guestId?.trim() || crypto.randomUUID();
    const guest = await ensureGuestUser(ctx, guestId);
    const session = await issueChannelSession(ctx, {
      authUserId: guest.authUserId,
      channel: PUBLIC_CHANNEL,
    });
    const owner: AssistantOwner = { userId: guest.authUserId, ownerType: "user" };
    const thread = await getLatestThread(ctx as any, owner, ASSISTANT_KIND);

    return {
      guestId,
      channelSessionToken: session.sessionToken,
      expiresAt: session.expiresAt,
      threadId: thread?._id,
    };
  },
});

/**
 * WHY:   Action-based public assistant endpoints need one centralized session resolver.
 * WHAT:  Returns the validated guest channel session, owner, and active thread projection.
 * HOW:   Uses guestId + opaque session token against the shared channelSessions table and assistant thread store.
 */
export const _resolvePublicSession = internalQuery({
  args: {
    guestId: v.string(),
    channelSessionToken: v.string(),
    threadId: v.optional(v.id("assistantThreads")),
  },
  returns: v.any(),
  handler: async (ctx, args) => resolvePublicSessionForRead(ctx, args),
});

export const _listMessagesForOwner = internalQuery({
  args: {
    userId: v.string(),
    threadId: v.id("assistantThreads"),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const owner: AssistantOwner = {
      userId: args.userId,
      ownerType: "user",
    };
    return listThreadMessages(ctx as any, owner, args.threadId, ASSISTANT_KIND);
  },
});

/**
 * WHY:   The public app must load the latest thread without requiring authenticated workspace access.
 * WHAT:  Returns the latest accessible thread plus guest owner information for the public assistant surface.
 * HOW:   Validates the guest channel session, then reads the latest thread scoped to the public assistant kind.
 */
export const getThreadSafe = query({
  args: {
    guestId: v.string(),
    channelSessionToken: v.string(),
    threadId: v.optional(v.id("assistantThreads")),
  },
  returns: v.any(),
  handler: async (ctx, args): Promise<any> => {
    const session = await resolvePublicSessionForRead(ctx, args);
    const buyerContext: unknown = await ctx.runQuery(
      internal.shared_logic.buyerContext.getBuyerContextInternal,
      {
        channel: "web",
        userId: session.owner.userId,
      },
    );
    return {
      thread: session.thread,
      owner: session.owner,
      guestId: session.guestId,
      expiresAt: session.expiresAt,
      buyerContext: sanitizeBuyerContext(buyerContext),
    };
  },
});

/**
 * WHY:   The public conversation UI needs thread messages through the same persistence model as other assistants.
 * WHAT:  Lists messages for the requested public assistant thread.
 * HOW:   Validates the guest session, then delegates to the shared assistant thread message reader.
 */
export const listMessages = query({
  args: {
    guestId: v.string(),
    channelSessionToken: v.string(),
    threadId: v.optional(v.id("assistantThreads")),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const session = await resolvePublicSessionForRead(ctx, args);
    const resolvedThreadId = args.threadId ?? session.thread?._id;
    const messages = await listThreadMessages(
      ctx as any,
      session.owner,
      resolvedThreadId,
      ASSISTANT_KIND,
    );
    return hydrateStoredMessages({
      ctx,
      threadId: resolvedThreadId,
      messages,
    });
  },
});

/**
 * WHY:   Signed-in buyers should reopen saved public-assistant threads through the same `anan_main_public` thread store.
 * WHAT:  Returns the authenticated buyer's latest or requested public assistant thread plus current buyer context.
 * HOW:   Resolves the authenticated owner, then reads the public assistant thread and shared buyer state.
 */
export const getAuthenticatedThread = query({
  args: {
    threadId: v.optional(v.id("assistantThreads")),
  },
  returns: v.any(),
  handler: async (ctx, args): Promise<any> => {
    const session = await resolveAuthenticatedSessionForRead(ctx, args);
    const buyerContext: unknown = await ctx.runQuery(
      internal.shared_logic.buyerContext.getBuyerContextInternal,
      {
        channel: "web",
        userId: session.owner.userId,
      },
    );
    return {
      thread: session.thread,
      owner: session.owner,
      buyerContext: sanitizeBuyerContext(buyerContext),
    };
  },
});

/**
 * WHY:   Authenticated buyers should read persisted public-assistant transcripts without falling back to session-only browser state.
 * WHAT:  Lists structured thread messages for one authenticated buyer thread.
 * HOW:   Reuses the shared assistant thread store and maps metadata into the buyer-web message DTO shape.
 */
export const listAuthenticatedMessages = query({
  args: {
    threadId: v.optional(v.id("assistantThreads")),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const session = await resolveAuthenticatedSessionForRead(ctx, args);
    const resolvedThreadId = args.threadId ?? session.thread?._id;
    const messages = await listThreadMessages(
      ctx as any,
      session.owner,
      resolvedThreadId,
      ASSISTANT_KIND,
    );
    return hydrateStoredMessages({
      ctx,
      threadId: resolvedThreadId,
      messages,
    });
  },
});

/**
 * WHY:   Buyer chat surfaces should hydrate public-assistant state with one live query per active mode.
 * WHAT:  Returns the active public-assistant thread, ordered messages, and buyer context for either guest or authenticated buyers.
 * HOW:   Resolves the appropriate owner/session first, then reads the shared public thread store and buyer context once.
 */
export const getThreadState = query({
  args: {
    guestId: v.optional(v.string()),
    channelSessionToken: v.optional(v.string()),
    threadId: v.optional(v.id("assistantThreads")),
  },
  returns: v.any(),
  handler: async (ctx, args): Promise<any> => {
    const session = await resolveAssistantPublicSession(ctx, args);
    const resolvedThreadId = args.threadId ?? session.thread?._id;
    const [messages, buyerContext] = await Promise.all([
      resolvedThreadId
        ? listThreadMessages(ctx as any, session.owner, resolvedThreadId, ASSISTANT_KIND)
        : [],
      ctx.runQuery(
        internal.shared_logic.buyerContext.getBuyerContextInternal,
        {
          channel: "web",
          userId: session.owner.userId,
        },
      ),
    ]);

    return {
      thread: session.thread,
      owner: session.owner,
      guestId: session.guestId,
      expiresAt: session.expiresAt,
      messages: await hydrateStoredMessages({
        ctx,
        threadId: resolvedThreadId,
        messages,
      }),
      buyerContext: sanitizeBuyerContext(buyerContext),
    };
  },
});

/**
 * WHY:   Public assistant sends should resolve all pre-orchestration state through one backend bundle read.
 * WHAT:  Returns owner, thread, entitlement, transcript history, and read-only compiled buyer context for one send attempt.
 * HOW:   Resolves the guest/auth session, loads the public thread transcript, computes regenerate context, and compiles buyer context without writes.
 */
export const getRuntimeContextBundle = query({
  args: {
    guestId: v.optional(v.string()),
    channelSessionToken: v.optional(v.string()),
    threadId: v.optional(v.id("assistantThreads")),
    startFresh: v.optional(v.boolean()),
    message: v.string(),
    regenerate: v.optional(v.boolean()),
    regenerateMessageId: v.optional(v.string()),
  },
  returns: v.any(),
  handler: async (ctx, args): Promise<any> => {
    const session = await resolveAssistantPublicSession(ctx, args);
    const resolvedThreadId = args.threadId ?? session.thread?._id;
    const existingMessages = resolvedThreadId
      ? await listThreadMessages(
          ctx as any,
          session.owner,
          resolvedThreadId,
          ASSISTANT_KIND,
        )
      : [];
    const regenerateSource = selectRegenerateSource({
      existingMessages: existingMessages as Array<any>,
      regenerate: args.regenerate,
      regenerateMessageId: args.regenerateMessageId,
    });
    const effectiveUserMessage = regenerateSource?.content ?? args.message;
    const [entitlement, compiledBuyerContext] = await Promise.all([
      resolveAssistantEntitlementForCurrentProfile(ctx, { safe: true }),
      buildCompiledBuyerContextPayload({
        ctx,
        channel: "web",
        userId: session.owner.userId,
        message: effectiveUserMessage,
        threadId: resolvedThreadId,
        persistCompiledCache: false,
        startFresh: args.startFresh,
      }),
    ]);

    return {
      thread: session.thread,
      owner: session.owner,
      guestId: session.guestId,
      expiresAt: session.expiresAt,
      entitlement,
      existingMessages,
      regenerateSource,
      effectiveUserMessage,
      compiledBuyerContext,
    };
  },
});

/**
 * WHY:   The public app should be able to allocate a durable thread before the first assistant turn.
 * WHAT:  Creates a new empty thread for the guest public assistant session.
 * HOW:   Validates the guest session and delegates to the shared assistant thread creator with the public kind.
 */
export const createThread = mutation({
  args: {
    guestId: v.string(),
    channelSessionToken: v.string(),
    title: v.optional(v.string()),
  },
  returns: v.object({
    threadId: v.id("assistantThreads"),
  }),
  handler: async (ctx, args) => {
    const session = await resolvePublicSessionForRead(ctx, args);
    return createAssistantThread(ctx, {
      owner: session.owner,
      assistantKind: ASSISTANT_KIND,
      orchestratorName: ORCHESTRATOR_NAME,
      title: args.title?.trim() || "New conversation",
    });
  },
});

/**
 * WHY:   Voice uploads from the public browser still need a backend-issued storage upload URL.
 * WHAT:  Returns a Convex storage upload URL after validating the guest session.
 * HOW:   Reuses the shared storage primitive once the session token is accepted.
 */
export const generateVoiceUploadUrl = mutation({
  args: {
    guestId: v.string(),
    channelSessionToken: v.string(),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    await resolvePublicSessionForRead(ctx, args);
    return ctx.storage.generateUploadUrl();
  },
});

async function buildStructuredTurn(args: {
  ctx: any;
  owner: AssistantOwner;
  initialThread: Doc<"assistantThreads"> | null;
  message: string;
  startFresh?: boolean;
  inputMode?: "text" | "voice";
  locale?: "ar" | "en" | "fr";
  qualification?: {
    monthlySalary?: number;
    downPayment?: number;
    preferredYears?: number;
    employmentStatus?: string;
    notes?: string;
  };
  selectedPropertyId?: Id<"properties">;
  selectedPropertyIds?: Id<"properties">[];
  runtimeContextOverride?: {
    thread?: Doc<"assistantThreads"> | null;
    owner: AssistantOwner;
    entitlement?: { mode: "qa" | "action" };
    existingMessages?: Array<Doc<"assistantMessages">>;
    regenerateSource?: Doc<"assistantMessages"> | null;
    effectiveUserMessage?: string;
    compiledBuyerContext?: {
      compiledPromptContext: string;
      promptBudgetMeta: unknown;
    } | null;
  };
}) {
  const result = await handleAssistantMessage(args.ctx, {
    message: args.message,
    threadId: args.initialThread?._id,
    inputMode: args.inputMode,
    userMessageMetadata: {
      locale: args.locale,
      selectedPropertyId: args.selectedPropertyId,
      selectedPropertyIds: args.selectedPropertyIds,
    },
    assistantKind: ASSISTANT_KIND,
    orchestratorName: ORCHESTRATOR_NAME,
    promptPrefix: PROMPT_PREFIX,
    ownerOverride: args.owner,
    initialThreadOverride: args.initialThread,
    runtimeContextOverride: args.runtimeContextOverride,
    saveConversationStepMutationOverride:
      internal.ai_zone.assistantPublic._saveConversationStep,
  });

  const compacted = compactAssistantResponse(result.output);
  if (compacted.changed) {
    await args.ctx.runMutation(
      internal.ai_zone.assistantPublic._rewriteAssistantMessage,
      {
        messageId: result.messageId as Id<"assistantMessages">,
        content: compacted.text,
      },
    );
  }

  const structured = await buildStructuredBuyerResponse({
    ctx: args.ctx,
    owner: { userId: args.owner.userId },
    channel: "web",
    locale: args.locale ?? "ar",
    message: args.message,
    assistantText: compacted.text,
    threadId: result.threadId as Id<"assistantThreads">,
    startFresh: args.startFresh,
    selectedPropertyId: args.selectedPropertyId,
    selectedPropertyIds: args.selectedPropertyIds,
    triggerMessageId: result.userMessageId as Id<"assistantMessages"> | undefined,
    qualification: args.qualification,
    promptBudgetMeta: result.promptBudgetMeta as any,
  });

  if (structured.message !== compacted.text) {
    await args.ctx.runMutation(
      internal.ai_zone.assistantPublic._rewriteAssistantMessage,
      {
        messageId: result.messageId as Id<"assistantMessages">,
        content: structured.message,
      },
    );
  }

  await args.ctx.runMutation(
    internal.ai_zone.assistantPublic._patchAssistantMessageMetadata,
    {
      messageId: result.messageId as Id<"assistantMessages">,
      metadata: structured.comparisonArtifactId
        ? {
            requiresAuthForHandoff: structured.requiresAuthForHandoff,
            comparisonArtifactId: structured.comparisonArtifactId,
            comparisonPropertyIds: structured.comparisonPropertyIds,
            selectionSource: structured.selectionSource,
            buyerContext: structured.buyerContext,
          }
        : {
            properties: structured.properties,
            cards: structured.cards,
            suggestedPrompts: structured.suggestedPrompts,
            activePropertyId: structured.activePropertyId,
            requiresAuthForHandoff: structured.requiresAuthForHandoff,
            buyerContext: structured.buyerContext,
          },
    },
  );

  return {
    ok: true as const,
    threadId: String(result.threadId),
    mode: result.mode,
    messageId: String(result.messageId),
    compacted: compacted.changed,
    ...structured,
  };
}

/**
 * WHY:   Public assistant sends should reuse the existing assistant pipeline while keeping output compact for speech.
 * WHAT:  Sends one guest message through the shared orchestrator and returns a structured buyer payload for the web app.
 * HOW:   Resolves the guest session, runs the public orchestrator, then composes shortlist/cards/state metadata for the UI.
 */
export const sendMessage = action({
  args: {
    guestId: v.string(),
    channelSessionToken: v.string(),
    message: v.string(),
    threadId: v.optional(v.id("assistantThreads")),
    startFresh: v.optional(v.boolean()),
    inputMode: v.optional(v.union(v.literal("text"), v.literal("voice"))),
    locale: v.optional(v.union(v.literal("ar"), v.literal("en"), v.literal("fr"))),
    qualification: v.optional(buyerQualificationValidator),
    selectedPropertyId: v.optional(v.id("properties")),
    selectedPropertyIds: v.optional(v.array(v.id("properties"))),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const runtimeContext = await ctx.runQuery(
      api.ai_zone.assistantPublic.getRuntimeContextBundle,
      {
        guestId: args.guestId,
        channelSessionToken: args.channelSessionToken,
        threadId: args.threadId,
        startFresh: args.startFresh,
        message: args.message,
      } as never,
    ) as any;

    return buildStructuredTurn({
      ctx,
      owner: runtimeContext.owner,
      initialThread: runtimeContext.thread ?? null,
      message: args.message,
      startFresh: args.startFresh,
      inputMode: args.inputMode,
      locale: args.locale,
      qualification: args.qualification,
      selectedPropertyId: args.selectedPropertyId,
      selectedPropertyIds: args.selectedPropertyIds,
      runtimeContextOverride: runtimeContext,
    });
  },
});

/**
 * WHY:   Once the buyer signs in, the same public assistant should continue on the authenticated `anan_main_public` thread store.
 * WHAT:  Sends one authenticated public-web buyer message through the public orchestrator and structured response layer.
 * HOW:   Resolves the signed-in owner, loads the matching public thread, then reuses the same structured public send flow.
 */
export const sendAuthenticatedMessage = action({
  args: {
    message: v.string(),
    threadId: v.optional(v.id("assistantThreads")),
    startFresh: v.optional(v.boolean()),
    inputMode: v.optional(v.union(v.literal("text"), v.literal("voice"))),
    locale: v.optional(v.union(v.literal("ar"), v.literal("en"), v.literal("fr"))),
    qualification: v.optional(buyerQualificationValidator),
    selectedPropertyId: v.optional(v.id("properties")),
    selectedPropertyIds: v.optional(v.array(v.id("properties"))),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const runtimeContext = await ctx.runQuery(
      api.ai_zone.assistantPublic.getRuntimeContextBundle,
      {
        threadId: args.threadId,
        startFresh: args.startFresh,
        message: args.message,
      } as never,
    ) as any;

    return buildStructuredTurn({
      ctx,
      owner: runtimeContext.owner,
      initialThread: runtimeContext.thread ?? null,
      message: args.message,
      startFresh: args.startFresh,
      inputMode: args.inputMode,
      locale: args.locale,
      qualification: args.qualification,
      selectedPropertyId: args.selectedPropertyId,
      selectedPropertyIds: args.selectedPropertyIds,
      runtimeContextOverride: runtimeContext,
    });
  },
});

/**
 * WHY:   The signed-in public buyer flow should inherit the guest conversation instead of starting a blank saved history.
 * WHAT:  Promotes the guest public assistant thread/state/memory into the authenticated buyer account.
 * HOW:   Resolves the guest session, requires auth, then patches the stored rows in place so the thread id stays stable.
 */
export const promoteGuestToAuthenticatedBuyer = mutation({
  args: {
    guestId: v.string(),
    channelSessionToken: v.string(),
  },
  returns: v.object({
    threadId: v.optional(v.id("assistantThreads")),
    movedThreadIds: v.array(v.id("assistantThreads")),
  }),
  handler: async (ctx, args): Promise<any> => {
    const session = await resolvePublicSessionForRead(ctx, args);
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Authentication required to promote guest history.",
      });
    }

    const promoted: {
      activeThreadId?: Id<"assistantThreads">;
      movedThreadIds: Array<Id<"assistantThreads">>;
    } = await ctx.runMutation(
      internal.shared_logic.buyerContext.promoteBuyerContextInternal,
      {
        fromUserId: session.owner.userId,
        toUserId: authUserId,
      },
    );

    return {
      threadId: promoted.activeThreadId ?? session.thread?._id,
      movedThreadIds: promoted.movedThreadIds,
    };
  },
});

/**
 * WHY:   The public buyer UI needs one direct context read for bootstrapping selected property and recent qualification state.
 * WHAT:  Returns the guest buyer context resolved from the persisted public state + memory store.
 * HOW:   Validates the guest session, then reads the shared buyer context using the guest owner id.
 */
export const getBuyerContext = query({
  args: {
    guestId: v.string(),
    channelSessionToken: v.string(),
  },
  returns: v.any(),
  handler: async (ctx, args): Promise<any> => {
    const session = await resolvePublicSessionForRead(ctx, args);
    const buyerContext = await ctx.runQuery(internal.shared_logic.buyerContext.getBuyerContextInternal, {
      channel: "web",
      userId: session.owner.userId,
    });
    return sanitizeBuyerContext(buyerContext);
  },
});

/**
 * WHY:   Signed-in buyers also need the normalized public buyer context when reopening a saved thread.
 * WHAT:  Returns the authenticated buyer's public assistant context snapshot.
 * HOW:   Resolves the auth owner and reads the same shared buyer-context query used by the guest flow.
 */
export const getAuthenticatedBuyerContext = query({
  args: {},
  returns: v.any(),
  handler: async (ctx): Promise<any> => {
    const session = await resolveAuthenticatedSessionForRead(ctx, {});
    const buyerContext = await ctx.runQuery(internal.shared_logic.buyerContext.getBuyerContextInternal, {
      channel: "web",
      userId: session.owner.userId,
    });
    return sanitizeBuyerContext(buyerContext);
  },
});

/**
 * WHY:   Voice input in the public app should use the same private STT backend path as the workspace assistant.
 * WHAT:  Transcribes one uploaded storage object into text for the guest public assistant.
 * HOW:   Validates the guest session through an internal query, then delegates to the shared transcription service.
 */
export const transcribeVoiceFromStorage = action({
  args: {
    guestId: v.string(),
    channelSessionToken: v.string(),
    storageId: v.id("_storage"),
  },
  returns: v.object({
    text: v.string(),
    languageCode: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    await ctx.runQuery(internal.ai_zone.assistantPublic._resolvePublicSession, {
      guestId: args.guestId,
      channelSessionToken: args.channelSessionToken,
    });
    return transcribeStoredVoiceNote(ctx, args.storageId, { skipAuthorization: true });
  },
});

/**
 * WHY:   The public assistant needs one backend-controlled TTS endpoint so browser clients never see vendor secrets.
 * WHAT:  Synthesizes assistant text with ElevenLabs and returns browser-ready base64 audio metadata.
 * HOW:   Validates the guest session, compacts the text again defensively, then delegates to the ElevenLabs service.
 */
export const synthesizeAssistantVoice = action({
  args: {
    guestId: v.string(),
    channelSessionToken: v.string(),
    text: v.string(),
  },
  returns: v.object({
    text: v.string(),
    audioBase64: v.optional(v.string()),
    mimeType: v.optional(v.string()),
    voiceUnavailableReason: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    await ctx.runQuery(internal.ai_zone.assistantPublic._resolvePublicSession, {
      guestId: args.guestId,
      channelSessionToken: args.channelSessionToken,
    });
    const compacted = compactAssistantResponse(args.text);
    try {
      const audio = await synthesizeAssistantVoiceAudio(compacted.text);
      return {
        text: compacted.text,
        ...audio,
      };
    } catch (error) {
      const voiceUnavailableReason = describeVoiceSynthesisFallback(error);
      return {
        text: compacted.text,
        voiceUnavailableReason,
      };
    }
  },
});

export const _saveConversationStep = internalMutation({
  args: {
    threadId: v.optional(v.id("assistantThreads")),
    userId: v.string(),
    ownerType: v.union(v.literal("broker"), v.literal("RED"), v.literal("user")),
    ownerBrokerId: v.optional(v.id("brokers")),
    ownerREDId: v.optional(v.id("RED")),
    userMessage: v.string(),
    userMessageMetadata: v.optional(v.any()),
    persistUserMessage: v.optional(v.boolean()),
    assistantMessage: v.string(),
    assistantMetadata: v.optional(v.any()),
    mode: v.union(v.literal("qa"), v.literal("action")),
  },
  handler: async (ctx, args) =>
    saveConversationStep(ctx, {
      ...args,
      assistantKind: ASSISTANT_KIND,
      orchestratorName: ORCHESTRATOR_NAME,
    }),
});

export const _rewriteAssistantMessage = internalMutation({
  args: {
    messageId: v.id("assistantMessages"),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      content: args.content,
    });
    return null;
  },
});

export const _patchAssistantMessageMetadata = internalMutation({
  args: {
    messageId: v.id("assistantMessages"),
    metadata: v.any(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.messageId);
    if (!existing) return null;

    await ctx.db.patch(args.messageId, {
      metadata: {
        ...(typeof existing.metadata === "object" && existing.metadata ? existing.metadata : {}),
        ...(typeof args.metadata === "object" && args.metadata ? args.metadata : {}),
      },
    });
    return null;
  },
});
