import { Badge } from "@/client_zone/components/ui/badge";
import { useLocaleDictionary } from "@/client_zone/components/LocaleProvider";
import { formatCurrency } from "@/client_zone/lib/formatters";
import {
  AgUiCardHeading,
  AgUiCardShell,
  AgUiMetricTile,
  CardContent,
} from "../AgUiCardPrimitives";
import type { MortgageCheckCardProps } from "../types";

/**
 * WHY:   Buyers need a clean financing checkpoint before moving deeper into advisor handoff or property comparison.
 * WHAT:  Renders a starter eligibility summary with budget and installment hints.
 * HOW:   Keeps the outcome readable in a two-column facts layout on larger screens and stacked on mobile.
 */
export function MortgageCheckCard({
  title,
  estimatedEligibility,
  recommendedBudget,
  monthlyInstallmentEstimate,
  summary,
}: MortgageCheckCardProps) {
  const { locale } = useLocaleDictionary();
  const statusLabel =
    estimatedEligibility === "eligible"
      ? locale === "ar"
        ? "مناسب"
        : "Eligible"
      : estimatedEligibility === "review"
        ? locale === "ar"
          ? "مراجعة"
          : "Review"
        : locale === "ar"
          ? "بيانات غير كافية"
          : "Insufficient data";

  return (
    <AgUiCardShell>
      <AgUiCardHeading title={title} summary={summary} aside={<Badge>{statusLabel}</Badge>} />
      <CardContent className="grid gap-3 pt-0 sm:grid-cols-2">
        <AgUiMetricTile
          label={locale === "ar" ? "الميزانية المقترحة" : "Recommended budget"}
          value={recommendedBudget ? formatCurrency(recommendedBudget, locale) : "—"}
        />
        <AgUiMetricTile
          label={locale === "ar" ? "القسط الشهري التقريبي" : "Estimated monthly payment"}
          value={monthlyInstallmentEstimate ? formatCurrency(monthlyInstallmentEstimate, locale) : "—"}
        />
      </CardContent>
    </AgUiCardShell>
  );
}
