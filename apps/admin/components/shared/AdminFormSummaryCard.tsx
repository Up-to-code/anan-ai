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
    <section className="rounded-[24px] border border-[color:color-mix(in_srgb,var(--workspace-border)_76%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-panel)_96%,transparent)] p-4 shadow-sm">
      <h2 className="text-base font-black text-[var(--workspace-bubble-other-foreground)]">{title}</h2>
      <div className="mt-4 space-y-3">
        {values.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3 rounded-[18px] border border-[color:color-mix(in_srgb,var(--workspace-border)_74%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-elevated)_58%,transparent)] px-3 py-2.5">
            <span className="text-sm text-[var(--workspace-muted)]">{item.label}</span>
            <span className="text-sm font-black text-[var(--workspace-bubble-other-foreground)]">
              {item.tone === "status" && typeof item.value === "string" ? <StatusBadge value={item.value} /> : item.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
