import { SHARED_PROMPT_BLOCKS } from "../core";
import {
  buildAgentRegistry,
  buildTeamRegistry,
  defineAgentConfig,
  defineModels,
  defineTeamConfig,
  defineTools,
} from "../core/registry";

export const MODEL_CATALOG = defineModels({
  defaultModel: "google/gemini-2.5-flash",
  models: {
    "google/gemini-2.5-flash": {
      id: "google/gemini-2.5-flash",
      description: "Primary model for workspace orchestration.",
    },
    "google/gemini-2.0-flash": {
      id: "google/gemini-2.0-flash",
      description: "Fallback model for workspace orchestration.",
    },
  },
});

export const TOOL_CATALOG = defineTools({});

const defineAgent = (input: Parameters<typeof defineAgentConfig>[1]) =>
  defineAgentConfig({ modelCatalog: MODEL_CATALOG, toolCatalog: TOOL_CATALOG }, input);

export const ananWorkspaceProjectsDefinition = defineAgent({
  name: "anan_workspace_projects",
  description:
    "Manages partner projects: creation, updates, publishing status, and operational summaries.",
  team: "team_workspace_projects",
  allowedRoles: ["broker", "RED", "admin"],
  prompt: {
    version: "v1",
    identity: "أنت anan_workspace_projects، وكيل إدارة المشاريع للشركاء في منصة عنان.",
    scope: [
      "إدارة المشاريع (إنشاء، تحديث، إلغاء) حسب صلاحيات الدور.",
      "تلخيص حالة المشاريع وتحديد الخطوة التالية المطلوبة.",
    ],
    toolUsage: [
      "لا تنفّذ أي إجراء بدون أداة صريحة.",
      "اطلب تأكيداً واضحاً قبل تنفيذ التغييرات الحساسة.",
    ],
    output: [
      "قدّم خطة تنفيذ قصيرة أو أسئلة محددة لاستكمال البيانات.",
      "اختصر النتائج في نقاط تشغيلية قابلة للتنفيذ.",
    ],
    safety: [
      SHARED_PROMPT_BLOCKS.arabicStandard,
      SHARED_PROMPT_BLOCKS.noFabrication,
      SHARED_PROMPT_BLOCKS.businessPolicy,
    ],
  },
  modelPolicy: { temperature: 0.2 },
  runtimePolicy: { maxSteps: 4, failureMode: "soft" },
  toolKeys: [],
});

export const ananWorkspaceOffersDefinition = defineAgent({
  name: "anan_workspace_offers",
  description:
    "Operates offers and commissions for partners, including creation, updates, and approvals.",
  team: "team_workspace_offers",
  allowedRoles: ["broker", "RED", "admin"],
  prompt: {
    version: "v1",
    identity: "أنت anan_workspace_offers، وكيل إدارة العروض للشركاء في منصة عنان.",
    scope: [
      "إدارة العروض (إنشاء، تعديل، إيقاف) بما يتوافق مع الصلاحيات.",
      "تلخيص شروط العرض ومتطلبات الموافقة.",
    ],
    toolUsage: [
      "لا تقترح تنفيذ تغييرات بدون أدوات مسموحة.",
      "اطلب موافقة واضحة قبل نشر أو إلغاء عرض.",
    ],
    output: [
      "قدّم ملخصاً تشغيلياً مع الخطوات التالية المطلوبة.",
      "اذكر أي بيانات ناقصة لإكمال المهمة.",
    ],
    safety: [
      SHARED_PROMPT_BLOCKS.arabicStandard,
      SHARED_PROMPT_BLOCKS.noFabrication,
      SHARED_PROMPT_BLOCKS.businessPolicy,
    ],
  },
  modelPolicy: { temperature: 0.2 },
  runtimePolicy: { maxSteps: 4, failureMode: "soft" },
  toolKeys: [],
});

export const ananWorkspaceCrmDefinition = defineAgent({
  name: "anan_workspace_crm",
  description:
    "Coordinates CRM activities for partner workspaces: leads, stages, and next actions.",
  team: "team_workspace_crm",
  allowedRoles: ["broker", "RED", "admin"],
  prompt: {
    version: "v1",
    identity: "أنت anan_workspace_crm، وكيل إدارة CRM للشركاء في منصة عنان.",
    scope: [
      "تنظيم الفرص والمراحل وتحديث الحالة بناءً على صلاحيات الدور.",
      "تحديد الخطوات التالية وتلخيص المخاطر أو العوائق.",
    ],
    toolUsage: [
      "لا تغير حالات CRM دون أداة واضحة وموافقة.",
    ],
    output: [
      "قدّم تحديثاً مختصراً مع توصيات تشغيلية مباشرة.",
    ],
    safety: [
      SHARED_PROMPT_BLOCKS.arabicStandard,
      SHARED_PROMPT_BLOCKS.noFabrication,
      SHARED_PROMPT_BLOCKS.businessPolicy,
    ],
  },
  modelPolicy: { temperature: 0.2 },
  runtimePolicy: { maxSteps: 4, failureMode: "soft" },
  toolKeys: [],
});

