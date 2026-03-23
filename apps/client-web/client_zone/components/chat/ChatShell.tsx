"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
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
import { useLocaleDictionary } from "@/client_zone/components/LocaleProvider";
import { useClientAssistant } from "@/client_zone/hooks/useClientAssistant";
import type { ChatSuggestion } from "@/client_zone/lib/types";

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

function buildSuggestions(locale: "ar" | "en", mode: "default" | "search" | "loans"): ChatSuggestion[] {
  if (mode === "search") {
    return locale === "ar"
      ? [
          { id: "s1", label: "شقة في الرياض", prompt: "أبحث عن شقة في الرياض" },
          { id: "s2", label: "قارن الخيارات", prompt: "قارن أفضل الخيارات" },
          { id: "s3", label: "استثمار", prompt: "أريد خيارات مناسبة للاستثمار" },
        ]
      : [
          { id: "s1", label: "Riyadh apartment", prompt: "Find an apartment in Riyadh" },
          { id: "s2", label: "Compare options", prompt: "Compare the best options" },
          { id: "s3", label: "Investment", prompt: "Show investment-friendly options" },
        ];
  }

  if (mode === "loans") {
    return locale === "ar"
      ? [
          { id: "l1", label: "فحص الأهلية", prompt: "هل راتبي 15000 مناسب للتمويل؟" },
          { id: "l2", label: "خطة سداد", prompt: "اعرض خطة سداد مبدئية" },
          { id: "l3", label: "قرض لشقة", prompt: "أريد تمويل لشقة في الرياض" },
        ]
      : [
          { id: "l1", label: "Check eligibility", prompt: "Does a SAR 15,000 salary qualify me?" },
          { id: "l2", label: "Payment plan", prompt: "Show me a starter payment plan" },
          { id: "l3", label: "Loan for apartment", prompt: "I need financing for an apartment in Riyadh" },
        ];
  }

  return locale === "ar"
    ? [
        { id: "d1", label: "أبحث عن شقة", prompt: "أبحث عن شقة في الرياض" },
        { id: "d2", label: "فحص التمويل", prompt: "هل راتبي 15000 مناسب للتمويل؟" },
        { id: "d3", label: "قارن الخيارات", prompt: "قارن أفضل الخيارات" },
        { id: "d4", label: "محادثة تجريبية", prompt: "__open_demo__:demo-apartment-search" },
      ]
    : [
        { id: "d1", label: "Find apartment", prompt: "Find an apartment in Riyadh" },
        { id: "d2", label: "Check financing", prompt: "Does a SAR 15,000 salary qualify me?" },
        { id: "d3", label: "Compare options", prompt: "Compare the best options" },
        { id: "d4", label: "Open demo conversation", prompt: "__open_demo__:demo-apartment-search" },
      ];
}

/**
 * WHY:   The simplified client app needs one primary ChatGPT-style shell shared by `/`, `/app`, `/search`, and `/loans`.
 * WHAT:  Renders the centered chat experience, including header, thread, suggestions, and sticky prompt input.
 * HOW:   Adapts its initial prompt and suggestion set by route mode while keeping all replies inside the conversation.
 */
export function ChatShell({
  mode = "default",
  initialPrompt,
}: {
  mode?: "default" | "search" | "loans";
  initialPrompt?: string | null;
}) {
  const searchParams = useSearchParams();
  const { isAuthenticated } = useConvexAuth();
  const { locale } = useLocaleDictionary();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const { dockRef, dockHeight } = useComposerDockHeight();
  const assistant = useClientAssistant({
    locale,
    initialPrompt: initialPrompt ?? searchParams.get("prompt"),
  });
  const suggestions = useMemo(() => buildSuggestions(locale, mode), [locale, mode]);

  function handleSuggestion(prompt: string) {
    if (prompt.startsWith("__open_demo__:")) {
      assistant.openDemoThread(prompt.replace("__open_demo__:", ""));
      return;
    }
    void assistant.submit(prompt);
  }

  return (
    <div className="relative flex min-h-dvh flex-col bg-slate-50">
      <ChatAurora />
      <ChatHeader
        isAuthenticated={isAuthenticated}
        onToggleHistory={() => setIsHistoryOpen(true)}
      />
      <ChatHistorySidebar
        open={isHistoryOpen}
        isAuthenticated={isAuthenticated}
        demoThreads={assistant.demoThreads}
        recentThreads={assistant.recentThreads}
        activeThreadId={assistant.activeThreadId}
        onSelectDemoThread={assistant.openDemoThread}
        onSelectHistoryThread={assistant.openHistoryThread}
        onClose={() => setIsHistoryOpen(false)}
      />
      <ChatConversation
        className="relative z-10"
        contentStyle={{
          paddingBottom: `calc(${dockHeight}px + max(1.5rem, env(safe-area-inset-bottom)))`,
        }}
      >
        {assistant.activeThreadKind === "welcome" ? (
          <ThreadWelcome suggestions={suggestions} onSelect={handleSuggestion} />
        ) : null}

        {assistant.messages.map((message) => (
          <div key={message.id} className="space-y-3">
            {message.role === "assistant" ? (
              <AssistantTurn message={message} />
            ) : (
              <ChatMessage role={message.role}>
              <p>{message.text}</p>
              </ChatMessage>
            )}
          </div>
        ))}

        {assistant.showAuthCallout ? <ChatAuthGateNotice returnTo="/" /> : null}
        {assistant.isSubmitting ? <ChatLoader /> : null}
        {assistant.messages.length > 0 ? (
          <div className="mx-auto w-full max-w-[1080px] pt-2">
            <ChatSuggestions suggestions={suggestions} onSelect={handleSuggestion} />
          </div>
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
