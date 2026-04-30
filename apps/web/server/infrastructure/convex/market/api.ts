import { createRepositoryRefs } from "@anan/convex-adapters/repository";
import { apiUnsafe } from "@/lib/convexApi";

export type MarketApiRefs = {
  getMarketSnapshot: unknown;
};

export const marketApi = createRepositoryRefs<MarketApiRefs>(apiUnsafe, "shared_logic/market");
