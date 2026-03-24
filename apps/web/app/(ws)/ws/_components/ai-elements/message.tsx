"use client";

import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: "user" | "assistant" | "system";
};

export const Message = ({ className, from, ...props }: MessageProps) => (
  <div
    className={cn(
      "group flex w-full max-w-[95%] flex-col gap-2",
      from === "user" ? "is-user ml-auto items-end" : "is-assistant items-start",
      className,
    )}
    {...props}
  />
);

export type MessageContentProps = HTMLAttributes<HTMLDivElement>;

export const MessageContent = ({
  children,
  className,
  ...props
}: MessageContentProps) => (
  <div
    className={cn(
      "w-fit min-w-0 max-w-full text-[15px] leading-7",
      "group-[.is-user]:rounded-lg group-[.is-user]:bg-slate-950 group-[.is-user]:px-4 group-[.is-user]:py-3 group-[.is-user]:text-white",
      "group-[.is-assistant]:rounded-lg group-[.is-assistant]:border-2 group-[.is-assistant]:border-slate-200 group-[.is-assistant]:bg-white group-[.is-assistant]:px-4 group-[.is-assistant]:py-3 group-[.is-assistant]:text-slate-900",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);
