import { cn } from "@/lib/utils";
import { labelForStatus } from "@/lib/adminLabels";

type StatusBadgeProps = {
  value?: string | null;
  className?: string;
};

const toneByValue: Record<string, string> = {
  available: "border-emerald-200 bg-emerald-50 text-emerald-700",
  sold: "border-slate-200 bg-slate-100 text-slate-700",
  reserved: "border-amber-200 bg-amber-50 text-amber-700",
  new_lead: "border-blue-200 bg-blue-50 text-blue-700",
  contacted: "border-sky-200 bg-sky-50 text-sky-700",
  qualified: "border-indigo-200 bg-indigo-50 text-indigo-700",
  offer_made: "border-violet-200 bg-violet-50 text-violet-700",
  under_contract: "border-orange-200 bg-orange-50 text-orange-700",
  closed_won: "border-emerald-200 bg-emerald-50 text-emerald-700",
  closed_lost: "border-rose-200 bg-rose-50 text-rose-700",
  failed: "border-rose-200 bg-rose-50 text-rose-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

/**
 * WHY:   Status values appear across the admin console and need one quick, readable visual treatment.
 * WHAT:  Renders a bordered uppercase status chip using the institutional palette.
 * HOW:   Maps known statuses to tones and falls back to a neutral appearance for unknown values.
 */
export default function StatusBadge({ value, className }: StatusBadgeProps) {
  const normalized = value?.trim() || "unknown";

  return (
    <span
      className={cn(
        "inline-flex border px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em]",
        toneByValue[normalized] ?? "border-slate-200 bg-slate-50 text-slate-600",
        className,
      )}
    >
      {labelForStatus(normalized)}
    </span>
  );
}
