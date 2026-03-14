import { useMemo } from "react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/lib/convexApi";
import { mockProperties } from "@/lib/mockData";
import { MobilePropertyFeedItem } from "@/types/mobile";

const hasConvexUrl = Boolean(process.env.EXPO_PUBLIC_CONVEX_URL);

/**
 * WHY:   The home feed needs one data hook that can run against Convex or local mocks during setup.
 * WHAT:  Returns the mobile property feed list plus a mock-safe fallback mode.
 * HOW:   Uses Convex pagination when a deployment URL exists and falls back to seeded fixtures otherwise.
 */
export function usePropertyFeed() {
  if (!hasConvexUrl) {
    return {
      properties: mockProperties,
      status: "mock" as const,
    };
  }

  const feed = usePaginatedQuery(
    (api as any)["user_zone/mobile/feed"].listFeed,
    {},
    { initialNumItems: 8 },
  );

  const properties = useMemo<MobilePropertyFeedItem[]>(() => {
    if (feed.results && feed.results.length > 0) {
      return feed.results.map(normalizeFeedItem);
    }
    return mockProperties;
  }, [feed.results]);

  return {
    properties,
    status: feed.status,
  };
}

function normalizeFeedItem(item: any): MobilePropertyFeedItem {
  const fallback = mockProperties.find((property) => property.id === String(item.id)) ?? mockProperties[0];
  return {
    id: String(item.id),
    title: item.title,
    address: item.address,
    location: item.location,
    area: item.area,
    price: item.price,
    beds: item.beds,
    baths: item.baths,
    sqft: item.sqft,
    status: item.status,
    media: item.media,
    owner: item.owner,
    aiSummary: item.aiSummary,
    recommendedPrompts: item.recommendedPrompts ?? fallback?.recommendedPrompts ?? [],
    demoPreviewCard: item.demoPreviewCard ?? fallback?.demoPreviewCard,
  };
}
