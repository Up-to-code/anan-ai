import { usePaginatedQuery } from "convex/react";
import { api } from "@/lib/convexApi";
import { toMobileProperty } from "@/lib/mobileData";
import { resolveConvexUrl } from "@/lib/mobileEnv.shared";

const LIVE_BACKEND_ENABLED = Boolean(
  resolveConvexUrl({
    expoPublicConvexUrl: process.env.EXPO_PUBLIC_CONVEX_URL,
  }),
);

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
    findPropertyById(propertyId?: string | null) {
      if (!propertyId) return null;
      return properties.find((property) => property.id === propertyId) ?? null;
    },
  };
}

function useUnavailablePropertyFeed() {
  return {
    properties: [] as Array<ReturnType<typeof toMobileProperty>>,
    featuredProperties: [] as Array<ReturnType<typeof toMobileProperty>>,
    isLoading: false,
    status: "Exhausted" as const,
    loadMore: () => undefined,
    findPropertyById(propertyId?: string | null) {
      void propertyId;
      return null;
    },
  };
}

/**
 * WHY:   Mobile discovery should only consume the live Convex feed in the shipped buyer runtime.
 * WHAT:  Returns live paginated buyer properties, loading state, and a load-more helper for the mobile UI.
 * HOW:   Uses Convex pagination when the backend is configured and otherwise reports an unavailable empty state.
 */
export function usePropertyFeed() {
  return LIVE_BACKEND_ENABLED ? useLivePropertyFeed() : useUnavailablePropertyFeed();
}

export type PropertyFeedController = ReturnType<typeof usePropertyFeed>;
