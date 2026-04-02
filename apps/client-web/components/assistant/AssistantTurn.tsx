"use client";

import { useLocale } from "@/app/_components/LocaleProvider";
import type { BuyerAssistantCard, BuyerAssistantMessage } from "@/client_zone/shared/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { formatLocaleNumber } from "@/lib/locale";
import { ComparisonTable } from "./cards/ComparisonTable";
import { PropertyShortlist } from "./cards/PropertyShortlist";

interface AssistantTurnProps {
  message: BuyerAssistantMessage;
}

/**
 * WHY:   Assistant turns can return text, property results, and structured advisory cards in one reply.
 * WHAT:  Renders one buyer assistant message from the `user_zone/web` contract.
 * HOW:   Displays markdown first, then property shortlist results, then specialized or generic card renderers keyed by card type.
 */
export function AssistantTurn({ message }: AssistantTurnProps) {
  const { locale } = useLocale();

  return (
    <div className="mb-6 flex flex-col gap-4 animate-zone-page-enter">
      {message.text ? (
        <div className="max-w-[90%] rounded-2xl rounded-tl-none bg-muted p-4 text-sm text-foreground">
          <MarkdownContent content={message.text} />
        </div>
      ) : null}

      {message.properties?.length ? <PropertyShortlist properties={message.properties} /> : null}

      {message.cards?.length ? (
        <div className="flex flex-col gap-3">
          {message.cards.map((card, index) => (
            <RenderedAssistantCard
              key={`${card.type}-${index}`}
              card={card}
              locale={locale}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function RenderedAssistantCard({
  card,
  locale,
}: {
  card: BuyerAssistantCard;
  locale: "ar" | "en" | "fr";
}) {
  if (card.type === "comparison_table") {
    return (
      <ComparisonTable
        title={card.title}
        columns={card.columns}
        rows={card.rows}
        summary={card.summary}
      />
    );
  }

  const metrics = buildCardMetrics(card, locale);

  return (
    <Card data-testid={`client-ag-ui-card-${card.type}`} className="overflow-hidden border-primary/10 shadow-sm">
      <CardHeader className="bg-muted/25 pb-4">
        <CardTitle className="text-sm font-black uppercase tracking-[0.18em] text-slate-900 dark:text-slate-50">
          {card.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        {metrics.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-[var(--workspace-border)] bg-background px-4 py-3 text-right"
              >
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--workspace-muted)]">
                  {metric.label}
                </p>
                <p className="mt-2 text-lg font-black text-slate-950 dark:text-slate-50">
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
        ) : null}
        <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{card.summary}</p>
      </CardContent>
    </Card>
  );
}

function buildCardMetrics(
  card: Exclude<BuyerAssistantCard, { type: "comparison_table" }>,
  locale: "ar" | "en" | "fr",
) {
  const currency = (value?: number) =>
    value === undefined
      ? "—"
      : formatLocaleNumber(locale, value, {
          style: "currency",
          currency: "SAR",
          maximumFractionDigits: 0,
        });

  switch (card.type) {
    case "roi_summary":
      return [
        { label: "Purchase price", value: currency(card.purchasePrice) },
        { label: "Annual rent", value: currency(card.estimatedAnnualRent) },
        { label: "Gross yield", value: `${card.grossYieldPercent}%` },
      ];
    case "payment_plan":
      return [
        { label: "Down payment", value: currency(card.downPayment) },
        { label: "Monthly installment", value: currency(card.monthlyInstallment) },
        { label: "Duration", value: `${card.durationMonths} months` },
      ];
    case "mortgage_check":
      return [
        { label: "Eligibility", value: card.estimatedEligibility },
        { label: "Budget", value: currency(card.recommendedBudget) },
        { label: "Installment", value: currency(card.monthlyInstallmentEstimate) },
      ];
    case "permit_status":
      return [{ label: "Status", value: card.permitStatus }];
    case "broker_handoff":
      return [{ label: "Status", value: card.handoffStatus }];
    case "broker_profile":
      return [
        { label: "Advisor", value: card.brokerName },
        { label: "Agency", value: card.brokerAgency },
        { label: "Rating", value: `${card.rating}` },
        { label: "Listings", value: `${card.activeListings}` },
      ];
    case "developer_profile":
      return [
        { label: "Developer", value: card.developerName },
        { label: "Established", value: `${card.establishedYear}` },
        { label: "Completed projects", value: `${card.completedProjects}` },
      ];
    case "loan_calculator":
      return [
        { label: "Property price", value: currency(card.propertyPrice) },
        { label: "Down payment", value: currency(card.downPayment) },
        { label: "Monthly payment", value: currency(card.monthlyPayment) },
        { label: "Term", value: `${card.years} years` },
      ];
    case "bank_offer":
      return [
        { label: "Bank", value: card.bankName },
        { label: "Rate", value: card.rateLabel },
        { label: "Down payment", value: `${card.downPaymentPercent}%` },
        { label: "Monthly estimate", value: currency(card.monthlyEstimate) },
      ];
  }
}
