import { useQuery } from "convex/react";
import { api } from "@/lib/convexApi";
import { toMobileProperty } from "@/lib/mobileData";
import { resolveConvexUrl } from "@/lib/mobileEnv.shared";

const LIVE_BACKEND_ENABLED = Boolean(
  resolveConvexUrl({
    expoPublicConvexUrl: process.env.EXPO_PUBLIC_CONVEX_URL,
  }),
);

function useLivePropertyDetail(propertyId?: string) {
  const liveProperty = useQuery(api.user_zone.mobile.feed.getPropertyDetail, propertyId ? ({ propertyId: propertyId as never } as never) : "skip") as any;

  if (liveProperty === undefined) {
    return {
      property: null,
      isLoading: true,
    };
  }

  return {
    property: liveProperty
      ? toMobileProperty({
          ...liveProperty,
          id: String(liveProperty.id),
          bankId: liveProperty.bankId ? String(liveProperty.bankId) : undefined,
          owner: {
            ...liveProperty.owner,
            id: String(liveProperty.owner.id),
          },
        })
      : null,
    isLoading: false,
  };
}

function useUnavailablePropertyDetail(propertyId?: string) {
  void propertyId;
  return {
    property: null,
    isLoading: false,
  };
}

/**
 * WHY:   Property routes need a direct read helper when the feed page is not already mounted or fully paged in.
 * WHAT:  Returns one buyer-facing property for the given route id.
 * HOW:   Calls the mobile detail query when the backend is configured and otherwise returns an unavailable state.
 */
export function usePropertyDetail(propertyId?: string) {
  return LIVE_BACKEND_ENABLED ? useLivePropertyDetail(propertyId) : useUnavailablePropertyDetail(propertyId);
}
