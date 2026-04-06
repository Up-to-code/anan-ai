import type { BuyerChatSuggestion } from "@/client_zone/shared/types";
import { Button } from "./button";

interface ChatSuggestionsProps {
  suggestions: BuyerChatSuggestion[];
  onSelect: (suggestion: BuyerChatSuggestion) => void;
}

/**
 * WHY:   Suggested prompts should feel like lightweight conversational chips instead of full-size actions.
 * WHAT:  Renders tappable prompt pills that stay in a single horizontal row and inherit the buyer assistant surface styling.
 * HOW:   Uses a no-wrap scroll row, compact content-fit buttons, and background-mixed surfaces that adapt to light and dark themes.
 */
export function ChatSuggestions({ suggestions, onSelect }: ChatSuggestionsProps) {
  if (!suggestions.length) return null;

  return (
    <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1 animate-zone-page-enter [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {suggestions.map((s) => (
        <Button
          key={s.id}
          variant="ghost"
          className="h-auto shrink-0 rounded-full border border-[color:color-mix(in_srgb,var(--workspace-border)_88%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-panel)_82%,transparent)] px-[1ch] py-[0.42em] text-[12px] leading-none font-semibold whitespace-nowrap text-[var(--workspace-bubble-other-foreground)] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-sm hover:border-[color:color-mix(in_srgb,var(--workspace-highlight)_22%,var(--workspace-border))] hover:bg-[color:color-mix(in_srgb,var(--workspace-panel)_92%,var(--workspace-highlight-soft))] hover:text-[var(--workspace-highlight-strong)] focus-visible:ring-[color:color-mix(in_srgb,var(--workspace-highlight)_24%,transparent)]"
          onClick={() => onSelect(s)}
        >
          {s.label}
        </Button>
      ))}
    </div>
  );
}
