import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
};

/**
 * WHY:   The rebuilt admin should use straightforward page headers instead of decorative dashboard hero copy.
 * WHAT:  Renders a simple title row with optional supporting text and actions.
 * HOW:   Shows the eyebrow only when it adds meaning beyond the title and keeps the hierarchy text-first.
 */
export default function PageHeader({
  eyebrow,
  title,
  description,
  className,
  actions,
}: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-4 border-b border-stone-300 pb-5 lg:flex-row lg:items-start lg:justify-between", className)}>
      <div className="space-y-3">
        {eyebrow && eyebrow !== title ? <div className="text-sm text-slate-500">{eyebrow}</div> : null}
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {description ? <div className="max-w-3xl text-sm leading-7 text-slate-600">{description}</div> : null}
      </div>
      {actions ? <div className="flex shrink-0">{actions}</div> : null}
    </header>
  );
}
