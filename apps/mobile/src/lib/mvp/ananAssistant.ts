import { BUYER_CAPABILITIES, PROPERTY_CATALOG } from "@/lib/mvp/ananCatalog";
import { extractAmount, formatCurrency } from "@/lib/mvp/formatters";
import type {
  CapabilityResultCard,
  ChatCapabilityId,
  ConversationMessage,
  JourneyAction,
  PropertyPreview,
} from "@/types/chat";

export type AssistantReply = {
  text: string;
  properties?: PropertyPreview[];
  cards?: CapabilityResultCard[];
  actions?: JourneyAction[];
  contextPropertyId?: string;
};

export type AssistantRequest = {
  message: string;
  capability?: ChatCapabilityId;
  contextPropertyId?: string;
  surfacedPropertyIds?: string[];
};

const SEARCH_WORDS = ["ابحث", "أبحث", "شقة", "فيلا", "دوبلكس", "استوديو", "وحدة", "عقار", "منزل"];
const FINANCE_WORDS = ["تمويل", "بنك", "قرض", "راتب", "أهلية", "أقسط", "سداد"];
const ROI_WORDS = ["عائد", "استثمار", "roi", "yield"];
const COMPARE_WORDS = ["قارن", "مقارنة", "أفضل خيارين"];
const BOOKING_WORDS = ["احجز", "زيارة", "موعد", "مستشار", "تواصل", "حولني"];

/**
 * WHY:   The guest-mode mobile MVP still needs a believable assistant that matches Anan capabilities.
 * WHAT:  Converts a buyer prompt into deterministic text, property results, insight cards, and journey actions.
 * HOW:   Uses explicit keyword routing plus catalog heuristics so the UI can evolve before live AI wiring lands.
 */
export function buildAssistantReply(request: AssistantRequest): AssistantReply {
  const normalized = normalizePrompt(request.message);

  if (request.capability === "booking" || includesAny(normalized, BOOKING_WORDS)) {
    return buildBookingReply(request, normalized);
  }

  if (request.capability === "loans" || includesAny(normalized, FINANCE_WORDS)) {
    return buildFinanceReply(request, normalized);
  }

  if (request.capability === "roi" || includesAny(normalized, ROI_WORDS)) {
    return buildRoiReply(request, normalized);
  }

  if (request.capability === "compare" || includesAny(normalized, COMPARE_WORDS)) {
    return buildCompareReply(request, normalized);
  }

  if (
    request.capability === "search" ||
    request.capability === "properties" ||
    includesAny(normalized, SEARCH_WORDS)
  ) {
    return buildSearchReply(request, normalized);
  }

  return buildConciergeReply();
}

/**
 * WHY:   The chat home should open with a useful starting point instead of an empty timeline.
 * WHAT:  Returns the initial assistant message used by the buyer workspace.
 * HOW:   Starts with a simple concierge-style welcome and a small curated shortlist instead of UI testing payloads.
 */
export function buildWelcomeMessage(): ConversationMessage {
  const properties = getFeaturedProperties();

  return {
    id: "welcome-message",
    role: "assistant",
    text: "أهلاً بك في عنان. اكتب المدينة والميزانية ونوع العقار، وسأبدأ لك بأفضل الخيارات المناسبة مباشرة.",
    properties,
  };
}

/**
 * WHY:   Multiple screens need a consistent set of featured properties for empty and fallback states.
 * WHAT:  Returns the default property shortlist for the buyer MVP.
 * HOW:   Reuses the first few strongest catalog entries so the experience feels curated.
 */
export function getFeaturedProperties() {
  return PROPERTY_CATALOG.slice(0, 3);
}

/**
 * WHY:   The search screen and assistant engine share the same guest catalog.
 * WHAT:  Exposes the full deterministic property catalog.
 * HOW:   Returns the static catalog array used by the mobile MVP.
 */
export function listCatalogProperties() {
  return PROPERTY_CATALOG;
}

