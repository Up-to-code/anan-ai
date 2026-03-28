"use client";

import { useEffect, useRef, useState } from "react";
import { useAction, useMutation, useQuery, useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/convexApi";
import { capturePostHogEvent } from "@/lib/posthog";
import { buildClientUiTurn } from "@/client_zone/lib/clientAgUi";
import type {
  AssistantMessage,
  ClientOrderDetail,
  ClientProperty,
  ClientThreadKind,
  Locale,
  PersistedThreadMessage,
  ThreadSummary,
} from "../lib/types";
import {
  getLatestThreadProperty,
  toAssistantMessage,
  toTranscriptSeedMessages,
} from "../lib/threadPersistence";

const GUEST_THREAD_STORAGE_KEY = "anan-client-guest-thread";

type GuestThreadSnapshot = {
  locale: Locale;
  activeThreadId: string | null;
  activeThreadKind: Exclude<ClientThreadKind, "demo">;
  activeProperty: ClientProperty | null;
  messages: AssistantMessage[];
};

function loadGuestThreadSnapshot() {
  if (typeof window === "undefined") return null as GuestThreadSnapshot | null;
  try {
    const value = window.sessionStorage.getItem(GUEST_THREAD_STORAGE_KEY);
    return value ? (JSON.parse(value) as GuestThreadSnapshot) : null;
  } catch {
    return null;
  }
}

function saveGuestThreadSnapshot(snapshot: GuestThreadSnapshot) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(GUEST_THREAD_STORAGE_KEY, JSON.stringify(snapshot));
}

function clearGuestThreadSnapshot() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(GUEST_THREAD_STORAGE_KEY);
}

function describeFailure(error: unknown) {
  if (error instanceof Error && error.message.trim()) return error.message;
  return "unknown_failure";
}

function trackAssistantCardViews(cards: AssistantMessage["cards"]) {
  if (!cards?.length) return;

  cards.forEach((card) => {
    switch (card.type) {
      case "payment_plan":
        capturePostHogEvent("client_payment_plan_viewed", {
          cardType: card.type,
          durationMonths: card.durationMonths,
        });
        break;
      case "loan_calculator":
        capturePostHogEvent("client_loan_calculator_viewed", {
          cardType: card.type,
          years: card.years,
          interestRate: card.interestRate,
        });
        break;
      case "roi_summary":
      case "roi_projection":
        capturePostHogEvent("client_roi_viewed", {
          cardType: card.type,
        });
        break;
      case "broker_profile":
        capturePostHogEvent("client_broker_profile_viewed", {
          brokerName: card.brokerName,
        });
        break;
      default:
        break;
    }
  });
}

function mapThreadSummary(summary: {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  preview?: string;
}): ThreadSummary {
  return {
    id: String(summary.id),
    title: summary.title,
    createdAt: summary.createdAt,
    updatedAt: summary.updatedAt,
    preview: summary.preview,
  };
}

/**
 * WHY:   The client assistant page needs one stateful source of truth for guest chat, saved threads, and advisor handoff flow.
 * WHAT:  Manages the active conversation, auth-aware persistence, and guest-to-auth transcript promotion.
 * HOW:   Uses transient browser state for guests and switches to persisted Convex threads once the buyer signs in.
 */
