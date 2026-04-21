import { internalAction } from "../../../_generated/server";
import type { ActionCtx } from "../../../_generated/server";
import { v } from "convex/values";
import { api, internal } from "../../../_generated/api";
import { runAssistantSurfaceRuntime } from "../../openMultiAgent";
import { getLatestThread } from "../../services/assistantService";

export const generateReply = internalAction({
  args: {
    userId: v.string(),
    message: v.string(),
    displayName: v.optional(v.string()),
    threadId: v.optional(v.string()),
  },
  handler: async (
    ctx: ActionCtx,
    args: { userId: string; message: string; displayName?: string; threadId?: string },
  ): Promise<{ ok: true; text: string; threadId?: string }> => {
    await ctx.runMutation(api.shared_logic.users.whatsapp.ensureWhatsAppUser, {
      userId: args.userId,
      displayName: args.displayName,
    });
    const thread: { _id: string } | null = args.threadId
      ? { _id: args.threadId }
      : ((await getLatestThread(ctx as any, args.userId)) as { _id: string } | null);
    const basePrompt = `${args.message}\n\n[Policy: QA-only mode. Answer questions only. Do not execute actions.]`;
    const result = await runAssistantSurfaceRuntime({
      surface: "default",
      ctx,
      prompt: basePrompt,
      role: "user",
      userId: args.userId,
      threadId: args.threadId ?? thread?._id,
      channel: "whatsapp",
    });
    const saved = (await ctx.runMutation(
      internal.ai_zone.assistant._saveConversationStep,
      {
        threadId: args.threadId ?? thread?._id,
        userId: args.userId,
        ownerType: "user",
        userMessage: args.message,
        assistantMessage: result.output,
        mode: "qa",
      },
    )) as { threadId: string };
    return { ok: true as const, text: result.output, threadId: saved.threadId };
  },
});
