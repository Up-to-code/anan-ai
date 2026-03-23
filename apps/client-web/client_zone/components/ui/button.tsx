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
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        variant === "default" && "bg-slate-900 text-white hover:bg-slate-800",
        variant === "secondary" && "bg-slate-100 text-slate-900 hover:bg-slate-200",
        variant === "outline" && "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
        variant === "ghost" && "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        size === "default" && "h-10 px-4 py-2",
        size === "sm" && "h-8 px-3 text-xs",
        size === "icon" && "h-9 w-9",
        className,
      )}
      {...props}
    />
  );
}
