import type {
  MobileAssistantCard,
  MobilePropertyFeedItem,
  WhatsAppOutboundMessage,
} from "./contracts";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(value);
}

function buildPropertyMetaLine(property: MobilePropertyFeedItem) {
  const location = property.area ?? property.location ?? property.address;
  return `${location} • ${property.beds} غرف • ${property.baths} حمام`;
}

/**
 * WHY:   WhatsApp needs a short property snapshot before deeper follow-up actions.
 * WHAT:  Builds a compact Arabic property summary from the buyer-facing property DTO.
 * HOW:   Reuses the compact mobile DTO rather than reaching back into raw property documents.
 */
export function buildPropertySummary(property: MobilePropertyFeedItem) {
  const lines = [
    `*${property.title}*`,
    buildPropertyMetaLine(property),
    `السعر: ${formatCurrency(property.price)}`,
    `المالك: ${property.owner.name}${property.owner.isVerified ? " • موثق" : ""}`,
  ];
  if (property.aiSummary) {
    lines.push(property.aiSummary);
  }
  return lines.join("\n");
}

function renderComparisonCard(card: Extract<MobileAssistantCard, { type: "comparison_table" }>) {
  const rows = card.rows.map((row) => `- ${row[0]}: ${row[1]}`);
  return [card.title, ...rows, card.summary].join("\n");
}

/**
 * WHY:   Mobile-style result cards still need a readable transcript on WhatsApp.
 * WHAT:  Renders deterministic buyer cards into one WhatsApp-safe text block.
 * HOW:   Maps each card variant to a compact Arabic summary so transport remains text-first.
 */
export function renderCardsAsText(cards: MobileAssistantCard[]) {
  return cards
    .map((card) => {
      switch (card.type) {
        case "roi_summary":
          return [
            `*${card.title}*`,
            `سعر الشراء: ${formatCurrency(card.purchasePrice)}`,
            `الإيجار السنوي التقديري: ${formatCurrency(card.estimatedAnnualRent)}`,
            `العائد الإجمالي: ${card.grossYieldPercent}%`,
            card.summary,
          ].join("\n");
        case "payment_plan":
          return [
            `*${card.title}*`,
            `الدفعة الأولى: ${formatCurrency(card.downPayment)}`,
            `القسط الشهري: ${formatCurrency(card.monthlyInstallment)}`,
            `المدة: ${card.durationMonths} شهر`,
            card.summary,
          ].join("\n");
        case "mortgage_check":
          return [
            `*${card.title}*`,
            `الحالة: ${card.estimatedEligibility}`,
            card.recommendedBudget !== undefined
              ? `الميزانية المقترحة: ${formatCurrency(card.recommendedBudget)}`
              : undefined,
            card.monthlyInstallmentEstimate !== undefined
              ? `قسط تقريبي: ${formatCurrency(card.monthlyInstallmentEstimate)}`
              : undefined,
            card.summary,
          ]
            .filter(Boolean)
            .join("\n");
        case "permit_status":
          return [
            `*${card.title}*`,
            `الحالة: ${card.permitStatus}`,
            card.summary,
          ].join("\n");
        case "comparison_table":
          return renderComparisonCard(card);
        case "broker_handoff":
          return [
            `*${card.title}*`,
            `الحالة: ${card.handoffStatus}`,
            card.summary,
          ].join("\n");
        default:
          return "";
      }
    })
    .filter(Boolean)
    .join("\n\n");
}

/**
 * WHY:   Assistant messages are still stored in the shared transcript tables for audit and review.
 * WHAT:  Converts outbound WhatsApp messages into one plain-text assistant transcript string.
 * HOW:   Flattens list rows and button labels into readable text while preserving the main reply order.
 */
export function buildAssistantTranscript(
  outboundMessages: WhatsAppOutboundMessage[],
  fallbackMessage: string,
) {
  const segments = outboundMessages.map((message) => {
    if (message.type === "text") return message.text;
    if (message.type === "reply_buttons") {
      return [message.body, `الأزرار: ${message.buttons.map((button) => button.title).join(" | ")}`]
        .filter(Boolean)
        .join("\n");
    }
    return [
      message.header,
      message.body,
      `القائمة: ${message.rows.map((row) => row.title).join(" | ")}`,
    ]
      .filter(Boolean)
      .join("\n");
  });

  const transcript = segments.filter(Boolean).join("\n\n");
  return transcript || fallbackMessage;
}
