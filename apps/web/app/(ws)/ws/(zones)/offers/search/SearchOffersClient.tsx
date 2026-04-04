"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import OfferListItem from "../shared/components/OfferListItem";
import type { WorkspaceOfferSummary } from "../types/offerTypes";

export type SearchOfferFilters = {
  searchQuery: string;
};

export function filterSearchOffers(items: WorkspaceOfferSummary[], filters: SearchOfferFilters) {
  const query = filters.searchQuery.trim().toLowerCase();
  if (!query) return items;
  return items.filter((item) =>
    [
      item.message,
      item.description ?? "",
      item.propertySummary ?? "",
      item.property?.title ?? "",
      item.property?.address ?? "",
      item.senderName ?? "",
      item.primaryOrganization?.name ?? "",
      item.clientContext?.clientName ?? "",
      item.clientContext?.clientNeed ?? "",
    ]
      .join(" ")
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
          {filteredItems.map((item) => <OfferListItem key={item.id} item={item} />)}
        </div>
      </div>
    </div>
  );
}
