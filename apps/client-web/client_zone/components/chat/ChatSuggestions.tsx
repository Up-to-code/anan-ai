"use client";

import type { ChatSuggestion } from "@/client_zone/lib/types";
import { Button } from "@/client_zone/components/ui/button";

/**
 * WHY:   A chat-first empty state still needs a fast way to start common buyer journeys.
 * WHAT:  Renders prompt suggestion chips above the composer or in the empty thread state.
 * HOW:   Uses small outline buttons so suggestions do not compete with the conversation itself.
 */
export function ChatSuggestions({
  suggestions,
  onSelect,
}: {
  suggestions: ChatSuggestion[];
  onSelect: (prompt: string) => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
      {suggestions.map((suggestion) => (
        <Button
          key={suggestion.id}
          variant="outline"
          size="sm"
          onClick={() => onSelect(suggestion.prompt)}
          className="h-auto rounded-lg px-3 py-2 text-start text-xs sm:text-sm"
        >
          {suggestion.label}
        </Button>
      ))}
    </div>
  );
}