/**
 * WHY:   The property detail route needs direct access to a single catalog item.
 * WHAT:  Finds one property by its client-side id.
 * HOW:   Performs a simple in-memory lookup against the guest catalog.
 */
export function getPropertyById(propertyId?: string) {
  if (!propertyId) return undefined;
  return PROPERTY_CATALOG.find((property) => property.id === propertyId);
}

/**
 * WHY:   Search and comparison helpers need the same filtering behavior as the chat assistant.
 * WHAT:  Returns property matches for a free-form query.
 * HOW:   Applies city, area, type, and budget heuristics to the guest catalog.
 */
export function findProperties(query: string) {
  const normalized = normalizePrompt(query);
  const budget = extractAmount(normalized);
  const city = detectCity(normalized);
  const area = detectArea(normalized);
  const type = detectType(normalized);

  const matches = PROPERTY_CATALOG.filter((property) => {
    const matchesCity = city ? property.city.includes(city) : true;
    const matchesArea = area ? property.area.includes(area) : true;
    const matchesType = type ? property.propertyType === type : true;
    const matchesBudget = budget ? property.price <= budget * 1.08 : true;
    const matchesText =
      normalized.length === 0 ||
      property.title.includes(normalized) ||
      property.area.includes(normalized) ||
      property.city.includes(normalized);

    return matchesCity && matchesArea && matchesType && matchesBudget && matchesText;
  });

  if (matches.length > 0) return matches;

  return PROPERTY_CATALOG.filter((property) => {
    const matchesCity = city ? property.city.includes(city) : true;
    const matchesArea = area ? property.area.includes(area) : true;
    const matchesType = type ? property.propertyType === type : true;
    return matchesCity && matchesArea && matchesType;
  });
}

function buildConciergeReply(): AssistantReply {
  return {
    text: "يمكنني البدء من أي زاوية تريدها: ميزانية، مدينة، نوع الوحدة، التمويل، أو العائد الاستثماري. إذا رغبت، أجهز لك shortlist أولي الآن.",
    properties: getFeaturedProperties(),
  };
}

function buildSearchReply(request: AssistantRequest, normalized: string): AssistantReply {
  const matches = findProperties(normalized).slice(0, 4);
  const budget = extractAmount(normalized);
  const shortlist = matches.length > 0 ? matches : getFeaturedProperties();

  return {
    text: matches.length > 0
      ? `حضرت لك ${matches.length} خيارات مناسبة${budget ? ` ضمن حدود ${formatCurrency(budget)}` : ""}. اختر أي وحدة لنكمل التمويل أو الزيارة مباشرة.`
      : "لم أجد تطابقاً حرفياً، لذلك جهزت أقرب وحدات مناسبة لتبدأ منها.",
    properties: shortlist,
    actions: shortlist[0]
      ? [
          { type: "open_property", label: "فتح أول خيار", propertyId: shortlist[0].id },
          { type: "add_requirement", label: "إضافة متطلب بحث" },
          { type: "edit_preferences", label: "تعديل المنطقة" },
          { type: "advisor_handoff", label: "أحتاج ترشيحاً أدق", propertyId: shortlist[0].id },
        ]
      : undefined,
    contextPropertyId: shortlist[0]?.id,
  };
}

