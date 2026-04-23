/**
 * storeUserPreference.ts — Store user preference tool
 *
 * WHY:   Memory needs to persist preferences across sessions.
 * WHAT:  Wraps shared_logic/memory/repository.storeInternal.
 * HOW:   Calls internal mutation with runtime userId/threadId.
 */
import { tool, zodSchema } from "ai";
import type { Tool } from "ai";
import { z } from "zod";
import type { ActionCtx } from "../../../../_generated/server";
import { internal } from "../../../../_generated/api";
import type { AgentRuntimeContext } from "../../types";

export function storeUserPreference(ctx: ActionCtx, runtime: AgentRuntimeContext): Tool {
  return tool({
    description:
      "Store a user preference or constraint for future sessions. Safe persona keys include communication_tone, preferred_language_style, response_density, sales_readiness, and handoff_preference.",
    inputSchema: zodSchema(z.object({
      key: z.string(),
      value: z.string(),
      memoryType: z.enum(["preference", "constraint", "fact", "interaction", "feedback"]).optional(),
      entityType: z.enum(["property", "location", "bank", "product", "neighborhood"]).optional(),
      entityId: z.string().optional(),
      confidence: z.number().min(0).max(1).optional(),
      expiresAt: z.number().optional(),
      metadata: z.any().optional(),
    })),
    execute: async (args): Promise<unknown> => {
      return (await ctx.runMutation(
        internal.shared_logic.memory.repository.storeInternal,
        {
          userId: runtime.userId,
          threadId: runtime.threadId,
          memoryType: args.memoryType ?? "preference",
          entityType: args.entityType,
          entityId: args.entityId,
          key: args.key,
          value: args.value,
          confidence: args.confidence,
          expiresAt: args.expiresAt,
          metadata: args.metadata,
          source: "anan_memory",
        },
      )) as unknown;
    },
  });
}
