import { fetchQuery } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";
import type { MarketFilters, MarketSnapshot } from "@/server/contracts/market";

type MarketApiRefs = {
  getMarketSnapshot: unknown;
};

const marketApi = apiUnsafe["shared_logic/market"] as MarketApiRefs;

export type MarketRepository = {
  getSnapshot(filters: MarketFilters): Promise<MarketSnapshot>;
};

/**
 * WHY:   The workspace market service should depend on a stable repository instead of embedding Convex transport calls.
 * WHAT:  Adapts the shared Convex market query into the web server's typed market snapshot contract.
 * HOW:   Forwards validated filters to `shared_logic/market.getMarketSnapshot` and returns the snapshot unchanged.
 */
export const convexMarketRepository: MarketRepository = {
  async getSnapshot(filters) {
    return fetchQuery(marketApi.getMarketSnapshot as never, filters as never) as Promise<MarketSnapshot>;
  },
};
