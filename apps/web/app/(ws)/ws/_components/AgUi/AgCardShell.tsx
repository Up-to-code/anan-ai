import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * WHY:   AG UI cards should look consistent across assistant pages in both light and dark themes.
 * WHAT:  Provides one shared surface wrapper for assistant cards and list-style panels.
 * HOW:   Centralizes border, background, shadow, and inner elevation classes so individual cards only define content.
 */
export function AgCardShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "w-full rounded-[26px] border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] p-5 shadow-[0_12px_36px_rgba(15,23,42,0.06)]",
        "dark:shadow-[0_20px_48px_rgba(0,0,0,0.28)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function agInnerPanelClassName() {
  return "border border-[color:color-mix(in_srgb,var(--workspace-border)_82%,transparent)] bg-[var(--workspace-elevated)]";
}
