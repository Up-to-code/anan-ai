import { useLocaleDictionary } from "@/client_zone/components/LocaleProvider";
import { formatCurrency } from "@/client_zone/lib/formatters";
import {
  AgUiCardHeading,
  AgUiCardShell,
  AgUiMetricTile,
  CardContent,
  agUiInnerPanelClassName,
} from "../AgUiCardPrimitives";
import type { LoanCalculatorCardProps } from "../types";

/**
 * WHY:   The assistant needs a clear financing scenario block that can be scanned quickly inside the thread.
 * WHAT:  Renders a starter loan breakdown with the core financing numbers.
 * HOW:   Uses a light grid of key figures and leaves deeper interactivity for a later pass.
 */
export function LoanCalculatorCard(props: LoanCalculatorCardProps) {
  const { locale } = useLocaleDictionary();
  const metrics = [
    { label: locale === "ar" ? "سعر العقار" : "Property price", value: formatCurrency(props.propertyPrice, locale) },
    { label: locale === "ar" ? "الدفعة الأولى" : "Down payment", value: formatCurrency(props.downPayment, locale) },
    { label: locale === "ar" ? "قيمة التمويل" : "Loan amount", value: formatCurrency(props.loanAmount, locale) },
    { label: locale === "ar" ? "القسط الشهري" : "Monthly payment", value: formatCurrency(props.monthlyPayment, locale) },
  ];

  return (
    <AgUiCardShell>
      <AgUiCardHeading title={props.title} summary={props.summary} />
      <CardContent className="space-y-4 pt-0">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <AgUiMetricTile key={metric.label} label={metric.label} value={metric.value} />
          ))}
        </div>
        <div className={`flex flex-wrap gap-6 px-4 py-3 text-sm font-medium text-[var(--workspace-muted)] ${agUiInnerPanelClassName()}`}>
          <span>{locale === "ar" ? "الفائدة" : "Interest"}: {props.interestRate}%</span>
          <span>{locale === "ar" ? "المدة" : "Term"}: {props.years} {locale === "ar" ? "سنة" : "years"}</span>
        </div>
      </CardContent>
    </AgUiCardShell>
  );
}
