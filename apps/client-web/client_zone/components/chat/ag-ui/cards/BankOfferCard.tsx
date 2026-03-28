import { Landmark } from "lucide-react";
import { useLocaleDictionary } from "@/client_zone/components/LocaleProvider";
import { formatCurrency } from "@/client_zone/lib/formatters";
import {
  AgUiCardHeading,
  AgUiCardShell,
  AgUiMetricTile,
  CardContent,
} from "../AgUiCardPrimitives";
import type { BankOfferCardProps } from "../types";

/**
 * WHY:   Financing conversations feel incomplete without a bank-style offer comparison block.
 * WHAT:  Renders one mock financing offer from a bank or lender.
 * HOW:   Surfaces the few numbers buyers usually compare first: rate, down payment, and monthly estimate.
 */
export function BankOfferCard(props: BankOfferCardProps) {
  const { locale } = useLocaleDictionary();

  return (
    <AgUiCardShell>
      <AgUiCardHeading
        title={props.title}
        summary={
          <>
            <span className="font-black text-[var(--workspace-bubble-other-foreground)]">
              {props.bankName}
            </span>
            {" • "}
            {props.summary}
          </>
        }
        aside={
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)]">
            <Landmark className="h-4 w-4 text-[var(--workspace-bubble-other-foreground)]" />
          </span>
        }
      />
      <CardContent className="space-y-4 pt-0">
        <div className="grid gap-3 sm:grid-cols-3">
          <AgUiMetricTile label={locale === "ar" ? "الفائدة" : "Rate"} value={props.rateLabel} />
          <AgUiMetricTile label={locale === "ar" ? "الدفعة الأولى" : "Down payment"} value={`${props.downPaymentPercent}%`} />
          <AgUiMetricTile label={locale === "ar" ? "قسط تقريبي" : "Monthly estimate"} value={formatCurrency(props.monthlyEstimate, locale)} />
        </div>
      </CardContent>
    </AgUiCardShell>
  );
}
