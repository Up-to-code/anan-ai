import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  delta?: number | null;
  className?: string;
};

/**
 * WHY:   Command-center metrics need one expressive card style so KPI scans feel fast and consistent across the admin workspace.
 * WHAT:  Renders a compact metric card with value, delta, hint, and an optional icon.
 * HOW:   Uses workspace tokens for both themes and reserves stronger contrast for the value while keeping the supporting copy subdued.
 */
export default function StatCard({ label, value, hint, icon: Icon, delta, className }: StatCardProps) {
  const numericDelta = typeof delta === "number" ? delta : null;
  const deltaLabel =
    typeof numericDelta === "number"
      ? `${numericDelta > 0 ? "+" : ""}${new Intl.NumberFormat("ar-SA", {
          style: "percent",
          maximumFractionDigits: 0,
        }).format(numericDelta)}`
      : null;

  return (
    <div
      className={cn(
        "rounded-[32px] border border-[color:color-mix(in_srgb,var(--workspace-border)_76%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-panel)_97%,transparent)] p-7 shadow-[0_16px_42px_-30px_rgba(15,23,42,0.22)] transition-all duration-200 hover:border-[color:color-mix(in_srgb,var(--workspace-highlight)_20%,transparent)] hover:bg-[color:color-mix(in_srgb,var(--workspace-panel)_100%,transparent)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-2 text-right">
          <div className="text-[11px] font-black uppercase leading-none tracking-[0.2em] text-[var(--workspace-muted)]">
            {label}
          </div>
          <div className="text-4xl font-black tracking-tight text-[var(--workspace-bubble-other-foreground)]">{value}</div>
        </div>
        {Icon ? (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[20px] border border-[color:color-mix(in_srgb,var(--workspace-border)_78%,transparent)] bg-[var(--workspace-elevated)] text-[var(--workspace-highlight)]">
            <Icon className="h-6 w-6" />
          </div>
        ) : null}
      </div>
      
      <div className="mt-6 flex items-center justify-between border-t border-[color:color-mix(in_srgb,var(--workspace-border)_68%,transparent)] pt-5">
        {deltaLabel ? (
          <div className={cn(
            "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-black tracking-wide", 
            (numericDelta ?? 0) >= 0 
              ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" 
              : "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
          )}>
            {deltaLabel} • {deltaLabel.startsWith("+") ? "زيادة" : "نقصان"}
          </div>
        ) : <div />}
        
        {hint ? (
          <p className="text-left text-[12px] font-bold text-[var(--workspace-muted)]">
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}
