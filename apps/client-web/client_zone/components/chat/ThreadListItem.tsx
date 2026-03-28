"use client";

import { cn } from "@/lib/utils";

/**
 * WHY:   The upgraded history drawer should expose conversations as fast, scannable rows instead of heavy cards.
 * WHAT:  Renders a single selectable thread row with optional timestamp and active state.
 * HOW:   Uses minimal structure so the drawer behaves like a normal product history list.
 */
export function ThreadListItem({
  title,
  meta,
  preview,
  active = false,
  onSelect,
}: {
  title: string;
  meta?: string;
  preview?: string;
  active?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full flex-col items-start rounded-[22px] border px-4 py-3 text-start transition-all",
        active
          ? "border-[color:color-mix(in_srgb,var(--workspace-highlight)_24%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_8%,var(--workspace-panel))] text-[var(--workspace-bubble-other-foreground)] shadow-sm"
          : "border-transparent text-[var(--workspace-bubble-other-foreground)] hover:border-[color:var(--workspace-border)] hover:bg-[var(--workspace-panel)]",
      )}
    >
      <span className="line-clamp-1 text-sm font-black">{title}</span>
      {preview ? (
        <span className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--workspace-muted)]">
          {preview}
        </span>
      ) : null}
      {meta ? (
        <span className="mt-2 text-[11px] font-black uppercase tracking-[0.16em] text-[var(--workspace-muted)]">
          {meta}
        </span>
      ) : null}
    </button>
  );
}