function buildFinanceReply(request: AssistantRequest, normalized: string): AssistantReply {
  const salary = extractAmount(normalized);
  const targetProperty = resolveTargetProperty(request, normalized);
  const recommendedBudget = salary ? salary * 55 : Math.round(targetProperty.price * 0.92);
  const downPayment = Math.round(targetProperty.price * targetProperty.downPaymentRate);
  const loanAmount = targetProperty.price - downPayment;
  const monthlyInstallment = Math.round(loanAmount / targetProperty.paymentMonths);
  const eligibility = salary === undefined ? "insufficient_data" : salary >= 14_000 ? "eligible" : salary >= 9_000 ? "review" : "insufficient_data";

  const cards: CapabilityResultCard[] = [
    {
      type: "mortgage_check",
      title: "فحص مبدئي لأهلية التمويل",
      estimatedEligibility: eligibility,
      recommendedBudget,
      monthlyInstallmentEstimate: monthlyInstallment,
      summary:
        eligibility === "eligible"
          ? "المؤشرات الأولية جيدة. الخطوة التالية هي تثبيت التزاماتك الحالية واختيار البنك الأنسب."
          : eligibility === "review"
            ? "الأهلية ممكنة، لكننا نحتاج صورة أدق للالتزامات والدفعة الأولى."
            : "أرسل الراتب أو الدفعة الأولى وسأعيد الحساب فوراً.",
    },
    {
      type: "loan_calculator",
      title: `حاسبة القرض لـ ${targetProperty.title}`,
      propertyPrice: targetProperty.price,
      downPayment,
      loanAmount,
      interestRate: 4.5,
      years: targetProperty.paymentMonths / 12,
      monthlyPayment: monthlyInstallment,
      summary: "عينة تفصيلية لتمويل العقار بافتراض مرابحة 4.5% سنوياً بناءً على سياسات البنوك المتعاونة.",
    },
  ];

  return {
    text: `اعتمدت ${targetProperty.title} كنقطة مرجعية للتمويل لتوضيح الحسبة بالتفصيل.`,
    cards,
    properties: [targetProperty],
    actions: [
      { type: "open_property", label: "عرض الوحدة المرجعية", propertyId: targetProperty.id },
      { type: "edit_preferences", label: "تعديل الميزانية والراتب" },
      { type: "advisor_handoff", label: "ترتيب مكالمة تمويل", propertyId: targetProperty.id },
    ],
    contextPropertyId: targetProperty.id,
  };
}

function buildRoiReply(request: AssistantRequest, normalized: string): AssistantReply {
  const targetProperty = resolveTargetProperty(request, normalized);
  const grossYieldPercent = Number(((targetProperty.annualRentEstimate / targetProperty.price) * 100).toFixed(1));
  const projectedValue5Years = Math.round(targetProperty.price * 1.15); // 15% 5y property value growth

  return {
    text: `هذه قراءة استثمارية لـ ${targetProperty.title}. قمت بعمل توقعات لخمس سنوات لتقدير النمو.`,
    properties: [targetProperty],
    cards: [
      {
        type: "roi_projection",
        title: "توقعات العائد ونمو القيمة",
        purchasePrice: targetProperty.price,
        annualRent: targetProperty.annualRentEstimate,
        projectedValue5Years,
        yieldPercent: grossYieldPercent,
        summary: `العائد الصافي المبدئي ${grossYieldPercent}% سنوياً مع نمو متوقع 15% لقيمة العقار خلال 5 سنوات في ${targetProperty.area}.`,
      },
    ],
    actions: [
      { type: "confirm_details", label: "تأكيد واستمرار لمعاينة مماثلة" },
      { type: "open_property", label: "فتح تفاصيل الوحدة", propertyId: targetProperty.id },
      { type: "advisor_handoff", label: "أريد تحليل أعمق", propertyId: targetProperty.id },
    ],
    contextPropertyId: targetProperty.id,
  };
}

function buildCompareReply(request: AssistantRequest, normalized: string): AssistantReply {
  const primary = resolveTargetProperty(request, normalized);
  const secondary = PROPERTY_CATALOG.find((property) => {
    if (property.id === primary.id) return false;
    return property.city === primary.city || property.propertyType === primary.propertyType;
  }) ?? PROPERTY_CATALOG[1];

  return {
    text: "قارنت لك خيارين قريبين من نفس السياق حتى يكون القرار أوضح من مجرد مواصفات منفصلة.",
    properties: [primary, secondary],
    cards: [
      {
        type: "comparison_table",
        title: "مقارنة سريعة",
        columns: ["البند", primary.title, secondary.title],
        rows: [
          ["السعر", formatCurrency(primary.price), formatCurrency(secondary.price)],
          ["المنطقة", primary.area, secondary.area],
          ["المساحة", `${primary.sqft} قدم`, `${secondary.sqft} قدم`],
          ["غرف النوم", String(primary.beds), String(secondary.beds)],
          ["العائد المبدئي", `${Math.round((primary.annualRentEstimate / primary.price) * 1000) / 10}%`, `${Math.round((secondary.annualRentEstimate / secondary.price) * 1000) / 10}%`],
        ],
        summary: "الفرق الأساسي هنا بين الكلفة، اتساع الوحدة، وسرعة العائد المتوقع.",
      },
    ],
    actions: [
      { type: "open_property", label: "فتح الخيار الأول", propertyId: primary.id },
      { type: "advisor_handoff", label: "ساعدني في الحسم", propertyId: primary.id },
    ],
    contextPropertyId: primary.id,
  };
}

