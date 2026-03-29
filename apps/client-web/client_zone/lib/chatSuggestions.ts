import { buildBuyerChatSuggestions } from "./buyerAssistantShared";
import type { ChatSuggestion, Locale } from "./types";

/**
 * WHY:   The chat surface needs route-aware prompt starters without hardcoding them inside the shell component.
 * WHAT:  Returns the visible quick-start suggestions for the requested mode and locale.
 * HOW:   Delegates to the shared buyer assistant suggestion set so web and mobile share the same product prompts.
 */
export function buildChatSuggestions(
  locale: Locale,
  mode: "default" | "search" | "loans",
): ChatSuggestion[] {
  return buildBuyerChatSuggestions(locale, mode);
}
