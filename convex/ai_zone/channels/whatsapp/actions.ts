import { internalAction } from "../../../_generated/server";
import type { ActionCtx } from "../../../_generated/server";
import { v } from "convex/values";
import { api, internal } from "../../../_generated/api";
import type { Id } from "../../../_generated/dataModel";
import { orchestrate } from "../../agents/anan";

export const generateReply = internalAction({
  args: {
    userId: v.string(),
    message: v.string(),
    displayName: v.optional(v.string()),
    threadId: v.optional(v.id("assistantThreads")),
  },
  handler: async (
    ctx: ActionCtx,
    args: { userId: string; message: string; displayName?: string; threadId?: Id<"assistantThreads"> },
  ): Promise<{ ok: true; text: string; threadId?: string }> => {
    await ctx.runMutation(api.shared_logic.users.whatsapp.ensureWhatsAppUser, {
      userId: args.userId,
      displayName: args.displayName,
    });
    const thread: { _id: Id<"assistantThreads"> } | null = args.threadId
      ? { _id: args.threadId }
      : ((await ctx.runQuery(
          internal.ai_zone.assistant._getLatestThreadByUserId,
          { userId: args.userId },
        )) as { _id: Id<"assistantThreads"> } | null);
    const basePrompt = `${args.message}\n\n[Policy: QA-only mode. Answer questions only. Do not execute actions.]`;
    const result = await orchestrate({
      ctx,
      prompt: basePrompt,
      role: "user",
      userId: args.userId,
      threadId: (args.threadId ?? thread?._id) as any,
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
