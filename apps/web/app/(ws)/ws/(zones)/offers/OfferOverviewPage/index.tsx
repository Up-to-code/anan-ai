"use client";

import Link from "next/link";
import OfferPaginationNav from "../OfferPaginationNav";
import OfferListItem from "../OfferListItem";
import type { WorkspaceOfferSummary } from "../offerTypes";
import type { OffersSortValue, PaginatedCollection } from "../offersPageData";

function sortLabel(sort: OffersSortValue) {
  return sort === "updated_asc" ? "الأقدم أولاً" : "الأحدث أولاً";
}

/**
 * WHY:   The main offers page should feel like one clean searchable workspace list rather than a dashboard of queues.
 * WHAT:  Renders search + time sort controls above one flat paginated list of offer cards.
 * HOW:   Receives a server-prepared, deduplicated, sorted collection and preserves query params through form submit and pagination.
 */
export default function OfferOverviewPage({
  items,
  pagination,
  routeBase,
  searchQuery,
  sort,
}: {
  items: WorkspaceOfferSummary[];
  pagination: PaginatedCollection<WorkspaceOfferSummary>;
  routeBase: string;
  searchQuery: string;
  sort: OffersSortValue;
}) {
  return (
    <div className="flex min-h-full flex-col pb-32">
      <div className="grid gap-6 px-6 py-6 lg:px-8 lg:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/ws/offers/create"
            className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-3 text-[13px] font-bold text-background transition hover:bg-foreground/90"
          >
            إنشاء عرض
          </Link>
          <div className="text-right text-[13px] text-muted-foreground">
            {pagination.totalItems} عرض
          </div>
        </div>

        <form action="/ws/offers" className="grid gap-3 rounded-[20px] border border-border/60 bg-card p-4 shadow-sm lg:grid-cols-[minmax(0,1fr)_200px_auto] lg:items-center">
          <input
            type="text"
            name="q"
            defaultValue={searchQuery}
            placeholder="ابحث في العروض..."
            className="w-full rounded-full bg-background px-4 py-3 text-right text-[14px] font-medium text-foreground outline-none ring-1 ring-border placeholder:text-muted-foreground"
          />
          <select
            name="sort"
            defaultValue={sort}
            className="rounded-full bg-background px-4 py-3 text-right text-[14px] font-medium text-foreground outline-none ring-1 ring-border"
          >
            <option value="updated_desc">الأحدث أولاً</option>
            <option value="updated_asc">الأقدم أولاً</option>
          </select>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-3 text-[13px] font-bold text-background transition hover:bg-foreground/90"
          >
            تطبيق
          </button>
        </form>

        <div className="flex items-center justify-between gap-3 text-[13px] text-muted-foreground">
          <div>{sortLabel(sort)}</div>
          {searchQuery ? <div className="text-right">نتائج البحث: {searchQuery}</div> : null}
        </div>

        {items.length > 0 ? (
          <div className="grid gap-4" data-slot="offers-grid">
            {items.map((item) => (
              <OfferListItem key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-border/60 bg-card/70 px-6 py-12 text-center text-[14px] font-medium text-muted-foreground">
            لا توجد عروض مطابقة حالياً.
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
    </div>
  );
}
