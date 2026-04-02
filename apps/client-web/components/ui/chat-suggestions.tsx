import type { BuyerChatSuggestion } from "@/client_zone/shared/types";
import { Button } from "./button";

interface ChatSuggestionsProps {
  suggestions: BuyerChatSuggestion[];
  onSelect: (suggestion: BuyerChatSuggestion) => void;
}

export function ChatSuggestions({ suggestions, onSelect }: ChatSuggestionsProps) {
  if (!suggestions.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4 animate-zone-page-enter">
      {suggestions.map((s) => (
        <Button
          key={s.id}
          variant="outline"
          size="sm"
          className="rounded-full text-xs font-semibold px-4 border-primary/20 hover:border-primary/50 text-primary"
          onClick={() => onSelect(s)}
        >
          {s.label}
        </Button>
      ))}
    </div>
  );
}
