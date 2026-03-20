import { useAction, useMutation } from "convex/react";
import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/convexApi";
import { mockAssistantResponse } from "@/lib/mockData";
import { MobilePropertyFeedItem, ChatMessage } from "@/types/mobile";

const hasConvexUrl = Boolean(process.env.EXPO_PUBLIC_CONVEX_URL);
const DEMO_EXTERNAL_USER_ID = "demo-mobile-user";

type AskAssistantFn = ((args: { propertyId: unknown; message: string }) => Promise<{ message: string; cards?: ChatMessage["cards"] }>) | null;
type CreateQualifiedHandoffFn = ((args: {
  propertyId: unknown;
  message: string;
  externalUserId: string;
  qualification: {
    monthlySalary: number;
    downPayment: number;
    preferredYears: number;
  };
}) => Promise<{ status: string }>) | null;

function appendMessage(setMessages: Dispatch<SetStateAction<ChatMessage[]>>, message: ChatMessage) {
  setMessages((prev) => [...prev, message]);
}

function appendFallbackAssistantMessage(
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>,
  property: MobilePropertyFeedItem,
  userText: string,
) {
  const fallback = mockAssistantResponse(property, userText);
  appendMessage(setMessages, {
    id: `${Date.now()}-assistant`,
    role: "assistant",
    text: fallback.message,
    cards: fallback.cards,
  });
}

async function runSendFlow({
  property,
  query,
  setMessages,
  setQuery,
  askAssistant,
}: {
  property?: MobilePropertyFeedItem;
  query: string;
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  setQuery: (value: string) => void;
  askAssistant: AskAssistantFn;
}) {
  if (!property || !query.trim()) return;
  const text = query.trim();

  appendMessage(setMessages, {
    id: `${Date.now()}-user`,
    role: "user",
    text,
  });
  setQuery("");

  if (!hasConvexUrl || !askAssistant) {
    appendFallbackAssistantMessage(setMessages, property, text);
    return;
  }

  try {
    const response = await askAssistant({ propertyId: property.id, message: text });
    appendMessage(setMessages, {
      id: `${Date.now()}-assistant`,
      role: "assistant",
      text: response.message,
      cards: response.cards ?? [],
    });
  } catch {
    appendFallbackAssistantMessage(setMessages, property, text);
  }
}

function appendPreviewHandoffCard(setMessages: Dispatch<SetStateAction<ChatMessage[]>>) {
  appendMessage(setMessages, {
    id: `${Date.now()}-verify-preview`,
    role: "assistant",
    cards: [{
      type: "broker_handoff",
      title: "تم تجهيز التحويل",
      handoffStatus: "qualified",
      summary: "تم حفظ التحويل محلياً كمعاينة، وعند ربط Convex سيتم إرساله تلقائياً.",
    }],
  });
}

function appendHandoffResultCard(
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>,
  status: string,
) {
  appendMessage(setMessages, {
    id: `${Date.now()}-verify-ok`,
    role: "assistant",
    cards: [{
      type: "broker_handoff",
      title: "تم تحويلك كعميل مؤهل",
      handoffStatus: status,
      summary: "تم تسجيل طلبك داخل نظام المتابعة وسيتم التواصل معك من الشريك المناسب.",
    }],
  });
}

function appendHandoffErrorCard(setMessages: Dispatch<SetStateAction<ChatMessage[]>>) {
  appendMessage(setMessages, {
    id: `${Date.now()}-verify-error`,
    role: "assistant",
    cards: [{
      type: "broker_handoff",
      title: "خطأ في التحويل",
      handoffStatus: "qualified",
      summary: "تم حفظ التحويل محلياً كمعاينة نظراً لوجود خطأ في الاتصال بالخادم.",
    }],
  });
}

