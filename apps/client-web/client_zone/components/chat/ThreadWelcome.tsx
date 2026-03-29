"use client";

import { useLocaleDictionary } from "@/client_zone/components/LocaleProvider";
import type { ChatSuggestion } from "@/client_zone/lib/types";
import { AnanBrandMark } from "./AnanBrandMark";
import { ChatSuggestions } from "./ChatSuggestions";
import { ClientAssistantColumn } from "./chatLayout";

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
    <ClientAssistantColumn className="flex min-h-[54vh] flex-col items-center justify-center gap-8 px-2 text-center">
      <div className="rounded-full border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-[var(--workspace-muted)]">
        Buyer Assistant
      </div>
      <div className="flex h-20 w-20 items-center justify-center rounded-[30px] border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] shadow-sm">
        <AnanBrandMark className="h-14 w-14" />
      </div>
      <div className="max-w-2xl space-y-4">
        <h1 className="text-3xl font-black tracking-tight text-[var(--workspace-bubble-other-foreground)] sm:text-4xl">
          {dictionary.app.welcomeTitle}
        </h1>
        <p className="text-sm leading-7 text-[var(--workspace-muted)] sm:text-base">
          {dictionary.app.welcomeDescription}
        </p>
      </div>
      <div className="w-full max-w-3xl">
        <ChatSuggestions
          suggestions={suggestions}
          onSelect={onSelect}
          className="justify-center"
        />
      </div>
    </ClientAssistantColumn>
  );
}
