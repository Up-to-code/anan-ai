import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
  variant?: "compact" | "hero";
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
  variant = "compact",
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "grid min-w-0 gap-4 border-b border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)]",
        variant === "compact"
          ? "pb-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"
          : "pb-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end",
        className,
      )}
    >
      <div className={cn("min-w-0 text-right", variant === "compact" ? "space-y-2.5" : "space-y-3")}>
        {eyebrow && eyebrow !== title ? (
          <div className="text-[11px] font-black uppercase leading-none tracking-[0.24em] text-[var(--workspace-muted)]">
            {eyebrow}
          </div>
        ) : null}
        <h1
          className={cn(
            "text-balance font-black tracking-tight text-[var(--workspace-bubble-other-foreground)]",
            variant === "compact" ? "text-3xl sm:text-4xl" : "text-4xl sm:text-5xl",
          )}
        >
          {title}
        </h1>
        {description ? (
          <div
            className={cn(
              "text-[var(--workspace-muted)]",
              variant === "compact"
                ? "max-w-2xl text-[13px] font-medium leading-6 sm:text-[14px]"
                : "max-w-3xl text-[14px] font-medium leading-relaxed sm:text-[15px]",
            )}
          >
            {description}
          </div>
        ) : null}
      </div>
      {actions ? (
        <div className="flex min-w-0 flex-wrap items-center gap-2 justify-self-start lg:justify-self-end lg:self-end">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
