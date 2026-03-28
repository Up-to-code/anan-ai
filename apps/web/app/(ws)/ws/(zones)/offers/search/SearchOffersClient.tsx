"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { formatOfferPrice, formatOfferStageLabel } from "../offerViewModel";
import type { WorkspaceOfferSummary } from "../offerTypes";

export type SearchOfferFilters = {
  searchQuery: string;
};

export function filterSearchOffers(items: WorkspaceOfferSummary[], filters: SearchOfferFilters) {
  const query = filters.searchQuery.trim().toLowerCase();
  if (!query) return items;
  return items.filter((item) =>
    `${item.message} ${item.description ?? ""} ${item.property?.title ?? ""} ${item.property?.address ?? ""} ${item.senderName ?? ""}`
      .toLowerCase()
      .includes(query),
  );
}

/**
 * WHY:   Search remains useful as a lightweight discovery surface for open and targeted offer cases during the offers cutover.
 * WHAT:  Renders a searchable list of normalized offer summaries.
 * HOW:   Filters in memory by one free-text query that spans case title, description, property fields, and sender name.
 */
export default function SearchOffersClient({ items }: { items: WorkspaceOfferSummary[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const filteredItems = filterSearchOffers(items, { searchQuery });

  return (
    <div className="flex min-h-full flex-col pb-24">
      <div className="grid gap-6 px-6 py-6 lg:px-8 lg:py-8">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="ابحث داخل الحالات..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-2xl border border-border bg-background px-12 py-3 text-[14px] font-bold text-foreground"
            />
          </div>
        </div>

        <div className="grid gap-4" data-slot="offers-grid">
          {filteredItems.map((item) => (
            <Link
              key={item.id}
              href={`/ws/offers/${item.id}`}
              className="rounded-3xl border border-border bg-card p-5 shadow-sm transition hover:bg-muted/20"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-black text-foreground">{item.message}</div>
                  <div className="mt-2 text-[13px] text-muted-foreground">
                    {item.property?.title ?? "أصل عقاري"} • {item.property?.address ?? "غير محدد"}
                  </div>
                  {item.senderName ? (
                    <div className="mt-2 text-[13px] font-bold text-foreground/75">{item.senderName}</div>
                  ) : null}
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    {formatOfferStageLabel(item.stage)}
                  </div>
                  <div className="mt-1 text-[15px] font-black text-foreground">{formatOfferPrice(item.price)}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
