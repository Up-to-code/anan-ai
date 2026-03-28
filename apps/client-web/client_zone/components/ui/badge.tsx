import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * WHY:   Chat result blocks need compact metadata labels without custom one-off styling.
 * WHAT:  Renders a small shadcn-style badge.
 * HOW:   Keeps the visual weight low so the conversation remains primary.
 */
export function Badge({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-[color:color-mix(in_srgb,var(--workspace-border)_84%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-elevated)_82%,white)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--workspace-muted)]",
        className,
      )}
      {...props}
    />
  );
}
