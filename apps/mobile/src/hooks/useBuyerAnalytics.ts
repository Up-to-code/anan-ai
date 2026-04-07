import { useQuery } from "convex/react";
import { api } from "@/lib/convexApi";
import { buildFallbackAnalyticsSummary } from "@/lib/mobileAnalytics";
import { usePropertyFeed } from "@/hooks/usePropertyFeed";
import type { MobileBuyerAnalyticsSummary } from "@/types/mobile";

const LIVE_BACKEND_ENABLED = Boolean(process.env.EXPO_PUBLIC_CONVEX_URL);

function useLiveBuyerAnalytics() {
  return useQuery(api.user_zone.mobile.analytics.getBuyerMarketSummary, {} as never) as
    | MobileBuyerAnalyticsSummary
    | null
    | undefined;
}

/**
 * WHY:   The analytics screen should consume one stable buyer-summary contract regardless of backend mode.
 * WHAT:  Returns the live analytics summary when available, otherwise a deterministic fallback summary built from local inventory.
 * HOW:   Switches cleanly on the same environment flag used across the mobile app so analytics never mixes real and fallback data.
 */
export function useBuyerAnalytics() {
  const feed = usePropertyFeed();
  const liveSummary = LIVE_BACKEND_ENABLED ? useLiveBuyerAnalytics() : null;

  if (!LIVE_BACKEND_ENABLED) {
    return {
      summary: buildFallbackAnalyticsSummary(feed.properties),
      isLoading: false,
      hasBackend: false,
    };
  }

  return {
    summary: liveSummary ?? buildFallbackAnalyticsSummary(feed.properties),
    isLoading: liveSummary === undefined,
    hasBackend: true,
  };
}

