"use client";

import type { ChatSuggestion } from "@/client_zone/lib/types";
import { Button } from "@/client_zone/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * WHY:   A chat-first empty state still needs a fast way to start common buyer journeys.
 * WHAT:  Renders prompt suggestion chips above the composer or in the empty thread state.
 * HOW:   Uses small outline buttons so suggestions do not compete with the conversation itself.
 */
export function ChatSuggestions({
  suggestions,
  onSelect,
  className,
}: {
  suggestions: ChatSuggestion[];
  onSelect: (prompt: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {suggestions.map((suggestion) => (
        <Button
          key={suggestion.id}
          variant="outline"
          size="sm"
          onClick={() => onSelect(suggestion.prompt)}
          className="h-auto min-h-11 max-w-full justify-start rounded-full border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] px-4 py-2 text-start text-xs normal-case shadow-sm sm:text-sm"
        >
          {suggestion.label}
        </Button>
      ))}
    </div>
  );
}
