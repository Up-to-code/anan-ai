import type { RefObject } from "react";
import { Animated, Pressable, ScrollView, View } from "react-native";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import { useEffect, useRef } from "react";
import { Building2, MapPin, Sparkles } from "lucide-react-native";
import { MobileAgUiTurnRenderer } from "@/components/chat/ag-ui/MobileAgUiTurnRenderer";
import { InsightCard } from "@/components/chat/InsightCard";
import { PropertyRecommendationRow } from "@/components/chat/PropertyRecommendationRow";
import { SearchResultsPanel } from "@/components/chat/SearchResultsPanel";
import { AppText } from "@/components/ui/AppText";
import { useMobileLayout } from "@/lib/mobileLayout";
import { getPropertyLocationLabel } from "@/lib/mobileData";
import { useAppTheme } from "@/lib/mobileTheme";
import type { MobileConversationMessage, MobileProperty, MobileSearchContext } from "@/types/mobile";

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

type MessageListProps = {
  listRef: RefObject<FlashListRef<MobileConversationMessage> | null>;
  messages: MobileConversationMessage[];
  isTyping?: boolean;
  onPropertyPress: (property: MobileProperty) => void;
  onOpenProperty?: (property: MobileProperty) => void;
  onOpenGallery?: (property: MobileProperty, initialIndex: number) => void;
  onSuggestedPromptPress: (prompt: string) => void;
  bottomPadding?: number;
  contextProperty?: MobileProperty | null;
  showLatestSuggestedPrompts?: boolean;
};

/**
 * WHAT:  Timeline logic adopting soft bubbles and delicate frames.
 */
