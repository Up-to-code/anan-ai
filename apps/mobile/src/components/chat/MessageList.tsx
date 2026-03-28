import type { RefObject } from "react";
import { Pressable, View, Platform } from "react-native";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import { useEffect } from "react";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { InsightCard } from "@/components/chat/InsightCard";
import { PropertyResultCard } from "@/components/chat/PropertyResultCard";
import { AppText } from "@/components/ui/AppText";
import type { ConversationMessage, JourneyAction, PropertyPreview } from "@/types/chat";

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

type MessageListProps = {
  listRef: RefObject<FlashListRef<ConversationMessage> | null>;
  messages: ConversationMessage[];
  isTyping?: boolean;
  onPropertyPress: (property: PropertyPreview) => void;
  onActionPress: (action: JourneyAction) => void;
};

/**
 * WHY:   The Nexus MessageList must feel premium and spacious, with perfect RTL alignment.
 * WHAT:  Modernizes the message stream with rounded-3xl geometry and bubble-less assistant text.
 * HOW:   Uses FlashList for performance and ensures high-contrast Cairo typography throughout.
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
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 }}
      maintainVisibleContentPosition={{ autoscrollToBottomThreshold: 0.2 }}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View className="mb-8">
          {item.text === "TYPING_INDICATOR" ? (
            <SearchingIndicator />
          ) : (
            <MessageBubble message={item} onPropertyPress={onPropertyPress} onActionPress={onActionPress} />
          )}
        </View>
      )}
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
    <View className={cn("flex-column", isUser ? "items-start" : "items-end")}>
      <View
        className={cn(
          "max-w-[90%] px-6 py-4 transition-all",
          isUser
            ? "rounded-[32px] rounded-bl-[8px] bg-slate-900 dark:bg-slate-50"
            : "bg-transparent px-0 border-0"
        )}
      >
        <AppText
          className={cn(
            "text-[17px] leading-[1.6]",
            isUser 
              ? "text-white dark:text-slate-950 font-cairo-medium" 
              : "text-slate-900 dark:text-slate-50 font-cairo-bold"
          )}
        >
          {message.text}
        </AppText>
      </View>

      {message.properties?.length ? (
        <View className="mt-8 w-full gap-5">
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
        <View className="mt-8 w-full gap-5">
          {message.cards.map((card, index) => (
            <InsightCard key={`${card.type}-${index}`} card={card} />
          ))}
        </View>
      ) : null}

      {message.actions?.length ? (
        <View className="mt-8 flex-row-reverse flex-wrap gap-3">
          {message.actions.map((action) => {
            const isPrimary = action.type === "confirm_details" || action.type === "open_property" || action.type === "book_viewing";
            return (
              <Pressable
                key={`${action.type}-${action.label}`}
                className={cn(
                  "rounded-2xl px-6 py-4 active:scale-95 transition-all text-center",
                  isPrimary 
                    ? "bg-primary" 
                    : "bg-slate-100 dark:bg-slate-800"
                )}
                onPress={() => onActionPress(action)}
              >
                <AppText className={cn(
                  "text-[13px] font-cairo-black tracking-tight",
                  isPrimary ? "text-white" : "text-slate-900 dark:text-slate-100"
                )}>
                  {action.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function SearchingIndicator() {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(1, { duration: 800 }), withTiming(0.4, { duration: 800 })),
      -1,
      true
    );
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View className="items-end">
      <View className="flex-row-reverse items-center rounded-full border border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
        <Animated.View style={style} className="flex-row items-center gap-3">
          <View className="h-1.5 w-1.5 rounded-full bg-primary" />
          <AppText className="font-cairo-black text-[13px] tracking-widest text-primary uppercase">
            تحليل الطب الآن...
          </AppText>
        </Animated.View>
      </View>
    </View>
  );
}
