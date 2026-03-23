import { buildClientUiTurn } from "./adapters";
import { MOCK_PROPERTIES } from "./mockCatalog";
import type { AssistantCard, AssistantMessage, ClientProperty, Locale } from "../types";

type MockReply = {
  text: string;
  properties?: ClientProperty[];
  cards?: AssistantCard[];
};

function hasAny(query: string, words: string[]) {
  return words.some((word) => query.includes(word));
}

function searchReply(locale: Locale): MockReply {
  const isArabic = locale === "ar";

  return {
    text: isArabic
      ? `# Shortlist أولي\n\nبناءً على الطلب الحالي، جهزت لك ثلاث وحدات أقرب لسيناريو شراء سكني عملي في الرياض.\n\n## لماذا هذه الخيارات؟\n- توازن جيد بين السعر والمساحة\n- مواقع مناسبة للاستخدام اليومي\n- فرق واضح بين خيار السكن وخيار الاستثمار\n\n### الملخص\nالخيار الأول والثاني أقوى للسكن، بينما الثالث يظل أفضل إذا كنت تريد نقطة دخول أخف.`
      : `# Initial shortlist\n\nBased on your prompt, I prepared three options that best fit a practical residential buying path in Riyadh.\n\n## Why these options?\n- balanced price-to-space ratio\n- practical daily-use locations\n- clear separation between living and investment profiles\n\n### Summary\nThe first two options are stronger for end use, while the third stays attractive if you want a lighter entry point.`,
    properties: MOCK_PROPERTIES,
    cards: [
      {
        type: "accent_note",
        title: isArabic ? "قراءة أولية" : "Initial read",
        tone: "info",
        summary: isArabic ? "هذه قراءة افتتاحية من mock data قابلة للتضييق أكثر حسب الحي أو طريقة السداد." : "This is an opening mock-data read that can be narrowed further by district or financing preference.",
      },
      {
        type: "comparison_table",
        title: isArabic ? "مقارنة أولية" : "Starter comparison",
        columns: isArabic ? ["البند", "Olive", "Courtyard", "Duplex"] : ["Metric", "Olive", "Courtyard", "Duplex"],
        rows: [
          [isArabic ? "السعر" : "Price", "1.18M", "1.32M", "960K"],
          [isArabic ? "الاستخدام" : "Use case", isArabic ? "سكن" : "Living", isArabic ? "سكن راقٍ" : "Premium living", isArabic ? "استثمار" : "Investment"],
          [isArabic ? "المساحة" : "Area", "1780", "1910", "1490"],
        ],
        summary: isArabic ? "هذا الجدول يوضح نقطة البداية قبل الانتقال للتمويل." : "This table shows the starting position before moving into financing.",
      },
    ],
  };
}

function financeReply(locale: Locale): MockReply {
  const isArabic = locale === "ar";
  return {
    text: isArabic
      ? `# فحص تمويل مبدئي\n\nتعاملت مع هذا الطلب كرحلة عميل حقيقية، لذلك أضفت قراءة تمويل أولية مع سيناريو قرض واضح وعرض بنكي افتراضي.\n\n## ما الذي يهم هنا؟\n- ميزانية الشراء المريحة\n- القسط الشهري المتوقع\n- البنك الأقرب لقرار متوازن\n\nهذه ليست موافقة بنكية نهائية، لكنها كافية لاتخاذ قرار أولي.`
      : `# Starter financing review\n\nI treated this as a real buyer flow, so I added an initial qualification read, a clear loan scenario, and one mock bank offer.\n\n## What matters here?\n- comfortable purchase range\n- expected monthly payment\n- the bank scenario closest to a balanced decision\n\nThis is not a final bank approval, but it is enough for an early decision.`,
    cards: [
      {
        type: "mortgage_check",
        title: isArabic ? "فحص الأهلية" : "Eligibility check",
        estimatedEligibility: "eligible",
        recommendedBudget: 1240000,
        monthlyInstallmentEstimate: 6900,
        summary: isArabic ? "الأهلية المبدئية جيدة مع هامش أمان متوسط." : "Starter eligibility looks good with a moderate comfort margin.",
      },
      {
        type: "loan_calculator",
        title: isArabic ? "صورة تمويل تقريبية" : "Starter loan outline",
        propertyPrice: 1180000,
        downPayment: 118000,
        loanAmount: 1062000,
        interestRate: 4.6,
        years: 20,
        monthlyPayment: 6760,
        summary: isArabic ? "هذا السيناريو مناسب إذا أردت توازن الدفعة الأولى والقسط." : "This scenario works if you want a balanced down payment and monthly payment.",
      },
      {
        type: "bank_offer",
        title: isArabic ? "عرض بنكي مقترح" : "Suggested bank offer",
        bankName: isArabic ? "بنك الأهلي" : "SNB",
        rateLabel: "4.39% fixed",
        downPaymentPercent: 10,
        monthlyEstimate: 6680,
        summary: isArabic ? "عرض مناسب إذا كان الهدف خفض القسط من دون رفع الدفعة الأولى كثيراً." : "A useful scenario if your goal is reducing the monthly payment without pushing the down payment too high.",
      },
    ],
  };
}

