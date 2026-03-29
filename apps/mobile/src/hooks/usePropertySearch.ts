import { useState } from "react";
import { getPropertyLocationLabel } from "@/lib/mobileData";
import { usePropertyFeed } from "@/hooks/usePropertyFeed";
import type { MobileProperty } from "@/types/mobile";

const ALL_FILTER = "الكل";

/**
 * WHY:   Direct property search still needs one focused state source even after mobile moves to the live feed contract.
 * WHAT:  Exposes query/filter state plus filtered mobile properties ready for list rendering.
 * HOW:   Reuses the shared live feed hook and filters by text, location label, and owner type on the client.
 */
export function usePropertySearch() {
  const feed = usePropertyFeed();
  const [query, setQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState(ALL_FILTER);
  const [selectedOwnerType, setSelectedOwnerType] = useState(ALL_FILTER);

  const allProperties = feed.properties;
  const areas = [ALL_FILTER, ...new Set(allProperties.map((property) => getPropertyLocationLabel(property)))];
  const ownerTypes = [ALL_FILTER, "وسيط", "مطور"];

  const results = allProperties.filter((property) => {
    const matchesText =
      query.trim().length === 0 ||
      property.title.includes(query) ||
      property.address.includes(query) ||
      getPropertyLocationLabel(property).includes(query) ||
      property.owner.name.includes(query);
    const matchesArea = selectedArea === ALL_FILTER || getPropertyLocationLabel(property) === selectedArea;
    const matchesOwnerType =
      selectedOwnerType === ALL_FILTER || matchOwnerTypeLabel(property, selectedOwnerType);

    return matchesText && matchesArea && matchesOwnerType;
  });

  return {
    ...feed,
    query,
    selectedArea,
    selectedOwnerType,
    areas,
    ownerTypes,
    results,
    setQuery,
    setSelectedArea,
    setSelectedOwnerType,
  };
}

function matchOwnerTypeLabel(property: MobileProperty, ownerTypeLabel: string) {
  if (ownerTypeLabel === "وسيط") return property.owner.type === "broker";
  if (ownerTypeLabel === "مطور") return property.owner.type === "RED";
  return ownerTypeLabel === ALL_FILTER;
}