export const ananWorkspaceOrgDefinition = defineAgent({
  name: "anan_workspace_org",
  description:
    "Handles organization-level partner operations such as team setup, access, and policies.",
  team: "team_workspace_org",
  allowedRoles: ["broker", "RED", "admin"],
  prompt: {
    version: "v1",
    identity: "أنت anan_workspace_org، وكيل إدارة المنظمات للشركاء في منصة عنان.",
    scope: [
      "إدارة الهيكل التنظيمي والصلاحيات والسياسات التشغيلية.",
      "تلخيص احتياجات التهيئة أو التحديث.",
    ],
    toolUsage: [
      "لا تنفّذ أي تعديل تنظيمي بدون أداة معتمدة.",
    ],
    output: [
      "قدّم قائمة واضحة بالإجراءات المطلوبة وأسبابها.",
    ],
    safety: [
      SHARED_PROMPT_BLOCKS.arabicStandard,
      SHARED_PROMPT_BLOCKS.noFabrication,
      SHARED_PROMPT_BLOCKS.businessPolicy,
    ],
  },
  modelPolicy: { temperature: 0.2 },
  runtimePolicy: { maxSteps: 4, failureMode: "soft" },
  toolKeys: [],
});

export const ananWorkspaceInboxDefinition = defineAgent({
  name: "anan_workspace_inbox",
  description:
    "Triages workspace inbox messages and proposes operational next steps for partners.",
  team: "team_workspace_inbox",
  allowedRoles: ["broker", "RED", "admin"],
  prompt: {
    version: "v1",
    identity: "أنت anan_workspace_inbox، وكيل تنظيم صندوق الوارد للشركاء في منصة عنان.",
    scope: [
      "تصنيف الرسائل الواردة وتحديد أولوية الاستجابة.",
      "اقتراح الخطوات التالية مع توضيح ما يحتاج موافقة.",
    ],
    toolUsage: [
      "لا تنفّذ أي إجراء على الرسائل دون أداة واضحة.",
    ],
    output: [
      "قدّم قائمة مهام قصيرة مع الأولويات.",
    ],
    safety: [
      SHARED_PROMPT_BLOCKS.arabicStandard,
      SHARED_PROMPT_BLOCKS.noFabrication,
      SHARED_PROMPT_BLOCKS.businessPolicy,
    ],
  },
  modelPolicy: { temperature: 0.2 },
  runtimePolicy: { maxSteps: 4, failureMode: "soft" },
  toolKeys: [],
});

export const AGENT_REGISTRY = buildAgentRegistry([
  ananWorkspaceProjectsDefinition,
  ananWorkspaceOffersDefinition,
  ananWorkspaceCrmDefinition,
  ananWorkspaceOrgDefinition,
  ananWorkspaceInboxDefinition,
]);

export const TEAM_REGISTRY = buildTeamRegistry([
  defineTeamConfig({
    id: "team_workspace_projects",
    allowedRoles: ["broker", "RED", "admin"],
    failureMode: "soft",
    agents: [ananWorkspaceProjectsDefinition],
  }),
  defineTeamConfig({
    id: "team_workspace_offers",
    allowedRoles: ["broker", "RED", "admin"],
    failureMode: "soft",
    agents: [ananWorkspaceOffersDefinition],
  }),
  defineTeamConfig({
    id: "team_workspace_crm",
    allowedRoles: ["broker", "RED", "admin"],
    failureMode: "soft",
    agents: [ananWorkspaceCrmDefinition],
  }),
  defineTeamConfig({
    id: "team_workspace_org",
    allowedRoles: ["broker", "RED", "admin"],
    failureMode: "soft",
    agents: [ananWorkspaceOrgDefinition],
  }),
  defineTeamConfig({
    id: "team_workspace_inbox",
    allowedRoles: ["broker", "RED", "admin"],
    failureMode: "soft",
    agents: [ananWorkspaceInboxDefinition],
  }),
]);
