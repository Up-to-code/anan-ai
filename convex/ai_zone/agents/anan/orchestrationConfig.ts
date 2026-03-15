import { SHARED_PROMPT_BLOCKS } from "../core";
import {
  buildAgentRegistry,
  buildTeamRegistry,
  defineAgentConfig,
  defineModels,
  defineTeamConfig,
  defineTools,
} from "../core/registry";

import { smartPropertySearch } from "../team_search/anan_search/tools/smartPropertySearch";
import { getLastSearchContext as getSearchLastContext } from "../team_search/anan_search/tools/getLastSearchContext";
import { getLastSearchFindings as getSearchLastFindings } from "../team_search/anan_search/tools/getLastSearchFindings";
import { browseAndExtract } from "../team_search/anan_web/tools/browseAndExtract";

import { getLastSearchContext as getPropertyLastContext } from "../team_property/tools/getLastSearchContext";
import { getLastSearchFindings as getPropertyLastFindings } from "../team_property/tools/getLastSearchFindings";
import { getMemoryContext as getPropertyMemoryContext } from "../team_property/tools/getMemoryContext";

import { getBankBundles } from "../team_finance/tools/getBankBundles";
import { estimateMortgage } from "../team_finance/tools/estimateMortgage";

import { getKnowledgePage } from "../team_knowledge/tools/getKnowledgePage";
import { getMemoryContext as getKnowledgeMemoryContext } from "../team_knowledge/tools/getMemoryContext";
import { storeUserPreference } from "../team_knowledge/tools/storeUserPreference";
import { storeInteraction } from "../team_knowledge/tools/storeInteraction";

import { getDeveloperHandbookSnippets } from "../team_platform/tools/getDeveloperHandbookSnippets";
import { suggestTrainingEntry } from "../team_trainer/tools/suggestTrainingEntry";

export const MODEL_CATALOG = defineModels({
  defaultModel: "google/gemini-2.5-flash",
  models: {
    "google/gemini-2.5-flash": {
      id: "google/gemini-2.5-flash",
      description: "Primary default model for user orchestration.",
    },
    "google/gemini-2.0-flash": {
      id: "google/gemini-2.0-flash",
      description: "Fallback model for user orchestration.",
    },
  },
});

export const TOOL_CATALOG = defineTools({
  search_smart_property: {
    key: "search_smart_property",
    description: "Search properties across internal data and portals.",
    factory: smartPropertySearch,
  },
  search_last_context: {
    key: "search_last_context",
    description: "Fetch the latest search context for the user.",
    factory: getSearchLastContext,
  },
  search_last_findings: {
    key: "search_last_findings",
    description: "Fetch the latest search findings for the user.",
    factory: getSearchLastFindings,
  },
  web_browse_extract: {
    key: "web_browse_extract",
    description: "Browse external sources and extract structured content.",
    factory: browseAndExtract,
  },
  property_last_context: {
    key: "property_last_context",
    description: "Reuse the last property search context for analysis.",
    factory: getPropertyLastContext,
  },
  property_last_findings: {
    key: "property_last_findings",
    description: "Reuse the last property search findings for comparison.",
    factory: getPropertyLastFindings,
  },
  property_memory_context: {
    key: "property_memory_context",
    description: "Retrieve preference memory for personalized recommendations.",
    factory: getPropertyMemoryContext,
  },
  finance_bank_bundles: {
    key: "finance_bank_bundles",
    description: "Fetch bank product bundles for financing analysis.",
    factory: getBankBundles,
  },
  finance_estimate_mortgage: {
    key: "finance_estimate_mortgage",
    description: "Estimate mortgage payments and affordability.",
    factory: estimateMortgage,
  },
  knowledge_get_page: {
    key: "knowledge_get_page",
    description: "Retrieve relevant knowledge base snippets (RAG).",
    factory: getKnowledgePage,
  },
  memory_get_context: {
    key: "memory_get_context",
    description: "Fetch per-user memory context.",
    factory: getKnowledgeMemoryContext,
  },
  memory_store_preference: {
    key: "memory_store_preference",
    description: "Store a user preference in memory.",
    factory: storeUserPreference,
  },
  memory_store_interaction: {
    key: "memory_store_interaction",
    description: "Store a user interaction summary in memory.",
    factory: storeInteraction,
  },
  platform_handbook_snippets: {
    key: "platform_handbook_snippets",
    description: "Fetch developer handbook snippets for platform guidance.",
    factory: getDeveloperHandbookSnippets,
  },
  trainer_suggest_entry: {
    key: "trainer_suggest_entry",
    description: "Suggest a training entry based on conversation data.",
    factory: suggestTrainingEntry,
  },
});

