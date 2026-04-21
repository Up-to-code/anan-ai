import { ConvexError, v } from "convex/values";
import { query } from "../../_generated/server";
import { mobileFinanceEstimateValidator } from "./contracts";
import { isPropertyDistributionReady } from "../../shared_logic/projects/readiness";

function getNumericRule(rule: unknown, keys: string[]) {
  if (!rule || typeof rule !== "object") return undefined;
  const record = rule as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return undefined;
}

function calculateMortgage(args: {
  propertyPrice: number;
  downPayment: number;
  annualRate: number;
  years: number;
}) {
  const loanAmount = Math.max(0, args.propertyPrice - args.downPayment);
  const monthlyRate = args.annualRate / 100 / 12;
  const installments = Math.max(args.years * 12, 1);
  const factor = Math.pow(1 + monthlyRate, installments);
  const monthlyPayment =
    monthlyRate > 0
      ? Math.round((loanAmount * monthlyRate * factor) / Math.max(factor - 1, 1))
      : Math.round(loanAmount / installments);
  const totalPaid = Math.round(monthlyPayment * installments);
  const totalInterest = Math.max(0, totalPaid - loanAmount);

  return {
    loanAmount,
    monthlyPayment,
    totalPaid,
    totalInterest,
  };
}

function resolveAffordabilityStatus(monthlyPayment: number, monthlySalary?: number) {
  if (!monthlySalary || monthlySalary <= 0) return "review" as const;
  if (monthlyPayment <= monthlySalary * 0.35) return "comfortable" as const;
  if (monthlyPayment <= monthlySalary * 0.5) return "review" as const;
  return "stretch" as const;
}

/**
 * WHY:   Finance screens and assistant follow-ups need one real mobile-friendly estimate contract instead of repeating placeholder math inside the UI.
 * WHAT:  Returns a property-aware finance scenario with amortized payment totals and lightweight bank comparisons.
 * HOW:   Resolves the active property price, applies either explicit user inputs or bank-derived defaults, then projects the top bank bundles into buyer-safe summary rows.
 */
export const getEstimate = query({
  args: {
    propertyId: v.optional(v.id("properties")),
    propertyPrice: v.optional(v.number()),
    downPayment: v.optional(v.number()),
    years: v.optional(v.number()),
    annualRate: v.optional(v.number()),
    monthlySalary: v.optional(v.number()),
  },
  returns: mobileFinanceEstimateValidator,
  handler: async (ctx, args) => {
    const loadedProperty = args.propertyId ? await ctx.db.get(args.propertyId) : null;
    const property = loadedProperty && isPropertyDistributionReady(loadedProperty) ? loadedProperty : null;
    const propertyPrice = args.propertyPrice ?? property?.price;
    if (!propertyPrice || propertyPrice <= 0) {
      throw new ConvexError({ code: "INVALID_INPUT", message: "Property price is required for finance estimates" });
    }

    const bankRecords = property?.bankId
      ? [await ctx.db.get(property.bankId)].filter(Boolean)
      : await ctx.db.query("banks").take(20);
    const bundles = (bankRecords as Array<NonNullable<(typeof bankRecords)[number]>>).flatMap((bank) =>
      (bank.products ?? []).map((product) => ({
        bankName: bank.name,
        rules: product.rules,
      })),
    );

    const leadingBundle = bundles[0];
    const defaultDownPaymentPercent =
      getNumericRule(leadingBundle?.rules, ["minDownPaymentPercent", "downPaymentPercent"]) ?? 10;
    const resolvedAnnualRate =
      args.annualRate ?? getNumericRule(leadingBundle?.rules, ["interestRate", "annualRate"]) ?? 4.75;
    const resolvedYears = args.years ?? 20;
    const resolvedDownPayment = Math.max(
      0,
      args.downPayment ?? Math.round(propertyPrice * (defaultDownPaymentPercent / 100)),
    );
    const primaryEstimate = calculateMortgage({
      propertyPrice,
      downPayment: resolvedDownPayment,
      annualRate: resolvedAnnualRate,
      years: resolvedYears,
    });
    const recommendedBudget = args.monthlySalary ? Math.round(args.monthlySalary * 55) : undefined;
    const affordabilityStatus = resolveAffordabilityStatus(primaryEstimate.monthlyPayment, args.monthlySalary);

    const bankOffers = bundles.slice(0, 2).map((bundle, index) => {
      const downPaymentPercent =
        getNumericRule(bundle.rules, ["minDownPaymentPercent", "downPaymentPercent"]) ?? (index === 0 ? 10 : 15);
      const annualRate = getNumericRule(bundle.rules, ["interestRate", "annualRate"]) ?? (index === 0 ? 4.35 : 4.85);
      const estimate = calculateMortgage({
        propertyPrice,
        downPayment: Math.round(propertyPrice * (downPaymentPercent / 100)),
        annualRate,
        years: resolvedYears,
      });

      return {
        bankName: bundle.bankName,
        rateLabel: `${annualRate}%`,
        downPaymentPercent,
        monthlyEstimate: estimate.monthlyPayment,
        summary: `تقدير مبدئي على ${property?.title ?? "العقار"} مع دفعة أولى ${downPaymentPercent}%.`,
      };
    });

    const downPaymentPercent = propertyPrice > 0 ? Math.round((resolvedDownPayment / propertyPrice) * 100) : 0;

    return {
      propertyId: property?._id,
      propertyTitle: property?.title,
      propertyPrice,
      downPayment: resolvedDownPayment,
      downPaymentPercent,
      loanAmount: primaryEstimate.loanAmount,
      annualRate: resolvedAnnualRate,
      years: resolvedYears,
      monthlyPayment: primaryEstimate.monthlyPayment,
      totalPaid: primaryEstimate.totalPaid,
      totalInterest: primaryEstimate.totalInterest,
      affordabilityStatus,
      recommendedBudget,
      bankOffers,
      summary:
        affordabilityStatus === "comfortable"
          ? "السيناريو الحالي يبدو مريحاً مقارنة بالدخل الشهري المرسل."
          : affordabilityStatus === "review"
            ? "هذا السيناريو قابل للمراجعة، لكن يحتاج تأكيد الراتب والالتزامات الحالية."
            : "القسط الحالي مرتفع مقارنة بالدخل المرسل، ويفضل تعديل الدفعة الأولى أو المدة.",
    };
  },
});
