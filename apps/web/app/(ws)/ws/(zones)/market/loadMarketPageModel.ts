import { getWorkspaceMarketSnapshot } from "@/server/market";
import { mapMarketSnapshotToPageModel } from "./marketViewModel";
import type { WorkspaceMarketPageModel } from "./marketTypes";

type MarketSearchParams = {
  city?: string | string[];
  area?: string | string[];
  query?: string | string[];
  windowDays?: string | string[];
};

function pickString(value?: string | string[]): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseWindowDays(value?: string): 30 | 90 | 180 | undefined {
  if (value === "30" || value === "90" || value === "180") {
    return Number(value) as 30 | 90 | 180;
  }
  return undefined;
}

/**
 * WHY:   All market analysis routes should load the same server snapshot logic instead of duplicating search-param parsing.
 * WHAT:  Resolves the current market page model from route search params.
 * HOW:   Parses the shared market filters once, calls the market service, then maps the snapshot into the UI model.
 */
export async function loadMarketPageModel(searchParams: Promise<MarketSearchParams>): Promise<WorkspaceMarketPageModel> {
  const resolvedSearchParams = await searchParams;
  const snapshot = await getWorkspaceMarketSnapshot({
    city: pickString(resolvedSearchParams.city),
    area: pickString(resolvedSearchParams.area),
    query: pickString(resolvedSearchParams.query),
    windowDays: parseWindowDays(pickString(resolvedSearchParams.windowDays)),
  });

  return mapMarketSnapshotToPageModel(snapshot);
}
