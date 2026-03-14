import type { OfferMarketplaceItem } from "./offerTypes";

export const OFFERS_PAGE_SIZE = 8;
export const OFFER_PROFILES_PAGE_SIZE = 9;

export type OffersPageSearchParams = {
  page?: string | string[];
};

export type PaginatedCollection<T> = {
  items: T[];
  page: number;
  pageCount: number;
  totalItems: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type OfferSenderProfile = {
  id: string;
  name: string;
  kind: "developer" | "broker";
  offerCount: number;
  publicCount: number;
  privateCount: number;
  latestLocation: string;
  averagePriceLabel: string;
  topProjectTitle: string;
  latestOfferTitle: string;
};

function pickString(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function parsePriceLabel(priceLabel: string) {
  const normalized = Number(priceLabel.replace(/[^\d.]/g, ""));
  return Number.isFinite(normalized) ? normalized : 0;
}

function formatPrice(value: number) {
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value)} ر.س`;
}

export function resolvePage(searchParams: OffersPageSearchParams): number {
  const parsed = Number.parseInt(pickString(searchParams.page) ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function paginateItems<T>(
  items: T[],
  page: number,
  pageSize: number,
): PaginatedCollection<T> {
  const safePage = Math.max(1, page);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(safePage, pageCount);
  const start = (currentPage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page: currentPage,
    pageCount,
    totalItems: items.length,
    hasPreviousPage: currentPage > 1,
    hasNextPage: currentPage < pageCount,
  };
}

/**
 * WHY:   The offers zone now needs broker/developer profile tabs without adding a brand-new directory backend.
 * WHAT:  Builds sender profiles from the existing offer list by grouping on sender label and kind.
 * HOW:   Aggregates counts, average price, and one representative project/location so the profile tabs stay data-backed.
 */
export function buildOfferSenderProfiles(
  items: OfferMarketplaceItem[],
  kind: "developer" | "broker",
): OfferSenderProfile[] {
  const grouped = new Map<string, OfferMarketplaceItem[]>();

  items
    .filter((item) => item.kind === kind)
    .forEach((item) => {
      const key = `${kind}:${item.ownerLabel}`;
      const current = grouped.get(key) ?? [];
      current.push(item);
      grouped.set(key, current);
    });

  return [...grouped.entries()]
    .map(([key, groupedItems]) => {
      const totalPrice = groupedItems.reduce((sum, item) => sum + parsePriceLabel(item.priceLabel), 0);
      const publicCount = groupedItems.filter((item) => item.demandLabel).length;
      const privateCount = groupedItems.length - publicCount;
      const latestItem = groupedItems[0];
      const projectCounts = new Map<string, number>();

      groupedItems.forEach((item) => {
        projectCounts.set(item.project.title, (projectCounts.get(item.project.title) ?? 0) + 1);
      });

      const topProjectTitle =
        [...projectCounts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ??
        latestItem?.project.title ??
        "بدون مشروع";

      return {
        id: key,
        name: latestItem?.ownerLabel ?? "صاحب عرض",
        kind,
        offerCount: groupedItems.length,
        publicCount,
        privateCount,
        latestLocation: latestItem?.location ?? "غير محدد",
        averagePriceLabel: formatPrice(totalPrice / Math.max(groupedItems.length, 1)),
        topProjectTitle,
        latestOfferTitle: latestItem?.title ?? "عرض حديث",
      };
    })
    .sort((left, right) => right.offerCount - left.offerCount || left.name.localeCompare(right.name, "ar"));
}
