import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/client_zone/components/ui/card";
import { useLocaleDictionary } from "@/client_zone/components/LocaleProvider";
import { formatCurrency } from "@/client_zone/lib/formatters";
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
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{props.title}</CardTitle>
        <CardDescription>{props.summary}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs text-slate-500">{locale === "ar" ? "المنطقة" : "Location"}</div>
          <div className="mt-2 text-sm font-semibold text-slate-900">{props.location}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs text-slate-500">{locale === "ar" ? "متوسط السعر" : "Average price"}</div>
          <div className="mt-2 text-sm font-semibold text-slate-900">{formatCurrency(props.averagePrice, locale)}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs text-slate-500">{locale === "ar" ? "اتجاه السوق" : "Trend"}</div>
          <div className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
            <TrendIcon className="h-4 w-4" />
            {props.trendPercentage}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
