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
      "group-[.is-user]:rounded-2xl group-[.is-user]:rounded-br-md group-[.is-user]:bg-slate-950 group-[.is-user]:px-4 group-[.is-user]:py-3 group-[.is-user]:text-white group-[.is-user]:shadow-[0_10px_24px_-18px_rgba(15,23,42,0.9)]",
      "group-[.is-assistant]:rounded-2xl group-[.is-assistant]:rounded-bl-md group-[.is-assistant]:border group-[.is-assistant]:border-slate-200 group-[.is-assistant]:bg-white group-[.is-assistant]:px-4 group-[.is-assistant]:py-3 group-[.is-assistant]:text-slate-900 group-[.is-assistant]:shadow-[0_10px_28px_-22px_rgba(15,23,42,0.45)]",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);