async function runVerifyFlow({
  property,
  query,
  setMessages,
  createQualifiedHandoff,
}: {
  property?: MobilePropertyFeedItem;
  query: string;
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  createQualifiedHandoff: CreateQualifiedHandoffFn;
}) {
  if (!property) return;
  if (!hasConvexUrl || !createQualifiedHandoff) {
    appendPreviewHandoffCard(setMessages);
    return;
  }

  try {
    const handoff = await createQualifiedHandoff({
      propertyId: property.id,
      message: query || "طلب تحويل",
      externalUserId: DEMO_EXTERNAL_USER_ID,
      qualification: {
        monthlySalary: 15000,
        downPayment: Math.round(property.price * 0.15),
        preferredYears: 20,
      },
    });
    appendHandoffResultCard(setMessages, handoff.status);
  } catch {
    appendHandoffErrorCard(setMessages);
  }
}

function useAssistantPanelState(property?: MobilePropertyFeedItem) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setQuery(property?.recommendedPrompts?.[0] ?? "اعرض خطة السداد");
    }
  }, [property?.id, isOpen]);

  const open = useCallback(() => {
    setIsOpen(true);
    if (!property || messages.length > 0) return;
    appendMessage(setMessages, {
      id: Date.now().toString(),
      role: "assistant",
      text: `هذه تفاصيل ذكية عن ${property.title}. كيف يمكنني مساعدتك؟`,
      cards: property.demoPreviewCard ? [property.demoPreviewCard] : [],
    });
  }, [property, messages.length]);

  return {
    isOpen,
    setIsOpen,
    query,
    setQuery,
    messages,
    setMessages,
    open,
  };
}

function usePropertyAssistantAdapters() {
  const askAssistant = hasConvexUrl
    ? (useAction((api as any)["user_zone/mobile/assistant"].askPropertyAssistant) as AskAssistantFn)
    : null;
  const createQualifiedHandoff = hasConvexUrl
    ? (useMutation((api as any)["user_zone/mobile/assistant"].createQualifiedHandoff) as CreateQualifiedHandoffFn)
    : null;
  return { askAssistant, createQualifiedHandoff };
}

function usePropertyAssistantActions({
  property,
  query,
  setQuery,
  setMessages,
  askAssistant,
  createQualifiedHandoff,
}: {
  property?: MobilePropertyFeedItem;
  query: string;
  setQuery: (value: string) => void;
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  askAssistant: AskAssistantFn;
  createQualifiedHandoff: CreateQualifiedHandoffFn;
}) {
  const send = useCallback(async (explicitProperty?: MobilePropertyFeedItem) => {
    await runSendFlow({ property: explicitProperty ?? property, query, setMessages, setQuery, askAssistant });
  }, [askAssistant, property, query, setMessages, setQuery]);
  const verify = useCallback(async (explicitProperty?: MobilePropertyFeedItem) => {
    await runVerifyFlow({ property: explicitProperty ?? property, query, setMessages, createQualifiedHandoff });
  }, [createQualifiedHandoff, property, query, setMessages]);
  return { send, verify };
}

/**
 * WHY:   The buyer needs a continuous conversational workspace, not isolated Q&A cards.
 * WHAT:  Manages a history of messages (`messages`) and orchestrates Convex backend tools.
 * HOW:   Accumulates text, injected properties, and generated ROI/Payment cards into a ChatMessage timeline.
 */
export function usePropertyAssistant(property?: MobilePropertyFeedItem) {
  const { askAssistant, createQualifiedHandoff } = usePropertyAssistantAdapters();
  const { isOpen, setIsOpen, query, setQuery, messages, setMessages, open } = useAssistantPanelState(property);
  const { send, verify } = usePropertyAssistantActions({ property, query, setQuery, setMessages, askAssistant, createQualifiedHandoff });

  return {
    isOpen,
    open,
    close: () => setIsOpen(false),
    query,
    setQuery,
    messages,
    seedPrompt: setQuery,
    send,
    verify,
    collapsedPlaceholder: property ? `اسأل عن ${property.title}` : "اسأل عن هذه الوحدة",
  };
}
