import type { Id } from "../../_generated/dataModel";

type BuyerComparisonSelectionSource =
  | "ui_selected"
  | "history_resolved"
  | "text_resolved";

type SupportedLocale = "ar" | "en" | "fr";

type BuyerComparisonProperty = {
  id: Id<"properties">;
  title: string;
  address: string;
  location?: string;
  area?: string;
  price: number;
  beds: number;
  baths: number;
  sqft?: number;
  status?: string;
  owner: {
    name: string;
    type: "broker" | "RED";
    agencyLabel?: string;
  };
  aiSummary?: string;
  finance?: {
    bankOfferCount?: number;
  };
};

type BuyerComparisonSnapshot = {
  message: string;
  cards: Array<Record<string, unknown>>;
  properties: BuyerComparisonProperty[];
  activePropertyId?: Id<"properties">;
  suggestedPrompts: string[];
};

/**
 * WHY:   Comparison artifact storage should track whether the meaningful payload changed between refreshes.
 * WHAT:  Builds a small stable digest hash from the resolved property comparison snapshot.
 * HOW:   Hashes a normalized string payload with a cheap deterministic integer hash.
 */
export function buildBuyerComparisonDigestHash(snapshot: BuyerComparisonSnapshot) {
  const raw = JSON.stringify({
    message: snapshot.message,
    properties: snapshot.properties.map((property) => ({
      id: String(property.id),
      price: property.price,
      location: property.area ?? property.location ?? "",
      beds: property.beds,
      baths: property.baths,
      sqft: property.sqft ?? null,
      status: property.status ?? "",
    })),
    cards: snapshot.cards,
  });

  let hash = 0;
  for (let index = 0; index < raw.length; index += 1) {
    hash = (hash * 31 + raw.charCodeAt(index)) >>> 0;
  }
  return `cmp_${hash.toString(16)}`;
}

function formatCurrency(value: number, locale: SupportedLocale) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(value);
}

function buildComparisonPrompts(locale: SupportedLocale) {
  if (locale === "fr") {
    return [
      "Explique-moi la meilleure option",
      "Quelle option convient au financement ?",
      "Montre-moi plus de biens similaires",
      "Mets-moi en relation avec un conseiller",
    ];
  }
  if (locale === "en") {
    return [
      "Explain the best option",
      "Which one fits financing better?",
      "Show me more similar properties",
      "Connect me to an advisor",
    ];
  }
  return [
    "اشرح لي أفضل خيار",
    "أي خيار أنسب للتمويل؟",
    "اعرض لي عقارات مشابهة",
    "وصّلني بمستشار",
  ];
}

/**
 * WHY:   Buyers need a stable side-by-side comparison card generated from fresh property data.
 * WHAT:  Builds the buyer-facing comparison snapshot, digest title, and digest summary for one compare turn.
 * HOW:   Uses a consistent metric-first table so replay and refresh stay visually aligned.
 */
export function buildBuyerComparisonSnapshot(args: {
  locale: SupportedLocale;
  properties: BuyerComparisonProperty[];
  selectionSource: BuyerComparisonSelectionSource;
}): {
  snapshot: BuyerComparisonSnapshot;
  digestTitle: string;
  digestSummary: string;
  digestHash: string;
} {
  const columns = [
    args.locale === "fr" ? "Indicateur" : args.locale === "en" ? "Metric" : "البند",
    ...args.properties.map((property) => property.title),
  ];
  const rows = [
    [
      args.locale === "fr" ? "Prix" : args.locale === "en" ? "Price" : "السعر",
      ...args.properties.map((property) => formatCurrency(property.price, args.locale)),
    ],
    [
      args.locale === "fr" ? "Zone" : args.locale === "en" ? "Area" : "المنطقة",
      ...args.properties.map((property) => property.area ?? property.location ?? property.address),
    ],
    [
      args.locale === "fr" ? "Chambres" : args.locale === "en" ? "Bedrooms" : "غرف النوم",
      ...args.properties.map((property) => String(property.beds)),
    ],
    [
      args.locale === "fr" ? "Salles de bain" : args.locale === "en" ? "Bathrooms" : "الحمامات",
      ...args.properties.map((property) => String(property.baths)),
    ],
    [
      args.locale === "fr" ? "Surface" : args.locale === "en" ? "Area size" : "المساحة",
      ...args.properties.map((property) => property.sqft ? `${property.sqft}` : (args.locale === "fr" ? "Non précisée" : args.locale === "en" ? "Not specified" : "غير محدد")),
    ],
    [
      args.locale === "fr" ? "Statut" : args.locale === "en" ? "Status" : "الحالة",
      ...args.properties.map((property) => property.status ?? (args.locale === "fr" ? "Disponible" : args.locale === "en" ? "Available" : "متاح")),
    ],
    [
      args.locale === "fr" ? "Partenaire" : args.locale === "en" ? "Partner" : "الشريك",
      ...args.properties.map((property) => property.owner.agencyLabel ?? property.owner.name),
    ],
  ];

  const digestTitle =
    args.locale === "fr"
      ? "Comparaison de propriétés"
      : args.locale === "en"
        ? "Property comparison"
        : "مقارنة العقارات";
  const digestSummary =
    args.locale === "fr"
      ? `Comparaison ${args.selectionSource === "ui_selected" ? "pilotée par la sélection UI" : "résolue depuis l'historique"} entre ${args.properties.length} biens.`
      : args.locale === "en"
        ? `${args.selectionSource === "ui_selected" ? "UI-selected" : "History-resolved"} comparison across ${args.properties.length} properties.`
        : `مقارنة ${args.selectionSource === "ui_selected" ? "مبنية على اختيار الواجهة" : "مستخرجة من السياق"} بين ${args.properties.length} عقارات.`;

  const message =
    args.locale === "fr"
      ? `J'ai préparé une comparaison directe entre ${args.properties.map((property) => property.title).join("، ")} avec les points qui changent vraiment la décision.`
      : args.locale === "en"
        ? `I prepared a direct comparison between ${args.properties.map((property) => property.title).join(", ")} using the decision-making details that matter most.`
        : `جهزت لك مقارنة مباشرة بين ${args.properties.map((property) => property.title).join("، ")} مع أهم التفاصيل التي تغيّر القرار فعلاً.`;

  const snapshot: BuyerComparisonSnapshot = {
    message,
    cards: [
      {
        type: "comparison_table",
        title: digestTitle,
        columns,
        rows,
        summary: digestSummary,
      },
    ],
    properties: args.properties,
    activePropertyId: args.properties[0]?.id,
    suggestedPrompts: buildComparisonPrompts(args.locale),
  };

  return {
    snapshot,
    digestTitle,
    digestSummary,
    digestHash: buildBuyerComparisonDigestHash(snapshot),
  };
}
