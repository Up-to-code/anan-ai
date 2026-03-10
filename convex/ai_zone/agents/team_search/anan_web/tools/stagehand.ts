/**
 * Stagehand – extractCardsFromSource.
 *
 * WHY:   Web fallback needs structured extraction from listing pages.
 * WHAT:  Uses Stagehand extract with a normalized card schema.
 * HOW:   Builds a Stagehand client and runs extraction with Zod schema.
 */
import { z } from "zod";
import type { ActionCtx } from "../../../../../_generated/server";
import { components } from "../../../../../_generated/api";
import { Stagehand } from "@browserbasehq/convex-stagehand";
import { getStagehandConfig } from "./scrapingConfig";

export type StagehandState = {
  disabled: boolean;
  reason?: string;
};

export function classifyStagehandError(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  if (/429|rate limit/i.test(msg)) return "rate_limit";
  if (/timeout|ETIMEDOUT/i.test(msg)) return "timeout";
  if (/api key|invalid key|unauthorized/i.test(msg)) return "auth";
  return "unknown";
}

const cardSchema = z.object({
  cards: z.array(
    z.object({
      title: z.string(),
      price: z.optional(z.string()),
      location: z.optional(z.string()),
      url: z.optional(z.string()),
      imageUrls: z.optional(z.array(z.string())),
      beds: z.optional(z.string()),
      baths: z.optional(z.string()),
      area: z.optional(z.string()),
    }),
  ),
});

type StagehandComponent = ConstructorParameters<typeof Stagehand>[0];

function buildStagehand() {
  const config = getStagehandConfig();
  if ("error" in config) return { error: config.error } as const;
  return new Stagehand(components.stagehand as unknown as StagehandComponent, config);
}

/** extractCardsFromSource — Listing page extraction. */
export async function extractCardsFromSource(
  ctx: ActionCtx,
  listingUrl: string,
  maxCards: number,
  state: StagehandState,
): Promise<unknown[]> {
  const stagehand = buildStagehand();
  if ("error" in stagehand) {
    state.disabled = true;
    state.reason = stagehand.error;
    return [];
  }
  try {
    const result = await stagehand.extract(ctx, {
      url: listingUrl,
      instruction:
        "Extract property cards with title, price, location, URL, images, beds, baths, and area.",
      schema: cardSchema,
    });
    const cards = (result as { cards?: unknown[] })?.cards ?? [];
    return cards.slice(0, Math.max(1, maxCards));
  } catch (err) {
    state.reason = classifyStagehandError(err);
    if (state.reason === "auth" || state.reason === "rate_limit") {
      state.disabled = true;
    }
    return [];
  }
}
