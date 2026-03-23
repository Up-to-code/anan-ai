/**
 * Durable workflows for agent response generation.
 */
import { WorkflowManager } from "@convex-dev/workflow";
import type { WorkflowId } from "@convex-dev/workflow";
import { api, components, internal } from "../../../_generated/api";
import { internalAction } from "../../../_generated/server";
import { v } from "convex/values";
import type { Id } from "../../../_generated/dataModel";
import { WORKFLOW_RETRY_POLICY } from "../../../shared_logic/lib/retry";

export const workflow = new WorkflowManager(components.workflow as never, {
  workpoolOptions: {
    defaultRetryBehavior: {
      maxAttempts: WORKFLOW_RETRY_POLICY.maxAttempts,
      initialBackoffMs: WORKFLOW_RETRY_POLICY.initialBackoffMs,
      base: WORKFLOW_RETRY_POLICY.base,
    },
    retryActionsByDefault: false,
    maxParallelism: 60,
  },
});

export const generateResponseWorkflow = workflow.define({
  args: {
    threadId: v.string(),
    promptMessageId: v.string(),
    channel: v.optional(
      v.union(v.literal("whatsapp"), v.literal("app"), v.literal("web")),
    ),
  },
  returns: v.null(),
  handler: async (step, { threadId, promptMessageId, channel }) => {
    // The workflow now calls the main assistant endpoint which handles the full multi-agent orchestration
    const sendMessageAction = api.ai_zone.assistant.sendMessage;
    if (!sendMessageAction) throw new Error("sendMessage action not found");

    // We need the original user message content to pass to sendMessage
    // Since we only have promptMessageId here, we'll need to fetch it first via query
    const messageDoc = await step.runQuery(
      internal.ai_zone.assistant._getMessageContent,
      { messageId: promptMessageId as Id<"assistantMessages"> }
    );

    if (!messageDoc) throw new Error("Could not find message content");

    await step.runAction(
      sendMessageAction as never,
      { message: messageDoc.content, threadId: threadId as Id<"assistantThreads"> } as never,
      { name: "generateResponse" },
    );
  },
});

export const startGenerateResponseWorkflow = internalAction({
  args: {
    threadId: v.string(),
    promptMessageId: v.string(),
    channel: v.optional(
      v.union(v.literal("whatsapp"), v.literal("app"), v.literal("web")),
    ),
  },
  handler: async (ctx, actionArgs): Promise<WorkflowId> => {
    // NOTE: We annotate/cast here to avoid type cycles when referencing `internal.*` within the same module.
    const wf = internal.ai_zone.agents.shared.workflows.generateResponseWorkflow as any;
    if (!wf) throw new Error("generateResponseWorkflow not found");
    return workflow.start(ctx, wf as never, actionArgs as never);
  },
});
