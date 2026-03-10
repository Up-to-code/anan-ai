/**
 * getLastSearchContext.ts — Wrapper tool for last search context
 *
 * WHY:   Agents need quick access to the most recent search context.
 * WHAT:  Calls shared_logic/properties/history.getLastSearchContext.
 * HOW:   Uses runtime userId and optional threadId.
 */

import { tool, zodSchema } from "ai";
import type { Tool } from "ai";
import { z } from "zod";
import type { ActionCtx } from "../../../../../_generated/server";
import { apiRefs } from "../../../../../shared_logic/lib/generatedApiRefs";
import type { AgentRuntimeContext } from "../../../types";

export function getLastSearchContext(ctx: ActionCtx, runtime: AgentRuntimeContext): Tool {
  return tool({
    description: "Fetch the most recent property search context for the user.",
    inputSchema: zodSchema(z.object({})),
    execute: async (): Promise<unknown> => {
      return (await ctx.runQuery(
        apiRefs["shared_logic/properties/history"].getLastSearchContext,
        { userId: runtime.userId, threadId: runtime.threadId },
      )) as unknown;
    },
  });
}
