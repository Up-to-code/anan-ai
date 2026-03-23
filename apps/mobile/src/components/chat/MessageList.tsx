import type { RefObject } from "react";
import { Pressable, View } from "react-native";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import { useEffect } from "react";
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { InsightCard } from "@/components/chat/InsightCard";
import { PropertyResultCard } from "@/components/chat/PropertyResultCard";
import { AppText } from "@/components/ui/AppText";
import type { ConversationMessage, JourneyAction, PropertyPreview } from "@/types/chat";

type MessageListProps = {
  listRef: RefObject<FlashListRef<ConversationMessage> | null>;
  messages: ConversationMessage[];
  isTyping?: boolean;
  onPropertyPress: (property: PropertyPreview) => void;
  onActionPress: (action: JourneyAction) => void;
};

/**
 * WHY:   The buyer assistant needs a performant timeline that can grow without janky scrolling.
 * WHAT:  Renders the virtualized conversation list with text, property cards, insight cards, and actions.
 * HOW:   Uses `FlashList` plus lightweight enter transitions while keeping each message self-contained.
 */
export function MessageList({
  listRef,
  messages,
  isTyping,
  onPropertyPress,
  onActionPress,
}: MessageListProps) {
  const data = [...messages];
  if (isTyping) {
    data.push({ id: "typing-indicator", role: "assistant", text: "TYPING_INDICATOR" });
  }

  return (
    <FlashList
      ref={listRef}
      data={data}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 24 }}
      maintainVisibleContentPosition={{ autoscrollToBottomThreshold: 0.2 }}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => {
        if (item.text === "TYPING_INDICATOR") {
          return (
            <Animated.View entering={FadeInDown.duration(200)} className="mb-4">
              <SearchingIndicator />
            </Animated.View>
          );
        }
        return (
          <Animated.View entering={FadeInDown.duration(180).delay(index * 20)} className="mb-4">
            <MessageBubble message={item} onPropertyPress={onPropertyPress} onActionPress={onActionPress} />
          </Animated.View>
        );
      }}
    />
  );
}

function MessageBubble({
  message,
  onPropertyPress,
  onActionPress,
}: {
  message: ConversationMessage;
  onPropertyPress: (property: PropertyPreview) => void;
  onActionPress: (action: JourneyAction) => void;
}) {
  const isUser = message.role === "user";

  return (
    <View className={isUser ? "items-start" : "items-end"}>
      <View className={isUser ? "max-w-[84%] border border-line bg-white px-4 py-3" : "max-w-[92%] border border-brand-soft bg-panel px-4 py-3"}>
        <AppText className="text-sm leading-6 text-ink">{message.text}</AppText>
      </View>

      {message.properties?.length ? (
        <View className="mt-3 w-full gap-3">
          {message.properties.map((property) => (
            <PropertyResultCard
              key={property.id}
              property={property}
              onPress={onPropertyPress}
            />
          ))}
        </View>
      ) : null}

      {message.cards?.length ? (
        <View className="mt-3 w-full gap-3">
          {message.cards.map((card, index) => (
            <InsightCard key={`${card.type}-${index}`} card={card} />
          ))}
        </View>
      ) : null}

      {message.actions?.length ? (
        <View className="mt-3 flex-row-reverse flex-wrap gap-2">
          {message.actions.map((action) => {
            const isPrimary = action.type === "confirm_details" || action.type === "open_property" || action.type === "book_viewing";
            return (
              <Pressable
                key={`${action.type}-${action.label}`}
                className={isPrimary ? "border border-brand bg-brand px-3 py-2" : "border border-line bg-white px-3 py-2"}
                onPress={() => onActionPress(action)}
              >
                <AppText className={isPrimary ? "text-xs text-white font-cairo-bold" : "text-xs text-ink"}>{action.label}</AppText>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function SearchingIndicator() {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(1, { duration: 600 }), withTiming(0.5, { duration: 600 })),
      -1,
      true
    );
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View className="items-end">
      <View className="max-w-[92%] flex-row-reverse items-center border border-brand-soft bg-panel px-4 py-3">
        <Animated.View style={style}>
          <AppText className="text-sm font-cairo-bold text-brand">جاري معالجة الطلب...</AppText>
        </Animated.View>
      </View>
    </View>
  );
}
