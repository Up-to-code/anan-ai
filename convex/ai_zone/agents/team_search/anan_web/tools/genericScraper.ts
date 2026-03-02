/**
 * Generic config-driven property scraper.
 * Plan: wasalt, bayut, aqar configs.
 *
 * TODO: Implement when pipeline and Stagehand are wired.
 */
import { getStagehandConfig } from "./scrapingConfig";
import type { StagehandState } from "./stagehand";

export type GenericPortalConfig = {
  name: string;
  listingUrl: string;
  cardSelector?: string;
};

/** Placeholder – implement when search pipeline exists. */
export async function extractFromPortal(
  _ctx: unknown,
  config: GenericPortalConfig,
  _listingUrl: string,
  _maxCards: number,
  state: StagehandState,
): Promise<unknown[]> {
  const stagehandConfig = getStagehandConfig();
  if ("error" in stagehandConfig) {
    state.disabled = true;
    state.reason = stagehandConfig.error;
    return [];
  }
  return [];
}
