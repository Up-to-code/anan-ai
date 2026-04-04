import type { DealDetail, PaginatedDealsResult } from "@/server/contracts/deals";

export function mapDealIds<T extends { id?: string; REDId?: string; brokerId?: string; propertyId?: string; offerId?: string }>(
  deal: T,
) {
  return {
    ...deal,
    redId: deal.REDId,
  };
}

export function mapDealDetail(deal: DealDetail | null) {
  return deal ? mapDealIds(deal) : null;
}

export function mapPaginatedDeals(result: PaginatedDealsResult): PaginatedDealsResult {
  return {
    ...result,
    page: result.page.map(mapDealIds),
  };
}
