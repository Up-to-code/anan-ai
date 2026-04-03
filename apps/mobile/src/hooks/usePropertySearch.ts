import { useEffect, useMemo, useState } from "react";
import { getPropertyLocationLabel } from "@/lib/mobileData";
import { filterPropertiesForSearch } from "@/lib/mobileSearch";
import { usePropertyFeed } from "@/hooks/usePropertyFeed";
import type { MobileSearchContext } from "@/types/mobile";

const ALL_FILTER = "الكل";

/**
 * WHY:   Direct property search still needs one focused state source even after mobile moves to the live feed contract.
 * WHAT:  Exposes query/filter state plus filtered mobile properties ready for list rendering.
 * HOW:   Reuses the shared live feed hook and filters by text, location label, and owner type on the client.
 */
export function usePropertySearch(searchContext?: MobileSearchContext | null) {
  const feed = usePropertyFeed();
  const [query, setQuery] = useState(searchContext?.query ?? "");
  const [selectedArea, setSelectedArea] = useState(searchContext?.area ?? ALL_FILTER);
  const [selectedOwnerType, setSelectedOwnerType] = useState(searchContext?.ownerType ?? ALL_FILTER);

  const allProperties = feed.properties;
  const areas = useMemo(
    () => [ALL_FILTER, ...new Set(allProperties.map((property) => getPropertyLocationLabel(property)))],
    [allProperties],
  );
  const ownerTypes = [ALL_FILTER, "وسيط", "مطور"];

  useEffect(() => {
    setQuery(searchContext?.query ?? "");
    setSelectedArea(searchContext?.area ?? ALL_FILTER);
    setSelectedOwnerType(searchContext?.ownerType ?? ALL_FILTER);
  }, [searchContext?.area, searchContext?.ownerType, searchContext?.query, searchContext?.searchSummary]);

  const results = useMemo(
    () =>
      filterPropertiesForSearch(allProperties, {
        query,
        selectedArea,
        selectedOwnerType,
        allFilterLabel: ALL_FILTER,
      }),
    [allProperties, query, selectedArea, selectedOwnerType],
  );

  return {
    ...feed,
    allFilterLabel: ALL_FILTER,
    searchContext,
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
