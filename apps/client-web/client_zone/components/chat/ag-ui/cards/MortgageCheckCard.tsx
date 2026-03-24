import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/client_zone/components/ui/card";
import { Badge } from "@/client_zone/components/ui/badge";
import { useLocaleDictionary } from "@/client_zone/components/LocaleProvider";
import { formatCurrency } from "@/client_zone/lib/formatters";
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm">{title}</CardTitle>
          <Badge className="rounded-md bg-slate-100 text-slate-700">{statusLabel}</Badge>
        </div>
        <CardDescription>{summary}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs text-slate-500">{locale === "ar" ? "الميزانية المقترحة" : "Recommended budget"}</div>
          <div className="mt-2 text-lg font-semibold text-slate-900">
            {recommendedBudget ? formatCurrency(recommendedBudget, locale) : "—"}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs text-slate-500">{locale === "ar" ? "القسط الشهري التقريبي" : "Estimated monthly payment"}</div>
          <div className="mt-2 text-lg font-semibold text-slate-900">
            {monthlyInstallmentEstimate ? formatCurrency(monthlyInstallmentEstimate, locale) : "—"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
