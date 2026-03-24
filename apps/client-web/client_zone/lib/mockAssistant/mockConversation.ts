import type {
  AssistantMessage,
  ClientProperty,
  Locale,
  MockConversationThread,
} from "../types";
import { buildClientUiTurn } from "./adapters";
import { MOCK_PROPERTIES as PROPERTIES } from "./mockCatalog";

function userMessage(id: string, text: string): AssistantMessage {
  return { id, role: "user", text };
}

function assistantMessage(
  id: string,
  text: string,
  options?: {
    properties?: ClientProperty[];
    cards?: AssistantMessage["cards"];
  },
): AssistantMessage {
  return {
    id,
    role: "assistant",
    text,
    properties: options?.properties,
    cards: options?.cards,
    uiTurn: buildClientUiTurn({
      assistantText: text,
      properties: options?.properties,
      cards: options?.cards,
    }),
  };
}

function buildApartmentSearchThread(locale: Locale): MockConversationThread {
  const isArabic = locale === "ar";

  return {
    id: "demo-apartment-search",
    title: isArabic ? "تجريبي: بحث شقة + تمويل" : "Demo: Apartment Search + Financing",
    createdAt: Date.now() - 1000 * 60 * 50,
    locale,
    messages: [
      assistantMessage(
        "demo-a-1",
        isArabic
          ? `# بداية البحث\n\nفهمت أنك تريد تجربة قريبة من رحلة عميل حقيقية، لذلك سأتعامل مع هذه المحادثة كأننا نبني shortlist فعلي قبل التمويل.\n\n## ما سأفعله الآن\n- أحدد أفضل 3 خيارات مناسبة\n- أوضح الفروق بسرعة\n- أضيف فحص تمويل أولي\n- أجهز الخطوة التالية إذا رغبت في مستشار`
          : `# Starting the search\n\nI am treating this like a real buyer workflow, not a toy chat. I will build a shortlist, explain the tradeoffs, add a starter financing check, and prepare the next step if you want advisor handoff.`,
        {
          properties: PROPERTIES.slice(0, 3),
        },
      ),
      userMessage(
        "demo-a-2",
        isArabic ? "أبحث عن شقة في الرياض لأسرة صغيرة وبميزانية قريبة من 1.2 مليون." : "I need an apartment in Riyadh for a small family around SAR 1.2M.",
      ),
      assistantMessage(
        "demo-a-3",
        isArabic
          ? `## Shortlist أولي\n\nراجعت السعر، المساحة، وملاءمة الاستخدام اليومي. الخياران الأول والثاني مناسبين أكثر للسكن العائلي، بينما الثالث أقرب لاستثمار مرن.\n\n### توصية سريعة\n1. Olive Residence إذا كانت الأولوية توازن السعر والمساحة.\n2. Courtyard Family إذا كانت الأولوية جودة التشطيب والنمو المستقبلي.\n3. Investor Duplex إذا كنت تريد نقطة دخول أقل.`
          : `## Initial shortlist\n\nI checked price, layout, and practical family use. The first two options are stronger for end use, while the third works better as a lower-entry investment play.\n\n### Quick recommendation\n1. Olive Residence for price-to-space balance.\n2. Courtyard Family for finish quality and long-term upside.\n3. Investor Duplex for a lighter entry point.`,
        {
          properties: PROPERTIES.slice(0, 3),
          cards: [
            {
              type: "accent_note",
              title: isArabic ? "ملخص سريع" : "Quick note",
              tone: "info",
              summary: isArabic ? "هذه shortlist افتتاحية لبدء القرار، وليست الترشيح النهائي بعد التمويل." : "This is an opening shortlist to start the decision, not the final recommendation after financing review.",
            },
            {
              type: "comparison_table",
              title: isArabic ? "مقارنة سريعة" : "Quick comparison",
              columns: isArabic ? ["البند", "Olive", "Courtyard", "Duplex"] : ["Metric", "Olive", "Courtyard", "Duplex"],
              rows: [
                [isArabic ? "السعر" : "Price", "1.18M", "1.32M", "960K"],
                [isArabic ? "المساحة" : "Area", "1780", "1910", "1490"],
                [isArabic ? "الهدف" : "Best fit", isArabic ? "سكن" : "Living", isArabic ? "سكن راقٍ" : "Premium living", isArabic ? "استثمار" : "Investment"],
              ],
              summary: isArabic ? "الجدول يوضح أفضل توازن بين السكن والسعر." : "This table shows the best balance between end use and entry price.",
            },
          ],
        },
      ),
      userMessage(
        "demo-a-4",
        isArabic ? "ممتاز. أريد أن أعرف وضعي مع التمويل إذا كان راتبي 15 ألف." : "Great. Check financing if my salary is SAR 15,000.",
      ),
      assistantMessage(
        "demo-a-5",
        isArabic
          ? `## فحص تمويل مبدئي\n\nبناءً على راتب 15,000 ريال، أنت داخل نطاق يسمح بمراجعة عملية لتمويل شقة في هذا المستوى السعري، لكن الخيار الأكثر راحة شهرياً يظل Olive Residence أو Investor Duplex.\n\n### ملاحظة\nهذه قراءة أولية للقرار، وليست موافقة بنكية نهائية.`
          : `## Starter financing review\n\nWith a SAR 15,000 salary, you are in a workable range for this ticket size, but the more comfortable monthly profile is still Olive Residence or the Investor Duplex.\n\n### Note\nThis is an early qualification read, not a final bank approval.`,
        {
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
              summary: isArabic ? "هذا العرض مناسب إذا كان هدفك خفض القسط من دون رفع الدفعة الأولى كثيراً." : "This offer works if you want to lower the monthly payment without pushing the down payment too high.",
            },
          ],
        },
      ),
      userMessage(
        "demo-a-6",
        isArabic ? "قارن لي Olive Residence مع Courtyard من ناحية السكن والعائد." : "Compare Olive Residence and Courtyard for both living quality and ROI.",
      ),
      assistantMessage(
        "demo-a-7",
        isArabic
          ? `## مقارنة قرار السكن مقابل العائد\n\nإذا كان القرار عائلياً بحتاً، فـ Courtyard يتقدم في التشطيب والانطباع العام. إذا كان القرار عقلانياً من زاوية الميزانية والعائد، فـ Olive Residence أكثر توازناً.\n\n### خلاصة القرار\n- اختر Courtyard إذا كنت ستحتفظ بالعقار لفترة أطول وتريد جودة أعلى.\n- اختر Olive إذا كنت تريد مرونة أفضل في التمويل والعائد.`
          : `## Living quality vs ROI\n\nIf this is a pure end-use decision, Courtyard wins on finish and overall feel. If the decision is more budget- and return-driven, Olive Residence is the more balanced asset.\n\n### Decision summary\n- Pick Courtyard for a longer hold and better finish quality.\n- Pick Olive for stronger financing flexibility and cleaner return math.`,
        {
          cards: [
            {
              type: "roi_projection",
              title: isArabic ? "تقدير العائد" : "ROI projection",
              purchasePrice: 1180000,
              annualRent: 92000,
              projectedValue5Years: 1360000,
              yieldPercent: 7.8,
              summary: isArabic ? "العائد المبدئي جيد بالنسبة لوحدة متوازنة في هذه المنطقة." : "The starter yield is strong for a balanced family unit in this area.",
            },
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
              type: "developer_profile",
              title: isArabic ? "ملف المطور" : "Developer profile",
              developerName: "Roshn",
              establishedYear: 2020,
              completedProjects: 8,
              summary: isArabic ? "المطور يملك سجل تنفيذ واضح ومناسب للمشتري الباحث عن ثقة أعلى." : "The developer has a clear delivery track record for buyers who prioritize confidence.",
            },
            {
              type: "broker_profile",
              title: isArabic ? "ملف الوسيط" : "Broker profile",
              brokerName: "Ahmed Mansour",
              brokerAgency: isArabic ? "شبكة عنان" : "Anan Network",
              rating: 4.8,
              activeListings: 12,
              summary: isArabic ? "الوسيط متخصص في شمال الرياض ويمكنه تضييق shortlist خلال دقائق." : "This broker specializes in North Riyadh and can tighten the shortlist quickly.",
            },
            {
              type: "insight_brief",
              title: isArabic ? "قراءة القرار" : "Decision brief",
              body: isArabic
                ? "إذا كنت تشتري للسكن وفي الوقت نفسه تهتم بعدم تجميد ميزانية كبيرة داخل أصل واحد، فـ Olive Residence يظل الخط الأكثر توازناً. ما يميزه هنا ليس عامل واحد فقط، بل اجتماع مرونة التمويل، سيولة إعادة البيع، ووضوح الجمهور المستهدف إذا قررت لاحقاً تحويله إلى أصل استثماري."
                : "If you are buying for living but still care about not locking too much of your budget into one asset, Olive Residence remains the more balanced line. The strength here is not one factor alone, but the combination of financing flexibility, resale liquidity, and a clear target renter profile if you later reposition it as an investment asset.",
              summary: isArabic ? "ملخص أطول للقرار قبل الخطوة التالية." : "A longer decision summary before the next step.",
            },
          ],
        },
      ),
      userMessage(
        "demo-a-8",
        isArabic ? "إذا أعجبني Olive Residence، ما الخطوة التالية؟" : "If I choose Olive Residence, what is the next step?",
      ),
      assistantMessage(
        "demo-a-9",
        isArabic
          ? `## الخطوة التالية\n\nأقترح أن نتحرك في مسارين معاً:\n- تثبيت الوحدة الأنسب داخل shortlist\n- إرسال طلب تحويل موجز إلى المستشار مع ملخص تفضيلاتك وتمويلك\n\nبهذا لا تبدأ من الصفر مع فريق المبيعات، بل ينتقل لهم ملف مرتب وواضح.`
          : `## Next step\n\nI would move in two tracks:\n- lock the strongest unit in your shortlist\n- prepare a compact advisor handoff with your preferences and financing profile\n\nThat way the sales conversation starts from a structured brief instead of a blank slate.`,
        {
          cards: [
            {
              type: "permit_status",
              title: isArabic ? "حالة الرخصة" : "Permit status",
              permitStatus: "verified",
              summary: isArabic ? "الوحدة تمر عبر مسار نشر موثق ويمكن الانتقال معها إلى الخطوة التالية." : "The listing passed the published verification flow and is ready for the next step.",
            },
            {
              type: "broker_handoff",
              title: isArabic ? "تحويل إلى مستشار" : "Advisor handoff",
              handoffStatus: "qualified",
              summary: isArabic ? "كل المعلومات الأساسية جاهزة لبدء التواصل مع مستشار مناسب." : "The essential information is ready for advisor handoff.",
            },
            {
              type: "accent_note",
              title: isArabic ? "جاهزية الملف" : "File readiness",
              tone: "success",
              summary: isArabic ? "يمكن نقل هذه المحادثة مباشرة إلى المستشار مع ملخص واضح للميزانية والتمويل والتفضيلات." : "This conversation can now be handed to an advisor with a clear summary of budget, financing, and preferences.",
            },
          ],
        },
      ),
    ],
  };
}

