import { cn } from "@/_core/lib/utils";

interface StatCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: string;
    className?: string;
}

export function StatCard({ title, value, icon, trend, className }: StatCardProps) {
    return (
        <div className={cn("bg-white border border-slate-200 rounded-xl p-5", className)}>
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{title}</p>
                {icon && <div className="text-slate-400">{icon}</div>}
            </div>
            <div className="mt-2">
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                {trend && <p className="text-xs text-emerald-600 mt-1">{trend}</p>}
            </div>
        </div>
    );
}
