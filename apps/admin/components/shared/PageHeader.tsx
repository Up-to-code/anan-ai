import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
};

/**
 * WHY:   Admin pages need one consistent hero treatment so command-center and CRUD surfaces feel like the same workspace.
 * WHAT:  Renders the page eyebrow, title, description, and optional actions with workspace-aware typography.
 * HOW:   Uses token-based colors and spacing so headers stay readable in both light and dark themes.
 */
export default function PageHeader({
  eyebrow,
  title,
  description,
  className,
  actions,
}: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-6 pb-8 lg:flex-row lg:items-end lg:justify-between", className)}>
      <div className="space-y-3 text-right">
        {eyebrow && eyebrow !== title ? (
          <div className="text-[11px] font-black uppercase leading-none tracking-[0.24em] text-[var(--workspace-muted)]">
            {eyebrow}
          </div>
        ) : null}
        <h1 className="text-4xl font-black tracking-tight text-[var(--workspace-bubble-other-foreground)] sm:text-5xl">
          {title}
        </h1>
        {description ? (
          <div className="max-w-3xl text-[14px] font-medium leading-relaxed text-[var(--workspace-muted)] sm:text-[15px]">
            {description}
          </div>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center">{actions}</div> : null}
    </header>
  );
}
