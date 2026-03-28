import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const CLIENT_ASSISTANT_COLUMN_CLASS_NAME = "mx-auto w-full max-w-4xl";

/**
 * WHY:   The client assistant needs one stable width primitive so prose, cards, loaders, and notices align exactly.
 * WHAT:  Exposes the shared centered column used across the public assistant thread.
 * HOW:   Wraps content in a single max-width container and lets callers extend spacing per state.
 */
export function ClientAssistantColumn({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(CLIENT_ASSISTANT_COLUMN_CLASS_NAME, className)}
      {...props}
    />
  );
}
