import type { WorkspaceOfferQueue, WorkspaceOfferSummary } from "./offerTypes";

export const OFFERS_PAGE_SIZE = 8;
export const OFFERS_SORT_VALUES = ["updated_desc", "updated_asc"] as const;
export type OffersSortValue = (typeof OFFERS_SORT_VALUES)[number];

export type OffersPageSearchParams = {
  page?: string | string[];
  q?: string | string[];
  sort?: string | string[];
};

export type PaginatedCollection<T> = {
  items: T[];
  page: number;
  pageCount: number;
  totalItems: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

function pickString(value?: string | string[]) {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function resolvePage(searchParams: OffersPageSearchParams): number {
  const parsed = Number.parseInt(pickString(searchParams.page) ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function resolveSearchQuery(searchParams: OffersPageSearchParams) {
  return (pickString(searchParams.q) ?? "").trim();
}

export function resolveSort(searchParams: OffersPageSearchParams): OffersSortValue {
  const selected = pickString(searchParams.sort);
  return selected === "updated_asc" ? "updated_asc" : "updated_desc";
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

function searchableOfferText(item: WorkspaceOfferSummary) {
  return [
    item.message,
    item.description ?? "",
    item.propertySummary ?? "",
    item.property?.title ?? "",
    item.property?.address ?? "",
    item.senderName ?? "",
    item.primaryOrganization?.name ?? "",
    item.clientContext?.clientName ?? "",
    item.clientContext?.clientNeed ?? "",
    item.clientContext?.clientBudget ?? "",
    item.clientContext?.clientPhone ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

export function flattenOffers(queues: WorkspaceOfferQueue[]) {
  const byId = new Map<string, WorkspaceOfferSummary>();
  for (const queue of queues) {
    for (const item of queue.items) {
      const existing = byId.get(item.id);
      if (!existing || item.updatedAt > existing.updatedAt) {
        byId.set(item.id, item);
      }
    }
  }
  return [...byId.values()];
}

export function filterOffersByQuery(
  items: WorkspaceOfferSummary[],
  searchQuery: string,
) {
  const normalized = searchQuery.trim().toLowerCase();
  if (!normalized) return items;
  return items.filter((item) => searchableOfferText(item).includes(normalized));
}

export function sortOffers(
  items: WorkspaceOfferSummary[],
  sort: OffersSortValue,
) {
  const sorted = [...items];
  sorted.sort((left, right) => {
    const timeDelta =
      sort === "updated_asc"
        ? left.updatedAt - right.updatedAt
        : right.updatedAt - left.updatedAt;
    if (timeDelta !== 0) return timeDelta;
    return sort === "updated_asc"
      ? left.createdAt - right.createdAt
      : right.createdAt - left.createdAt;
  });
  return sorted;
}

export function buildOffersRouteBase(args: {
  searchQuery: string;
  sort: OffersSortValue;
}) {
  const params = new URLSearchParams();
  if (args.searchQuery.trim().length > 0) {
    params.set("q", args.searchQuery.trim());
  }
  if (args.sort !== "updated_desc") {
    params.set("sort", args.sort);
  }
  const query = params.toString();
  return query ? `/ws/offers?${query}` : "/ws/offers";
}