const defineAgent = (input: Parameters<typeof defineAgentConfig>[1]) =>
  defineAgentConfig({ modelCatalog: MODEL_CATALOG, toolCatalog: TOOL_CATALOG }, input);

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

export const ananKnowledgeDefinition = defineAgent({
  name: "anan_knowledge",
  description:
    "Retrieves relevant context from the platform's knowledge base (production RAG) " +
    "to enrich other agents' responses with trained data and company information.",
  team: "team_knowledge",
  allowedRoles: ["user", "broker", "RED", "admin"],
  prompt: {
    version: "v2",
    identity: "أنت anan_knowledge، وكيل المعرفة التشغيلية في منصة عنان.",
    scope: ["استرجاع المعرفة الداخلية ذات الصلة بالسؤال من RAG الإنتاجي."],
    toolUsage: ["رتّب النتائج حسب الصلة ولا تستدعِ المعرفة غير المؤكدة."],
    output: ["قدّم سياقاً مرجعياً موجزاً يساعد الوكلاء الآخرين أو المستخدم مباشرة."],
    safety: [
      SHARED_PROMPT_BLOCKS.arabicStandard,
      SHARED_PROMPT_BLOCKS.noFabrication,
      SHARED_PROMPT_BLOCKS.businessPolicy,
    ],
  },
  modelPolicy: { temperature: 0.2 },
  runtimePolicy: { maxSteps: 2, failureMode: "soft" },
  toolKeys: ["knowledge_get_page"],
  ragNamespace: "production",
});

export const ananMemoryDefinition = defineAgent({
  name: "anan_memory",
  description:
    "Manages per-user memory: stores preferences, retrieves past context, " +
    "and generates user summaries to personalize conversations.",
  team: "team_knowledge",
  allowedRoles: ["user", "broker", "RED", "admin"],
  prompt: {
    version: "v2",
    identity: "أنت anan_memory، وكيل الذاكرة الشخصية في منصة عنان.",
    scope: ["استرجاع تفضيلات المستخدم وسياقه السابق وتحديثها عند الحاجة."],
    toolUsage: ["لا تحفظ بيانات حساسة.", "حدّث المعلومة السابقة بدلاً من تكرارها عند الإمكان."],
    output: ["قدّم ملخصاً موجزاً ومفيداً عند الحاجة."],
    safety: [
      SHARED_PROMPT_BLOCKS.arabicStandard,
      SHARED_PROMPT_BLOCKS.noFabrication,
      "لا تحفظ بيانات شخصية حساسة أو أسراراً أو كلمات مرور.",
    ],
  },
  modelPolicy: { temperature: 0.3 },
  runtimePolicy: { maxSteps: 2, failureMode: "soft" },
  toolKeys: ["memory_get_context", "memory_store_preference", "memory_store_interaction"],
});

