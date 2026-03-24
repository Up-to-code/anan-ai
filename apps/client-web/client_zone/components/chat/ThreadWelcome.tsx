"use client";

import { useLocaleDictionary } from "@/client_zone/components/LocaleProvider";
import type { ChatSuggestion } from "@/client_zone/lib/types";
import { AnanBrandMark } from "./AnanBrandMark";
import { ChatSuggestions } from "./ChatSuggestions";

/**
 * WHY:   The default client route should feel intentional before any message is sent, not empty.
 * WHAT:  Renders the centered welcome state with brand identity and quick entry suggestions.
 * HOW:   Uses a compact vertical stack that stays balanced on desktop and mobile.
 */
export function ThreadWelcome({
  suggestions,
  onSelect,
}: {
  suggestions: ChatSuggestion[];
  onSelect: (prompt: string) => void;
}) {
  const { dictionary } = useLocaleDictionary();

  return (
    <div className="flex min-h-[58vh] flex-col items-center justify-center gap-6 px-2 text-center">
      <AnanBrandMark className="h-14 w-14" />
      <div className="max-w-2xl space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          {dictionary.app.welcomeTitle}
        </h1>
        <p className="text-sm leading-7 text-slate-600 sm:text-base">
          {dictionary.app.welcomeDescription}
        </p>
      </div>
      <div className="w-full max-w-2xl">
        <ChatSuggestions suggestions={suggestions} onSelect={onSelect} />
      </div>
    </div>
  );
}
