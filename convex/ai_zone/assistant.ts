/**
 * assistant.ts — AI Zone Thin Controller
 *
 * Public Convex endpoints for the AI assistant.
 * All business logic is delegated to services/assistantService.ts.
 */
import { ConvexError, v } from "convex/values";
import { action, internalMutation, query, internalQuery } from "../_generated/server";
import {
  resolveAssistantOwner,
  resolveAssistantOwnerSafe,
  getLatestThread,
  listThreadMessages,
  handleAssistantMessage,
  saveConversationStep,
  getMessageContent,
} from "./services/assistantService";

// ─── Queries ──────────────────────────────────────────────────────────────────

export const getThread = query({
  args: {},
  handler: async (ctx) => {
    const owner = await resolveAssistantOwner(ctx);
    const thread = await getLatestThread(ctx, owner.userId);
    return { thread, owner };
  },
});

export const getThreadSafe = query({
  args: {},
  handler: async (ctx) => {
    const owner = await resolveAssistantOwnerSafe(ctx);
    if (!owner) return { thread: null, owner: null };
    const thread = await getLatestThread(ctx, owner.userId);
    return { thread, owner };
  },
});

export const listMessages = query({
  args: {
    threadId: v.optional(v.id("assistantThreads")),
  },
  handler: async (ctx, args) => {
    const owner = await resolveAssistantOwner(ctx);
    return listThreadMessages(ctx, owner, args.threadId);
  },
});

export const listMessagesSafe = query({
  args: {
    threadId: v.optional(v.id("assistantThreads")),
  },
  handler: async (ctx, args) => {
    const owner = await resolveAssistantOwnerSafe(ctx);
    if (!owner) return [];
    return listThreadMessages(ctx, owner, args.threadId);
  },
});

// ─── Actions ──────────────────────────────────────────────────────────────────

export const sendMessage = action({
  args: {
    message: v.string(),
    threadId: v.optional(v.id("assistantThreads")),
  },
  handler: async (ctx, args) => {
    return handleAssistantMessage(ctx, args);
  },
});

export const streamMessage = action({
  args: {
    message: v.string(),
    threadId: v.optional(v.id("assistantThreads")),
  },
  handler: async (ctx, args) => {
    // For now uses the same orchestration; frontend handles token-by-token playback.
    return handleAssistantMessage(ctx, args);
  },
});

// ─── Internal Mutations ───────────────────────────────────────────────────────

export const _saveConversationStep = internalMutation({
  args: {
    threadId: v.optional(v.id("assistantThreads")),
    userId: v.string(),
    ownerType: v.union(v.literal("broker"), v.literal("RED"), v.literal("user")),
    ownerBrokerId: v.optional(v.id("brokers")),
    ownerREDId: v.optional(v.id("RED")),
    userMessage: v.string(),
    assistantMessage: v.string(),
    mode: v.union(v.literal("qa"), v.literal("action")),
  },
  handler: async (ctx, args) => {
    return saveConversationStep(ctx, args);
  },
});

export const _getMessageContent = internalQuery({
  args: { messageId: v.id("assistantMessages") },
  handler: async (ctx, args) => {
    return getMessageContent(ctx, args.messageId);
  },
});

export const _getLatestThreadByUserId = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return getLatestThread(ctx, args.userId);
  },
});
