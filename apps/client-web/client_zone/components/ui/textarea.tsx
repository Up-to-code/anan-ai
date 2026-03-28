"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * WHY:   The prompt composer needs a lightweight shadcn-style text input surface.
 * WHAT:  Renders a resize-limited textarea for chat prompts.
 * HOW:   Keeps focus and border behavior aligned with the simplified chat design.
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[80px] w-full rounded-[24px] border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] px-4 py-3 text-sm font-medium text-[var(--workspace-bubble-other-foreground)] outline-none transition placeholder:text-[var(--workspace-muted)] focus:border-[color:color-mix(in_srgb,var(--workspace-highlight)_26%,transparent)] focus:bg-[var(--workspace-panel)]",
          className,
        )}
        {...props}
      />
    );
  },
);
