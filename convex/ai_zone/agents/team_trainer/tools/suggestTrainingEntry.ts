/**
 * suggestTrainingEntry.ts — Suggest training entry tool
 *
 * WHY:   Trainer needs to store learnings for admin review.
 * WHAT:  Inserts aiRAGEntries and pushes to recommendation RAG.
 * HOW:   Calls internal mutation + addToRecommendationRAG.
 */
import { tool, zodSchema } from "ai";
import type { Tool } from "ai";
import { z } from "zod";
import type { ActionCtx } from "../../../../_generated/server";
import { internal } from "../../../../_generated/api";
import type { AgentRuntimeContext } from "../../types";
import { addToRecommendationRAG } from "../../shared/ragInstances";

export function suggestTrainingEntry(ctx: ActionCtx, _runtime: AgentRuntimeContext): Tool {
  return tool({
    description: "Suggest a training entry for admin review and RAG update.",
    inputSchema: zodSchema(z.object({
      title: z.string(),
      content: z.string(),
      category: z.string().optional(),
      target: z.enum(["user", "broker", "RED", "all"]).optional(),
    })),
    execute: async ({ title, content, category, target }): Promise<unknown> => {
      const ragTarget = target ?? "all";
      const entryId = (await ctx.runMutation(
        internal.ai_zone.agents.shared.ragActions.createRagEntryInternal,
        {
          ragType: "recommendation",
          title,
          content,
          category,
          target: ragTarget,
          suggestedBy: "anan_trainer",
        },
      )) as unknown;

      await addToRecommendationRAG(ctx, content, category ?? "general", ragTarget);

      return { ok: true as const, entryId };
    },
  });
}
