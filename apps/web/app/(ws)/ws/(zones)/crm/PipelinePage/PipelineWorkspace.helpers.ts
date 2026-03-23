import type { PipelineStage } from "../crmTypes";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const STAGE_LABELS: Record<PipelineStage, string> = {
  new: "جديد",
  qualified: "مؤهل",
  proposal: "عرض",
  won: "مغلق",
  lost: "خسارة",
};

export const STAGE_ORDER = Object.keys(STAGE_LABELS) as PipelineStage[];

const FOLLOW_UP_FORMATTER = new Intl.DateTimeFormat("ar-SA", {
  dateStyle: "medium",
  timeStyle: "short",
});

export const DEAL_STAGE_BY_PIPELINE_STAGE: Record<
  PipelineStage,
  "new" | "contacted" | "negotiation" | "won" | "lost"
> = {
  new: "new",
  qualified: "contacted",
  proposal: "negotiation",
  won: "won",
  lost: "lost",
};

export function toDateTimeLocalValue(timestamp?: number): string {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const pad = (value: number) => value.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function formatFollowUpLabel(timestamp?: number): string {
  if (!timestamp) return "بدون متابعة محددة";
  return FOLLOW_UP_FORMATTER.format(new Date(timestamp));
}

export function getFollowUpStatus(
  timestamp?: number,
): "overdue" | "soon" | "scheduled" | "none" {
  if (!timestamp) return "none";
  const now = Date.now();
  if (timestamp < now) return "overdue";
  if (timestamp <= now + DAY_IN_MS) return "soon";
  return "scheduled";
}

export function getFollowUpPresentation(timestamp?: number): {
  label: string;
  tone: string;
} {
  const status = getFollowUpStatus(timestamp);

  if (status === "overdue") {
    return {
      label: "متأخرة",
      tone: "border-rose-200 bg-rose-50 text-rose-700",
    };
  }

  if (status === "soon") {
    return {
      label: "خلال 24 ساعة",
      tone: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  if (status === "scheduled") {
    return {
      label: "مجدولة",
      tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  return {
    label: "بدون موعد",
    tone: "border-slate-200 bg-slate-50 text-slate-500",
  };
}
