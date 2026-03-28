import type { WorkspaceOfferQueue, WorkspaceOfferQueueKey } from "./offerTypes";

export const OFFERS_PAGE_SIZE = 8;

export type OffersPageSearchParams = {
  page?: string | string[];
  queue?: string | string[];
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

export function resolveQueue(
  searchParams: OffersPageSearchParams,
  availableKeys: WorkspaceOfferQueueKey[],
) {
  const selected = pickString(searchParams.queue);
  if (!selected) return "all" as const;
  return availableKeys.includes(selected as WorkspaceOfferQueueKey)
    ? (selected as WorkspaceOfferQueueKey)
    : ("all" as const);
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

export function paginateQueues(
  queues: WorkspaceOfferQueue[],
  page: number,
  pageSize: number,
) {
  return queues.map((queue) => ({
    ...queue,
    pagination: paginateItems(queue.items, page, pageSize),
  }));
}
