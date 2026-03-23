import { Alert } from "react-native";
import { useState } from "react";
import {
  BUYER_CAPABILITIES,
  buildAssistantReply,
  buildWelcomeMessage,
} from "@/lib/mvp/ananAssistant";
import type {
  ChatCapabilityId,
  ConversationMessage,
  JourneyAction,
  PropertyPreview,
} from "@/types/chat";

/**
 * WHY:   The buyer home screen needs one stateful conversation source of truth.
 * WHAT:  Manages draft input, message timeline, context property memory, and mock journey actions.
 * HOW:   Seeds a welcome message, appends user prompts, and translates deterministic assistant replies into chat messages.
 */
export function useBuyerAssistant() {
  const initialMessage = buildWelcomeMessage();
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ConversationMessage[]>([initialMessage]);
  const [isTyping, setIsTyping] = useState(false);
  const [contextPropertyId, setContextPropertyId] = useState<string | undefined>(initialMessage.properties?.[0]?.id);
  const [lastSurfacedPropertyIds, setLastSurfacedPropertyIds] = useState<string[]>(
    initialMessage.properties?.map((property) => property.id) ?? [],
  );

  function submit(prompt = draft, capability?: ChatCapabilityId) {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    const userMessage: ConversationMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
      capability,
    };

    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setIsTyping(true);

    setTimeout(() => {
      const assistantReply = buildAssistantReply({
        message: trimmed,
        capability,
        contextPropertyId,
        surfacedPropertyIds: lastSurfacedPropertyIds,
      });

      const assistantMessage: ConversationMessage = {
        id: `assistant-${Date.now() + 1}`,
        role: "assistant",
        text: assistantReply.text,
        capability,
        properties: assistantReply.properties,
        cards: assistantReply.cards,
        actions: assistantReply.actions,
      };

      setMessages((current) => [...current, assistantMessage]);
      setIsTyping(false);

      if (assistantReply.contextPropertyId) {
        setContextPropertyId(assistantReply.contextPropertyId);
      }

      if (assistantReply.properties && assistantReply.properties.length > 0) {
        setLastSurfacedPropertyIds(assistantReply.properties.map((property) => property.id));
      }
    }, 1200);
  }

  function triggerCapability(capabilityId: ChatCapabilityId) {
    const capability = BUYER_CAPABILITIES.find((item) => item.id === capabilityId);
    if (!capability) return;
    submit(capability.prompt, capability.id);
  }

  function setContextProperty(property: PropertyPreview) {
    setContextPropertyId(property.id);
  }

  function handleJourneyAction(action: JourneyAction) {
    if (action.type === "book_viewing") {
      Alert.alert("حجز زيارة", "تم تجهيز طلب الزيارة في المعاينة الحالية. عند ربط النظام الحي سنرسل الطلب مباشرة.");
      return;
    }

    if (action.type === "advisor_handoff") {
      Alert.alert("مستشار عنان", "تم تجهيز طلب التواصل مع المستشار في تجربة الـ MVP الحالية.");
    }

    if (action.type === "confirm_details") {
      Alert.alert("تأكيد التفاصيل", "تم تأكيد طلبك بنجاح. سنقوم بتحديث الملف والمتابعة.");
    }

    if (action.type === "edit_preferences") {
      Alert.alert("تعديل التفضيلات", "سيتم تفعيل تجربة تعديل التفضيلات والميزانية قريباً.");
    }

    if (action.type === "add_requirement") {
      Alert.alert("إضافة متطلب", "ما هو المتطلب الإضافي الذي تريد البحث عنه؟ (ميزة تجريبية)");
    }
  }

  return {
    capabilities: BUYER_CAPABILITIES,
    draft,
    messages,
    isTyping,
    setDraft,
    submit,
    triggerCapability,
    setContextProperty,
    handleJourneyAction,
  };
}
