import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
};

/**
 * WHY:   The Nexus PageHeader needs high-contrast typography and minimalist spacing.
 * WHAT:  Modernizes the title section with Cairo font weights and premium tracking.
 * HOW:   Uses font-black for titles and tracking-widest for eyebrows to match the Nexus HUD.
 */
export default function PageHeader({
  eyebrow,
  title,
  description,
  className,
  actions,
}: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between pb-8", className)}>
      <div className="space-y-2 text-right">
        {eyebrow && eyebrow !== title ? (
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 leading-none">
            {eyebrow}
          </div>
        ) : null}
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-50">{title}</h1>
        {description ? (
          <div className="max-w-3xl text-[14px] font-medium leading-relaxed text-slate-500 dark:text-slate-400">
            {description}
          </div>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center">{actions}</div> : null}
    </header>
  );
}
