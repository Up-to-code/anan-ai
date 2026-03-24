import { useState } from "react";
import { listCatalogProperties } from "@/lib/mvp/ananAssistant";
import type { PropertyPreview } from "@/types/chat";

const ALL_FILTER = "الكل";

/**
 * WHY:   The search screen needs one small source of truth for query and filter state.
 * WHAT:  Exposes search input, filter setters, and filtered property results for the MVP catalog.
 * HOW:   Filters the in-memory catalog by text, city, and property type without mixing in hidden backend fallbacks.
 */
export function usePropertySearch() {
  const [query, setQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState(ALL_FILTER);
  const [selectedType, setSelectedType] = useState(ALL_FILTER);

  const allProperties = listCatalogProperties();
  const cities = [ALL_FILTER, ...new Set(allProperties.map((property) => property.city))];
  const types = [ALL_FILTER, "شقة", "فيلا", "دوبلكس", "تاون هاوس", "استوديو"];

  const results = allProperties.filter((property) => {
    const matchesText =
      query.trim().length === 0 ||
      property.title.includes(query) ||
      property.area.includes(query) ||
      property.city.includes(query);
    const matchesCity = selectedCity === ALL_FILTER || property.city === selectedCity;
    const matchesType = selectedType === ALL_FILTER || matchesTypeLabel(property, selectedType);

    return matchesText && matchesCity && matchesType;
  });

  return {
    query,
    selectedCity,
    selectedType,
    cities,
    types,
    results,
    setQuery,
    setSelectedCity,
    setSelectedType,
  };
}

function matchesTypeLabel(property: PropertyPreview, typeLabel: string) {
  if (typeLabel === "شقة") return property.propertyType === "apartment";
  if (typeLabel === "فيلا") return property.propertyType === "villa";
  if (typeLabel === "دوبلكس") return property.propertyType === "duplex";
  if (typeLabel === "تاون هاوس") return property.propertyType === "townhouse";
  if (typeLabel === "استوديو") return property.propertyType === "studio";
  return true;
}
