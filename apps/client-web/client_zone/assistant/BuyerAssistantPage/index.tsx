"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { MessageSquareText, History, Plus, Building2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/convexApi";
import { useLocale } from "@/app/_components/LocaleProvider";
import { Button } from "@/components/ui/button";
import { ChatMessageArea, ChatMessageAreaContent, ChatMessageAreaScrollButton } from "@/components/ui/chat-message-area";
import { ChatMessage } from "@/components/ui/chat-message";
import { ChatSuggestions } from "@/components/ui/chat-suggestions";
import { AssistantTurn } from "@/components/assistant/AssistantTurn";
import BuyerAssistantComposer from "./BuyerAssistantComposer";
import BuyerHistoryDrawer from "./BuyerHistoryDrawer";
import { useBuyerAssistant } from "./useBuyerAssistant";

/**
 * WHY:   Buyers need a dedicated assistant-first shell that reuses the web brand system without inheriting workspace complexity.
 * WHAT:  Renders the main buyer assistant page with header actions, scrollable conversation, prompt chips, and history drawer.
 * HOW:   Composes a buyer-specific shell around the shared primitives and the existing `user_zone/web` Convex contract.
 */
export default function BuyerAssistantPage() {
  const { dictionary, locale } = useLocale();
  const searchParams = useSearchParams();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const requestedThreadId = searchParams.get("threadId");
  const requestedPropertyId = searchParams.get("propertyId");
  const preselectedProperty =
    useQuery(
      api.user_zone.web.properties.getPropertyDetail,
      requestedPropertyId ? { propertyId: requestedPropertyId as never } : "skip",
    ) ?? null;

  const assistant = useBuyerAssistant({
    locale,
    requestedThreadId,
    preselectedProperty,
  });

  const latestSuggestions = useMemo(
    () => assistant.messages.at(-1)?.suggestedPrompts?.map((prompt, index) => ({
      id: `${index}-${prompt}`,
      label: prompt,
      prompt,
    })) ?? assistant.suggestions,
    [assistant.messages, assistant.suggestions],
  );

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,var(--workspace-shell)_0%,var(--workspace-canvas)_22%,var(--background)_100%)] text-slate-950 dark:text-slate-50">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-[28px] border border-[var(--workspace-border)] bg-[color:color-mix(in_srgb,var(--workspace-panel)_92%,white)] px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon-sm" onClick={() => setIsHistoryOpen(true)}>
              <History className="h-4 w-4" />
            </Button>
            <Link href="/app/history">
              <Button variant="ghost" size="icon-sm">
                <MessageSquareText className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="text-right">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--workspace-muted)]">
              {dictionary.assistant.shellEyebrow}
            </p>
            <h1 className="text-base font-black text-slate-900 dark:text-slate-50">
              {dictionary.assistant.shellTitle}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="outline" size="sm" className="rounded-full">
                <Building2 className="me-2 h-4 w-4" />
                {dictionary.nav.home}
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="rounded-full" onClick={assistant.resetConversation}>
              <Plus className="me-2 h-4 w-4" />
              {dictionary.assistant.newConversation}
            </Button>
          </div>
        </header>

        <section className="mt-5 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[36px] border border-[var(--workspace-border)] bg-[color:color-mix(in_srgb,var(--workspace-panel)_92%,white)] shadow-[0_25px_100px_rgba(15,23,42,0.08)]">
          {assistant.showSignInPrompt ? (
            <div data-testid="client-auth-gate" className="border-b border-[var(--workspace-border)] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_8%,white)] px-5 py-4 text-right text-sm text-slate-700 dark:bg-[color:color-mix(in_srgb,var(--workspace-highlight)_12%,var(--workspace-panel))] dark:text-slate-200">
              <span className="font-black">{dictionary.assistant.signInPromptTitle}</span>
              <span className="mx-2">{dictionary.assistant.signInPromptBody}</span>
              <Link data-testid="client-auth-gate-signin-link" href="/signin?intent=advisor&returnTo=/app" className="font-black text-[var(--workspace-highlight)] underline-offset-4 hover:underline">
                {dictionary.nav.signIn}
              </Link>
            </div>
          ) : null}

          <div className="flex min-h-0 flex-1 flex-col">
            <ChatMessageArea className="min-h-0 flex-1 px-4 sm:px-6">
              <ChatMessageAreaContent data-testid="client-assistant-thread" className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-1 py-8">
                {assistant.messages.map((message) => (
                  <div key={message.id}>
                    {message.role === "assistant" ? (
                      <AssistantTurn message={message} />
                    ) : (
                      <ChatMessage message={message} />
                    )}
                  </div>
                ))}
              </ChatMessageAreaContent>
              <ChatMessageAreaScrollButton />
            </ChatMessageArea>

            <div className="sticky bottom-0 border-t border-[var(--workspace-border)] bg-[linear-gradient(to_top,color-mix(in_srgb,var(--workspace-highlight)_6%,white),transparent_86%)] px-4 py-4 backdrop-blur sm:px-6">
              {assistant.sendError ? (
                <div className="mb-4 rounded-[24px] border border-red-500/15 bg-red-50/60 px-5 py-3 text-right text-sm font-bold text-red-600 dark:bg-red-500/10 dark:text-red-300">
                  {assistant.sendError}
                </div>
              ) : null}
              <div className="mx-auto w-full max-w-3xl">
                <ChatSuggestions
                  suggestions={latestSuggestions}
                  onSelect={(suggestion) => void assistant.sendMessage(suggestion.prompt)}
                />
                <BuyerAssistantComposer
                  value={assistant.draft}
                  isSending={assistant.isSending}
                  placeholder={dictionary.assistant.composerPlaceholder}
                  onChange={assistant.setDraft}
                  onSend={() => void assistant.sendMessage()}
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      <BuyerHistoryDrawer
        open={isHistoryOpen}
        threads={assistant.recentThreads}
        onClose={() => setIsHistoryOpen(false)}
      />
    </main>
  );
}
