import { buildClientRequirementViewModel } from "./offerViewModel";
import type { WorkspaceOfferQueue, WorkspaceOfferSummary } from "../../types/offerTypes";

export const OFFERS_PAGE_SIZE = 8;
export const OFFERS_SORT_VALUES = ["updated_desc", "updated_asc"] as const;
export type OffersSortValue = (typeof OFFERS_SORT_VALUES)[number];

export type OfferFilterOptions = {
  locations: string[];
  areas: string[];
};

const SAUDI_LOCATION_SUGGESTIONS = ["الرياض", "جدة", "الخبر", "الدمام", "مكة", "المدينة", "الظهران", "الجبيل"];

export type OffersPageSearchParams = {
  page?: string | string[];
  q?: string | string[];
  sort?: string | string[];
  budgetMin?: string | string[];
  budgetMax?: string | string[];
  bedsMin?: string | string[];
  bathsMin?: string | string[];
  sqftMin?: string | string[];
  sqftMax?: string | string[];
  area?: string | string[];
  location?: string | string[];
};

export type OffersPageFilters = {
  budgetMin?: number;
  budgetMax?: number;
  bedsMin?: number;
  bathsMin?: number;
  sqftMin?: number;
  sqftMax?: number;
  area: string;
  location: string;
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

function pickTrimmedString(value?: string | string[]) {
  return (pickString(value) ?? "").trim();
}

function pickNumericValue(value?: string | string[]) {
  const normalized = pickTrimmedString(value).replace(/[^\d.]/g, "");
  if (!normalized) return undefined;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
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

export function resolveFilters(searchParams: OffersPageSearchParams): OffersPageFilters {
  return {
    budgetMin: pickNumericValue(searchParams.budgetMin),
    budgetMax: pickNumericValue(searchParams.budgetMax),
    bedsMin: pickNumericValue(searchParams.bedsMin),
    bathsMin: pickNumericValue(searchParams.bathsMin),
    sqftMin: pickNumericValue(searchParams.sqftMin),
    sqftMax: pickNumericValue(searchParams.sqftMax),
    area: pickTrimmedString(searchParams.area),
    location: pickTrimmedString(searchParams.location),
  };
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
  const clientRequirement = buildClientRequirementViewModel(item.clientContext);
  return [
    item.message,
    item.description ?? "",
    item.propertySummary ?? "",
    item.property?.title ?? "",
    item.property?.address ?? "",
    item.property?.location ?? "",
    item.property?.area ?? "",
    item.property?.beds != null ? String(item.property.beds) : "",
    item.property?.baths != null ? String(item.property.baths) : "",
    item.property?.sqft != null ? String(item.property.sqft) : "",
    item.senderName ?? "",
    item.primaryOrganization?.name ?? "",
    item.clientContext?.clientName ?? "",
    item.clientContext?.clientNeed ?? "",
    item.clientContext?.clientBudget ?? "",
    item.clientContext?.clientPhone ?? "",
    item.clientContext?.location ?? "",
    item.clientContext?.area ?? "",
    item.clientContext?.bedsMin != null ? String(item.clientContext.bedsMin) : "",
    item.clientContext?.bathsMin != null ? String(item.clientContext.bathsMin) : "",
    item.clientContext?.sqftMin != null ? String(item.clientContext.sqftMin) : "",
    item.clientContext?.sqftMax != null ? String(item.clientContext.sqftMax) : "",
    clientRequirement?.budgetLabel ?? "",
    clientRequirement?.location ?? "",
    clientRequirement?.area ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

function includesNormalizedValue(candidates: Array<string | null | undefined>, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;
  return candidates.some((candidate) => candidate?.trim().toLowerCase().includes(normalizedQuery));
}

function resolveBudgetBounds(item: WorkspaceOfferSummary) {
  if (item.clientContext) {
    const budgetMin = item.clientContext.budgetMin;
    const budgetMax =
      item.clientContext.budgetMax ??
      (typeof item.price === "number" && item.price > 0 ? item.price : undefined);
    return {
      min: budgetMin ?? budgetMax,
      max: budgetMax ?? budgetMin,
    };
  }

  const price =
    typeof item.property?.price === "number"
      ? item.property.price
      : typeof item.price === "number"
        ? item.price
        : undefined;

  return {
    min: price,
    max: price,
  };
}

function resolveSqftBounds(item: WorkspaceOfferSummary) {
  if (item.clientContext) {
    const sqftMin = item.clientContext.sqftMin;
    const sqftMax = item.clientContext.sqftMax;
    return {
      min: sqftMin ?? sqftMax,
      max: sqftMax ?? sqftMin,
    };
  }

  return {
    min: item.property?.sqft,
    max: item.property?.sqft,
  };
}

function matchesNumericRange(args: {
  candidateMin?: number;
  candidateMax?: number;
  filterMin?: number;
  filterMax?: number;
}) {
  const { candidateMin, candidateMax, filterMin, filterMax } = args;
  if (filterMin == null && filterMax == null) return true;
  if (candidateMin == null && candidateMax == null) return false;

  const effectiveMin = candidateMin ?? candidateMax;
  const effectiveMax = candidateMax ?? candidateMin;

  if (filterMin != null && (effectiveMax == null || effectiveMax < filterMin)) {
    return false;
  }
  if (filterMax != null && (effectiveMin == null || effectiveMin > filterMax)) {
    return false;
  }
  return true;
}

function matchesMinimum(candidate: number | undefined, required: number | undefined) {
  if (required == null) return true;
  if (candidate == null) return false;
  return candidate >= required;
}

function matchesFilters(item: WorkspaceOfferSummary, filters: OffersPageFilters) {
  const clientRequirement = buildClientRequirementViewModel(item.clientContext);
  const budget = resolveBudgetBounds(item);
  const sqft = resolveSqftBounds(item);

  if (
    !matchesNumericRange({
      candidateMin: budget.min,
      candidateMax: budget.max,
      filterMin: filters.budgetMin,
      filterMax: filters.budgetMax,
    })
  ) {
    return false;
  }

  if (!matchesMinimum(item.clientContext?.bedsMin ?? item.property?.beds, filters.bedsMin)) {
    return false;
  }

  if (!matchesMinimum(item.clientContext?.bathsMin ?? item.property?.baths, filters.bathsMin)) {
    return false;
  }

  if (
    !matchesNumericRange({
      candidateMin: sqft.min,
      candidateMax: sqft.max,
      filterMin: filters.sqftMin,
      filterMax: filters.sqftMax,
    })
  ) {
    return false;
  }

  if (!includesNormalizedValue([item.clientContext?.area, clientRequirement?.area, item.property?.area], filters.area)) {
    return false;
  }

  if (
    !includesNormalizedValue(
      [item.clientContext?.location, clientRequirement?.location, item.property?.location, item.property?.address],
      filters.location,
    )
  ) {
    return false;
  }

  return true;
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
  return filterOffers(items, {
    searchQuery,
    filters: {
      area: "",
      location: "",
    },
  });
}

export function filterOffers(
  items: WorkspaceOfferSummary[],
  args: {
    searchQuery: string;
    filters: OffersPageFilters;
  },
) {
  const normalized = args.searchQuery.trim().toLowerCase();
  return items.filter((item) => {
    if (normalized && !searchableOfferText(item).includes(normalized)) {
      return false;
    }
    return matchesFilters(item, args.filters);
  });
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
  filters: OffersPageFilters;
}) {
  const params = new URLSearchParams();
  if (args.searchQuery.trim().length > 0) {
    params.set("q", args.searchQuery.trim());
  }
  if (args.sort !== "updated_desc") {
    params.set("sort", args.sort);
  }
  if (args.filters.budgetMin != null) {
    params.set("budgetMin", String(args.filters.budgetMin));
  }
  if (args.filters.budgetMax != null) {
    params.set("budgetMax", String(args.filters.budgetMax));
  }
  if (args.filters.bedsMin != null) {
    params.set("bedsMin", String(args.filters.bedsMin));
  }
  if (args.filters.bathsMin != null) {
    params.set("bathsMin", String(args.filters.bathsMin));
  }
  if (args.filters.sqftMin != null) {
    params.set("sqftMin", String(args.filters.sqftMin));
  }
  if (args.filters.sqftMax != null) {
    params.set("sqftMax", String(args.filters.sqftMax));
  }
  if (args.filters.area.trim().length > 0) {
    params.set("area", args.filters.area.trim());
  }
  if (args.filters.location.trim().length > 0) {
    params.set("location", args.filters.location.trim());
  }
  const query = params.toString();
  return query ? `/ws/offers?${query}` : "/ws/offers";
}

export function buildOfferFilterOptions(items: WorkspaceOfferSummary[]): OfferFilterOptions {
  const locations = new Set(SAUDI_LOCATION_SUGGESTIONS);
  const areas = new Set<string>();

  for (const item of items) {
    const itemLocations = [item.property?.location, item.clientContext?.location];
    const itemAreas = [item.property?.area, item.clientContext?.area];

    for (const location of itemLocations) {
      const normalized = location?.trim();
      if (!normalized) continue;
      locations.add(normalized);
    }

    for (const area of itemAreas) {
      const normalized = area?.trim();
      if (!normalized) continue;
      areas.add(normalized);
    }
  }

  const sortValues = (values: Set<string>) => [...values].sort((left, right) => left.localeCompare(right, "ar"));

  return {
    locations: sortValues(locations),
    areas: sortValues(areas),
  };
}
