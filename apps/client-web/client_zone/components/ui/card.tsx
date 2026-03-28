import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * WHY:   Chat messages and supporting pages need a neutral shadcn-style surface primitive.
 * WHAT:  Provides a small card wrapper consistent with the chat-first redesign.
 * HOW:   Uses composable subcomponents instead of one-off surface classes.
 */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] shadow-[0_18px_42px_rgba(15,23,42,0.06)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-2 px-5 pb-4 pt-5 sm:px-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "font-black tracking-tight text-[var(--workspace-bubble-other-foreground)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm leading-6 text-[var(--workspace-muted)]", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 pb-5 pt-0 sm:px-6 sm:pb-6", className)} {...props} />;
}
