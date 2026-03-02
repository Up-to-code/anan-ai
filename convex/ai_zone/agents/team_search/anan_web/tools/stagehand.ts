/**
 * Stagehand – extractCardsFromSource, extractPropertyDetails.
 * Plan: classifyStagehandError, state.disabled, fallback.
 *
 * TODO: Wire Stagehand(components.stagehand, getStagehandConfig())
 * when @browserbasehq/convex-stagehand is used.
 */
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

/** Placeholder – implement extractCardsFromSource when pipeline ready. */
export async function extractCardsFromSource(
  _ctx: unknown,
  _listingUrl: string,
  _maxCards: number,
  state: StagehandState,
): Promise<unknown[]> {
  const config = getStagehandConfig();
  if ("error" in config) {
    state.disabled = true;
    state.reason = config.error;
    return [];
  }
  return [];
}
