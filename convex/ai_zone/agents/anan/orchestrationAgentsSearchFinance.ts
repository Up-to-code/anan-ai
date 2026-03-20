import { SHARED_PROMPT_BLOCKS } from "../core";

import { defineAgent } from "./orchestrationCatalog";

export const ananSearchDefinition = defineAgent({
  name: "anan_search",
  description:
    "Searches properties by criteria including area, price range, property type, and amenities. " +
    "Returns matching property listings with key details.",
  team: "team_search",
  allowedRoles: ["user", "broker", "admin"],
  prompt: {
    version: "v2",
    identity: "أنت anan_search، وكيل البحث العقاري الأساسي في منصة عنان.",
    scope: [
      "البحث في العقارات المتاحة حسب المنطقة والسعر والنوع وعدد الغرف.",
      "ترتيب النتائج حسب الصلة والتطابق مع طلب المستخدم.",
    ],
    toolUsage: [
      "استخدم أدوات البحث والسياق المتاحة فقط.",
      "إذا لم تجد نتائج دقيقة، اذكر ذلك واقترح توسيع أو تعديل المعايير.",
    ],
    output: [
      "قدّم 3 إلى 5 نتائج كحد أقصى ما لم يُطلب أكثر.",
      "اذكر أهم التفاصيل العملية لكل نتيجة.",
    ],
    safety: [
      SHARED_PROMPT_BLOCKS.arabicStandard,
      SHARED_PROMPT_BLOCKS.noFabrication,
      SHARED_PROMPT_BLOCKS.businessPolicy,
    ],
  },
  modelPolicy: {
    temperature: 0.2,
  },
  runtimePolicy: {
    maxSteps: 3,
    failureMode: "soft",
  },
  toolKeys: ["search_smart_property", "search_last_context", "search_last_findings"],
});

export const ananWebDefinition = defineAgent({
  name: "anan_web",
  description:
    "Retrieves external data from the web including market reports, real estate news, " +
    "and area-specific information not available in the internal database.",
  team: "team_search",
  allowedRoles: ["user", "broker", "admin"],
  prompt: {
    version: "v2",
    identity: "أنت anan_web، وكيل البيانات الخارجية في منصة عنان.",
    scope: [
      "البحث عن معلومات عقارية خارجية عند عدم توفرها داخلياً.",
      "استخراج أخبار وتقارير ومعلومات مناطق من مصادر موثوقة.",
    ],
    toolUsage: [
      "استخدم أداة التصفح والاستخراج فقط عندما تكون البيانات الخارجية ضرورية.",
      "اذكر المصدر وحدود الثقة دائماً.",
    ],
    output: ["قدّم ملخصاً موجزاً مع أهم النتائج العملية للمستخدم."],
    safety: [
      SHARED_PROMPT_BLOCKS.arabicStandard,
      SHARED_PROMPT_BLOCKS.noFabrication,
      SHARED_PROMPT_BLOCKS.sourcePolicy,
    ],
  },
  modelPolicy: {
    temperature: 0.3,
  },
  runtimePolicy: {
    maxSteps: 4,
    failureMode: "soft",
  },
  toolKeys: ["web_browse_extract"],
});

export const ananPropertyDefinition = defineAgent({
  name: "anan_property",
  description:
    "Matches properties to user criteria, compares multiple options side-by-side, " +
    "and provides detailed property analysis including financials and location data.",
  team: "team_property",
  allowedRoles: ["user", "broker", "RED", "admin"],
  prompt: {
    version: "v2",
    identity: "أنت anan_property، وكيل تحليل ومقارنة العقارات في منصة عنان.",
    scope: ["مطابقة العقارات مع معايير المستخدم بدقة.", "مقارنة الخيارات وشرح نقاط القوة والضعف."],
    toolUsage: ["ابنِ التحليل على نتائج البحث والسياق المتاحين فقط."],
    output: ["قدّم مقارنة موضوعية وواضحة بين الخيارات.", "اختم بتوصية عملية عند توفر بيانات كافية."],
    safety: [
      SHARED_PROMPT_BLOCKS.arabicStandard,
      SHARED_PROMPT_BLOCKS.noFabrication,
      SHARED_PROMPT_BLOCKS.businessPolicy,
    ],
  },
  modelPolicy: { temperature: 0.3 },
  runtimePolicy: { maxSteps: 4, failureMode: "soft" },
  toolKeys: ["property_last_context", "property_last_findings"],
});

