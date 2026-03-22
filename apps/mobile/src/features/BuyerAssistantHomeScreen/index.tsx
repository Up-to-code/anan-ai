import { useEffect, useRef } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { useRouter } from "expo-router";
import { FlashListRef } from "@shopify/flash-list";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { ComposerDock } from "@/components/chat/ComposerDock";
import { MessageList } from "@/components/chat/MessageList";
import { useBuyerAssistant } from "@/hooks/useBuyerAssistant";
import type { ConversationMessage, JourneyAction, PropertyPreview } from "@/types/chat";

/**
 * WHY:   The buyer journey now starts with a single assistant workspace instead of separate feed-first routes.
 * WHAT:  Composes the chat-first home shell for search, finance, ROI, comparison, and booking prompts.
 * HOW:   Combines the buyer assistant hook with shared chat components and keyboard-safe layout behavior.
 */
export default function BuyerAssistantHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const assistant = useBuyerAssistant();
  const listRef = useRef<FlashListRef<ConversationMessage> | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(timer);
  }, [assistant.messages.length]);

  function handlePropertyPress(property: PropertyPreview) {
    assistant.setContextProperty(property);
    router.push({ pathname: "/property/[id]", params: { id: property.id } });
  }

  function handleActionPress(action: JourneyAction) {
    if (action.type === "open_property") {
      router.push({ pathname: "/property/[id]", params: { id: action.propertyId } });
      return;
    }

    assistant.handleJourneyAction(action);
  }

  return (
    <SafeAreaView className="flex-1 bg-panel" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View className="flex-1">
          <MessageList
            listRef={listRef}
            messages={assistant.messages}
            isTyping={assistant.isTyping}
            onPropertyPress={handlePropertyPress}
            onActionPress={handleActionPress}
          />
          <View style={{ paddingBottom: Math.max(insets.bottom, 8) }}>
            <ComposerDock
              value={assistant.draft}
              onChange={assistant.setDraft}
              onSend={() => assistant.submit()}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
