import type { AppLocale } from "@/lib/locale";
import { formatLocaleDateTime } from "@/lib/locale";
import type { PipelineStage } from "../../types/crmTypes";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const STAGE_ORDER = ["new", "qualified", "proposal", "won", "lost"] as const satisfies readonly PipelineStage[];

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

export function getStageLabel(stage: PipelineStage, locale: AppLocale): string {
  const labels: Record<PipelineStage, string> =
    locale === "fr"
      ? {
          new: "Nouveau",
          qualified: "Qualifie",
          proposal: "Proposition",
          won: "Gagne",
          lost: "Perdu",
        }
      : locale === "en"
        ? {
            new: "New",
            qualified: "Qualified",
            proposal: "Proposal",
            won: "Won",
            lost: "Lost",
          }
        : {
            new: "جديد",
            qualified: "مؤهل",
            proposal: "عرض",
            won: "مغلق",
            lost: "خسارة",
          };

  return labels[stage];
}

export function formatFollowUpLabel(timestamp: number | undefined, locale: AppLocale): string {
  if (!timestamp) {
    return locale === "fr"
      ? "Aucun suivi planifie"
      : locale === "en"
        ? "No follow-up scheduled"
        : "بدون متابعة محددة";
  }

  return formatLocaleDateTime(locale, new Date(timestamp), {
    dateStyle: "medium",
    timeStyle: "short",
  });
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

export function getFollowUpPresentation(timestamp: number | undefined, locale: AppLocale): {
  label: string;
  tone: string;
} {
  const status = getFollowUpStatus(timestamp);

  if (status === "overdue") {
    return {
      label: locale === "fr" ? "En retard" : locale === "en" ? "Overdue" : "متأخرة",
      tone: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
    };
  }

  if (status === "soon") {
    return {
      label: locale === "fr" ? "Sous 24 h" : locale === "en" ? "Within 24 hours" : "خلال 24 ساعة",
      tone: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
    };
  }

  if (status === "scheduled") {
    return {
      label: locale === "fr" ? "Planifie" : locale === "en" ? "Scheduled" : "مجدولة",
      tone: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
    };
  }

  return {
    label: locale === "fr" ? "Sans date" : locale === "en" ? "No date" : "بدون موعد",
    tone: "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
  };
}
