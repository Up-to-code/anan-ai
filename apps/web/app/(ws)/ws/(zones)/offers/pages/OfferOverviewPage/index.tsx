"use client";

import Link from "next/link";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import OfferPaginationNav from "../../shared/components/OfferPaginationNav";
import OfferListItem from "../../shared/components/OfferListItem";
import SearchableSelector from "./SearchableSelector";
import { formatOfferCountLabel, getOfferUiCopy } from "../../shared/copy/offerLocalization";
import type { WorkspaceOfferSummary } from "../../types/offerTypes";
import {
  type OfferFilterOptions,
  type OffersPageFilters,
  type OffersSortValue,
  type PaginatedCollection,
} from "../../shared/lib/offersPageData";

function sortLabel(sort: OffersSortValue, newestFirst: string, oldestFirst: string) {
  return sort === "updated_asc" ? oldestFirst : newestFirst;
}

function countActiveFilters(filters: OffersPageFilters, sort: OffersSortValue) {
  let count = 0;
  if (sort !== "updated_desc") count += 1;
  if (filters.location.trim()) count += 1;
  if (filters.area.trim()) count += 1;
  if (filters.budgetMin != null) count += 1;
  if (filters.budgetMax != null) count += 1;
  if (filters.bedsMin != null) count += 1;
  if (filters.bathsMin != null) count += 1;
  if (filters.sqftMin != null) count += 1;
  if (filters.sqftMax != null) count += 1;
  return count;
}

const inputClassName =
  "h-11 w-full rounded-[16px] border border-border/70 bg-background/90 px-3.5 text-right text-[13px] font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:border-[color:var(--workspace-highlight)] focus:ring-4 focus:ring-[color:var(--workspace-highlight-soft)]";

const labelClassName = "text-[12px] font-bold text-foreground";

/**
 * WHY:   The main offers page should feel like one calm marketplace surface with lightweight controls and a focused list.
 * WHAT:  Renders a compact theme-aware header, a flat paginated list of offer cards, and a slim searchable filter rail.
 * HOW:   Receives a server-prepared, deduplicated, sorted collection plus Saudi suggestion lists and keeps the active filter state in a sidebar form.
 */
