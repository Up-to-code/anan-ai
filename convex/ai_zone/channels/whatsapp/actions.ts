/**
 * actions.ts — WhatsApp reply generation
 *
 * WHY:   WhatsApp messages are unauthenticated; need a dedicated action.
 * WHAT:  Generates a reply via orchestrate and saves the conversation.
 * HOW:   Ensures user, resolves thread, calls orchestrate, saves messages.
 */
import { internalAction } from "../../../_generated/server";
import { v } from "convex/values";
import { apiRefs, internalRefs } from "../../../shared_logic/lib/generatedApiRefs";
import { orchestrate } from "../../agents/anan";

export const generateReply: any = internalAction({
  args: {
    userId: v.string(),
    message: v.string(),
    displayName: v.optional(v.string()),
    threadId: v.optional(v.string()),
  },
  handler: async (
    ctx: any,
    args: { userId: string; message: string; displayName?: string; threadId?: string },
  ): Promise<{ ok: true; text: string; threadId?: string }> => {
    await ctx.runMutation(apiRefs["shared_logic/users/whatsapp"].ensureWhatsAppUser, {
      userId: args.userId,
      displayName: args.displayName,
    });

    const thread: { _id?: string } | null = args.threadId
      ? { _id: args.threadId }
      : ((await ctx.runQuery(
          internalRefs["ai_zone/assistant"]._getLatestThreadByUserId,
          { userId: args.userId },
        )) as { _id?: string } | null);

    const basePrompt = `${args.message}\n\n[Policy: QA-only mode. Answer questions only. Do not execute actions.]`;

    const result = await orchestrate({
      ctx,
      prompt: basePrompt,
      role: "user",
      userId: args.userId,
      threadId: (args.threadId ?? thread?._id) as string | undefined,
      channel: "whatsapp",
    });

    const saved = (await ctx.runMutation(
      internalRefs["ai_zone/assistant"]._saveConversationStep,
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
} as any);