function investmentReply(locale: Locale): MockReply {
  const isArabic = locale === "ar";
  return {
    text: isArabic
      ? `# مقارنة استثمارية\n\nهنا أنا لا أبحث عن أعلى رقم فقط، بل عن صفقة يمكن الدفاع عنها من ناحية العائد، السيولة، ومخاطر التنفيذ.\n\n## القراءة الحالية\nالخيار الأرخص يمنح دخولاً أفضل، لكن الخيار المتوازن يظل أقوى للمستثمر الذي يريد خفض التقلب وتحسين قابلية الخروج لاحقاً.`
      : `# Investment comparison\n\nHere I am not only chasing the biggest number. I am looking for a deal that holds up on yield, liquidity, and execution risk.\n\n## Current read\nThe cheaper option gives a lighter entry point, but the more balanced option remains stronger for an investor who wants lower volatility and better exit quality later.`,
    properties: [MOCK_PROPERTIES[2], MOCK_PROPERTIES[0]],
    cards: [
      {
        type: "market_analysis",
        title: isArabic ? "قراءة السوق المحلي" : "Local market read",
        location: isArabic ? "شمال الرياض" : "North Riyadh",
        averagePrice: 1240000,
        priceTrend: "up",
        trendPercentage: 8.4,
        summary: isArabic ? "الحركة السعرية هنا مستقرة نسبياً مع طلب فعلي من المشترين النهائيين." : "Pricing here is relatively stable with genuine end-user demand.",
      },
      {
        type: "roi_projection",
        title: isArabic ? "إسقاط العائد لخمس سنوات" : "Five-year ROI projection",
        purchasePrice: 960000,
        annualRent: 78000,
        projectedValue5Years: 1100000,
        yieldPercent: 8.1,
        summary: isArabic ? "الفرصة مناسبة لمن يريد دخولاً أخف مع طلب إيجاري جيد." : "This suits a lighter entry point with healthy rental demand.",
      },
      {
        type: "insight_brief",
        title: isArabic ? "قراءة القرار" : "Decision brief",
        body: isArabic
          ? "عندما ننظر إلى الأمان الاستثماري على المدى المتوسط، فإننا لا نبحث فقط عن أعلى عائد لحظي. الأهم هو استقرار الطلب، احتمالية الخروج من الأصل لاحقاً، ومستوى التذبذب المتوقع في السعر."
          : "When we talk about medium-term investment safety, we are not only chasing the highest immediate yield. What matters more is demand stability, the likelihood of exiting the asset later, and the expected volatility in pricing.",
        summary: isArabic ? "هذا ملخص أطول لطريقة التفكير الاستثمارية." : "This is the longer summary of the investment logic.",
      },
    ],
  };
}

function handoffReply(locale: Locale): MockReply {
  const isArabic = locale === "ar";
  return {
    text: isArabic
      ? `# جاهزية التحويل\n\nالهدف هنا أن تنتقل هذه المحادثة إلى مستشار بشكل مرتب، لا أن تبدأ من جديد.\n\n## الموجود حالياً\n- فهم أولي للميزانية\n- اتجاه واضح بين السكن أو الاستثمار\n- صورة تمويل أولية\n- ملف جاهز للمتابعة`
      : `# Handoff readiness\n\nThe goal here is to move this conversation to an advisor in a structured way, not to restart from zero.\n\n## What is already clear\n- initial budget direction\n- a clearer living vs investment path\n- an early financing read\n- a file that is ready for follow-up`,
    cards: [
      {
        type: "broker_profile",
        title: isArabic ? "المستشار المقترح" : "Suggested advisor",
        brokerName: "Sara Alqahtani",
        brokerAgency: isArabic ? "شبكة عنان" : "Anan Network",
        rating: 4.9,
        activeListings: 9,
        summary: isArabic ? "مستشارة مناسبة لرحلات الشراء السكني التي تحتاج تنسيقاً سريعاً." : "A strong advisor for residential buying journeys that need quick coordination.",
      },
      {
        type: "broker_handoff",
        title: isArabic ? "جاهزية التحويل" : "Handoff readiness",
        handoffStatus: "qualified",
        summary: isArabic ? "الميزانية، المنطقة، ونمط التمويل أصبحت واضحة بما يكفي للمتابعة." : "Budget, location, and financing direction are clear enough for follow-up.",
      },
      {
        type: "accent_note",
        title: isArabic ? "تجهيز التسليم" : "Handoff prep",
        tone: "success",
        summary: isArabic ? "الملف الحالي منظم وقابل للمشاركة مع المستشار من دون إعادة شرح كل التفاصيل." : "The current file is organized and shareable with an advisor without re-explaining everything.",
      },
    ],
  };
}

/**
 * WHY:   The client assistant currently needs prompt-driven mock AG UI before the live client assistant grows into a richer structured response surface.
 * WHAT:  Builds a locale-aware mock assistant reply from the current prompt.
 * HOW:   Routes by simple intent keywords and returns article-style text plus AG UI cards.
 */
export function buildMockAssistantReply({
  locale,
  prompt,
}: {
  locale: Locale;
  prompt: string;
}): AssistantMessage {
  const normalized = prompt.toLowerCase();
  const financeWords = locale === "ar" ? ["تمويل", "راتب", "قرض", "أهلية", "سداد"] : ["finance", "salary", "loan", "mortgage", "eligibility"];
  const investmentWords = locale === "ar" ? ["استثمار", "عائد", "مقارنة"] : ["investment", "roi", "compare", "yield"];
  const handoffWords = locale === "ar" ? ["مستشار", "تحويل", "تواصل"] : ["advisor", "handoff", "contact"];

  let reply: MockReply;

  if (hasAny(normalized, handoffWords)) {
    reply = handoffReply(locale);
  } else if (hasAny(normalized, financeWords)) {
    reply = financeReply(locale);
  } else if (hasAny(normalized, investmentWords)) {
    reply = investmentReply(locale);
  } else {
    reply = searchReply(locale);
  }

  return {
    id: `assistant-mock-${Date.now()}`,
    role: "assistant",
    text: reply.text,
    properties: reply.properties,
    cards: reply.cards,
    uiTurn: buildClientUiTurn({
      assistantText: reply.text,
      properties: reply.properties,
      cards: reply.cards,
    }),
  };
}
