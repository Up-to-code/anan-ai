import { v } from "convex/values";
import { action, internalMutation, mutation, query } from "../_generated/server";
import {
  createAssistantThread,
  getAccessibleThread,
  getLatestThread,
  handleAssistantMessage,
  listRecentThreads,
  listThreadMessages,
  resolveAssistantOwner,
  resolveAssistantOwnerSafe,
  saveConversationStep,
} from "./services/assistantService";
import { transcribeStoredVoiceNote } from "./services/voiceTranscriptionService";

const ASSISTANT_KIND = "anan_workspace" as const;
const ORCHESTRATOR_NAME = "anan_workspace_orchestrator";
const PROMPT_PREFIX =
  "[Anan Workspace Operator]\nYou are the internal workspace operator. Prioritize projects, offers, CRM, organizations, invitations, inbox, and actionable next steps. Only propose actions the current workspace role can perform. Summaries should be operational and approval-ready.";

export const getThread = query({
  args: {},
  handler: async (ctx) => {
    const owner = await resolveAssistantOwner(ctx);
    const thread = await getLatestThread(ctx, owner, ASSISTANT_KIND);
    return { thread, owner };
  },
});

export const getThreadSafe = query({
  args: {},
  handler: async (ctx) => {
    const owner = await resolveAssistantOwnerSafe(ctx);
    if (!owner) return { thread: null, owner: null };
    const thread = await getLatestThread(ctx, owner, ASSISTANT_KIND);
    return { thread, owner };
  },
});

export const listMessages = query({
  args: {
    threadId: v.optional(v.id("assistantThreads")),
  },
  handler: async (ctx, args) => {
    const owner = await resolveAssistantOwner(ctx);
    return listThreadMessages(ctx, owner, args.threadId, ASSISTANT_KIND);
  },
});

export const listThreads = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const owner = await resolveAssistantOwner(ctx);
    return listRecentThreads(ctx, owner, ASSISTANT_KIND, args.limit ?? 6);
  },
});

export const getThreadById = query({
  args: {
    threadId: v.id("assistantThreads"),
  },
  handler: async (ctx, args) => {
    const owner = await resolveAssistantOwner(ctx);
    return getAccessibleThread(ctx, owner, args.threadId, ASSISTANT_KIND);
  },
});

export const sendMessage = action({
  args: {
    message: v.string(),
    threadId: v.optional(v.id("assistantThreads")),
    startNewThread: v.optional(v.boolean()),
    inputMode: v.optional(v.union(v.literal("text"), v.literal("voice"))),
    streamSessionId: v.optional(v.string()),
    regenerate: v.optional(v.boolean()),
    regenerateMessageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return handleAssistantMessage(ctx, {
      ...args,
      assistantKind: ASSISTANT_KIND,
      orchestratorName: ORCHESTRATOR_NAME,
      promptPrefix: PROMPT_PREFIX,
    });
  },
});

export const createThread = mutation({
  args: {
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const owner = await resolveAssistantOwner(ctx);
    return createAssistantThread(ctx, {
      owner,
      assistantKind: ASSISTANT_KIND,
      orchestratorName: ORCHESTRATOR_NAME,
      title: args.title?.trim() ? args.title.trim() : "محادثة جديدة",
    });
  },
});

export const generateVoiceUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await resolveAssistantOwner(ctx);
    return ctx.storage.generateUploadUrl();
  },
});

export const transcribeVoiceFromStorage = action({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return transcribeStoredVoiceNote(ctx, args.storageId);
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
  handler: async (ctx, args) => {
    return saveConversationStep(ctx, {
      ...args,
      assistantKind: ASSISTANT_KIND,
      orchestratorName: ORCHESTRATOR_NAME,
    });
  },
});

export {
  _appendStreamEvent,
  cancelStreamSession,
  isStreamCancelled,
  listStreamEvents,
} from "./assistantWorkspace.streamEvents";

export {
  _purgeStreamEvents,
  purgeStreamEvents,
} from "./assistantWorkspace.streamMaintenance";
