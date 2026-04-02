import type { RefObject } from "react";
import { Animated, Pressable, ScrollView, View } from "react-native";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import { useEffect, useRef } from "react";
import { Building2, MapPin, Sparkles } from "lucide-react-native";
import { MobileAgUiTurnRenderer } from "@/components/chat/ag-ui/MobileAgUiTurnRenderer";
import { InsightCard } from "@/components/chat/InsightCard";
import { PropertyRecommendationRow } from "@/components/chat/PropertyRecommendationRow";
import { AppText } from "@/components/ui/AppText";
import { useMobileLayout } from "@/lib/mobileLayout";
import { getPropertyLocationLabel } from "@/lib/mobileData";
import type { MobileConversationMessage, MobileProperty } from "@/types/mobile";

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

type MessageListProps = {
  listRef: RefObject<FlashListRef<MobileConversationMessage> | null>;
  messages: MobileConversationMessage[];
  isTyping?: boolean;
  onPropertyPress: (property: MobileProperty) => void;
  onOpenProperty?: (property: MobileProperty) => void;
  onSuggestedPromptPress: (prompt: string) => void;
  bottomPadding?: number;
  contextProperty?: MobileProperty | null;
  showLatestSuggestedPrompts?: boolean;
};

/**
 * WHY:   The assistant timeline should stay readable on narrow phones without looking like a property feed or a branded landing page.
 * WHAT:  Renders the virtualized conversation, compact recommendation rows, and follow-up chips with responsive spacing.
 * HOW:   Uses FlashList for performance and shared mobile layout tokens for message width, type, and chip sizing.
 */
export function MessageList({
  listRef,
  messages,
  isTyping,
  onPropertyPress,
  onOpenProperty,
  onSuggestedPromptPress,
  bottomPadding,
  contextProperty,
  showLatestSuggestedPrompts = true,
}: MessageListProps) {
  const layout = useMobileLayout();
  const data = [...messages];
  const latestSuggestedPromptMessageId =
    messages
      .slice()
      .reverse()
      .find((message) => message.role === "assistant" && (message.suggestedPrompts?.length ?? 0) > 0)?.id ?? null;

  if (isTyping) {
    data.push({ id: "typing-indicator", role: "assistant", text: "TYPING_INDICATOR" });
  }

  return (
    <FlashList
      ref={listRef}
      data={data}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: layout.contentPadding,
        paddingTop: layout.sectionGap,
        paddingBottom: bottomPadding ?? layout.sectionGap * 2.5,
      }}
      ListHeaderComponent={
        contextProperty ? (
          <ThreadContextCard
            property={contextProperty}
            onPress={() => (onOpenProperty ? onOpenProperty(contextProperty) : onPropertyPress(contextProperty))}
          />
        ) : null
      }
      maintainVisibleContentPosition={{ autoscrollToBottomThreshold: 0.2 }}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={{ marginBottom: layout.sectionGap + 8 }}>
          {item.text === "TYPING_INDICATOR" ? (
            <SearchingIndicator />
          ) : (
            <MessageBubble
              message={item}
              onPropertyPress={onPropertyPress}
              onOpenProperty={onOpenProperty}
              onSuggestedPromptPress={onSuggestedPromptPress}
              showSuggestedPrompts={showLatestSuggestedPrompts && item.id === latestSuggestedPromptMessageId}
            />
          )}
        </View>
      )}
    />
  );
}

