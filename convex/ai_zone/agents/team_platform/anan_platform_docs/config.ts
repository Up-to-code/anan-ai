/**
 * config.ts — anan_platform_docs Agent Configuration
 *
 * WHY:   Engineers need fast, rule-based answers about how to extend the backend safely without introducing authorization or performance regressions.
 * WHAT:  Retrieves curated developer handbook snippets and responds with actionable, file-path-oriented guidance.
 * HOW:   Uses the developer handbook retrieval tool and a low-temperature policy to produce short, non-fabricated guidance.
 */
import { agentFactory, SHARED_PROMPT_BLOCKS, type AgentDefinition } from "../../core";
import { getDeveloperHandbookSnippets } from "../tools/getDeveloperHandbookSnippets";

export const ananPlatformDocsDefinition: AgentDefinition = {
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
  tools: { getDeveloperHandbookSnippets },
};

export const ananPlatformDocs = agentFactory.create(ananPlatformDocsDefinition);

