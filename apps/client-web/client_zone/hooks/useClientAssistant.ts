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
} from "../lib/threadPersistence";

const GUEST_PUBLIC_SESSION_KEY = "anan-client-public-session";

type GuestPublicSession = {
  guestId: string;
  channelSessionToken: string;
  expiresAt: number;
};

function loadGuestPublicSession() {
  if (typeof window === "undefined") return null as GuestPublicSession | null;
  try {
    const value = window.sessionStorage.getItem(GUEST_PUBLIC_SESSION_KEY);
    return value ? (JSON.parse(value) as GuestPublicSession) : null;
  } catch {
    return null;
  }
}

function saveGuestPublicSession(session: GuestPublicSession) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(GUEST_PUBLIC_SESSION_KEY, JSON.stringify(session));
}

function clearGuestPublicSession() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(GUEST_PUBLIC_SESSION_KEY);
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
 * WHY:   The client assistant page now needs one source of truth that works for guest public sessions and promoted authenticated history.
 * WHAT:  Manages live assistant turns, guest session bootstrap, guest-to-auth promotion, and saved-thread reopening.
 * HOW:   Uses `ai_zone/assistantPublic` for live orchestration and keeps persisted `anan_main_public` threads as the durable history layer.
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
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const [guestSession, setGuestSession] = useState<GuestPublicSession | null>(
    () => loadGuestPublicSession(),
  );
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [activeProperty, setActiveProperty] = useState<ClientProperty | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthCallout, setShowAuthCallout] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(initialThreadId ?? null);
  const [activeThreadKind, setActiveThreadKind] = useState<ClientThreadKind>(
    initialThreadId ? "live" : "welcome",
  );
  const hasSubmittedInitialPrompt = useRef(false);
  const hasPromotedGuestSession = useRef(false);
  const submitInitialPromptRef = useRef<(prompt: string) => void>(() => {});
  submitInitialPromptRef.current = (prompt: string) => {
    void submit(prompt);
  };

  const bootstrapPublicSession = useMutation(api.ai_zone.assistantPublic.bootstrapSession);
  const promoteGuestToAuthenticatedBuyer = useMutation(
    api.ai_zone.assistantPublic.promoteGuestToAuthenticatedBuyer,
  );
  const sendGuestPublicMessage = useAction(api.ai_zone.assistantPublic.sendMessage);
  const sendAuthenticatedPublicMessage = useAction(
    api.ai_zone.assistantPublic.sendAuthenticatedMessage,
  );
  const createQualifiedHandoff = useMutation(api.user_zone.mobile.assistant.createQualifiedHandoff);

  const authenticatedAssistantState = useQuery(
    api.user_zone.web.threads.getClientAssistantState,
    isAuthenticated
      ? {
          threadId: activeThreadId ? (activeThreadId as never) : undefined,
        }
      : "skip",
  );

  const publicAssistantState = useQuery(
    api.ai_zone.assistantPublic.getThreadState,
    !isAuthenticated && guestSession
      ? {
          guestId: guestSession.guestId,
          channelSessionToken: guestSession.channelSessionToken,
          threadId: activeThreadId ? (activeThreadId as never) : undefined,
        }
      : "skip",
  );
  async function ensureGuestSession() {
    const stored = loadGuestPublicSession();
    if (stored?.guestId && stored.channelSessionToken && stored.expiresAt > Date.now()) {
      if (!guestSession || guestSession.channelSessionToken !== stored.channelSessionToken) {
        setGuestSession(stored);
      }
      return stored;
    }

    const bootstrapped = await bootstrapPublicSession({
      guestId: stored?.guestId,
    });
    const nextSession = {
      guestId: bootstrapped.guestId,
      channelSessionToken: bootstrapped.channelSessionToken,
      expiresAt: bootstrapped.expiresAt,
    };
    saveGuestPublicSession(nextSession);
    setGuestSession(nextSession);
    if (!activeThreadId && bootstrapped.threadId) {
      setActiveThreadId(String(bootstrapped.threadId));
      setActiveThreadKind("live");
    }
    return nextSession;
  }

  useEffect(() => {
    if (isAuthenticated || guestSession) return;
    void ensureGuestSession();
  }, [guestSession, isAuthenticated]);

  useEffect(() => {
    if (!initialThreadId || activeThreadId === initialThreadId) return;
    setActiveThreadId(initialThreadId);
    setActiveThreadKind("live");
  }, [activeThreadId, initialThreadId]);

  useEffect(() => {
    if (!isAuthenticated || hasPromotedGuestSession.current || !guestSession) return;

    hasPromotedGuestSession.current = true;
    void promoteGuestToAuthenticatedBuyer({
      guestId: guestSession.guestId,
      channelSessionToken: guestSession.channelSessionToken,
    })
      .then((result) => {
        if (result.threadId) {
          setActiveThreadId(String(result.threadId));
          setActiveThreadKind("live");
        }
        clearGuestPublicSession();
        setGuestSession(null);
      })
      .catch(() => {
        hasPromotedGuestSession.current = false;
      });
  }, [guestSession, isAuthenticated, promoteGuestToAuthenticatedBuyer]);

  useEffect(() => {
    if (!isAuthenticated || !authenticatedAssistantState) return;
    const resolvedThreadId =
      activeThreadId ??
      (authenticatedAssistantState.recentThreads[0]?.id
        ? String(authenticatedAssistantState.recentThreads[0].id)
        : null);
    if (resolvedThreadId && resolvedThreadId !== activeThreadId) {
      setActiveThreadId(resolvedThreadId);
    }

    const nextMessages = (authenticatedAssistantState.activeMessages as PersistedThreadMessage[]).map(
      toAssistantMessage,
    );
    setMessages(nextMessages);
    setActiveProperty(getLatestThreadProperty(nextMessages));
    setActiveThreadKind(nextMessages.length > 0 ? "live" : "welcome");
  }, [activeThreadId, authenticatedAssistantState, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated || !guestSession || !publicAssistantState) return;
    if (
      publicAssistantState.thread?._id &&
      String(publicAssistantState.thread._id) !== activeThreadId
    ) {
      setActiveThreadId(String(publicAssistantState.thread._id));
    }

    const nextMessages = (publicAssistantState.messages as PersistedThreadMessage[]).map(
      toAssistantMessage,
    );
    setMessages(nextMessages);
    setActiveProperty(getLatestThreadProperty(nextMessages));
    setActiveThreadKind(
      nextMessages.length > 0 || Boolean(publicAssistantState.thread?._id) ? "live" : "welcome",
    );
  }, [activeThreadId, guestSession, isAuthenticated, publicAssistantState]);

  async function submit(prompt = draft, inputMode: "text" | "voice" = "text") {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    const startedAt = Date.now();
    const userMessage: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
    };

    const optimisticMessages = [...messages, userMessage];
    setMessages(optimisticMessages);
    setDraft("");
    setIsSubmitting(true);
    setActiveThreadKind("live");

    capturePostHogEvent("client_assistant_prompt_submitted", {
      hasActiveProperty: Boolean(activeProperty),
      hasThreadId: Boolean(activeThreadId),
      isAuthenticated,
      inputMode,
      locale,
      messageLength: trimmed.length,
    });

    try {
      const selectedPropertyId = activeProperty ? (activeProperty.id as never) : undefined;
      const response = isAuthenticated
        ? await sendAuthenticatedPublicMessage({
            message: trimmed,
            threadId: activeThreadId ? (activeThreadId as never) : undefined,
            inputMode,
            selectedPropertyId,
            locale,
          })
        : await sendGuestPublicMessage({
            ...(await ensureGuestSession()),
            message: trimmed,
            threadId: activeThreadId ? (activeThreadId as never) : undefined,
            inputMode,
            selectedPropertyId,
            locale,
          });

      const assistantMessage: AssistantMessage = {
        id: String(response.messageId ?? `assistant-${Date.now()}`),
        role: "assistant",
        text: response.message,
        properties: response.properties as ClientProperty[],
        cards: response.cards as AssistantMessage["cards"],
        suggestedPrompts: response.suggestedPrompts,
        activePropertyId: response.activePropertyId ? String(response.activePropertyId) : undefined,
        requiresAuthForHandoff: response.requiresAuthForHandoff,
        uiTurn: buildClientUiTurn({
          assistantText: response.message,
          properties: response.properties as ClientProperty[],
          cards: response.cards as NonNullable<AssistantMessage["cards"]>,
        }),
      };

      const completeMessages = [...optimisticMessages, assistantMessage];
      setMessages(completeMessages);
      setShowAuthCallout(response.requiresAuthForHandoff && !isAuthenticated);
      if (response.threadId) {
        setActiveThreadId(String(response.threadId));
      }

      const resolvedActiveProperty =
        (response.properties as ClientProperty[]).find(
          (property) => String(property.id) === String(response.activePropertyId ?? ""),
        ) ??
        (response.properties?.[0] as ClientProperty | undefined) ??
        null;

      if (resolvedActiveProperty) {
        setActiveProperty(resolvedActiveProperty);
      }

      capturePostHogEvent("client_assistant_response_succeeded", {
        activePropertyId: response.activePropertyId ? String(response.activePropertyId) : undefined,
        cardTypes: response.cards.map((card: { type: string }) => card.type),
        durationMs: Date.now() - startedAt,
        hasThreadId: Boolean(response.threadId ?? activeThreadId),
        inputMode,
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
        inputMode,
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
    void submit(
      locale === "ar"
        ? `أريد تفاصيل أكثر عن ${property.title}`
        : `Tell me more about ${property.title}`,
    );
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
  }

  useEffect(() => {
    if (!initialPrompt || hasSubmittedInitialPrompt.current || initialThreadId) return;
    hasSubmittedInitialPrompt.current = true;
    submitInitialPromptRef.current(initialPrompt);
  }, [initialPrompt, initialThreadId]);

  const recentThreads = (
    ((authenticatedAssistantState?.recentThreads ?? []) as ThreadSummary[])
  ).map(mapThreadSummary);

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
