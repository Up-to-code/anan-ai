/**
 * genericScraper.ts — Config-driven listing scraper
 *
 * WHY:   Standardize extraction across common portals.
 * WHAT:  Resolves portal configs and extracts cards via Stagehand.
 * HOW:   Detects portal by host, then calls extractCardsFromSource.
 */
import type { ActionCtx } from "../../../../../_generated/server";
import { extractCardsFromSource } from "./stagehand";
import type { StagehandState } from "./stagehand";

export type GenericPortalConfig = {
  name: string;
  hosts: string[];
  listingUrlExample?: string;
};

export const PORTAL_CONFIGS: GenericPortalConfig[] = [
  {
    name: "wasalt",
    hosts: ["wasalt.com", "www.wasalt.com"],
    listingUrlExample: "https://wasalt.com/ar/property-for-sale",
  },
  {
    name: "aqar",
    hosts: ["aqar.fm", "www.aqar.fm"],
    listingUrlExample: "https://sa.aqar.fm",
  },
];

/** getPortalConfigForUrl — Match portal by host. */
export function getPortalConfigForUrl(url: string): GenericPortalConfig | null {
  try {
    const host = new URL(url).host.toLowerCase();
    return PORTAL_CONFIGS.find((p) => p.hosts.includes(host)) ?? null;
  } catch {
    return null;
  }
}

/** extractFromPortal — Extract listing cards for a portal URL. */
export async function extractFromPortal(
  ctx: ActionCtx,
  config: GenericPortalConfig,
  listingUrl: string,
  maxCards: number,
  state: StagehandState,
): Promise<unknown[]> {
  return extractCardsFromSource(ctx, listingUrl, maxCards, state);
}
