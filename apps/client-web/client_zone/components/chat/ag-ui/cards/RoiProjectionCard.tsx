import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/client_zone/components/ui/card";
import { useLocaleDictionary } from "@/client_zone/components/LocaleProvider";
import { formatCurrency } from "@/client_zone/lib/formatters";
import type { RoiProjectionCardProps } from "../types";

/**
 * WHY:   Client investors need a dedicated ROI block rather than burying return assumptions inside assistant prose.
 * WHAT:  Renders the main return and appreciation assumptions for a surfaced investment option.
 * HOW:   Focuses on the few figures that materially change a buying decision.
 */
export function RoiProjectionCard(props: RoiProjectionCardProps) {
  const { locale } = useLocaleDictionary();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{props.title}</CardTitle>
        <CardDescription>{props.summary}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs text-slate-500">{locale === "ar" ? "سعر الشراء" : "Purchase price"}</div>
          <div className="mt-2 text-base font-semibold text-slate-900">{formatCurrency(props.purchasePrice, locale)}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs text-slate-500">{locale === "ar" ? "الإيجار السنوي" : "Annual rent"}</div>
          <div className="mt-2 text-base font-semibold text-slate-900">{formatCurrency(props.annualRent, locale)}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs text-slate-500">{locale === "ar" ? "القيمة المتوقعة بعد 5 سنوات" : "Projected value in 5 years"}</div>
          <div className="mt-2 text-base font-semibold text-slate-900">{formatCurrency(props.projectedValue5Years, locale)}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs text-slate-500">{locale === "ar" ? "العائد" : "Yield"}</div>
          <div className="mt-2 text-base font-semibold text-slate-900">{props.yieldPercent}%</div>
        </div>
      </CardContent>
    </Card>
  );
}
