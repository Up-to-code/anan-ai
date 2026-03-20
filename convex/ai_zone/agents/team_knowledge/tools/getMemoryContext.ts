/**
 * getMemoryContext.ts — User memory context tool
 *
 * WHY:   Memory agent needs structured preferences and constraints.
 * WHAT:  Wraps shared_logic/memory/repository.getRelevantMemoriesByQuery.
 * HOW:   Calls internal query via ctx.runQuery.
 */
import { tool, zodSchema } from "ai";
import type { Tool } from "ai";
import { z } from "zod";
import type { ActionCtx } from "../../../../_generated/server";
import { internal } from "../../../../_generated/api";
import type { AgentRuntimeContext } from "../../types";

export function getMemoryContext(ctx: ActionCtx, runtime: AgentRuntimeContext): Tool {
  return tool({
    description: "Fetch relevant user memory context for the query.",
    inputSchema: zodSchema(z.object({ query: z.string(), limit: z.number().min(1).max(20).optional() })),
    execute: async ({ query, limit }): Promise<unknown> => {
      return (await ctx.runQuery(
        internal.shared_logic.memory.repository.getRelevantMemoriesByQuery,
        { userId: runtime.userId, query, limit },
      )) as unknown;
    },
  });
}
