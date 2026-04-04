import type { MarketFilters, MarketSnapshot } from "@/server/contracts/market";

export type MarketRepository = {
  getSnapshot(filters: MarketFilters): Promise<MarketSnapshot>;
};