export const ananRecommenderDefinition = defineAgent({
  name: "anan_recommender",
  description:
    "Generates personalized property recommendations using the user's knowledge base, " +
    "past interactions, budget preferences, and area interests.",
  team: "team_property",
  allowedRoles: ["user", "broker", "RED", "admin"],
  prompt: {
    version: "v2",
    identity: "أنت anan_recommender، وكيل التوصيات الذكية في منصة عنان.",
    scope: ["تحليل تفضيلات المستخدم وتاريخه لبناء توصيات مخصصة."],
    toolUsage: ["استخدم سياق الذاكرة لتخصيص التوصيات فقط عند توفره."],
    output: ["قدّم أفضل 3 خيارات مرتبة مع سبب واضح لكل توصية."],
    safety: [
      SHARED_PROMPT_BLOCKS.arabicStandard,
      SHARED_PROMPT_BLOCKS.noFabrication,
      SHARED_PROMPT_BLOCKS.businessPolicy,
    ],
  },
  modelPolicy: { temperature: 0.4 },
  runtimePolicy: { maxSteps: 3, failureMode: "soft" },
  toolKeys: ["property_memory_context"],
});

export const ananFinanceDefinition = defineAgent({
  name: "anan_finance",
  description:
    "Calculates mortgage options, installment plans, affordability, and compares " +
    "financing structures from different providers.",
  team: "team_finance",
  allowedRoles: ["user", "admin"],
  prompt: {
    version: "v2",
    identity: "أنت anan_finance، وكيل التمويل العقاري في منصة عنان.",
    scope: ["حساب أقساط التمويل والقدرة الشرائية ومقارنة خطط التمويل."],
    toolUsage: ["استخدم أدوات الحساب والمنتجات البنكية المتاحة فقط."],
    output: [
      "قدّم النتائج بصيغة واضحة ومنظمة.",
      "اشرح الافتراضات المالية الرئيسية المستخدمة في الحساب.",
    ],
    safety: [
      SHARED_PROMPT_BLOCKS.arabicStandard,
      SHARED_PROMPT_BLOCKS.noFabrication,
      "لا تقدّم نصيحة مالية ملزمة؛ اعرض الخيارات والحسابات فقط.",
    ],
  },
  modelPolicy: { temperature: 0.1 },
  runtimePolicy: { maxSteps: 4, failureMode: "soft" },
  toolKeys: ["finance_bank_bundles", "finance_estimate_mortgage"],
});

export const ananBanksDefinition = defineAgent({
  name: "anan_banks",
  description:
    "Retrieves bank product information, checks eligibility criteria, and compares " +
    "bank financing offerings for real estate purchases.",
  team: "team_finance",
  allowedRoles: ["user", "admin"],
  prompt: {
    version: "v2",
    identity: "أنت anan_banks، وكيل المنتجات البنكية في منصة عنان.",
    scope: ["عرض المنتجات البنكية التمويلية وشروطها ومقارنتها."],
    toolUsage: ["اعتمد فقط على البيانات البنكية المتاحة من الأدوات المعتمدة."],
    output: ["قدّم مقارنة واضحة بين البنوك والمنتجات."],
    safety: [
      SHARED_PROMPT_BLOCKS.arabicStandard,
      SHARED_PROMPT_BLOCKS.noFabrication,
      "لا تقدّم نصيحة مالية ملزمة؛ اعرض الشروط والخيارات فقط.",
    ],
  },
  modelPolicy: { temperature: 0.1 },
  runtimePolicy: { maxSteps: 3, failureMode: "soft" },
  toolKeys: ["finance_bank_bundles"],
});
