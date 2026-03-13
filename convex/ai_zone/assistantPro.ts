import { v } from "convex/values";
import { action, internalMutation, query } from "../_generated/server";
import {
  getLatestThread,
  handleAssistantMessage,
  listRecentThreads,
  listThreadMessages,
  resolveAssistantOwner,
  resolveAssistantOwnerSafe,
  saveConversationStep,
} from "./services/assistantService";

const ASSISTANT_KIND = "anan_pro" as const;
const ORCHESTRATOR_NAME = "anan_pro_orchestrator";
const PROMPT_PREFIX =
  "[Anan Pro Workspace Operator]\nYou are the internal workspace operator. Prioritize projects, offers, CRM, organizations, invitations, inbox, and actionable next steps. Only propose actions the current workspace role can perform. Summaries should be operational and approval-ready.";

export const getThread = query({
  args: {},
  handler: async (ctx) => {
    const owner = await resolveAssistantOwner(ctx);
    const thread = await getLatestThread(ctx, owner.userId, ASSISTANT_KIND);
    return { thread, owner };
  },
});

export const getThreadSafe = query({
  args: {},
  handler: async (ctx) => {
    const owner = await resolveAssistantOwnerSafe(ctx);
    if (!owner) return { thread: null, owner: null };
    const thread = await getLatestThread(ctx, owner.userId, ASSISTANT_KIND);
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
    return listRecentThreads(ctx, owner.userId, ASSISTANT_KIND, args.limit ?? 6);
  },
});

export const sendMessage = action({
  args: {
    message: v.string(),
    threadId: v.optional(v.id("assistantThreads")),
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

export const _saveConversationStep = internalMutation({
  args: {
    threadId: v.optional(v.id("assistantThreads")),
    userId: v.string(),
    ownerType: v.union(v.literal("broker"), v.literal("RED"), v.literal("user")),
    ownerBrokerId: v.optional(v.id("brokers")),
    ownerREDId: v.optional(v.id("RED")),
    userMessage: v.string(),
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
