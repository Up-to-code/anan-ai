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
  active = false,
  onSelect,
}: {
  title: string;
  meta?: string;
  active?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full flex-col items-start rounded-lg px-3 py-2 text-start transition-colors",
        active ? "bg-slate-100 text-slate-950" : "text-slate-700 hover:bg-slate-50",
      )}
    >
      <span className="line-clamp-1 text-sm font-medium">{title}</span>
      {meta ? <span className="mt-1 text-xs text-slate-500">{meta}</span> : null}
    </button>
  );
}
