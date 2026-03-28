import type { AssistantCard, ClientAgUiCard, ClientAgUiTurn, ClientProperty } from "./types";

function toShortlistCard(properties: ClientProperty[]): ClientAgUiCard | null {
  if (properties.length === 0) return null;

  return {
    id: "property-shortlist",
    componentId: "property_shortlist",
    props: { properties },
  };
}

function mapCardToUiCard(card: AssistantCard, index: number): ClientAgUiCard | null {
  switch (card.type) {
    case "comparison_table":
      return {
        id: `comparison-table-${index}`,
        componentId: "comparison_table",
        props: card,
      };
    case "mortgage_check":
      return {
        id: `mortgage-check-${index}`,
        componentId: "mortgage_check",
        props: card,
      };
    case "payment_plan":
    case "loan_calculator":
      return {
        id: `loan-calculator-${index}`,
        componentId: "loan_calculator",
        props:
          card.type === "payment_plan"
            ? {
                title: card.title,
                propertyPrice: card.downPayment + card.monthlyInstallment * card.durationMonths,
                downPayment: card.downPayment,
                loanAmount: card.monthlyInstallment * card.durationMonths,
                interestRate: 4.5,
                years: Math.max(1, Math.round(card.durationMonths / 12)),
                monthlyPayment: card.monthlyInstallment,
                summary: card.summary,
              }
            : card,
      };
    case "roi_summary":
    case "roi_projection":
      return {
        id: `roi-projection-${index}`,
        componentId: "roi_projection",
        props:
          card.type === "roi_summary"
            ? {
                title: card.title,
                purchasePrice: card.purchasePrice,
                annualRent: card.estimatedAnnualRent,
                projectedValue5Years: Math.round(card.purchasePrice * 1.14),
                yieldPercent: card.grossYieldPercent,
                summary: card.summary,
              }
            : card,
      };
    case "bank_offer":
      return {
        id: `bank-offer-${index}`,
        componentId: "bank_offer",
        props: card,
      };
    case "insight_brief":
      return {
        id: `insight-brief-${index}`,
        componentId: "insight_brief",
        props: card,
      };
    case "accent_note":
      return {
        id: `accent-note-${index}`,
        componentId: "accent_note",
        props: card,
      };
    case "broker_profile":
      return {
        id: `broker-profile-${index}`,
        componentId: "broker_profile",
        props: card,
      };
    case "developer_profile":
      return {
        id: `developer-profile-${index}`,
        componentId: "developer_profile",
        props: card,
      };
    case "permit_status":
      return {
        id: `permit-status-${index}`,
        componentId: "permit_status",
        props: card,
      };
    case "broker_handoff":
      return {
        id: `followup-prompt-${index}`,
        componentId: "followup_prompt",
        props: {
          title: card.title,
          summary: card.summary,
          actionLabel: card.handoffStatus === "qualified" ? "Request advisor handoff" : "Continue qualification",
        },
      };
    case "market_analysis":
      return {
        id: `market-analysis-${index}`,
        componentId: "market_analysis",
        props: card,
      };
    default:
      return null;
  }
}

/**
 * WHY:   Live client assistant messages still arrive as property arrays plus domain cards.
 * WHAT:  Converts assistant payloads into the AG UI turn model rendered by the chat surface.
 * HOW:   Prepends a shortlist card when properties are present, then maps each domain card in order.
 */
export function buildClientUiTurn({
  assistantText,
  properties = [],
  cards = [],
}: {
  assistantText?: string;
  properties?: ClientProperty[];
  cards?: AssistantCard[];
}): ClientAgUiTurn | undefined {
  const uiCards: ClientAgUiCard[] = [];
  const shortlistCard = toShortlistCard(properties);

  if (shortlistCard) {
    uiCards.push(shortlistCard);
  }

  cards.forEach((card, index) => {
    const uiCard = mapCardToUiCard(card, index);
    if (uiCard) {
      uiCards.push(uiCard);
    }
  });

  if (uiCards.length === 0) {
    return undefined;
  }

  return {
    objective: "client_assistant",
    targetZone: "client_web",
    assistantText,
    cards: uiCards,
  };
}
