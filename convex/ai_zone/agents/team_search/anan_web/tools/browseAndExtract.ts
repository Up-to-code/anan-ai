/**
 * browseAndExtract.ts — Generic web extraction tool
 *
 * WHY:   anan_web needs to fetch external market info and summaries.
 * WHAT:  Uses Stagehand to extract a text summary from a URL.
 * HOW:   Calls Stagehand extract with a simple content schema.
 */
import { tool, zodSchema } from "ai";
import type { Tool } from "ai";
import { z } from "zod";
import type { ActionCtx } from "../../../../../_generated/server";
import type { AgentRuntimeContext } from "../../../types";
import { components } from "../../../../../_generated/api";
import { Stagehand } from "@browserbasehq/convex-stagehand";
import { getStagehandConfig } from "./scrapingConfig";
import { classifyStagehandError } from "./stagehand";

const contentSchema: z.ZodTypeAny = z.object({
  content: z.string(),
});

const inputSchema = zodSchema(
  z.object({
    url: z.string().url(),
    instruction: z.string().optional(),
  }),
) as any;

type StagehandComponent = ConstructorParameters<typeof Stagehand>[0];

function buildStagehand() {
  const config = getStagehandConfig();
  if ("error" in config) return { error: config.error } as const;
  return new Stagehand(components.stagehand as unknown as StagehandComponent, config);
}

export function browseAndExtract(ctx: ActionCtx, _runtime: AgentRuntimeContext): Tool {
  return tool({
    description: "Extract a concise text summary from a URL.",
    inputSchema,
    execute: async (
      { url, instruction }: { url: string; instruction?: string },
    ): Promise<{ ok: boolean; content?: string; sourceUrl: string; error?: string }> => {
      const stagehand = buildStagehand();
      if ("error" in stagehand) {
        return { ok: false as const, error: stagehand.error, sourceUrl: url };
      }
      try {
        const result = await stagehand.extract(ctx, {
          url,
          instruction:
            instruction ??
            "Extract a concise summary of the page content relevant to real estate.",
          schema: contentSchema,
        });
        return {
          ok: true as const,
          content: (result as { content?: string })?.content ?? "",
          sourceUrl: url,
        };
      } catch (err) {
        return {
          ok: false as const,
          error: classifyStagehandError(err),
          sourceUrl: url,
        };
      }
    },
  });
}