export const ananPlatformDocsDefinition = defineAgent({
  name: "anan_platform_docs",
  description:
    "Answers platform/backend architecture questions using the internal developer handbook (secret-free). " +
    "Focuses on Convex best practices, authorization rules, zone boundaries, and safe agent/tool patterns.",
  team: "team_platform",
  allowedRoles: ["broker", "RED", "admin"],
  prompt: {
    version: "v1",
    identity: "أنت anan_platform_docs، وكيل توثيق المنصة وقواعد الباكند في عنان.",
    scope: [
      "إعطاء إرشادات هندسية دقيقة مبنية على قواعد المنصة وConvex best practices.",
      "التركيز على الأخطاء المنطقية (صلاحيات/ملكية/حالة) وليس أخطاء TypeScript.",
    ],
    toolUsage: [
      "استدعِ أداة المعرفة للحصول على مقاطع مرتبطة بالسؤال.",
      "لا تخمّن. إذا لم تجد مقاطع كافية، اطلب توضيحاً أو أشر إلى ملفات القواعد.",
    ],
    output: [
      "أجب بإيجاز وبشكل قواعدي.",
      "اذكر مسارات الملفات/المستندات ذات الصلة داخل الريبو.",
      "قدّم checklist قصيرة قابلة للتنفيذ عند الحاجة.",
    ],
    safety: [
      SHARED_PROMPT_BLOCKS.arabicStandard,
      SHARED_PROMPT_BLOCKS.noFabrication,
      SHARED_PROMPT_BLOCKS.businessPolicy,
      "لا تكشف أسراراً أو مفاتيح أو معلومات حساسة. استخدم فقط المعرفة الآمنة المضمنة في دليل المطور.",
    ],
  },
  modelPolicy: { temperature: 0.2 },
  runtimePolicy: { maxSteps: 2, failureMode: "soft" },
  toolKeys: ["platform_handbook_snippets"],
});

export const ananTrainerDefinition = defineAgent({
  name: "anan_trainer",
  description:
    "Extracts learnable facts from conversations and pushes them to the " +
    "recommendation RAG for admin review. Manages the self-improvement loop.",
  team: "team_trainer",
  allowedRoles: ["admin"],
  prompt: {
    version: "v2",
    identity: "أنت anan_trainer، وكيل التحسين الذاتي في منصة عنان.",
    scope: ["استخراج الحقائق القابلة للتعلم من المحادثات المكتملة.", "إنشاء مدخلات تدريبية قابلة للمراجعة من الإدارة."],
    toolUsage: ["لا تحفظ بيانات شخصية في المعرفة العامة."],
    output: ["حوّل المعلومة إلى صيغة تدريبية واضحة ومنظمة."],
    safety: [
      SHARED_PROMPT_BLOCKS.noFabrication,
      "لا تحفظ بيانات شخصية أو حساسة في التدريب العام.",
    ],
  },
  modelPolicy: { temperature: 0.4 },
  runtimePolicy: { maxSteps: 3, failureMode: "soft", enableTokenTracking: true },
  toolKeys: ["trainer_suggest_entry"],
  ragNamespace: "recommendation",
});

export const AGENT_REGISTRY = buildAgentRegistry([
  ananSearchDefinition,
  ananWebDefinition,
  ananPropertyDefinition,
  ananRecommenderDefinition,
  ananFinanceDefinition,
  ananBanksDefinition,
  ananKnowledgeDefinition,
  ananMemoryDefinition,
  ananPlatformDocsDefinition,
  ananTrainerDefinition,
]);

export const TEAM_REGISTRY = buildTeamRegistry([
  defineTeamConfig({
    id: "team_search",
    allowedRoles: ["user", "broker", "admin"],
    failureMode: "soft",
    agents: [ananSearchDefinition, ananWebDefinition],
  }),
  defineTeamConfig({
    id: "team_property",
    allowedRoles: ["user", "broker", "RED", "admin"],
    failureMode: "soft",
    agents: [ananPropertyDefinition, ananRecommenderDefinition],
  }),
  defineTeamConfig({
    id: "team_finance",
    allowedRoles: ["user", "admin"],
    failureMode: "soft",
    agents: [ananFinanceDefinition, ananBanksDefinition],
  }),
  defineTeamConfig({
    id: "team_knowledge",
    allowedRoles: ["user", "broker", "RED", "admin"],
    failureMode: "soft",
    agents: [ananKnowledgeDefinition, ananMemoryDefinition],
  }),
  defineTeamConfig({
    id: "team_platform",
    allowedRoles: ["broker", "RED", "admin"],
    failureMode: "soft",
    agents: [ananPlatformDocsDefinition],
  }),
  defineTeamConfig({
    id: "team_trainer",
    allowedRoles: ["admin"],
    failureMode: "soft",
    agents: [ananTrainerDefinition],
  }),
]);
