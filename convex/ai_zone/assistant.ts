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
  getAccessibleThread,
  getLatestThread,
  listThreadMessages,
  handleAssistantMessage,
  saveConversationStep,
  getMessageContent,
  listRecentThreads,
} from "./services/assistantService";
import { selectRegenerateSource } from "./services/assistantService/promptComposer";
import { resolveAssistantEntitlementForCurrentProfile } from "../shared_logic/subscriptions/index";

function scoreSnippet(content: string, terms: string[]) {
  const lower = content.toLowerCase();
  return terms.reduce((acc, term) => (lower.includes(term) ? acc + 1 : acc), 0);
}

async function buildKnowledgeSnippets(ctx: any, queryText: string, limit = 3) {
  const terms = queryText
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean)
    .slice(0, 8);

  if (terms.length === 0) {
    return [];
  }

  const pages = await ctx.db.query("knowledgePages").collect();
  return pages
    .map((page: any) => ({
      title: page.title,
      category: page.category ?? null,
      excerpt: String(page.content ?? "").slice(0, 500),
      score: scoreSnippet(`${page.title}\n${page.content}\n${page.category ?? ""}`, terms),
    }))
    .filter((row: any) => row.score > 0)
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, limit)
    .map(({ title, category, excerpt }: any) => ({ title, category, excerpt }));
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export const getThread = query({
  args: {},
  handler: async (ctx) => {
    const owner = await resolveAssistantOwner(ctx);
    const thread = await getLatestThread(ctx, owner);
    return { thread, owner };
  },
});

export const getThreadSafe = query({
  args: {},
  handler: async (ctx) => {
    const owner = await resolveAssistantOwnerSafe(ctx);
    if (!owner) return { thread: null, owner: null };
    const thread = await getLatestThread(ctx, owner);
    return { thread, owner };
  },
});

export const listMessages = query({
  args: {
    threadId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const owner = await resolveAssistantOwner(ctx);
    return listThreadMessages(ctx, owner, args.threadId);
  },
});

export const listMessagesSafe = query({
  args: {
    threadId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const owner = await resolveAssistantOwnerSafe(ctx);
    if (!owner) return [];
    return listThreadMessages(ctx, owner, args.threadId);
  },
});

export const listThreads = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const owner = await resolveAssistantOwner(ctx);
    return listRecentThreads(ctx, owner, "default", args.limit ?? 6);
  },
});

/**
 * WHY:   Assistant actions should gather thread, entitlement, transcript history, and knowledge through one backend read before orchestration.
 * WHAT:  Returns the pre-orchestration runtime bundle for the default assistant.
 * HOW:   Resolves the owner and active thread, computes regenerate context, and reads a small knowledge shortlist directly inside one query.
 */
export const getRuntimeContextBundle = query({
  args: {
    threadId: v.optional(v.string()),
    message: v.string(),
    regenerate: v.optional(v.boolean()),
    regenerateMessageId: v.optional(v.string()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const owner = await resolveAssistantOwner(ctx);
    const thread = args.threadId
      ? await getAccessibleThread(ctx, owner, args.threadId)
      : await getLatestThread(ctx, owner);
    const existingMessages = thread
      ? await listThreadMessages(ctx, owner, thread._id)
      : [];
    const regenerateSource = selectRegenerateSource({
      existingMessages: existingMessages as Array<any>,
      regenerate: args.regenerate,
      regenerateMessageId: args.regenerateMessageId,
    });
    const effectiveUserMessage = regenerateSource?.content ?? args.message;
    const [entitlement, knowledge] = await Promise.all([
      resolveAssistantEntitlementForCurrentProfile(ctx),
      buildKnowledgeSnippets(ctx, effectiveUserMessage),
    ]);

    return {
      owner,
      thread,
      entitlement,
      existingMessages,
      regenerateSource,
      effectiveUserMessage,
      knowledge,
    };
  },
});

// ─── Actions ──────────────────────────────────────────────────────────────────

export const sendMessage = action({
  args: {
    message: v.string(),
    threadId: v.optional(v.string()),
    inputMode: v.optional(v.union(v.literal("text"), v.literal("voice"))),
    regenerate: v.optional(v.boolean()),
    regenerateMessageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return handleAssistantMessage(ctx, args);
  },
});

export const streamMessage = action({
  args: {
    message: v.string(),
    threadId: v.optional(v.string()),
    inputMode: v.optional(v.union(v.literal("text"), v.literal("voice"))),
    regenerate: v.optional(v.boolean()),
    regenerateMessageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // For now uses the same orchestration; frontend handles token-by-token playback.
    return handleAssistantMessage(ctx, args);
  },
});

// ─── Internal Mutations ───────────────────────────────────────────────────────

export const _saveConversationStep = internalMutation({
  args: {
    threadId: v.optional(v.string()),
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
    return saveConversationStep(ctx, args);
  },
});

export const _getMessageContent = internalQuery({
  args: { messageId: v.string() },
  handler: async (ctx, args) => {
    return getMessageContent(ctx, args.messageId);
  },
});