function buildBookingReply(request: AssistantRequest, normalized: string): AssistantReply {
  const targetProperty = resolveTargetProperty(request, normalized);
  const cards: CapabilityResultCard[] = [
    {
      type: "broker_handoff",
      title: "جاهز للانتقال إلى الخطوة التالية",
      handoffStatus: "qualified",
      summary: `يمكنني تجهيز زيارة لـ ${targetProperty.title} أو ترتيب تواصل سريع مع ${targetProperty.ownerName}.`,
    },
    {
      type: "permit_status",
      title: "حالة التحقق",
      permitStatus: targetProperty.permitStatus,
      summary:
        targetProperty.permitStatus === "verified"
          ? "الجهة المالكة موثقة داخل عنان ويمكن متابعة الخطوات بثقة أعلى."
          : "يوجد عنصر يحتاج مراجعة إضافية قبل الإغلاق النهائي، وسيوضحه لك المستشار.",
    },
  ];

  return {
    text: "الخطوة العملية الآن هي تثبيت الوحدة المرجعية ثم اختيار ما إذا كنت تريد زيارة ميدانية أو مكالمة مع مستشار.",
    properties: [targetProperty],
    cards,
    actions: [
      { type: "book_viewing", label: "حجز زيارة", propertyId: targetProperty.id },
      { type: "advisor_handoff", label: "التحدث مع مستشار", propertyId: targetProperty.id },
      { type: "open_property", label: "مراجعة تفاصيل الوحدة", propertyId: targetProperty.id },
    ],
    contextPropertyId: targetProperty.id,
  };
}

function resolveTargetProperty(request: AssistantRequest, normalized: string): PropertyPreview {
  const byContext = getPropertyById(request.contextPropertyId);
  if (byContext) return byContext;

  const surfaced = (request.surfacedPropertyIds ?? [])
    .map((propertyId) => getPropertyById(propertyId))
    .filter((property): property is PropertyPreview => Boolean(property));
  if (surfaced && surfaced.length > 0) return surfaced[0];

  const matches = findProperties(normalized);
  if (matches.length > 0) return matches[0];

  const fallback = getFeaturedProperties()[0] ?? PROPERTY_CATALOG[0];
  if (!fallback) {
    throw new Error("PROPERTY_CATALOG must contain at least one property for the mobile MVP");
  }

  return fallback;
}

function includesAny(query: string, words: string[]) {
  return words.some((word) => query.includes(normalizePrompt(word)));
}

function normalizePrompt(value: string) {
  return value.trim().toLowerCase();
}

function detectCity(query: string) {
  return ["الرياض", "جدة", "الدمام"].find((city) => query.includes(city.toLowerCase()));
}

function detectArea(query: string) {
  return ["حطين", "الملقا", "الياسمين", "العقيق", "النرجس", "الروضة", "الفيصلية"].find((area) =>
    query.includes(area.toLowerCase()),
  );
}

function detectType(query: string): PropertyPreview["propertyType"] | undefined {
  if (query.includes("شقة")) return "apartment";
  if (query.includes("فيلا")) return "villa";
  if (query.includes("دوبلكس")) return "duplex";
  if (query.includes("تاون")) return "townhouse";
  if (query.includes("استوديو")) return "studio";
  return undefined;
}

export { BUYER_CAPABILITIES };
