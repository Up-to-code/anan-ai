import type {
  WorkspaceProjectAnalyticsBrokerActivityKey,
  WorkspaceProjectAnalyticsBrokerState,
  WorkspaceProjectAnalyticsDeveloperStageKey,
} from "@/server/contracts/properties";

export type DeveloperTabKey = "overview" | "brokers" | "activity";
export type EngagementMetricKey = "views" | "clicks" | "clickRate";

export const DEVELOPER_TABS: { key: DeveloperTabKey; label: string; description: string }[] = [
  {
    key: "overview",
    label: "Overview",
    description: "نظرة تنفيذية سريعة على العملاء، المراحل، وحركة المشروع.",
  },
  {
    key: "brokers",
    label: "Broker Tracking",
    description: "تعقب الوسطاء العاملين على المشروع وافتح تفاصيل كل وسيط بسرعة.",
  },
  {
    key: "activity",
    label: "Activity",
    description: "سجل الأعمال الفعلي حول المشروع: متى تحرك العملاء ومتى أغلقت الحالات.",
  },
];

export const ENGAGEMENT_METRICS = {
  views: {
    label: "المشاهدات",
    color: "#2563eb",
  },
  clicks: {
    label: "النقرات",
    color: "#0f766e",
  },
  clickRate: {
    label: "معدل التفاعل",
    color: "#ea580c",
  },
} as const;

export const BROKER_STATE_STYLES: Record<
  WorkspaceProjectAnalyticsBrokerState,
  {
    card: string;
    badge: string;
    soft: string;
  }
> = {
  viewer_only: {
    card: "border-slate-300 bg-slate-50/80",
    badge: "border-slate-300 bg-slate-100 text-slate-700",
    soft: "bg-slate-100 text-slate-700",
  },
  offer_active: {
    card: "border-sky-300 bg-sky-50/80",
    badge: "border-sky-300 bg-sky-100 text-sky-700",
    soft: "bg-sky-100 text-sky-700",
  },
  client_linked: {
    card: "border-amber-300 bg-amber-50/80",
    badge: "border-amber-300 bg-amber-100 text-amber-800",
    soft: "bg-amber-100 text-amber-800",
  },
  closed_won: {
    card: "border-emerald-300 bg-emerald-50/80",
    badge: "border-emerald-300 bg-emerald-100 text-emerald-800",
    soft: "bg-emerald-100 text-emerald-800",
  },
  closed_lost: {
    card: "border-rose-300 bg-rose-50/80",
    badge: "border-rose-300 bg-rose-100 text-rose-800",
    soft: "bg-rose-100 text-rose-800",
  },
};

export const BROKER_ACTIVITY_STYLES: Record<WorkspaceProjectAnalyticsBrokerActivityKey, string> = {
  new_client: "border-slate-300 bg-slate-100 text-slate-700",
  in_call: "border-sky-300 bg-sky-100 text-sky-700",
  in_stage: "border-amber-300 bg-amber-100 text-amber-800",
  permit_review: "border-orange-300 bg-orange-100 text-orange-800",
  closed_won: "border-emerald-300 bg-emerald-100 text-emerald-800",
  closed_lost: "border-rose-300 bg-rose-100 text-rose-800",
};

export const PRIMARY_STAGE_BADGES: Record<WorkspaceProjectAnalyticsDeveloperStageKey, string> = {
  new: "border-slate-300 bg-slate-100 text-slate-700",
  contacted: "border-sky-300 bg-sky-100 text-sky-700",
  negotiation: "border-amber-300 bg-amber-100 text-amber-800",
  won: "border-emerald-300 bg-emerald-100 text-emerald-800",
  lost: "border-rose-300 bg-rose-100 text-rose-800",
};

export const BROKER_STATE_SEQUENCE: WorkspaceProjectAnalyticsBrokerState[] = [
  "viewer_only",
  "offer_active",
  "client_linked",
  "closed_won",
  "closed_lost",
];

const BROKER_STATE_COPY: Record<
  WorkspaceProjectAnalyticsBrokerState,
  {
    label: string;
    developerLine: string;
  }
> = {
  viewer_only: {
    label: "فتح المشروع فقط",
    developerLine: "الوسيط دخل المشروع وشاهده، لكنه لم يربط عميلاً بعد.",
  },
  offer_active: {
    label: "يعمل على عرض",
    developerLine: "الوسيط يتحرك على عرض نشط لهذا المشروع ويحتاج متابعة قريبة.",
  },
  client_linked: {
    label: "جلب عميلاً",
    developerLine: "الوسيط نجح في ربط عميل فعلي بهذا المشروع داخل مسار العمل.",
  },
  closed_won: {
    label: "أغلق بنجاح",
    developerLine: "الوسيط وصل بعميل إلى إغلاق ناجح على هذا المشروع.",
  },
  closed_lost: {
    label: "إغلاق غير مكتمل",
    developerLine: "كان لدى الوسيط عميل على المشروع لكن الرحلة لم تكتمل حتى الإغلاق.",
  },
};

const BROKER_ACTIVITY_COPY: Record<
  WorkspaceProjectAnalyticsBrokerActivityKey,
  {
    short: string;
    developerLine: string;
  }
> = {
  new_client: {
    short: "عميل جديد",
    developerLine: "لدى الوسيط عميل جديد مرتبط بهذا المشروع الآن.",
  },
  in_call: {
    short: "في مكالمة",
    developerLine: "الوسيط يتابع العميل حالياً في مكالمة أو تواصل مباشر.",
  },
  in_stage: {
    short: "داخل مرحلة",
    developerLine: "العميل يتحرك الآن داخل مرحلة تجارية فعلية على المشروع.",
  },
  permit_review: {
    short: "مراجعة تصريح",
    developerLine: "هناك خطوة تشغيلية أو مراجعة تصريح تؤثر على تقدم هذا العميل.",
  },
  closed_won: {
    short: "إغلاق ناجح",
    developerLine: "الوسيط أنهى الرحلة بإغلاق ناجح على المشروع.",
  },
  closed_lost: {
    short: "إغلاق غير مكتمل",
    developerLine: "الرحلة وصلت لنهاية غير مكتملة ويحتاج المطور معرفة السبب.",
  },
};

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export function formatDateTime(value: number | null) {
  if (!value) return "بدون نشاط";
  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function computeClickRate(clicks: number, views: number) {
  if (views <= 0) return 0;
  return (clicks / views) * 100;
}

export function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function getBrokerStateNarrative(state: WorkspaceProjectAnalyticsBrokerState, count?: number) {
  const meta = BROKER_STATE_COPY[state];
  if (typeof count === "number") {
    return count > 0 ? `${formatNumber(count)} وسيط: ${meta.developerLine}` : `لا يوجد وسطاء في حالة "${meta.label}" حالياً.`;
  }
  return meta.developerLine;
}

export function getBrokerStateLabel(state: WorkspaceProjectAnalyticsBrokerState) {
  return BROKER_STATE_COPY[state].label;
}

export function getBrokerActivityNarrative(activityKey: WorkspaceProjectAnalyticsBrokerActivityKey | null, fallbackLabel?: string | null) {
  if (!activityKey) return fallbackLabel ?? "لا توجد حركة تشغيلية واضحة بعد.";
  return BROKER_ACTIVITY_COPY[activityKey]?.developerLine ?? fallbackLabel ?? "لا توجد حركة تشغيلية واضحة بعد.";
}
