import { useQuery } from "convex/react";
import { api } from "@/lib/convexApi";
import { resolveConvexUrl } from "@/lib/mobileEnv.shared";
import type { MobileFinanceEstimate } from "@/types/mobile";

const LIVE_BACKEND_ENABLED = Boolean(
  resolveConvexUrl({
    expoPublicConvexUrl: process.env.EXPO_PUBLIC_CONVEX_URL,
  }),
);

/**
 * WHY:   The finance screen should resolve scenarios from the live backend only.
 * WHAT:  Returns the current finance scenario and loading state for the selected property and buyer inputs.
 * HOW:   Uses the mobile finance query when Convex is configured and otherwise reports an unavailable empty state.
 */
export function useBuyerFinance(args: {
  propertyId?: string;
  propertyTitle?: string;
  propertyPrice: number;
  downPayment: number;
  annualRate: number;
  years: number;
  monthlySalary?: number;
}) {
  const liveEstimate = LIVE_BACKEND_ENABLED
    ? (useQuery(
        api.user_zone.mobile.finance.getEstimate,
        {
          propertyId: args.propertyId as never,
          propertyPrice: args.propertyPrice,
          downPayment: args.downPayment,
          annualRate: args.annualRate,
          years: args.years,
          monthlySalary: args.monthlySalary,
        } as never,
      ) as MobileFinanceEstimate | null | undefined)
    : null;

  return {
    estimate: LIVE_BACKEND_ENABLED ? liveEstimate ?? null : null,
    isLoading: LIVE_BACKEND_ENABLED ? liveEstimate === undefined : false,
  };
}
