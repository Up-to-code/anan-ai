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
 * WHY:   The Nexus StatCard must feel premium, using rounded-3xl geometry and Cairo weights.
 * WHAT:  Modernizes the metric tile with cleaner shadows, better contrast, and generous spacing.
 * HOW:   Adopts rounded-[32px] for the card and rounded-2xl for icons to match the platform-wide HUD.
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
    <div className={cn(
      "rounded-[32px] border border-border/10 bg-white dark:bg-slate-900 p-8 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-border/40", 
      className
    )}>
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-2 text-right">
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 leading-none">{label}</div>
          <div className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-50">{value}</div>
        </div>
        {Icon ? (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[20px] bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-border/10">
            <Icon className="h-6 w-6" />
          </div>
        ) : null}
      </div>
      
      <div className="mt-6 flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-5">
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
          <p className="text-[12px] font-bold text-slate-400 dark:text-slate-500 text-left">
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}
