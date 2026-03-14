import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
};

export default function PageHeader({
  eyebrow,
  title,
  description,
  className,
  actions,
}: PageHeaderProps) {
  return (
    <header className={cn("flex items-start justify-between gap-4 border-b-2 border-slate-100 pb-6", className)}>
      <div className="space-y-3">
        <div className="text-xs font-black uppercase tracking-widest text-blue-600">
          {eyebrow}
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          {title}
        </h1>
        {description && (
          <div className="max-w-xl text-sm font-semibold leading-relaxed text-slate-700">
            {description}
          </div>
        )}
      </div>
      {actions && <div className="flex shrink-0">{actions}</div>}
    </header>
  );
}
