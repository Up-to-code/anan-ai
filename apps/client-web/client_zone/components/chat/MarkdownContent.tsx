"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

const components: Partial<Components> = {
  h1: ({ children, ...props }) => (
    <h1
      className="mt-0 text-[1.7rem] font-black tracking-tight text-[var(--workspace-bubble-other-foreground)] sm:text-[1.9rem]"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2
      className="mt-8 text-[1.25rem] font-black tracking-tight text-[var(--workspace-bubble-other-foreground)]"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      className="mt-6 text-[1.05rem] font-extrabold text-[var(--workspace-bubble-other-foreground)]"
      {...props}
    >
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p
      className="mt-0 text-[15px] leading-8 text-[var(--workspace-bubble-other-foreground)]/90 sm:text-[16px]"
      {...props}
    >
      {children}
    </p>
  ),
  strong: ({ children, ...props }) => (
    <strong
      className="font-black text-[var(--workspace-bubble-other-foreground)]"
      {...props}
    >
      {children}
    </strong>
  ),
  a: ({ children, ...props }) => (
    <a
      className="font-bold text-[var(--workspace-highlight)] underline underline-offset-4"
      target="_blank"
      rel="noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
  ul: ({ children, ...props }) => (
    <ul
      className="my-4 ms-5 space-y-2 list-disc marker:text-[var(--workspace-highlight)]"
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol
      className="my-4 ms-5 space-y-2 list-decimal marker:font-black marker:text-[var(--workspace-highlight)]"
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li
      className="mt-0 text-[15px] leading-8 text-[var(--workspace-bubble-other-foreground)]/88 sm:text-[16px]"
      {...props}
    >
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="rounded-[24px] border-s-2 border-[color:var(--workspace-highlight)] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_6%,var(--workspace-panel))] px-5 py-4 text-[var(--workspace-bubble-other-foreground)]/88"
      {...props}
    >
      {children}
    </blockquote>
  ),
  table: ({ children, ...props }) => (
    <div className="my-4 overflow-x-auto rounded-[24px] border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)]">
      <table className="min-w-full border-collapse text-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead
      className="bg-[color:color-mix(in_srgb,var(--workspace-elevated)_78%,white)]"
      {...props}
    >
      {children}
    </thead>
  ),
  th: ({ children, ...props }) => (
    <th
      className="px-4 py-3 text-start text-xs font-black uppercase tracking-[0.18em] text-[var(--workspace-muted)]"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td
      className="border-t border-[color:var(--workspace-border)] px-4 py-3 text-[15px] font-medium text-[var(--workspace-bubble-other-foreground)]"
      {...props}
    >
      {children}
    </td>
  ),
  hr: (props) => (
    <hr
      className="my-6 border-[color:color-mix(in_srgb,var(--workspace-border)_92%,transparent)]"
      {...props}
    />
  ),
  code: ({ children, className, ...props }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <code
          className={cn(
            "block whitespace-pre-wrap break-words rounded-[22px] bg-slate-950 px-4 py-4 text-sm text-slate-50",
            className,
          )}
          {...props}
        >
          {children}
        </code>
      );
    }

    return (
      <code
        className="rounded-md bg-[var(--workspace-elevated)] px-1.5 py-0.5 text-[0.92em] font-semibold text-[var(--workspace-bubble-other-foreground)]"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }) => (
    <pre
      className="my-4 overflow-x-auto rounded-[22px] bg-slate-950 p-4 text-sm text-slate-50"
      {...props}
    >
      {children}
    </pre>
  ),
};

/**
 * WHY:   Assistant prose in the public client should read with the same markdown hierarchy as the workspace assistant.
 * WHAT:  Renders markdown-ish assistant copy with shared heading, table, list, and callout styling.
 * HOW:   Uses `react-markdown` plus GFM/raw support and applies workspace-aligned chrome through custom renderers.
 */
export function MarkdownContent({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "space-y-4 break-words [&>*+*]:mt-4",
        className,
      )}
    >
      <ReactMarkdown
        components={components}
        rehypePlugins={[rehypeRaw]}
        remarkPlugins={[remarkGfm]}
      >
        {content || ""}
      </ReactMarkdown>
    </div>
  );
}
