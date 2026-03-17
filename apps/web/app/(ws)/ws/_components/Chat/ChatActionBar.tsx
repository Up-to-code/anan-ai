"use client";

import { FileUp, Building2, Handshake, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

type ChatAction = {
  key: string;
  icon: React.ElementType;
  label: string;
  disabled?: boolean;
  onClick: () => void;
};

/**
 * WHY:   The inbox thread view needs a compact bar of icon+label actions above the composer for business workflows.
 * WHAT:  Renders a row of icon+label action buttons (Share File, Share Project, Share Deal, Private Offer).
 * HOW:   Receives pre-bound action handlers from the parent thread view and renders each as a flat icon+label button.
 */
export default function ChatActionBar({
  actions,
  className,
}: {
  actions: ChatAction[];
  className?: string;
}) {
  return (
    <div
      data-slot="chat-action-bar"
      className={cn(
        "flex items-center gap-1 border-b border-slate-100 bg-slate-50 px-4 py-2 overflow-x-auto",
        className,
      )}
    >
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.key}
            type="button"
            disabled={action.disabled}
            onClick={action.onClick}
            className={cn(
              "flex shrink-0 items-center gap-2 border border-transparent px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] transition-all",
              action.disabled
                ? "cursor-not-allowed text-slate-300"
                : "text-slate-500 hover:border-slate-200 hover:bg-white hover:text-slate-900",
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span>{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export { type ChatAction };
export { FileUp, Building2, Handshake, Tag };
