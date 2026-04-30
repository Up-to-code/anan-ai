"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";
import { handleAssistantMessage } from "./services/assistantService/handleAssistantMessage";
import { transcribeStoredVoiceNote } from "./services/voiceTranscriptionService";

const ASSISTANT_KIND = "anan_workspace" as const;
const ORCHESTRATOR_NAME = "anan_workspace_orchestrator";
const PROMPT_PREFIX =
  "[Anan Workspace Operator]\nYou are the internal workspace operator. Prioritize projects, offers, CRM, organizations, invitations, inbox, and actionable next steps. Only propose actions the current workspace role can perform. Summaries should be operational and approval-ready.";

export const sendMessageNode = action({
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
    return handleAssistantMessage(ctx, {
      ...args,
      assistantKind: ASSISTANT_KIND,
      orchestratorName: ORCHESTRATOR_NAME,
      promptPrefix: PROMPT_PREFIX,
    });
  },
});

export const transcribeVoiceFromStorageNode = action({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return transcribeStoredVoiceNote(ctx, args.storageId);
  },
});