export default function OfferOverviewPage({
  items,
  pagination,
  routeBase,
  filterOptions,
  sort,
  filters,
}: {
  items: WorkspaceOfferSummary[];
  pagination: PaginatedCollection<WorkspaceOfferSummary>;
  routeBase: string;
  filterOptions: OfferFilterOptions;
  sort: OffersSortValue;
  filters: OffersPageFilters;
}) {
  const { locale } = useWebLocale();
  const copy = getOfferUiCopy(locale);
  const activeFilterCount = countActiveFilters(filters, sort);
  const locationSelectorOptions = filterOptions.locations.map((option) => ({ label: option, value: option }));
  const areaSelectorOptions = filterOptions.areas.map((option) => ({ label: option, value: option }));
  const summaryPills = [
    formatOfferCountLabel(locale, copy.overview.offersCount, pagination.totalItems),
    copy.overview.marketScope,
    sortLabel(sort, copy.overview.newestFirst, copy.overview.oldestFirst),
  ];

  return (
    <div className="flex min-h-full flex-col pb-24">
      <div className="grid gap-6 px-6 py-6 lg:px-8 lg:py-8">
        <section className="rounded-[24px] border border-border/70 bg-card/85 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/75 lg:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3 text-right">
              <span className="inline-flex items-center rounded-full border border-[color:var(--workspace-highlight-soft)] bg-[color:var(--workspace-highlight-soft)] px-3 py-1 text-[11px] font-bold text-[color:var(--workspace-highlight-strong)]">
                {copy.overview.dashboardBadge}
              </span>
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-end lg:gap-3">
                <h1 className="text-[22px] font-black tracking-tight text-foreground">{copy.overview.openOffersTitle}</h1>
                {activeFilterCount > 0 ? (
                  <span className="rounded-full border border-[color:var(--workspace-highlight-soft)] bg-[color:var(--workspace-highlight-soft)] px-3 py-1 text-[11px] font-bold text-[color:var(--workspace-highlight-strong)]">
                    {formatOfferCountLabel(locale, copy.overview.activeFilters, activeFilterCount)}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                {summaryPills.map((pill) => (
                  <span
                    key={pill}
                    className="rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-[12px] font-bold text-muted-foreground"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              {activeFilterCount > 0 ? (
                <Link
                  href="/ws/offers"
                  className="inline-flex items-center justify-center rounded-full border border-border/70 bg-background/80 px-4 py-2.5 text-[13px] font-bold text-foreground transition hover:bg-background"
                >
                  {copy.overview.reset}
                </Link>
              ) : null}
              <Link
                href="/ws/offers/create"
                className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-3 text-[13px] font-bold text-background transition hover:bg-foreground/90"
              >
                {copy.overview.createOffer}
              </Link>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="space-y-4">
            {items.length > 0 ? (
              <div className="grid gap-4" data-slot="offers-grid">
                {items.map((item) => (
                  <OfferListItem key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="rounded-[28px] border border-dashed border-border/70 bg-card/80 px-6 py-14 text-center text-[14px] font-medium text-muted-foreground">
                {copy.overview.noMatchingOffers}
              </div>
            )}

            {pagination.totalItems > 0 ? (
              <OfferPaginationNav
                page={pagination.page}
                pageCount={pagination.pageCount}
                hasPreviousPage={pagination.hasPreviousPage}
                hasNextPage={pagination.hasNextPage}
                routeBase={routeBase}
              />
            ) : null}
          </div>

          <aside className="lg:sticky lg:top-6">
            <form
              action="/ws/offers"
              className="space-y-4 rounded-[24px] border border-border/70 bg-card/95 p-4 shadow-sm"
            >
              <div className="space-y-1.5 text-right">
                <div className="text-[15px] font-black text-foreground">{copy.overview.quickFilters}</div>
                <p className="text-[12px] leading-6 text-muted-foreground">
                  {copy.overview.quickFiltersDescription}
                </p>
              </div>

              <div className="grid gap-3">
                <SearchableSelector
                  label={copy.overview.location}
                  name="location"
                  value={filters.location}
                  placeholder={copy.overview.locationPlaceholder}
                  options={locationSelectorOptions}
                  emptyMessage={copy.overview.locationEmpty}
                />

                <SearchableSelector
                  label={copy.overview.area}
                  name="area"
                  value={filters.area}
                  placeholder={copy.overview.areaPlaceholder}
                  options={areaSelectorOptions}
                  emptyMessage={copy.overview.areaEmpty}
                />

                <label className="space-y-2 text-right">
                  <span className={labelClassName}>{copy.overview.sort}</span>
                  <select
                    name="sort"
                    defaultValue={sort}
                    className={inputClassName}
                  >
                    <option value="updated_desc">{copy.overview.newestFirst}</option>
                    <option value="updated_asc">{copy.overview.oldestFirst}</option>
                  </select>
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-2 text-right">
                    <span className={labelClassName}>{copy.overview.budgetFrom}</span>
                    <input
                      type="text"
                      name="budgetMin"
                      inputMode="numeric"
                      defaultValue={filters.budgetMin ?? ""}
                      placeholder="0"
                      className={inputClassName}
                    />
                  </label>
                  <label className="space-y-2 text-right">
                    <span className={labelClassName}>{copy.overview.budgetTo}</span>
                    <input
                      type="text"
                      name="budgetMax"
                      inputMode="numeric"
                      defaultValue={filters.budgetMax ?? ""}
                      placeholder={copy.overview.unlimited}
                      className={inputClassName}
                    />
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-2 text-right">
                    <span className={labelClassName}>{copy.overview.spaceFrom}</span>
                    <input
                      type="text"
                      name="sqftMin"
                      inputMode="numeric"
                      defaultValue={filters.sqftMin ?? ""}
                      placeholder="0"
                      className={inputClassName}
                    />
                  </label>
                  <label className="space-y-2 text-right">
                    <span className={labelClassName}>{copy.overview.spaceTo}</span>
                    <input
                      type="text"
                      name="sqftMax"
                      inputMode="numeric"
                      defaultValue={filters.sqftMax ?? ""}
                      placeholder={copy.overview.unlimited}
                      className={inputClassName}
                    />
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-2 text-right">
                    <span className={labelClassName}>{copy.overview.roomsFrom}</span>
                    <input
                      type="text"
                      name="bedsMin"
                      inputMode="numeric"
                      defaultValue={filters.bedsMin ?? ""}
                      placeholder="1"
                      className={inputClassName}
                    />
                  </label>
                  <label className="space-y-2 text-right">
                    <span className={labelClassName}>{copy.overview.bathsFrom}</span>
                    <input
                      type="text"
                      name="bathsMin"
                      inputMode="numeric"
                      defaultValue={filters.bathsMin ?? ""}
                      placeholder="1"
                      className={inputClassName}
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/ws/offers"
                  className="inline-flex min-w-[112px] items-center justify-center rounded-full border border-border/70 bg-background px-4 py-3 text-[13px] font-bold text-foreground transition hover:bg-muted/40"
                >
                  {copy.overview.clearAll}
                </Link>
                <button
                  type="submit"
                  className="inline-flex flex-1 items-center justify-center rounded-full bg-foreground px-5 py-3 text-[13px] font-bold text-background transition hover:bg-foreground/90"
                >
                  {copy.overview.applyFilters}
                </button>
              </div>
            </form>
          </aside>
        </div>
      </div>
    </div>
  );
}
