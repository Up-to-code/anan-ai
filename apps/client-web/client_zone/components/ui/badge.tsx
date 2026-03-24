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
      className={cn("inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs text-slate-600", className)}
      {...props}
    />
  );
}