export function useClientAssistant({
  locale,
  initialPrompt,
  initialThreadId,
}: {
  locale: Locale;
  initialPrompt?: string | null;
  initialThreadId?: string | null;
}) {
  const initialGuestSnapshot = loadGuestThreadSnapshot();
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const createQualifiedHandoff = useMutation(api.user_zone.mobile.assistant.createQualifiedHandoff);
  const askClientAssistant = useAction(api.user_zone.web.assistant.askClientAssistant);
  const seedClientThreadFromTranscript = useMutation(api.user_zone.web.threads.seedClientThreadFromTranscript);
  const persistedThreads = useQuery(
    api.user_zone.web.threads.listClientThreads,
    isAuthenticated ? {} : "skip",
  );
  const persistedMessages = useQuery(
    api.user_zone.web.threads.getClientThreadMessages,
    isAuthenticated && initialThreadId ? { threadId: initialThreadId as never } : "skip",
  );
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<AssistantMessage[]>(() => initialGuestSnapshot?.messages ?? []);
  const [activeProperty, setActiveProperty] = useState<ClientProperty | null>(
    () => initialGuestSnapshot?.activeProperty ?? null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthCallout, setShowAuthCallout] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(
    initialThreadId ?? initialGuestSnapshot?.activeThreadId ?? null,
  );
  const [activeThreadKind, setActiveThreadKind] = useState<ClientThreadKind>(
    initialThreadId || initialGuestSnapshot?.messages.length ? "live" : "welcome",
  );
  const hasSubmittedInitialPrompt = useRef(false);
  const hasMigratedGuestThread = useRef(false);
  const submitInitialPromptRef = useRef<(prompt: string) => void>(() => {});
  submitInitialPromptRef.current = (prompt: string) => {
    void submit(prompt);
  };

  useEffect(() => {
    if (initialThreadId && activeThreadId !== initialThreadId) {
      setActiveThreadId(initialThreadId);
      setActiveThreadKind("live");
    }
  }, [activeThreadId, initialThreadId]);

  useEffect(() => {
    if (!isAuthenticated || !activeThreadId) return;
    const sourceMessages = initialThreadId === activeThreadId ? persistedMessages : undefined;
    if (!sourceMessages) return;

    const nextMessages = (sourceMessages as PersistedThreadMessage[]).map(toAssistantMessage);
    setMessages(nextMessages);
    setActiveProperty(getLatestThreadProperty(nextMessages));
    setActiveThreadKind(nextMessages.length > 0 ? "live" : "welcome");
  }, [activeThreadId, initialThreadId, isAuthenticated, persistedMessages]);

  const activePersistedMessages = useQuery(
    api.user_zone.web.threads.getClientThreadMessages,
    isAuthenticated && activeThreadId && activeThreadId !== initialThreadId
      ? { threadId: activeThreadId as never }
      : "skip",
  );

  useEffect(() => {
    if (!isAuthenticated || !activeThreadId || activeThreadId === initialThreadId) return;
    if (!activePersistedMessages) return;

    const nextMessages = (activePersistedMessages as PersistedThreadMessage[]).map(toAssistantMessage);
    setMessages(nextMessages);
    setActiveProperty(getLatestThreadProperty(nextMessages));
    setActiveThreadKind(nextMessages.length > 0 ? "live" : "welcome");
  }, [activePersistedMessages, activeThreadId, initialThreadId, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) return;
    if (messages.length === 0 && activeThreadKind === "welcome" && !activeProperty) {
      clearGuestThreadSnapshot();
      return;
    }

    saveGuestThreadSnapshot({
      locale,
      activeThreadId,
      activeThreadKind: activeThreadKind === "welcome" ? "welcome" : "live",
      activeProperty,
      messages,
    });
  }, [activeProperty, activeThreadId, activeThreadKind, isAuthenticated, locale, messages]);

  useEffect(() => {
    if (!isAuthenticated || hasMigratedGuestThread.current) return;
    const snapshot = loadGuestThreadSnapshot();
    if (!snapshot || snapshot.messages.length === 0) return;

    hasMigratedGuestThread.current = true;
    void seedClientThreadFromTranscript({
      title: snapshot.messages.find((message) => message.role === "user")?.text.slice(0, 80),
      messages: toTranscriptSeedMessages(snapshot.messages) as never,
    })
      .then((result) => {
        clearGuestThreadSnapshot();
        setActiveThreadId(String(result.threadId));
        setActiveThreadKind("live");
        setMessages(snapshot.messages);
        setActiveProperty(snapshot.activeProperty);
      })
      .catch(() => {
        hasMigratedGuestThread.current = false;
      });
  }, [isAuthenticated, seedClientThreadFromTranscript]);

  async function submit(prompt = draft) {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    const startedAt = Date.now();
    const userMessage: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setDraft("");
    setIsSubmitting(true);
    setActiveThreadKind("live");
    capturePostHogEvent("client_assistant_prompt_submitted", {
      hasActiveProperty: Boolean(activeProperty),
      hasThreadId: Boolean(activeThreadId),
      isAuthenticated,
      locale,
      messageLength: trimmed.length,
    });

    try {
      const selectedPropertyId =
        activeProperty ? (activeProperty.id as never) : undefined;
      const response = await askClientAssistant({
        message: trimmed,
        threadId: isAuthenticated && activeThreadId ? (activeThreadId as never) : undefined,
        selectedPropertyId,
        locale,
      });
      const assistantMessage: AssistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: response.message,
        properties: response.properties as unknown as ClientProperty[],
        cards: response.cards as unknown as AssistantMessage["cards"],
        uiTurn: buildClientUiTurn({
          assistantText: response.message,
          properties: response.properties as unknown as ClientProperty[],
          cards: response.cards as unknown as NonNullable<AssistantMessage["cards"]>,
        }),
      };

      const completeMessages = [...nextMessages, assistantMessage];
      setMessages(completeMessages);
      setShowAuthCallout(response.requiresAuthForHandoff && !isAuthenticated);
      if (response.threadId) {
        setActiveThreadId(String(response.threadId));
      }

      if (assistantMessage.properties?.[0]) {
        setActiveProperty(assistantMessage.properties[0]);
      }
      capturePostHogEvent("client_assistant_response_succeeded", {
        activePropertyId: response.activePropertyId ? String(response.activePropertyId) : undefined,
        cardTypes: response.cards.map((card) => card.type),
        durationMs: Date.now() - startedAt,
        hasThreadId: Boolean(response.threadId ?? activeThreadId),
        isAuthenticated,
        propertyCount: response.properties.length,
        requiresAuthForHandoff: response.requiresAuthForHandoff,
      });
      if (response.properties.length > 0) {
        capturePostHogEvent("client_property_results_shown", {
          activePropertyId: response.activePropertyId ? String(response.activePropertyId) : undefined,
          propertyCount: response.properties.length,
        });
      }
      trackAssistantCardViews(response.cards as AssistantMessage["cards"]);
    } catch (error) {
      const failureCode = describeFailure(error);
      const fallbackMessage: AssistantMessage = {
        id: `assistant-error-${Date.now()}`,
        role: "assistant",
        text:
          locale === "ar"
            ? "تعذر إكمال الطلب حالياً. حاول مرة أخرى بعد لحظات."
            : "I could not complete that request right now. Please try again in a moment.",
      };
      setMessages((currentMessages) => [...currentMessages, fallbackMessage]);
      capturePostHogEvent("client_assistant_response_failed", {
        durationMs: Date.now() - startedAt,
        failureCode,
        hasActiveProperty: Boolean(activeProperty),
        hasThreadId: Boolean(activeThreadId),
        isAuthenticated,
      });
      capturePostHogEvent("client_action_failed", {
        action: "assistant_submit",
        failureCode,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function askAboutProperty(property: ClientProperty) {
    setActiveProperty(property);
    capturePostHogEvent("client_property_selected", {
      propertyId: String(property.id),
      ownerType: property.owner.type,
      selectionMode: "ask_about_property",
    });
    void submit(locale === "ar" ? `أريد تفاصيل أكثر عن ${property.title}` : `Tell me more about ${property.title}`);
  }

  async function requestAdvisor() {
    if (!activeProperty) return;
    capturePostHogEvent("client_advisor_handoff_requested", {
      hasThreadId: Boolean(activeThreadId),
      isAuthenticated,
      propertyId: String(activeProperty.id),
    });
    if (!isAuthenticated) {
      setShowAuthCallout(true);
      capturePostHogEvent("client_advisor_handoff_blocked_by_auth", {
        propertyId: String(activeProperty.id),
      });
      return;
    }

    try {
      const order = await createQualifiedHandoff({
        propertyId: activeProperty.id as never,
        message: messages.at(-1)?.text ?? activeProperty.title,
        threadId: activeThreadId ?? undefined,
        sourceChannel: "web",
      });

      capturePostHogEvent("client_qualified_handoff_created", {
        orderId: String(order.orderId),
        propertyId: String(activeProperty.id),
        status: order.status,
      });

      router.push(`/app/handoff?orderId=${encodeURIComponent(String(order.orderId))}`);
    } catch (error) {
      const failureCode = describeFailure(error);
      capturePostHogEvent("client_handoff_creation_failed", {
        failureCode,
        propertyId: String(activeProperty.id),
      });
      capturePostHogEvent("client_action_failed", {
        action: "request_advisor",
        failureCode,
      });
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `handoff-error-${Date.now()}`,
          role: "assistant",
          text:
            locale === "ar"
              ? "تعذر إنشاء طلب المستشار حالياً. حاول مرة أخرى بعد قليل."
              : "I could not create the advisor request right now. Please try again shortly.",
        },
      ]);
    }
  }

  function openHistoryThread(threadId: string) {
    setActiveThreadId(threadId);
    setMessages([]);
    setActiveProperty(null);
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
    if (!isAuthenticated) {
      clearGuestThreadSnapshot();
    }
  }

  useEffect(() => {
    if (!initialPrompt || hasSubmittedInitialPrompt.current || initialThreadId) return;
    hasSubmittedInitialPrompt.current = true;
    submitInitialPromptRef.current(initialPrompt);
  }, [initialPrompt, initialThreadId]);

  const recentThreads = ((persistedThreads ?? []) as ThreadSummary[]).map(mapThreadSummary);

  return {
    draft,
    messages,
    activeProperty,
    isSubmitting,
    showAuthCallout,
    activeThreadId,
    activeThreadKind,
    recentThreads,
    setDraft,
    setShowAuthCallout,
    submit,
    askAboutProperty,
    requestAdvisor,
    openHistoryThread,
    resetToWelcome,
  };
}

/**
 * WHY:   Supporting pages still need one shared read path for authenticated saved client threads.
 * WHAT:  Returns buyer thread summaries from Convex.
 * HOW:   Reuses the authenticated web thread query and normalizes the summary ids to strings.
 */
export function useClientHistory() {
  const { isAuthenticated } = useConvexAuth();
  const history = useQuery(api.user_zone.web.threads.listClientThreads, isAuthenticated ? {} : "skip");
  return ((history ?? []) as ThreadSummary[]).map(mapThreadSummary);
}

/**
 * WHY:   The handoff confirmation route needs a small authenticated read helper for one order.
 * WHAT:  Returns the current buyer's handoff order detail when an order id is provided.
 * HOW:   Skips the query for guests or empty routes and normalizes the Convex id fields to strings.
 */
export function useClientOrderDetail(orderId?: string) {
  const { isAuthenticated } = useConvexAuth();
  return useQuery(
    api.user_zone.web.orders.getClientOrderDetail,
    isAuthenticated && orderId ? { orderId: orderId as never } : "skip",
  ) as ClientOrderDetail | null | undefined;
}
