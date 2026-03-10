/**
 * getKnowledgePage.ts — Company knowledge retrieval tool
 *
 * WHY:   Knowledge agent needs access to curated knowledge pages.
 * WHAT:  Wraps shared_logic/knowledge.retrieveCompanyKnowledge.
 * HOW:   Calls the query via ctx.runQuery.
 */
import { tool, zodSchema } from "ai";
import type { Tool } from "ai";
import { z } from "zod";
import type { ActionCtx } from "../../../../_generated/server";
import { apiRefs } from "../../../../shared_logic/lib/generatedApiRefs";
import type { AgentRuntimeContext } from "../../types";

export function getKnowledgePage(ctx: ActionCtx, _runtime: AgentRuntimeContext): Tool {
  return tool({
    description: "Retrieve relevant company knowledge snippets.",
    inputSchema: zodSchema(z.object({ query: z.string(), limit: z.number().min(1).max(8).optional() })),
    execute: async ({ query, limit }): Promise<unknown> => {
      return (await ctx.runQuery(
        apiRefs["shared_logic/knowledge/index"].retrieveCompanyKnowledge,
        {
        query,
        limit,
        },
      )) as unknown;
    },
  });
}
