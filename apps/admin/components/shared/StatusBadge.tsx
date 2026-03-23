import { cn } from "@/lib/utils";
import { labelForStatus } from "@/lib/adminLabels";

type StatusBadgeProps = {
  value?: string | null;
  className?: string;
};

const toneByValue: Record<string, string> = {
  available: "border-emerald-300 bg-emerald-50 text-emerald-800",
  sold: "border-border bg-zinc-100 text-zinc-700",
  reserved: "border-amber-300 bg-amber-50 text-amber-800",
  new_lead: "border-sky-300 bg-sky-50 text-sky-800",
  contacted: "border-cyan-300 bg-cyan-50 text-cyan-800",
  qualified: "border-indigo-300 bg-indigo-50 text-indigo-800",
  offer_made: "border-violet-300 bg-violet-50 text-violet-800",
  under_contract: "border-orange-300 bg-orange-50 text-orange-800",
  closed_won: "border-emerald-300 bg-emerald-50 text-emerald-800",
  closed_lost: "border-rose-300 bg-rose-50 text-rose-800",
  failed: "border-rose-300 bg-rose-50 text-rose-800",
  success: "border-emerald-300 bg-emerald-50 text-emerald-800",
  active: "border-emerald-300 bg-emerald-50 text-emerald-800",
  inactive: "border-border bg-zinc-100 text-zinc-700",
  approved: "border-emerald-300 bg-emerald-50 text-emerald-800",
  accepted: "border-emerald-300 bg-emerald-50 text-emerald-800",
  rejected: "border-rose-300 bg-rose-50 text-rose-800",
  pending: "border-border bg-zinc-100 text-zinc-700",
  draft: "border-border bg-zinc-100 text-zinc-700",
  published: "border-sky-300 bg-sky-50 text-sky-800",
  complete: "border-emerald-300 bg-emerald-50 text-emerald-800",
  missing_document: "border-rose-300 bg-rose-50 text-rose-800",
  pending_review: "border-amber-300 bg-amber-50 text-amber-800",
  in_review: "border-amber-300 bg-amber-50 text-amber-800",
  new: "border-sky-300 bg-sky-50 text-sky-800",
};

/**
 * WHY:   Status values appear across the admin console and still need a shared visual treatment after the redesign.
 * WHAT:  Renders a compact status tag with the rebuilt neutral palette and mapped status label.
 * HOW:   Applies a tone for known values and falls back to a muted default for unknown states.
 */
export default function StatusBadge({ value, className }: StatusBadgeProps) {
  const normalized = value?.trim() || "unknown";

  return (
    <span
      className={cn(
        "inline-flex rounded-[8px] border px-2.5 py-1 text-xs font-medium",
        toneByValue[normalized] ?? "border-border bg-zinc-100 text-zinc-700",
        className,
      )}
    >
      {labelForStatus(normalized)}
    </span>
  );
}
