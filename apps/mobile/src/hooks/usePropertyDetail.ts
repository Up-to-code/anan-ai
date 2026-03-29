import { useQuery } from "convex/react";
import { api } from "@/lib/convexApi";
import { getFallbackProperties, toMobileProperty } from "@/lib/mobileData";

const LIVE_BACKEND_ENABLED = Boolean(process.env.EXPO_PUBLIC_CONVEX_URL);

function useLivePropertyDetail(propertyId?: string) {
  const liveProperty = useQuery(api.user_zone.mobile.feed.getPropertyDetail, propertyId ? ({ propertyId: propertyId as never } as never) : "skip") as any;

  if (!liveProperty) {
    return {
      property: null,
      isLoading: true,
    };
  }

  return {
    property: toMobileProperty({
      ...liveProperty,
      id: String(liveProperty.id),
      bankId: liveProperty.bankId ? String(liveProperty.bankId) : undefined,
      owner: {
        ...liveProperty.owner,
        id: String(liveProperty.owner.id),
      },
    }),
    isLoading: false,
  };
}

function useFallbackPropertyDetail(propertyId?: string) {
  return {
    property: getFallbackProperties().find((item) => item.id === propertyId) ?? null,
    isLoading: false,
  };
}

/**
 * WHY:   Property routes need a direct read helper when the feed page is not already mounted or fully paged in.
 * WHAT:  Returns one buyer-facing property for the given route id.
 * HOW:   Calls the new mobile detail query in live mode and falls back to the local catalog when Convex is unavailable.
 */
export function usePropertyDetail(propertyId?: string) {
  return LIVE_BACKEND_ENABLED ? useLivePropertyDetail(propertyId) : useFallbackPropertyDetail(propertyId);
}
