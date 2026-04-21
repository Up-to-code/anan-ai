import { useEffect, useMemo, useState } from "react";
import { useBuyerAccount } from "@/hooks/useBuyerAccount";
import { getPropertyLocationLabel } from "@/lib/mobileData";
import { filterPropertiesForSearch } from "@/lib/mobileSearch";
import { usePropertyFeed } from "@/hooks/usePropertyFeed";
import { getMobileDictionary } from "@/lib/i18n";
import type { MobileSearchContext } from "@/types/mobile";

/**
 * WHY:   Direct property search still needs one focused state source even after mobile moves to the live feed contract.
 * WHAT:  Exposes query/filter state plus filtered mobile properties ready for list rendering.
 * HOW:   Reuses the shared live feed hook and filters by text, location label, and owner type on the client.
 */
export function usePropertySearch(searchContext?: MobileSearchContext | null) {
  const account = useBuyerAccount();
  const locale = account.viewer.preferences.locale;
  const dictionary = getMobileDictionary(locale);
  const feed = usePropertyFeed();
  const allFilterLabel = dictionary.assistant.searchAll;
  const [query, setQuery] = useState(searchContext?.query ?? "");
  const [selectedArea, setSelectedArea] = useState(searchContext?.area ?? allFilterLabel);
  const [selectedOwnerType, setSelectedOwnerType] = useState(searchContext?.ownerType ?? allFilterLabel);

  const allProperties = feed.properties;
  const areas = useMemo(
    () => [allFilterLabel, ...new Set(allProperties.map((property) => getPropertyLocationLabel(property)))],
    [allFilterLabel, allProperties],
  );
  const ownerTypes = [allFilterLabel, "broker", "developer"];

  useEffect(() => {
    setQuery(searchContext?.query ?? "");
    setSelectedArea(searchContext?.area ?? allFilterLabel);
    setSelectedOwnerType(searchContext?.ownerType ?? allFilterLabel);
  }, [allFilterLabel, searchContext?.area, searchContext?.ownerType, searchContext?.query, searchContext?.searchSummary]);

  const results = useMemo(
    () =>
      filterPropertiesForSearch(allProperties, {
        query,
        selectedArea,
        selectedOwnerType,
        allFilterLabel,
      }),
    [allFilterLabel, allProperties, query, selectedArea, selectedOwnerType],
  );

  return {
    ...feed,
    allFilterLabel,
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
