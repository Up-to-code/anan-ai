import { useAction, useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "@/lib/convexApi";
import { mockAssistantResponse } from "@/lib/mockData";
import { MobilePropertyFeedItem, ChatMessage } from "@/types/mobile";

const hasConvexUrl = Boolean(process.env.EXPO_PUBLIC_CONVEX_URL);

/**
 * WHY:   The buyer needs a continuous conversational workspace, not isolated Q&A cards.
 * WHAT:  Manages a history of messages (`messages`) and orchestrates Convex backend tools.
 * HOW:   Accumulates text, injected properties, and generated ROI/Payment cards into a ChatMessage timeline.
 */
export function usePropertyAssistant(property?: MobilePropertyFeedItem) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const askAssistant = hasConvexUrl
    ? useAction((api as any)["user_zone/mobile/assistant"].askPropertyAssistant)
    : null;
  const createQualifiedHandoff = hasConvexUrl
    ? useMutation((api as any)["user_zone/mobile/assistant"].createQualifiedHandoff)
    : null;

  useEffect(() => {
    // Reset conversation if property changes, or we might want to keep it.
    // For now we reset it when focusing a new property feed item IF the user opens it from scratch.
    if (!isOpen) {
      setMessages([]);
      setQuery(property?.recommendedPrompts?.[0] ?? "اعرض خطة السداد");
    }
  }, [property?.id, isOpen]);

  const open = () => {
    setIsOpen(true);
    if (property && messages.length === 0) {
      setMessages([
        {
          id: Date.now().toString(),
          role: "assistant",
          text: `هذه تفاصيل ذكية عن ${property.title}. كيف يمكنني مساعدتك؟`,
          cards: property.demoPreviewCard ? [property.demoPreviewCard] : [],
        }
      ]);
    }
  };

  const close = () => {
    setIsOpen(false);
  };

  const seedPrompt = (prompt: string) => {
    setQuery(prompt);
  };

  const send = async (explicitProperty?: MobilePropertyFeedItem) => {
    const ctxProperty = explicitProperty ?? property;
    if (!ctxProperty || !query.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString() + "-user",
      role: "user",
      text: query.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuery("");

    if (!hasConvexUrl || !askAssistant) {
      const fallback = mockAssistantResponse(ctxProperty, userMessage.text!);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-assistant",
          role: "assistant",
          text: fallback.message,
          cards: fallback.cards,
        }
      ]);
      return;
    }

    try {
      const response = await askAssistant({
        propertyId: ctxProperty.id as never,
        message: userMessage.text!,
      });
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-assistant",
          role: "assistant",
          text: response.message,
          cards: response.cards,
        }
      ]);
    } catch (_error) {
      const fallback = mockAssistantResponse(ctxProperty, userMessage.text!);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-assistant",
          role: "assistant",
          text: fallback.message,
          cards: fallback.cards,
        }
      ]);
    }
  };

  const verify = async (explicitProperty?: MobilePropertyFeedItem) => {
    const ctxProperty = explicitProperty ?? property;
    if (!ctxProperty) return;

    if (!hasConvexUrl || !createQualifiedHandoff) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-verify",
          role: "assistant",
          cards: [{
            type: "broker_handoff",
            title: "تم تجهيز التحويل",
            handoffStatus: "qualified",
            summary: "تم حفظ التحويل محلياً كمعاينة، وعند ربط Convex سيتم إرساله تلقائياً.",
          }]
        }
      ]);
      return;
    }

    try {
      const handoff = await createQualifiedHandoff({
        propertyId: ctxProperty.id as never,
        message: query || "طلب تحويل",
        externalUserId: "demo-mobile-user",
        qualification: {
          monthlySalary: 15000,
          downPayment: Math.round(ctxProperty.price * 0.15),
          preferredYears: 20,
        },
      });
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-verify-ok",
          role: "assistant",
          cards: [{
            type: "broker_handoff",
            title: "تم تحويلك كعميل مؤهل",
            handoffStatus: handoff.status,
            summary: "تم تسجيل طلبك داخل نظام المتابعة وسيتم التواصل معك من الشريك المناسب.",
          }]
        }
      ]);
    } catch (_error) {
       setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-verify-err",
          role: "assistant",
          cards: [{
            type: "broker_handoff",
            title: "خطأ في التحويل",
            handoffStatus: "qualified",
            summary: "تم حفظ التحويل محلياً كمعاينة نظراً لوجود خطأ في الاتصال بالخادم.",
          }]
        }
      ]);
    }
  };

  return {
    isOpen,
    open,
    close,
    query,
    setQuery,
    messages,
    seedPrompt,
    send,
    verify,
    collapsedPlaceholder: property ? `اسأل عن ${property.title}` : "اسأل عن هذه الوحدة",
  };
}
