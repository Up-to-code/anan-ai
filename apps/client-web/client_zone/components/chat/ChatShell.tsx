"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useConvexAuth } from "convex/react";
import { ChatHeader } from "./ChatHeader";
import { ChatConversation } from "./ChatConversation";
import { ChatMessage } from "./ChatMessage";
import { ChatPromptInput } from "./ChatPromptInput";
import { ChatSuggestions } from "./ChatSuggestions";
import { ChatLoader } from "./ChatLoader";
import { ChatAuthGateNotice } from "./ChatAuthGateNotice";
import { ChatAurora } from "./ChatAurora";
import { ChatHistorySidebar } from "./ChatHistorySidebar";
import { AssistantTurn } from "./AssistantTurn";
import { ThreadWelcome } from "./ThreadWelcome";
import { ClientAssistantColumn } from "./chatLayout";
import { useLocaleDictionary } from "@/client_zone/components/LocaleProvider";
import { useClientAssistant } from "@/client_zone/hooks/useClientAssistant";
import { buildChatSuggestions } from "@/client_zone/lib/chatSuggestions";

function useComposerDockHeight() {
  const dockRef = useRef<HTMLDivElement | null>(null);
  const [dockHeight, setDockHeight] = useState(176);

  useEffect(() => {
    const element = dockRef.current;
    if (!element) return;

    const updateHeight = () => {
      setDockHeight(element.offsetHeight || 176);
    };

    updateHeight();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(() => updateHeight());
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { dockRef, dockHeight };
}

/**
 * WHY:   The simplified client app needs one primary ChatGPT-style shell shared by `/`, `/app`, `/search`, and `/loans`.
 * WHAT:  Renders the centered chat experience, including header, thread, suggestions, and sticky prompt input.
 * HOW:   Adapts its initial prompt and suggestion set by route mode while keeping all replies inside the conversation.
 */
export function ChatShell({
  mode = "default",
  initialPrompt,
  initialThreadId,
}: {
  mode?: "default" | "search" | "loans";
  initialPrompt?: string | null;
  initialThreadId?: string | null;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useConvexAuth();
  const { locale } = useLocaleDictionary();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const { dockRef, dockHeight } = useComposerDockHeight();
  const assistant = useClientAssistant({
    locale,
    initialPrompt: initialPrompt ?? searchParams.get("prompt"),
    initialThreadId: initialThreadId ?? searchParams.get("threadId"),
  });
  const suggestions = useMemo(() => buildChatSuggestions(locale, mode), [locale, mode]);
  const returnTo = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  return (
    <div className="relative flex min-h-dvh flex-col bg-[var(--workspace-shell)] text-[var(--workspace-bubble-other-foreground)]">
      <ChatAurora />
      <ChatHeader
        isAuthenticated={isAuthenticated}
        onToggleHistory={() => setIsHistoryOpen(true)}
      />
      <ChatHistorySidebar
        open={isHistoryOpen}
        isAuthenticated={isAuthenticated}
        recentThreads={assistant.recentThreads}
        activeThreadId={assistant.activeThreadId}
        onSelectHistoryThread={assistant.openHistoryThread}
        onClose={() => setIsHistoryOpen(false)}
      />
      <ChatConversation
        className="relative z-10"
        contentStyle={{
          paddingBottom: `calc(${dockHeight}px + 4rem + env(safe-area-inset-bottom))`,
        }}
      >
        {assistant.activeThreadKind === "welcome" ? (
          <ThreadWelcome suggestions={suggestions} onSelect={(prompt) => void assistant.submit(prompt)} />
        ) : null}

        {assistant.messages.map((message) => (
          <div key={message.id} className="w-full">
            {message.role === "assistant" ? (
              <AssistantTurn message={message} />
            ) : (
              <ChatMessage role={message.role}>
                <p>{message.text}</p>
              </ChatMessage>
            )}
          </div>
        ))}

        {assistant.showAuthCallout ? <ChatAuthGateNotice returnTo={returnTo} /> : null}
        {assistant.isSubmitting ? <ChatLoader /> : null}
        {assistant.messages.length > 0 ? (
          <ClientAssistantColumn className="pt-2">
            <ChatSuggestions
              suggestions={suggestions}
              onSelect={(prompt) => void assistant.submit(prompt)}
            />
          </ClientAssistantColumn>
        ) : null}
      </ChatConversation>
      <ChatPromptInput
        dockRef={dockRef}
        className="shrink-0"
        value={assistant.draft}
        onChange={assistant.setDraft}
        onSubmit={() => void assistant.submit()}
        disabled={assistant.isSubmitting}
      />
    </div>
  );
}