function MessageBubble({
  message,
  onPropertyPress,
  onOpenProperty,
  onSuggestedPromptPress,
  showSuggestedPrompts,
}: {
  message: MobileConversationMessage;
  onPropertyPress: (property: MobileProperty) => void;
  onOpenProperty?: (property: MobileProperty) => void;
  onSuggestedPromptPress: (prompt: string) => void;
  showSuggestedPrompts: boolean;
}) {
  const layout = useMobileLayout();
  const isUser = message.role === "user";
  const suggestedPrompts = message.suggestedPrompts ?? [];
  const trimmedText = message.text.trim();
  const startsWithLatin = /^[A-Za-z0-9]/.test(trimmedText);
  const bubbleTextAlign = startsWithLatin ? "left" : "right";
  const bubbleWritingDirection = startsWithLatin ? "ltr" : "rtl";

  return (
    <View className={cn("flex-column", isUser ? "items-end" : "items-stretch")}>
      {isUser ? (
        <View className="items-end">
          <View
            className="bg-slate-900 px-4 py-3 dark:bg-slate-50"
            style={{
              maxWidth: layout.bubbleMaxWidth,
              borderTopLeftRadius: layout.cardRadius + 2,
              borderTopRightRadius: layout.cardRadius + 2,
              borderBottomLeftRadius: 14,
              borderBottomRightRadius: layout.cardRadius + 2,
            }}
          >
            <AppText
              responsiveRole="body"
              className="font-cairo-medium text-white dark:text-slate-950"
              style={{ textAlign: bubbleTextAlign, writingDirection: bubbleWritingDirection }}
            >
              {message.text}
            </AppText>
          </View>
        </View>
      ) : (
        <View style={{ gap: layout.sectionGap - 2 }}>
          <View className="flex-row-reverse items-center gap-1.5">
            <Sparkles size={14} color="#2563EB" />
            <AppText responsiveRole="chip" className="font-cairo-black text-slate-800 dark:text-slate-100">
              مساعد عنان
            </AppText>
            <View className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <AppText responsiveRole="chip" className="font-medium text-slate-500 dark:text-slate-400">
              ذكاء اصطناعي
            </AppText>
          </View>
          <View
            className="rounded-[24px] border border-slate-200/80 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <AppText responsiveRole="bodyStrong" className="text-slate-900 dark:text-slate-50 font-cairo-bold">
              {message.text}
            </AppText>
          </View>
        </View>
      )}

      {message.uiTurn ? (
        <MobileAgUiTurnRenderer
          turn={message.uiTurn}
          onPropertyPress={onPropertyPress}
          onOpenProperty={onOpenProperty}
          onFollowupPromptPress={onSuggestedPromptPress}
        />
      ) : null}

      {!message.uiTurn && message.properties?.length ? (
        <View className="mt-5 w-full">
          <PropertyRecommendationRow
            properties={message.properties}
            onPropertyPress={onPropertyPress}
            onOpenProperty={onOpenProperty}
          />
        </View>
      ) : null}

      {!message.uiTurn && message.cards?.length ? (
        <View className="mt-5 w-full gap-4">
          {message.cards.map((card, index) => (
            <InsightCard key={`${card.type}-${index}`} card={card} />
          ))}
        </View>
      ) : null}

      {showSuggestedPrompts && suggestedPrompts.length ? (
        <ScrollView
          horizontal
          className="mt-5"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexDirection: "row-reverse", paddingHorizontal: 2 }}
        >
          {suggestedPrompts.map((prompt, index) => (
            <Pressable
              key={prompt}
              className="border border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900"
              style={{
                minHeight: layout.chipMinHeight + 4,
                borderRadius: 999,
                justifyContent: "center",
                marginLeft: index === suggestedPrompts.length - 1 ? 0 : 10,
                maxWidth: layout.width * 0.72,
              }}
              onPress={() => onSuggestedPromptPress(prompt)}
            >
              <AppText responsiveRole="chip" className="font-cairo-black tracking-tight text-slate-900 dark:text-slate-100">
                {prompt}
              </AppText>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

function SearchingIndicator() {
  const layout = useMobileLayout();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <View className="items-end">
      <View
        className="flex-row-reverse items-center border border-slate-200 bg-slate-50 px-4 dark:border-slate-800 dark:bg-slate-900"
        style={{ minHeight: layout.touchTarget, borderRadius: layout.chipRadius }}
      >
        <Animated.View style={{ opacity }} className="flex-row items-center gap-3">
          <View className="h-1.5 w-1.5 rounded-full bg-primary" />
          <AppText responsiveRole="chip" className="font-cairo-black text-primary">
            تحليل الطلب الآن...
          </AppText>
        </Animated.View>
      </View>
    </View>
  );
}

function ThreadContextCard({
  property,
  onPress,
}: {
  property: MobileProperty;
  onPress: () => void;
}) {
  const layout = useMobileLayout();

  return (
    <Pressable
      onPress={onPress}
      className="mb-3 gap-2 border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900"
      style={{ borderRadius: layout.cardRadius }}
    >
      <View className="flex-row-reverse items-center justify-between">
        <AppText responsiveRole="chip" className="font-medium text-slate-500 dark:text-slate-400 text-right">
          العقار الجاري
        </AppText>
        <Building2 size={16} color="#64748B" />
      </View>
      
      <View>
        <AppText responsiveRole="bodyStrong" className="font-cairo-black text-slate-900 dark:text-slate-50 text-right" numberOfLines={1}>
          {property.title}
        </AppText>
        <View className="flex-row-reverse items-center gap-1.5 mt-1">
          <MapPin size={14} color="#94A3B8" />
          <AppText responsiveRole="body" className="font-medium text-slate-500 dark:text-slate-400 text-right" numberOfLines={1}>
            {getPropertyLocationLabel(property)}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
}
