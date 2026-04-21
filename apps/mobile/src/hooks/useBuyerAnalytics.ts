import { useQuery } from "convex/react";
import { api } from "@/lib/convexApi";
import { resolveConvexUrl } from "@/lib/mobileEnv.shared";
import type { MobileBuyerAnalyticsSummary } from "@/types/mobile";

const LIVE_BACKEND_ENABLED = Boolean(
  resolveConvexUrl({
    expoPublicConvexUrl: process.env.EXPO_PUBLIC_CONVEX_URL,
  }),
);

function useLiveBuyerAnalytics() {
  return useQuery(api.user_zone.mobile.analytics.getBuyerMarketSummary, {} as never) as
    | MobileBuyerAnalyticsSummary
    | null
    | undefined;
}

/**
 * WHY:   The analytics screen should consume only the live buyer-summary contract used by the production app.
 * WHAT:  Returns the live analytics summary when available, plus loading state for the shared UI.
 * HOW:   Reads the Convex summary when configured and otherwise reports an unavailable empty state.
 */
export function useBuyerAnalytics() {
  const liveSummary = LIVE_BACKEND_ENABLED ? useLiveBuyerAnalytics() : null;

  return {
    summary: LIVE_BACKEND_ENABLED ? liveSummary ?? null : null,
    isLoading: LIVE_BACKEND_ENABLED ? liveSummary === undefined : false,
  };
}
