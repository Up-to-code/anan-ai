import type { AssistantCard } from "@/client_zone/lib/types";
import { formatCurrency } from "@/client_zone/lib/formatters";
import { useLocaleDictionary } from "@/client_zone/components/LocaleProvider";
import { Badge } from "@/client_zone/components/ui/badge";
import { AgUiCardHeading, AgUiCardShell, CardContent } from "./ag-ui/AgUiCardPrimitives";

function renderFinanceMeta(card: AssistantCard, locale: "ar" | "en") {
  if (card.type === "payment_plan") {
    return [
      formatCurrency(card.downPayment, locale),
      formatCurrency(card.monthlyInstallment, locale),
      `${card.durationMonths}`,
    ];
  }

  if (card.type === "mortgage_check") {
    return [
      card.estimatedEligibility,
      card.recommendedBudget ? formatCurrency(card.recommendedBudget, locale) : "—",
    ];
  }

  if (card.type === "roi_summary") {
    return [
      formatCurrency(card.purchasePrice, locale),
      `${card.grossYieldPercent}%`,
    ];
  }

  if (card.type === "comparison_table") {
    return card.rows.slice(0, 2).flat();
  }

  return [];
}

/**
 * WHY:   Financing and ROI outputs still need structure after the chat simplification.
 * WHAT:  Renders a compact in-thread finance/result card.
 * HOW:   Summarizes the first useful data points and preserves the assistant summary text below them.
 */
export function ChatFinanceCard({ card }: { card: AssistantCard }) {
  const { locale } = useLocaleDictionary();
  const meta = renderFinanceMeta(card, locale);

  return (
    <AgUiCardShell>
      <AgUiCardHeading title={card.title} summary={card.summary} />
      <CardContent className="pt-0">
        {meta.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {meta.map((item) => (
              <Badge key={`${card.title}-${item}`}>{item}</Badge>
            ))}
          </div>
        ) : null}
      </CardContent>
    </AgUiCardShell>
  );
}
