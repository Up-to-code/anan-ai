import type { ReactNode } from "react";
import StatusBadge from "@/components/shared/StatusBadge";

type AdminFormSummaryCardProps = {
  title: string;
  values: Array<{ label: string; value: ReactNode; tone?: "status" | "default" }>;
};

/**
 * WHY:   Real admin forms need a side summary so important state and linked context stay visible during editing.
 * WHAT:  Renders a compact key-value summary card for the create/edit rail.
 * HOW:   Optionally formats values as status badges while keeping normal text rows for everything else.
 */
export default function AdminFormSummaryCard({ title, values }: AdminFormSummaryCardProps) {
  return (
    <section className="rounded-[8px] border border-border bg-white p-4">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <div className="mt-4 space-y-3">
        {values.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3 rounded-[8px] border border-border bg-slate-50 px-3 py-2.5">
            <span className="text-sm text-slate-600">{item.label}</span>
            <span className="text-sm font-medium text-slate-900">
              {item.tone === "status" && typeof item.value === "string" ? <StatusBadge value={item.value} /> : item.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
