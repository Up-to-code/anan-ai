/**
 * storeInteraction.ts — Store user interaction tool
 *
 * WHY:   Tracks recent interactions to improve personalization.
 * WHAT:  Wraps shared_logic/memory/repository.storeInteractionInternal.
 * HOW:   Calls internal mutation with runtime userId/threadId.
 */
import { tool, zodSchema } from "ai";
import type { Tool } from "ai";
import { z } from "zod";
import type { ActionCtx } from "../../../../_generated/server";
import { internalRefs } from "../../../../shared_logic/lib/generatedApiRefs";
import type { AgentRuntimeContext } from "../../types";

export function storeInteraction(ctx: ActionCtx, runtime: AgentRuntimeContext): Tool {
  return tool({
    description: "Store a user interaction event for memory.",
    inputSchema: zodSchema(z.object({
      action: z.string(),
      entityType: z.enum(["property", "location", "bank", "product", "neighborhood"]).optional(),
      entityId: z.string().optional(),
      details: z.string().optional(),
      metadata: z.any().optional(),
    })),
    execute: async (args): Promise<unknown> => {
      return (await ctx.runMutation(
        internalRefs["shared_logic/memory/repository"].storeInteractionInternal,
        {
          userId: runtime.userId,
          threadId: runtime.threadId,
          entityType: args.entityType,
          entityId: args.entityId,
          action: args.action,
          details: args.details,
          metadata: args.metadata,
        },
      )) as unknown;
    },
  });
}
