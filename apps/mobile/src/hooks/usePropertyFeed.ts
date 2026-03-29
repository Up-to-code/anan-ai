import { usePaginatedQuery } from "convex/react";
import { api } from "@/lib/convexApi";
import { getFallbackProperties, toMobileProperty } from "@/lib/mobileData";

const LIVE_BACKEND_ENABLED = Boolean(process.env.EXPO_PUBLIC_CONVEX_URL);

function useLivePropertyFeed() {
  const liveFeed = usePaginatedQuery(api.user_zone.mobile.feed.listFeed, {} as never, {
    initialNumItems: 12,
  });

  const properties = ((liveFeed.results ?? []) as Array<any>).map((property) =>
    toMobileProperty({
      ...property,
      id: String(property.id),
      bankId: property.bankId ? String(property.bankId) : undefined,
      owner: {
        ...property.owner,
        id: String(property.owner.id),
      },
    }),
  );

  return {
    mode: "live" as const,
    properties,
    featuredProperties: properties.slice(0, 6),
    isLoading: liveFeed.isLoading,
    status: liveFeed.status,
    loadMore: () => liveFeed.loadMore(12),
    hasBackend: true,
    findPropertyById(propertyId?: string | null) {
      if (!propertyId) return null;
      return properties.find((property) => property.id === propertyId) ?? null;
    },
  };
}

function useFallbackPropertyFeed() {
  const properties = getFallbackProperties();

  return {
    mode: "fallback" as const,
    properties,
    featuredProperties: properties.slice(0, 6),
    isLoading: false,
    status: "Exhausted" as const,
    loadMore: () => undefined,
    hasBackend: false,
    findPropertyById(propertyId?: string | null) {
      if (!propertyId) return null;
      return properties.find((property) => property.id === propertyId) ?? null;
    },
  };
}

/**
 * WHY:   Mobile discovery needs one feed source that can swap cleanly between Convex and explicit local fallback mode.
 * WHAT:  Returns live paginated buyer properties, loading state, and a load-more helper for the mobile UI.
 * HOW:   Uses Convex pagination when configured and falls back to the deterministic local catalog otherwise.
 */
export function usePropertyFeed() {
  return LIVE_BACKEND_ENABLED ? useLivePropertyFeed() : useFallbackPropertyFeed();
}

export type PropertyFeedController = ReturnType<typeof usePropertyFeed>;
