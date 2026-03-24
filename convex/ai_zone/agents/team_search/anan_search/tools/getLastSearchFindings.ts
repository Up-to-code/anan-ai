/**
 * getLastSearchFindings.ts — Wrapper tool for last search findings
 *
 * WHY:   Agents need access to the latest findings for analysis.
 * WHAT:  Calls shared_logic/properties/history.getLastSearchFindings.
 * HOW:   Uses runtime userId and optional threadId.
 */

import { tool, zodSchema } from "ai";
import type { Tool } from "ai";
import { z } from "zod";
import type { ActionCtx } from "../../../../../_generated/server";
import { api } from "../../../../../_generated/api";
import type { AgentRuntimeContext } from "../../../types";

const inputSchema = zodSchema(
  z.object({ maxFindings: z.number().min(1).max(20).optional() }),
) as any;

export function getLastSearchFindings(ctx: ActionCtx, runtime: AgentRuntimeContext): Tool {
  return tool({
    description: "Fetch the latest property findings for the user.",
    inputSchema,
    execute: async ({ maxFindings }): Promise<unknown> => {
      return (await ctx.runQuery(
        api.shared_logic.properties.history.getLastSearchFindings,
        { userId: runtime.userId, threadId: runtime.threadId, maxFindings },
      )) as unknown;
    },
  });
}
