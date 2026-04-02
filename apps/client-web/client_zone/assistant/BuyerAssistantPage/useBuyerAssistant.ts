"use client";

import { useAction, useQuery } from "convex/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/convexApi";
import type { AppLocale } from "@/lib/locale";
import type { Id } from "@convex/dataModel";
import { buildBuyerChatSuggestions } from "@/client_zone/shared/suggestions";
import type {
  BuyerAssistantCard,
  BuyerAssistantMessage,
  BuyerProperty,
  BuyerThreadSummary,
} from "@/client_zone/shared/types";

function buildWelcomeMessage(locale: AppLocale): BuyerAssistantMessage {
  return {
    id: "welcome",
    role: "assistant",
    text:
      locale === "en"
        ? "Tell me the city, budget, and type of property you want, and I will start with the best verified options."
        : locale === "fr"
          ? "Dites-moi la ville, le budget et le type de bien souhaité, et je commencerai avec les meilleures options vérifiées."
          : "اخبرني بالمدينة والميزانية ونوع العقار، وسأبدأ لك بأفضل الخيارات الموثقة.",
    createdAt: Date.now(),
    suggestedPrompts: buildBuyerChatSuggestions(locale).map((suggestion) => suggestion.prompt),
  };
}

function mapStoredMessage(message: {
  id: string;
  role: "assistant" | "user";
  text: string;
  createdAt: number;
  properties?: BuyerProperty[];
  cards?: BuyerAssistantCard[];
  activePropertyId?: string;
  requiresAuthForHandoff?: boolean;
  suggestedPrompts?: string[];
}): BuyerAssistantMessage {
  return {
    id: String(message.id),
    role: message.role,
    text: message.text,
    createdAt: message.createdAt,
    properties: message.properties,
    cards: message.cards,
    activePropertyId: message.activePropertyId,
    requiresAuthForHandoff: message.requiresAuthForHandoff,
    suggestedPrompts: message.suggestedPrompts,
  };
}

function readLatestProperty(messages: BuyerAssistantMessage[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const property = messages[index]?.properties?.[0];
    if (property) return property;
  }
  return null;
}

/**
 * WHY:   The rebuilt buyer assistant needs one local state model above the Convex buyer-web API.
 * WHAT:  Orchestrates message sending, saved-thread hydration, property focus, and assistant prompt suggestions.
 * HOW:   Reads `user_zone/web` queries/actions directly, keeps guest messages local, and hydrates authenticated history only when available.
 */
export function useBuyerAssistant(args: {
  locale: AppLocale;
  requestedThreadId?: string | null;
  preselectedProperty?: BuyerProperty | null;
}) {
  const askClientAssistant = useAction(api.user_zone.web.assistant.askClientAssistant);
  const requestedThreadId = args.requestedThreadId
    ? (args.requestedThreadId as Id<"assistantThreads">)
    : undefined;

  const assistantState =
    useQuery(api.user_zone.web.threads.getClientAssistantState, {
      threadId: requestedThreadId,
      limit: 12,
    }) ?? { recentThreads: [], activeMessages: [] };

  const [threadId, setThreadId] = useState<string | null>(args.requestedThreadId ?? null);
  const [messages, setMessages] = useState<BuyerAssistantMessage[]>([buildWelcomeMessage(args.locale)]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const appliedThreadRef = useRef<string | null>(null);
  const appliedPropertyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!args.requestedThreadId) return;
    if (appliedThreadRef.current === args.requestedThreadId) return;
    if (assistantState.activeMessages.length === 0) return;

    appliedThreadRef.current = args.requestedThreadId;
    setThreadId(args.requestedThreadId);
    setMessages(assistantState.activeMessages.map(mapStoredMessage));
  }, [args.requestedThreadId, assistantState.activeMessages]);

  useEffect(() => {
    if (!args.preselectedProperty) return;
    if (appliedPropertyRef.current === String(args.preselectedProperty.id)) return;
    appliedPropertyRef.current = String(args.preselectedProperty.id);
    void sendMessage(
      args.locale === "en"
        ? `Tell me more about ${args.preselectedProperty.title}`
        : args.locale === "fr"
          ? `Parle-moi davantage de ${args.preselectedProperty.title}`
          : `أريد تفاصيل أكثر عن ${args.preselectedProperty.title}`,
      args.preselectedProperty,
    );
  }, [args.locale, args.preselectedProperty]);

  const activeProperty = useMemo(() => readLatestProperty(messages), [messages]);
  const showSignInPrompt = messages.some((message) => message.requiresAuthForHandoff);
  const recentThreads = assistantState.recentThreads as BuyerThreadSummary[];

  async function sendMessage(rawMessage = draft, selectedProperty?: BuyerProperty | null) {
    const message = rawMessage.trim();
    if (!message) return;

    const userMessage: BuyerAssistantMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: message,
      createdAt: Date.now(),
      activePropertyId: selectedProperty ? String(selectedProperty.id) : activeProperty ? String(activeProperty.id) : undefined,
    };

    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setSendError(null);
    setIsSending(true);

    try {
      const response = await askClientAssistant({
        message,
        threadId: threadId ? (threadId as Id<"assistantThreads">) : undefined,
        selectedPropertyId: (selectedProperty?.id ?? activeProperty?.id) as Id<"properties"> | undefined,
        locale: args.locale,
      });

      const assistantMessage: BuyerAssistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: response.message,
        createdAt: Date.now(),
        properties: response.properties as BuyerProperty[],
        cards: response.cards as BuyerAssistantCard[],
        activePropertyId: response.activePropertyId ? String(response.activePropertyId) : undefined,
        requiresAuthForHandoff: response.requiresAuthForHandoff,
        suggestedPrompts: response.suggestedPrompts,
      };

      setThreadId(response.threadId ? String(response.threadId) : threadId);
      setMessages((current) => [...current, assistantMessage]);
    } catch (error) {
      const messageText =
        error instanceof Error && error.message.trim()
          ? error.message
          : args.locale === "en"
            ? "Could not send the message right now."
            : args.locale === "fr"
              ? "Impossible d’envoyer le message pour le moment."
              : "تعذر إرسال الرسالة حالياً.";
      setSendError(messageText);
    } finally {
      setIsSending(false);
    }
  }

  function resetConversation() {
    setThreadId(null);
    setMessages([buildWelcomeMessage(args.locale)]);
    setDraft("");
    setSendError(null);
  }

  return {
    activeProperty,
    draft,
    isSending,
    messages,
    recentThreads,
    sendError,
    showSignInPrompt,
    suggestions: buildBuyerChatSuggestions(args.locale),
    threadId,
    resetConversation,
    sendMessage,
    setDraft,
  };
}
