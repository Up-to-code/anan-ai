import { ConvexError, v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import { action, internalMutation, internalQuery, mutation, query } from "../_generated/server";
import { internal } from "../_generated/api";
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

const ASSISTANT_KIND = "anan_main_public" as const;
const ORCHESTRATOR_NAME = "anan_main_public_orchestrator";
const PUBLIC_CHANNEL = "main_assistant_web" as const;
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
  args: { guestId: string; channelSessionToken: string; threadId?: Id<"assistantThreads"> },
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
  handler: async (ctx, args) => {
    const session = await resolvePublicSessionForRead(ctx, args);
    return {
      thread: session.thread,
      owner: session.owner,
      guestId: session.guestId,
      expiresAt: session.expiresAt,
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
    return listThreadMessages(ctx as any, session.owner, resolvedThreadId, ASSISTANT_KIND);
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

/**
 * WHY:   Public assistant sends should reuse the existing assistant pipeline while keeping output compact for speech.
 * WHAT:  Sends one text or voice-derived message through the shared orchestrator and rewrites overlong replies compactly.
 * HOW:   Resolves the guest session, delegates to `handleAssistantMessage`, then compacts and patches the assistant turn if needed.
 */
export const sendMessage = action({
  args: {
    guestId: v.string(),
    channelSessionToken: v.string(),
    message: v.string(),
    threadId: v.optional(v.id("assistantThreads")),
    inputMode: v.optional(v.union(v.literal("text"), v.literal("voice"))),
  },
  returns: v.object({
    ok: v.literal(true),
    threadId: v.string(),
    mode: v.union(v.literal("qa"), v.literal("action")),
    output: v.string(),
    messageId: v.string(),
    compacted: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const session = (await ctx.runQuery(internal.ai_zone.assistantPublic._resolvePublicSession, {
      guestId: args.guestId,
      channelSessionToken: args.channelSessionToken,
      threadId: args.threadId,
    })) as PublicSession;

    const result = await handleAssistantMessage(ctx, {
      message: args.message,
      threadId: args.threadId ?? session.thread?._id,
      inputMode: args.inputMode,
      assistantKind: ASSISTANT_KIND,
      orchestratorName: ORCHESTRATOR_NAME,
      promptPrefix: PROMPT_PREFIX,
      ownerOverride: session.owner,
      initialThreadOverride: session.thread,
      saveConversationStepMutationOverride: internal.ai_zone.assistantPublic._saveConversationStep,
    });

    const compacted = compactAssistantResponse(result.output);
    if (compacted.changed) {
      await ctx.runMutation(internal.ai_zone.assistantPublic._rewriteAssistantMessage, {
        messageId: result.messageId as Id<"assistantMessages">,
        content: compacted.text,
      });
    }

    return {
      ...result,
      output: compacted.text,
      compacted: compacted.changed,
    };
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
