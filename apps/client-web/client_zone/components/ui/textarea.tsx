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
          "flex min-h-[80px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300",
          className,
        )}
        {...props}
      />
    );
  },
);
