import { cn } from "@/lib/utils";

type WorkspacePanelProps = {
  children?: React.ReactNode;
  className?: string;
  tone?: "default" | "dark" | "muted" | "warn";
  density?: "hero" | "default" | "compact";
  header?: React.ReactNode;
  footer?: React.ReactNode;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  fullHeight?: boolean;
  scrollBody?: boolean;
  maxBodyHeightClassName?: string;
  minBodyHeightClassName?: string;
};

const tones = {
  default:
    "rounded-[32px] border border-[color:color-mix(in_srgb,var(--workspace-border)_76%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-panel)_96%,transparent)] text-[var(--workspace-bubble-other-foreground)] shadow-[0_16px_48px_-30px_rgba(15,23,42,0.28)] backdrop-blur-sm",
  dark:
    "rounded-[32px] border border-[color:color-mix(in_srgb,var(--workspace-highlight)_26%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-sidebar-strong)_88%,transparent)] text-white shadow-[0_18px_56px_-32px_rgba(2,6,23,0.6)]",
  muted:
    "rounded-[32px] border border-[color:color-mix(in_srgb,var(--workspace-border)_74%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-elevated)_72%,transparent)] text-[var(--workspace-bubble-other-foreground)]",
  warn:
    "rounded-[32px] border border-amber-400/20 bg-[color:color-mix(in_srgb,#f59e0b_12%,var(--workspace-panel))] text-[var(--workspace-bubble-other-foreground)] shadow-[0_12px_42px_-30px_rgba(245,158,11,0.35)]",
};

const densityStyles = {
  hero: {
    simple: "p-5 sm:p-7",
    header: "px-5 py-5 sm:px-6 sm:py-6",
    body: "px-5 py-5 sm:px-6 sm:py-6",
    footer: "px-5 py-4 sm:px-6",
  },
  default: {
    simple: "p-4 sm:p-5",
    header: "px-5 py-5 sm:px-6",
    body: "px-5 py-5 sm:px-6",
    footer: "px-5 py-4 sm:px-6",
  },
  compact: {
    simple: "p-4",
    header: "px-4 py-4 sm:px-5",
    body: "px-4 py-4 sm:px-5",
    footer: "px-4 py-3 sm:px-5",
  },
};

/**
 * WHY:   Rebuilt admin pages need one shared container surface for charts, tables, and dense operational panels.
 * WHAT:  Wraps content in a consistent bordered panel with optional tonal variants and structured header/body/footer slots.
 * HOW:   Falls back to the original simple padded surface for lightweight cards, but can switch to a bounded flex column for sticky, scrollable dashboard panels.
 */
export default function WorkspacePanel({
  children,
  className,
  tone = "default",
  density = "default",
  header,
  footer,
  headerClassName,
  bodyClassName,
  footerClassName,
  fullHeight = false,
  scrollBody = false,
  maxBodyHeightClassName,
  minBodyHeightClassName,
}: WorkspacePanelProps) {
  const isStructured = Boolean(
    header || footer || bodyClassName || fullHeight || scrollBody || maxBodyHeightClassName || minBodyHeightClassName,
  );
  const densityStyle = densityStyles[density];

  if (!isStructured) {
    return (
      <section className={cn("min-w-0 max-w-full", densityStyle.simple, tones[tone], className)}>
        {children}
      </section>
    );
  }

  return (
    <section
      className={cn(
        "flex min-w-0 max-w-full flex-col",
        tones[tone],
        fullHeight && "h-full min-h-0",
        className,
      )}
    >
      {header ? (
        <div
          className={cn(
            "border-b border-[color:color-mix(in_srgb,var(--workspace-border)_70%,transparent)]",
            densityStyle.header,
            headerClassName,
          )}
        >
          {header}
        </div>
      ) : null}
      <div
        className={cn(
          "min-w-0",
          densityStyle.body,
          fullHeight && "flex-1 min-h-0",
          scrollBody && "overflow-y-auto overscroll-contain",
          maxBodyHeightClassName,
          minBodyHeightClassName,
          bodyClassName,
        )}
      >
        {children}
      </div>
      {footer ? (
        <div
          className={cn(
            "border-t border-[color:color-mix(in_srgb,var(--workspace-border)_70%,transparent)]",
            densityStyle.footer,
            footerClassName,
          )}
        >
          {footer}
        </div>
      ) : null}
    </section>
  );
}
