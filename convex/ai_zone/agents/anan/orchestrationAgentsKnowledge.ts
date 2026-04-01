import { SHARED_PROMPT_BLOCKS } from "../core";

import { defineAgent } from "./orchestrationCatalog";

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
