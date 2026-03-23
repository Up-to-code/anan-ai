import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/client_zone/components/ui/card";
import { useLocaleDictionary } from "@/client_zone/components/LocaleProvider";
import { formatCurrency } from "@/client_zone/lib/formatters";
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
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{props.title}</CardTitle>
        <CardDescription>{props.summary}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs text-slate-500">{metric.label}</div>
              <div className="mt-2 text-base font-semibold text-slate-900">{metric.value}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-slate-600">
          <span>{locale === "ar" ? "الفائدة" : "Interest"}: {props.interestRate}%</span>
          <span>{locale === "ar" ? "المدة" : "Term"}: {props.years} {locale === "ar" ? "سنة" : "years"}</span>
        </div>
      </CardContent>
    </Card>
  );
}
