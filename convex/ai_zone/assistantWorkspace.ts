import { makeFunctionReference } from "convex/server";
import { v } from "convex/values";
import { action, internalMutation, mutation, query } from "../_generated/server";
import {
  createAssistantThread,
  saveConversationStep,
} from "./services/assistantService/persistence";
import { resolveAssistantOwner, resolveAssistantOwnerSafe } from "./services/assistantService/owner";
import {
  getAccessibleThread,
  getLatestThread,
  listRecentThreads,
  listThreadMessages,
} from "./services/assistantService/threads";
import { selectRegenerateSource } from "./services/assistantService/promptComposer";
import { resolveAssistantEntitlementForCurrentProfile } from "../shared_logic/subscriptions/index";

const ASSISTANT_KIND = "anan_workspace" as const;
const ORCHESTRATOR_NAME = "anan_workspace_orchestrator";
const PROMPT_PREFIX =
  "[Anan Workspace Operator]\nYou are the internal workspace operator. Prioritize projects, offers, CRM, organizations, invitations, inbox, and actionable next steps. Only propose actions the current workspace role can perform. Summaries should be operational and approval-ready.";
const sendMessageNodeRef = makeFunctionReference<"action">(
  "ai_zone/assistantWorkspaceNode:sendMessageNode",
);
const transcribeVoiceFromStorageNodeRef = makeFunctionReference<"action">(
  "ai_zone/assistantWorkspaceNode:transcribeVoiceFromStorageNode",
);

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
    threadId: v.optional(v.string()),
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
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    const owner = await resolveAssistantOwner(ctx);
    return getAccessibleThread(ctx, owner, args.threadId, ASSISTANT_KIND);
  },
});

/**
 * WHY:   Workspace assistant sends should resolve thread, entitlement, history, and knowledge before orchestration through one query bundle.
 * WHAT:  Returns the workspace assistant runtime bundle for one send attempt.
 * HOW:   Resolves the current workspace owner, reads the requested or latest thread, computes regenerate context, and loads a bounded knowledge shortlist.
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
      ? await getAccessibleThread(ctx, owner, args.threadId, ASSISTANT_KIND)
      : await getLatestThread(ctx, owner, ASSISTANT_KIND);
    const existingMessages = thread
      ? await listThreadMessages(ctx, owner, thread._id, ASSISTANT_KIND)
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

export const sendMessage = action({
  args: {
    message: v.string(),
    threadId: v.optional(v.string()),
    startNewThread: v.optional(v.boolean()),
    inputMode: v.optional(v.union(v.literal("text"), v.literal("voice"), v.literal("attachment"))),
    attachments: v.optional(v.array(v.object({
      key: v.string(),
      url: v.string(),
      name: v.string(),
      size: v.optional(v.number()),
      mime: v.optional(v.string()),
    }))),
    streamSessionId: v.optional(v.string()),
    regenerate: v.optional(v.boolean()),
    regenerateMessageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return ctx.runAction(sendMessageNodeRef, args);
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

export const finalizeUploadedFiles = mutation({
  args: {
    files: v.array(v.object({
      storageId: v.id("_storage"),
      name: v.string(),
      size: v.optional(v.number()),
      mime: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    await resolveAssistantOwner(ctx);
    const uploaded = await Promise.all(
      args.files.map(async (file) => {
        const url = await ctx.storage.getUrl(file.storageId);
        if (!url) {
          throw new Error(`ASSISTANT_ATTACHMENT_URL_UNAVAILABLE:${String(file.storageId)}`);
        }
        return {
          key: String(file.storageId),
          url,
          name: file.name,
          size: file.size,
          mime: file.mime,
        };
      }),
    );
    return uploaded;
  },
});

export const transcribeVoiceFromStorage = action({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return ctx.runAction(transcribeVoiceFromStorageNodeRef, args);
  },
});

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