export function MessageList({
  listRef,
  messages,
  isTyping,
  onPropertyPress,
  onOpenProperty,
  onOpenGallery,
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
              onOpenGallery={onOpenGallery}
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
  onOpenGallery,
  onSuggestedPromptPress,
  onShowMoreSearchResults,
  showSuggestedPrompts,
}: {
  message: MobileConversationMessage;
  onPropertyPress: (property: MobileProperty) => void;
  onOpenProperty?: (property: MobileProperty) => void;
  onOpenGallery?: (property: MobileProperty, initialIndex: number) => void;
  onSuggestedPromptPress: (prompt: string) => void;
  onShowMoreSearchResults?: (context: MobileSearchContext) => void;
  showSuggestedPrompts: boolean;
}) {
  const layout = useMobileLayout();
  const theme = useAppTheme();
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
            style={{
              maxWidth: layout.bubbleMaxWidth,
              borderRadius: theme.radii.bubble,
              backgroundColor: theme.colors.userBubble,
              paddingHorizontal: 16,
              paddingVertical: 10,
            }}
          >
            <AppText
              responsiveRole="body"
              className="font-cairo-medium leading-relaxed"
              style={{
                fontSize: 15,
                textAlign: bubbleTextAlign,
                writingDirection: bubbleWritingDirection,
                color: theme.colors.userBubbleText,
              }}
            >
              {message.text}
            </AppText>
          </View>
        </View>
      ) : (
        <View style={{ gap: 8 }}>
          <View className="flex-row-reverse items-start gap-3">
             <View 
                className="h-8 w-8 items-center justify-center rounded-full mt-0.5" 
                style={{ backgroundColor: theme.colors.primarySoft, borderWidth: 1, borderColor: theme.colors.primaryMuted }}
             >
                <Sparkles size={16} color={theme.colors.primary} />
             </View>
             <View className="flex-1">
                <View
                  className="px-1 py-1"
                  style={{
                    backgroundColor: "transparent",
                  }}
                >
                  <AppText responsiveRole="bodyStrong" className="font-cairo-semibold leading-relaxed" style={{ fontSize: 16, color: theme.colors.ink }}>
                    {message.text}
                  </AppText>
                </View>
             </View>
          </View>
        </View>
      )}

      {message.uiTurn ? (
        <View className="mt-2">
          <MobileAgUiTurnRenderer
            turn={message.uiTurn}
            onPropertyPress={onPropertyPress}
            onOpenProperty={onOpenProperty}
            onOpenGallery={onOpenGallery}
            onFollowupPromptPress={onSuggestedPromptPress}
            ambientBackgroundColor={theme.colors.canvas}
          />
        </View>
      ) : null}

      {!message.uiTurn && message.properties?.length ? (
        <View className="mt-4 w-full">
          <PropertyRecommendationRow
            properties={message.properties}
            onPropertyPress={onPropertyPress}
            onOpenProperty={onOpenProperty}
            onOpenGallery={onOpenGallery}
            onShowMore={() => onSuggestedPromptPress("اعرض نتائج مشابهة")}
            ambientBackgroundColor={theme.colors.canvas}
          />
        </View>
      ) : null}

      {message.searchContext && message.searchResults?.length ? (
        <SearchResultsPanel
          searchContext={message.searchContext}
          results={message.searchResults}
          onPropertyPress={onPropertyPress}
          onOpenProperty={onOpenProperty}
          onOpenGallery={onOpenGallery}
          ambientBackgroundColor={theme.colors.canvas}
        />
      ) : null}

      {!message.uiTurn && message.cards?.length ? (
        <View className="mt-4 w-full gap-4">
          {message.cards.map((card, index) => (
            <InsightCard key={`${card.type}-${index}`} card={card} />
          ))}
        </View>
      ) : null}

      {showSuggestedPrompts && suggestedPrompts.length ? (
        <ScrollView
          horizontal
          className="mt-4"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexDirection: "row-reverse", paddingHorizontal: 2 }}
        >
          {suggestedPrompts.map((prompt, index) => (
            <Pressable
              key={prompt}
              className="px-4 py-2"
              style={({ pressed }) => ({
                borderRadius: theme.radii.pill,
                justifyContent: "center",
                marginLeft: index === suggestedPrompts.length - 1 ? 0 : 8,
                maxWidth: layout.width * 0.72,
                borderWidth: 1,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
              onPress={() => onSuggestedPromptPress(prompt)}
            >
              <AppText className="text-[13px] font-cairo-bold" style={{ color: theme.colors.ink }}>
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
  const theme = useAppTheme();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <View className="flex-row-reverse items-center gap-3">
      <View 
        className="h-8 w-8 items-center justify-center rounded-full" 
        style={{ backgroundColor: theme.colors.surfaceMuted, borderWidth: 1, borderColor: theme.colors.border }}
      >
        <Sparkles size={16} color={theme.colors.inkMuted} />
      </View>
      <Animated.View style={{ opacity }} className="flex-row items-center gap-1.5">
        <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
        <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: theme.colors.primary, opacity: 0.7 }} />
        <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: theme.colors.primary, opacity: 0.4 }} />
      </Animated.View>
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
  const theme = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      className="mb-3 gap-2 px-5 py-4"
      style={{
        borderRadius: theme.radii.card, // Card 16px geometry
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surfaceMuted,
      }}
    >
      <View className="flex-row-reverse items-center justify-between">
        <AppText className="text-[11px] font-cairo-bold text-right" style={{ color: theme.colors.inkMuted }}>
          العقار الجاري
        </AppText>
        <Building2 size={16} color={theme.colors.inkMuted} />
      </View>

      <View>
        <AppText responsiveRole="bodyStrong" className="font-cairo-bold text-right" numberOfLines={1} style={{ color: theme.colors.ink }}>
          {property.title}
        </AppText>
        <View className="flex-row-reverse items-center gap-1.5 mt-1">
          <MapPin size={14} color={theme.colors.inkMuted} />
          <AppText responsiveRole="body" className="font-medium text-right" numberOfLines={1} style={{ color: theme.colors.inkMuted }}>
            {getPropertyLocationLabel(property)}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
}
