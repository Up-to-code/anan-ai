import { Landmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/client_zone/components/ui/card";
import { useLocaleDictionary } from "@/client_zone/components/LocaleProvider";
import { formatCurrency } from "@/client_zone/lib/formatters";
import type { BankOfferCardProps } from "../types";

/**
 * WHY:   Financing conversations feel incomplete without a bank-style offer comparison block.
 * WHAT:  Renders one mock financing offer from a bank or lender.
 * HOW:   Surfaces the few numbers buyers usually compare first: rate, down payment, and monthly estimate.
 */
export function BankOfferCard(props: BankOfferCardProps) {
  const { locale } = useLocaleDictionary();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
            <Landmark className="h-4 w-4 text-slate-700" />
          </span>
          <div>
            <CardTitle className="text-sm">{props.title}</CardTitle>
            <CardDescription>{props.bankName}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-slate-600">{props.summary}</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs text-slate-500">{locale === "ar" ? "الفائدة" : "Rate"}</div>
            <div className="mt-2 text-sm font-semibold text-slate-900">{props.rateLabel}</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs text-slate-500">{locale === "ar" ? "الدفعة الأولى" : "Down payment"}</div>
            <div className="mt-2 text-sm font-semibold text-slate-900">{props.downPaymentPercent}%</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs text-slate-500">{locale === "ar" ? "قسط تقريبي" : "Monthly estimate"}</div>
            <div className="mt-2 text-sm font-semibold text-slate-900">{formatCurrency(props.monthlyEstimate, locale)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
