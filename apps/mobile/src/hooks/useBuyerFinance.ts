import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/lib/convexApi";
import type { MobileFinanceEstimate } from "@/types/mobile";

const LIVE_BACKEND_ENABLED = Boolean(process.env.EXPO_PUBLIC_CONVEX_URL);

function buildFallbackFinanceEstimate(args: {
  propertyId?: string;
  propertyTitle?: string;
  propertyPrice: number;
  downPayment: number;
  annualRate: number;
  years: number;
  monthlySalary?: number;
}): MobileFinanceEstimate {
  const loanAmount = Math.max(0, args.propertyPrice - args.downPayment);
  const downPaymentPercent = args.propertyPrice > 0 ? Math.round((args.downPayment / args.propertyPrice) * 100) : 0;
  const monthlyRate = args.annualRate / 100 / 12;
  const installments = Math.max(args.years * 12, 1);
  const factor = Math.pow(1 + monthlyRate, installments);
  const monthlyPayment =
    monthlyRate > 0 ? Math.round((loanAmount * monthlyRate * factor) / Math.max(factor - 1, 1)) : Math.round(loanAmount / installments);
  const totalPaid = Math.round(monthlyPayment * installments);
  const totalInterest = Math.max(0, totalPaid - loanAmount);
  const recommendedBudget = args.monthlySalary ? Math.round(args.monthlySalary * 55) : undefined;
  const affordabilityStatus =
    !args.monthlySalary || args.monthlySalary <= 0
      ? "review"
      : monthlyPayment <= args.monthlySalary * 0.35
        ? "comfortable"
        : monthlyPayment <= args.monthlySalary * 0.5
          ? "review"
          : "stretch";

  return {
    propertyId: args.propertyId,
    propertyTitle: args.propertyTitle,
    propertyPrice: args.propertyPrice,
    downPayment: args.downPayment,
    downPaymentPercent,
    loanAmount,
    annualRate: args.annualRate,
    years: args.years,
    monthlyPayment,
    totalPaid,
    totalInterest,
    affordabilityStatus,
    recommendedBudget,
    bankOffers: [],
    summary:
      affordabilityStatus === "comfortable"
        ? "السيناريو الحالي يبدو مريحاً مقارنة بالدخل الشهري المرسل."
        : affordabilityStatus === "review"
          ? "هذا السيناريو يحتاج مراجعة إضافية لكنه ما زال ضمن النطاق المبدئي."
          : "القسط الحالي مرتفع مقارنة بالدخل الشهري المرسل ويحتاج تعديل الافتراضات.",
  };
}

/**
 * WHY:   The finance screen needs one property-aware estimate source that works in both live and fallback modes.
 * WHAT:  Returns the current finance scenario and loading state for the selected property and buyer inputs.
 * HOW:   Uses the mobile finance query when Convex is configured and falls back to the same amortization math locally otherwise.
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

  const fallbackEstimate = useMemo(
    () =>
      buildFallbackFinanceEstimate({
        propertyId: args.propertyId,
        propertyTitle: args.propertyTitle,
        propertyPrice: args.propertyPrice,
        downPayment: args.downPayment,
        annualRate: args.annualRate,
        years: args.years,
        monthlySalary: args.monthlySalary,
      }),
    [args.annualRate, args.downPayment, args.monthlySalary, args.propertyId, args.propertyPrice, args.propertyTitle, args.years],
  );

  return {
    estimate: LIVE_BACKEND_ENABLED ? liveEstimate ?? fallbackEstimate : fallbackEstimate,
    isLoading: LIVE_BACKEND_ENABLED ? liveEstimate === undefined : false,
    hasBackend: LIVE_BACKEND_ENABLED,
  };
}

