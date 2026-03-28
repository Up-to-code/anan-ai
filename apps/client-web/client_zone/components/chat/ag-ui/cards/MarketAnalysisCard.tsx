import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { useLocaleDictionary } from "@/client_zone/components/LocaleProvider";
import { formatCurrency } from "@/client_zone/lib/formatters";
import {
  AgUiCardHeading,
  AgUiCardShell,
  AgUiMetricTile,
  CardContent,
} from "../AgUiCardPrimitives";
import type { MarketAnalysisCardProps } from "../types";

/**
 * WHY:   The mock assistant needs one market context block that feels like research, not generic filler.
 * WHAT:  Renders local market context with price trend and average pricing.
 * HOW:   Uses a compact split layout so it works in the article-style thread without turning into a dashboard.
 */
export function MarketAnalysisCard(props: MarketAnalysisCardProps) {
  const { locale } = useLocaleDictionary();
  const TrendIcon = props.priceTrend === "up" ? TrendingUp : props.priceTrend === "down" ? TrendingDown : Minus;

  return (
    <AgUiCardShell>
      <AgUiCardHeading title={props.title} summary={props.summary} />
      <CardContent className="grid gap-3 pt-0 sm:grid-cols-3">
        <AgUiMetricTile label={locale === "ar" ? "المنطقة" : "Location"} value={props.location} />
        <AgUiMetricTile label={locale === "ar" ? "متوسط السعر" : "Average price"} value={formatCurrency(props.averagePrice, locale)} />
        <AgUiMetricTile
          label={locale === "ar" ? "اتجاه السوق" : "Trend"}
          value={
            <span className="inline-flex items-center gap-2">
              <TrendIcon className="h-4 w-4" />
              {props.trendPercentage}%
            </span>
          }
        />
      </CardContent>
    </AgUiCardShell>
  );
}