function buildInvestmentComparisonThread(locale: Locale): MockConversationThread {
  const isArabic = locale === "ar";
  return {
    id: "demo-investment-comparison",
    title: isArabic ? "تجريبي: مقارنة استثمارية" : "Demo: Investment Comparison",
    createdAt: Date.now() - 1000 * 60 * 110,
    locale,
    messages: [
      assistantMessage(
        "demo-b-1",
        isArabic
          ? `# مقارنة استثمارية سريعة\n\nسأفترض أنك تبحث عن صفقة يمكن شرحها بسرعة: سعر دخول واضح، عائد متوقع، ومخاطر تنفيذ منخفضة نسبياً.`
          : `# Quick investment comparison\n\nI am assuming you want a deal you can explain quickly: clear entry price, credible return potential, and manageable execution risk.`,
        {
          properties: [PROPERTIES[2], PROPERTIES[0]],
          cards: [
            {
              type: "accent_note",
              title: isArabic ? "زاوية التحليل" : "Analysis frame",
              tone: "info",
              summary: isArabic ? "المقارنة هنا تركز على جودة الصفقة للمستثمر المتحفظ، لا على أعلى عائد نظري فقط." : "This comparison focuses on quality of deal for a conservative investor, not just the highest theoretical yield.",
            },
            {
              type: "comparison_table",
              title: isArabic ? "الخيارات الأقرب للاستثمار" : "Closest investment options",
              columns: isArabic ? ["البند", "Duplex", "Olive"] : ["Metric", "Duplex", "Olive"],
              rows: [
                [isArabic ? "سعر الدخول" : "Entry price", "960K", "1.18M"],
                [isArabic ? "العائد المتوقع" : "Expected yield", "8.1%", "7.8%"],
                [isArabic ? "مخاطر التنفيذ" : "Execution risk", isArabic ? "أقل" : "Lower", isArabic ? "متوسطة" : "Moderate"],
              ],
              summary: isArabic ? "الخيار الأول أقوى عائداً، والثاني أكثر استقراراً للمشتري المتحفظ." : "The first option is stronger on raw yield, while the second is steadier for a conservative buyer.",
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
              type: "bank_offer",
              title: isArabic ? "سيناريو تمويل استثماري" : "Investment financing scenario",
              bankName: isArabic ? "مصرف الراجحي" : "Al Rajhi Bank",
              rateLabel: "4.65% variable",
              downPaymentPercent: 15,
              monthlyEstimate: 5320,
              summary: isArabic ? "تمويل مناسب إذا كانت الأولوية المحافظة على سيولة إضافية بعد الشراء." : "Useful if preserving extra post-purchase liquidity is the priority.",
            },
          ],
        },
      ),
      userMessage("demo-b-2", isArabic ? "أريد الخيار الأكثر أماناً على المدى المتوسط." : "I want the safer medium-term option."),
      assistantMessage(
        "demo-b-3",
        isArabic
          ? `## الترشيح النهائي\n\nالخيار الأكثر أماناً على المدى المتوسط هو Olive Residence، ليس لأنه الأعلى عائداً، بل لأنه يوازن بين السيولة، نوع المستأجر المتوقع، وقابلية إعادة البيع.`
          : `## Final recommendation\n\nThe safer medium-term option is Olive Residence, not because it has the highest yield, but because it balances liquidity, tenant quality, and resale potential.`,
        {
          cards: [
            {
              type: "developer_profile",
              title: isArabic ? "موثوقية المطور" : "Developer credibility",
              developerName: "Roshn",
              establishedYear: 2020,
              completedProjects: 8,
              summary: isArabic ? "وجود مطور واضح يعزز الثقة في الاحتفاظ بالعقار وإعادة بيعه." : "A clearer developer profile supports confidence for both hold and resale.",
            },
            {
              type: "insight_brief",
              title: isArabic ? "لماذا هذا الخيار أكثر أماناً؟" : "Why is this safer?",
              body: isArabic
                ? "عندما ننظر إلى الأمان الاستثماري على المدى المتوسط، فإننا لا نبحث فقط عن أعلى عائد لحظي. الأهم هو مدى استقرار الطلب، احتمالية الخروج من الأصل لاحقاً، ومستوى التذبذب المتوقع في السعر. لذلك يتقدم Olive Residence لأنه يحقق توازناً أفضل بين هذه العناصر."
                : "When we talk about medium-term investment safety, we are not only chasing the highest immediate yield. What matters more is demand stability, the likelihood of exiting the asset later, and the expected volatility in pricing. Olive Residence comes out ahead because it balances those factors more cleanly.",
              summary: isArabic ? "شرح أطول للمنطق الاستثماري." : "A longer explanation of the investment logic.",
            },
          ],
        },
      ),
    ],
  };
}

