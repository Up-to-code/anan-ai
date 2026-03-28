import type { ComponentProps, ReactNode } from "react";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Card,
} from "@/client_zone/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * WHY:   Client AG UI cards need one shared surface so widths, borders, shadows, and spacing stay identical across card types.
 * WHAT:  Provides the public-assistant equivalent of the workspace AG UI card shell.
 * HOW:   Centralizes the outer workspace-like panel chrome while still composing through the local card primitives.
 */
export function AgUiCardShell({
  className,
  ...props
}: ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn(
        "w-full rounded-[28px] border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] shadow-[0_18px_42px_rgba(15,23,42,0.06)]",
        className,
      )}
      {...props}
    />
  );
}

export function agUiInnerPanelClassName() {
  return "rounded-[22px] border border-[color:color-mix(in_srgb,var(--workspace-border)_82%,transparent)] bg-[var(--workspace-elevated)]";
}

/**
 * WHY:   Most client AG UI cards repeat the same title-plus-summary framing above their specific content.
 * WHAT:  Renders a consistent card header for public assistant AG UI blocks.
 * HOW:   Keeps typography and spacing aligned while allowing optional badge/status content on the right.
 */
export function AgUiCardHeading({
  title,
  summary,
  aside,
}: {
  title: string;
  summary?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <CardHeader className="gap-3 px-5 pb-4 pt-5 sm:px-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <CardTitle className="text-[15px] font-black text-[var(--workspace-bubble-other-foreground)] sm:text-base">
            {title}
          </CardTitle>
          {summary ? (
            <CardDescription className="max-w-3xl text-[13px] leading-6 text-[var(--workspace-muted)] sm:text-sm">
              {summary}
            </CardDescription>
          ) : null}
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </div>
    </CardHeader>
  );
}

/**
 * WHY:   Metric-driven cards need a reusable elevated tile style instead of each card inventing its own mini-surface.
 * WHAT:  Renders one statistic or fact tile inside AG UI metric grids.
 * HOW:   Applies the shared elevated panel treatment and consistent label/value typography.
 */
export function AgUiMetricTile({
  label,
  value,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(agUiInnerPanelClassName(), "p-4", className)}>
      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--workspace-muted)]">
        {label}
      </div>
      <div className="mt-3 text-[15px] font-black text-[var(--workspace-bubble-other-foreground)] sm:text-base">
        {value}
      </div>
    </div>
  );
}

export { CardContent };
