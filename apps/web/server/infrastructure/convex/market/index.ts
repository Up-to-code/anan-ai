import { fetchQuery } from "convex/nextjs";
import { marketApi } from "./api";
import type { MarketRepository } from "./types";

export type { MarketRepository } from "./types";

/**
 * WHY:   The workspace market service should depend on a stable repository instead of embedding Convex transport calls.
 * WHAT:  Adapts the shared Convex market query into the web server's typed market snapshot contract.
 * HOW:   Forwards validated filters to `shared_logic/market.getMarketSnapshot` and returns the snapshot unchanged.
 */
export const convexMarketRepository: MarketRepository = {
  async getSnapshot(filters) {
    return fetchQuery(marketApi.getMarketSnapshot as never, filters as never) as ReturnType<MarketRepository["getSnapshot"]>;
  },
};
