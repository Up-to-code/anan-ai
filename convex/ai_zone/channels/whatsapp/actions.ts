import { internalAction } from "../../../_generated/server";
import type { ActionCtx } from "../../../_generated/server";
import { v } from "convex/values";
import { api, internal } from "../../../_generated/api";
import { runAssistantSurfaceRuntime } from "../../services/assistantSurfaceRuntime";
import { getLatestThread } from "../../services/assistantService";
import { buildPersonaContextBlock } from "../../../shared_logic/memory/persona";

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
    const personaContextBlock = await loadWhatsAppPersonaContext(ctx, args.userId, args.message);
    const personaBlock = personaContextBlock ? `\n\n${personaContextBlock}` : "";
    const basePrompt = `${args.message}\n\n[Policy: QA-only mode. Answer questions only. Do not execute actions. Keep WhatsApp replies compact and easy to scan.]${personaBlock}`;
    const result = await runAssistantSurfaceRuntime({
      surface: "default",
      ctx,
      prompt: basePrompt,
      intentPrompt: args.message,
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

async function loadWhatsAppPersonaContext(ctx: ActionCtx, userId: string, query: string) {
  try {
    const memory = await ctx.runQuery(
      internal.shared_logic.memory.repository.getRelevantMemoriesByQuery,
      { userId, query, limit: 8 },
    );
    return buildPersonaContextBlock(memory);
  } catch (error) {
    console.warn("[whatsapp] Persona context load failed (non-critical):", error);
    return "";
  }
}
