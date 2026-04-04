import { apiUnsafe } from "@/lib/convexApi";

export type MarketApiRefs = {
  getMarketSnapshot: unknown;
};

export const marketApi = apiUnsafe["shared_logic/market"] as MarketApiRefs;
