/**
 * getBankBundles.ts — Bank product retrieval tool
 *
 * WHY:   Finance agents need structured bank products and bundles.
 * WHAT:  Wraps shared_logic/banks/queries.getBundles.
 * HOW:   Calls the query via ctx.runQuery.
 */
import { tool, zodSchema } from "ai";
import type { Tool } from "ai";
import { z } from "zod";
import type { ActionCtx } from "../../../../_generated/server";
import { api } from "../../../../_generated/api";
import type { AgentRuntimeContext } from "../../types";

export function getBankBundles(ctx: ActionCtx, _runtime: AgentRuntimeContext): Tool {
  return tool({
    description: "Fetch bank financing bundles (products) for comparison.",
    inputSchema: zodSchema(z.object({ bankId: z.string().optional() })),
    execute: async ({ bankId }): Promise<unknown> => {
      return (await ctx.runQuery(api.shared_logic.banks.queries.getBundles, {
        bankId: bankId as any,
      })) as unknown;
    },
  });
}
