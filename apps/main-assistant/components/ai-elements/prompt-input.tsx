"use client";

import type { ComponentPropsWithoutRef, FormEvent } from "react";
import { forwardRef, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type PromptInputProps = ComponentPropsWithoutRef<"form"> & {
  onSubmit?: () => void;
};

/**
 * WHY:   The public assistant should keep the same prompt-input composition model as the main web assistant.
 * WHAT:  Exposes lightweight prompt primitives (`PromptInput*`) for body, textarea, tools, and actions.
 * HOW:   Wraps semantic HTML elements with small Tailwind defaults and textarea auto-resize behavior.
 */
export const PromptInput = forwardRef<HTMLFormElement, PromptInputProps>(
  function PromptInput({ className, onSubmit, ...props }, ref) {
    return (
      <form
        ref={ref}
        className={cn("overflow-hidden rounded-[1.25rem]", className)}
        onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          onSubmit?.();
        }}
        {...props}
      />
    );
  },
);

export function PromptInputBody({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return <div className={cn("relative", className)} {...props} />;
}

export const PromptInputTextarea = forwardRef<
  HTMLTextAreaElement,
  ComponentPropsWithoutRef<"textarea">
>(function PromptInputTextarea({ className, rows = 1, ...props }, ref) {
  const innerRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const element = innerRef.current;
    if (!element) return;
    element.style.height = "0px";
    element.style.height = `${element.scrollHeight}px`;
  }, [props.value]);

  return (
    <textarea
      ref={(node) => {
        innerRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      rows={rows}
      className={cn(
        "min-h-[4.25rem] w-full resize-none bg-transparent text-[15px] leading-7 outline-none",
        className,
      )}
      {...props}
    />
  );
});

export function PromptInputFooter({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn("flex items-center justify-between gap-3 px-4 py-3", className)}
      {...props}
    />
  );
}

export function PromptInputTools({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return <div className={cn("flex items-center gap-2", className)} {...props} />;
}

export function PromptInputButton({
  className,
  type = "button",
  ...props
}: ComponentPropsWithoutRef<"button">) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full border text-sm transition disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
