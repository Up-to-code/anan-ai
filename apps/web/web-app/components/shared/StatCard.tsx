import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  className?: string;
};

export default function StatCard({ label, value, hint, icon: Icon, className }: StatCardProps) {
  return (
    <div className={cn("border-2 border-slate-100 bg-white p-6 transition hover:border-slate-200", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">
            {label}
          </div>
          <div className="text-3xl font-black tracking-tight text-slate-900">
            {value}
          </div>
        </div>
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center bg-slate-50 text-slate-400">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {hint && (
        <p className="mt-4 text-xs font-bold text-slate-500">
          {hint}
        </p>
      )}
    </div>
  );
}
