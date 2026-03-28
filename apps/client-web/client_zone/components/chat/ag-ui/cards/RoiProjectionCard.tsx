import { useLocaleDictionary } from "@/client_zone/components/LocaleProvider";
import { formatCurrency } from "@/client_zone/lib/formatters";
import {
  AgUiCardHeading,
  AgUiCardShell,
  AgUiMetricTile,
  CardContent,
} from "../AgUiCardPrimitives";
import type { RoiProjectionCardProps } from "../types";

/**
 * WHY:   Client investors need a dedicated ROI block rather than burying return assumptions inside assistant prose.
 * WHAT:  Renders the main return and appreciation assumptions for a surfaced investment option.
 * HOW:   Focuses on the few figures that materially change a buying decision.
 */
export function RoiProjectionCard(props: RoiProjectionCardProps) {
  const { locale } = useLocaleDictionary();

  return (
    <AgUiCardShell>
      <AgUiCardHeading title={props.title} summary={props.summary} />
      <CardContent className="grid gap-3 pt-0 sm:grid-cols-2 xl:grid-cols-4">
        <AgUiMetricTile label={locale === "ar" ? "سعر الشراء" : "Purchase price"} value={formatCurrency(props.purchasePrice, locale)} />
        <AgUiMetricTile label={locale === "ar" ? "الإيجار السنوي" : "Annual rent"} value={formatCurrency(props.annualRent, locale)} />
        <AgUiMetricTile label={locale === "ar" ? "القيمة المتوقعة بعد 5 سنوات" : "Projected value in 5 years"} value={formatCurrency(props.projectedValue5Years, locale)} />
        <AgUiMetricTile label={locale === "ar" ? "العائد" : "Yield"} value={`${props.yieldPercent}%`} />
      </CardContent>
    </AgUiCardShell>
  );
}