function buildAdvisorHandoffThread(locale: Locale): MockConversationThread {
  const isArabic = locale === "ar";
  return {
    id: "demo-advisor-handoff",
    title: isArabic ? "تجريبي: تحويل إلى مستشار" : "Demo: Advisor Handoff",
    createdAt: Date.now() - 1000 * 60 * 180,
    locale,
    messages: [
      assistantMessage(
        "demo-c-1",
        isArabic
          ? `# تجهيز التحويل\n\nعندما أرى أن متطلباتك الأساسية واضحة، أرتب التحويل إلى مستشار بشكل مختصر ومهني حتى لا تبدأ المحادثة التالية من الصفر.`
          : `# Preparing the handoff\n\nOnce your core requirements are clear, I package the next step for an advisor so the follow-up does not start from zero.`,
        {
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
        },
      ),
    ],
  };
}

/**
 * WHY:   The new client assistant needs believable seeded conversations for design review before richer live orchestration lands.
 * WHAT:  Returns the localized list of demo conversation threads used by the welcome state and history drawer.
 * HOW:   Builds deterministic multi-turn threads with article-style assistant text and AG UI cards.
 */
export function getMockConversationThreads(locale: Locale): MockConversationThread[] {
  return [
    buildApartmentSearchThread(locale),
    buildInvestmentComparisonThread(locale),
    buildAdvisorHandoffThread(locale),
  ];
}
