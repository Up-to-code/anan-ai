"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * WHY:   The chat rewrite needs a small shadcn-style button primitive for prompts, header actions, and auth flows.
 * WHAT:  Renders a semantic button with minimal variant styling.
 * HOW:   Applies class-based variants without introducing a larger component dependency.
 */
export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "icon";
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border text-sm font-bold transition-all disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--workspace-highlight)_28%,transparent)] active:scale-[0.98]",
        variant === "default" &&
          "border-transparent bg-slate-950 text-white shadow-[0_10px_28px_rgba(15,23,42,0.18)] hover:bg-[var(--workspace-highlight-strong)]",
        variant === "secondary" &&
          "border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] text-[var(--workspace-bubble-other-foreground)] hover:bg-[var(--workspace-accent-soft)]",
        variant === "outline" &&
          "border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] text-[var(--workspace-bubble-other-foreground)] hover:bg-[var(--workspace-elevated)]",
        variant === "ghost" &&
          "border-transparent bg-transparent text-[var(--workspace-muted)] hover:border-[color:var(--workspace-border)] hover:bg-[var(--workspace-panel)] hover:text-[var(--workspace-bubble-other-foreground)]",
        size === "default" && "h-11 px-4 py-2.5",
        size === "sm" && "min-h-10 px-4 py-2 text-xs sm:text-sm",
        size === "icon" && "h-10 w-10 rounded-full",
        className,
      )}
      {...props}
    />
  );
}
