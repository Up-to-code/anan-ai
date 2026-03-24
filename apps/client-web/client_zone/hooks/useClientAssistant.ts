"use client";

import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { useMutation, useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/convexApi";
import {
  getMockConversationThreads,
} from "@/client_zone/lib/mockAssistant/mockConversation";
import { getMockThreadSummaries } from "@/client_zone/lib/mockAssistant/mockHistory";
import { buildMockAssistantReply } from "@/client_zone/lib/mockAssistant/mockReplies";
import type {
  AssistantMessage,
  ClientProperty,
  ClientThreadKind,
  HistorySnapshot,
  Locale,
  ThreadSummary,
} from "../lib/types";

const HISTORY_STORAGE_KEY = "anan-client-history";
const HISTORY_STORAGE_EVENT = "anan-client-history-updated";

function loadHistory() {
  if (typeof window === "undefined") return [] as HistorySnapshot[];
  try {
    const value = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    return value ? (JSON.parse(value) as HistorySnapshot[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(snapshot: HistorySnapshot) {
  if (typeof window === "undefined") return;
  const nextHistory = [snapshot, ...loadHistory().filter((item) => item.id !== snapshot.id)].slice(0, 12);
  window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(nextHistory));
  window.dispatchEvent(new CustomEvent(HISTORY_STORAGE_EVENT));
}

function buildHistorySnapshot({
  locale,
  title,
  currentMessages,
}: {
  locale: Locale;
  title: string;
  currentMessages: AssistantMessage[];
}): HistorySnapshot {
  const summary = currentMessages
    .filter((message) => message.role === "assistant")
    .at(-1)?.text ?? title;

  return {
    id: `thread-${Date.now()}`,
    createdAt: Date.now(),
    locale,
    title,
    summary,
    messages: currentMessages,
  };
}

function buildThreadSummary(snapshot: HistorySnapshot): ThreadSummary {
  return {
    id: snapshot.id,
    kind: "live",
    title: snapshot.title,
    createdAt: snapshot.createdAt,
  };
}

/**
 * WHY:   The client assistant page needs one stateful source of truth for welcome mode, demo threads, mock chat, and sign-in gating.
 * WHAT:  Manages the active thread, prompt-driven mock replies, local history, and advisor handoff flow.
 * HOW:   Keeps the main session mock-first while leaving only handoff mutation live for supporting flows.
 */
export function useClientAssistant({
  locale,
  initialPrompt,
}: {
  locale: Locale;
  initialPrompt?: string | null;
}) {
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const createQualifiedHandoff = useMutation(api.user_zone.mobile.assistant.createQualifiedHandoff);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [activeProperty, setActiveProperty] = useState<ClientProperty | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthCallout, setShowAuthCallout] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [activeThreadKind, setActiveThreadKind] = useState<ClientThreadKind>("welcome");
  const [recentThreads, setRecentThreads] = useState<HistorySnapshot[]>(() => loadHistory());
  const hasSubmittedInitialPrompt = useRef(false);

  const demoConversations = useMemo(() => getMockConversationThreads(locale), [locale]);
  const demoThreads = useMemo(() => getMockThreadSummaries(locale), [locale]);

  const syncHistory = useEffectEvent(() => {
    setRecentThreads(loadHistory());
  });

  const submitInitialPrompt = useEffectEvent((prompt: string) => {
    void submit(prompt);
  });

  useEffect(() => {
    const sync = () => syncHistory();
    window.addEventListener("storage", sync);
    window.addEventListener(HISTORY_STORAGE_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(HISTORY_STORAGE_EVENT, sync);
    };
  }, []);

  async function submit(prompt = draft) {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    const baseMessages = activeThreadKind === "demo" ? [...messages] : messages;
    const userMessage: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
    };

    const nextMessages = [...baseMessages, userMessage];
    setMessages(nextMessages);
    setDraft("");
    setIsSubmitting(true);
    setActiveThreadKind("live");
    setActiveThreadId((current) =>
      !current || activeThreadKind === "demo" ? `live-${Date.now()}` : current,
    );

    try {
      const assistantMessage = buildMockAssistantReply({
        locale,
        prompt: trimmed,
      });

      const completeMessages = [...nextMessages, assistantMessage];
      setMessages(completeMessages);

      if (assistantMessage.properties?.[0]) {
        setActiveProperty(assistantMessage.properties[0]);
      }

      if (isAuthenticated) {
        const snapshot = buildHistorySnapshot({
          locale,
          title: trimmed,
          currentMessages: completeMessages,
        });
        saveHistory(snapshot);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function askAboutProperty(property: ClientProperty) {
    setActiveProperty(property);
    void submit(locale === "ar" ? `أريد تفاصيل أكثر عن ${property.title}` : `Tell me more about ${property.title}`);
  }

  async function requestAdvisor() {
    if (!activeProperty) return;
    if (!isAuthenticated) {
      setShowAuthCallout(true);
      return;
    }

    const order = await createQualifiedHandoff({
      propertyId: activeProperty.id as never,
      message: messages.at(-1)?.text ?? activeProperty.title,
    });

    window.localStorage.setItem(
      "anan-client-last-handoff",
      JSON.stringify({
        orderId: order.orderId,
        propertyTitle: activeProperty.title,
        createdAt: Date.now(),
      }),
    );

    router.push(`/app/handoff?orderId=${encodeURIComponent(String(order.orderId))}`);
  }

  function openDemoThread(threadId: string) {
    const thread = demoConversations.find((item) => item.id === threadId);
    if (!thread) return;

    setMessages(thread.messages);
    setActiveProperty(thread.messages.flatMap((message) => message.properties ?? []).at(0) ?? null);
    setActiveThreadId(thread.id);
    setActiveThreadKind("demo");
    setShowAuthCallout(false);
  }

  function openHistoryThread(threadId: string) {
    const thread = recentThreads.find((item) => item.id === threadId);
    if (!thread) return;

    setMessages(thread.messages);
    setActiveProperty(thread.messages.flatMap((message) => message.properties ?? []).at(0) ?? null);
    setActiveThreadId(thread.id);
    setActiveThreadKind("live");
    setShowAuthCallout(false);
  }

  function resetToWelcome() {
    setDraft("");
    setMessages([]);
    setActiveProperty(null);
    setShowAuthCallout(false);
    setActiveThreadId(null);
    setActiveThreadKind("welcome");
    hasSubmittedInitialPrompt.current = true;
  }

  useEffect(() => {
    if (!initialPrompt || hasSubmittedInitialPrompt.current) return;
    hasSubmittedInitialPrompt.current = true;
    submitInitialPrompt(initialPrompt);
  }, [initialPrompt]);

  return {
    draft,
    messages,
    activeProperty,
    isSubmitting,
    showAuthCallout,
    activeThreadId,
    activeThreadKind,
    demoThreads,
    recentThreads: recentThreads.map(buildThreadSummary),
    setDraft,
    setShowAuthCallout,
    submit,
    askAboutProperty,
    requestAdvisor,
    openDemoThread,
    openHistoryThread,
    resetToWelcome,
  };
}

/**
 * WHY:   Supporting pages still need direct access to locally saved assistant snapshots.
 * WHAT:  Returns locally saved client assistant snapshots.
 * HOW:   Subscribes to the shared history storage event and localStorage updates.
 */
export function useClientHistory() {
  const [history, setHistory] = useState<HistorySnapshot[]>(() => loadHistory());

  useEffect(() => {
    const syncHistory = () => setHistory(loadHistory());

    window.addEventListener("storage", syncHistory);
    window.addEventListener(HISTORY_STORAGE_EVENT, syncHistory);

    return () => {
      window.removeEventListener("storage", syncHistory);
      window.removeEventListener(HISTORY_STORAGE_EVENT, syncHistory);
    };
  }, []);

  return history;
}
