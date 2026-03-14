/**
 * getDeveloperHandbookSnippets.ts — Developer handbook retrieval tool
 *
 * WHY:   The platform docs agent needs access to internal rules without scanning tables or mixing developer guidance with product knowledge.
 * WHAT:  Wraps shared_logic/developerHandbook.retrieveDeveloperHandbookSnippets.
 * HOW:   Calls the query via ctx.runQuery and returns bounded excerpt snippets only.
 */
import { tool, zodSchema } from "ai";
import type { Tool } from "ai";
import { z } from "zod";
import type { ActionCtx } from "../../../../_generated/server";
import { apiRefs } from "../../../../shared_logic/lib/generatedApiRefs";
import type { AgentRuntimeContext } from "../../types";

export function getDeveloperHandbookSnippets(ctx: ActionCtx, _runtime: AgentRuntimeContext): Tool {
  return tool({
    description: "Retrieve internal developer handbook snippets (rules, architecture, best practices).",
    inputSchema: zodSchema(z.object({ query: z.string(), limit: z.number().min(1).max(8).optional() })),
    execute: async ({ query, limit }): Promise<unknown> => {
      return (await ctx.runQuery(
        apiRefs["shared_logic/developerHandbook/index"].retrieveDeveloperHandbookSnippets,
        { query, limit },
      )) as unknown;
    },
  });
}

