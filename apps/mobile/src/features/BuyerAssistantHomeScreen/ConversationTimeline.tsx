import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, Keyboard, Platform, Pressable, ScrollView, TurboModuleRegistry, View } from "react-native";
import type { BubbleProps, IMessage } from "react-native-gifted-chat";
import { MobileAgUiTurnRenderer } from "@/components/chat/ag-ui/MobileAgUiTurnRenderer";
import { InsightCard } from "@/components/chat/InsightCard";
import { PropertyRecommendationRow } from "@/components/chat/PropertyRecommendationRow";
import { SearchResultsPanel } from "@/components/chat/SearchResultsPanel";
import { Button } from "@/components/ui/Button";
import { AppText } from "@/components/ui/AppText";
import { MobileSurface } from "@/components/ui/MobileChrome";
import { ConversationComposer } from "@/features/BuyerAssistantHomeScreen/ConversationComposer";
import { useMobileLocale } from "@/lib/mobileLocale";
import { useAppTheme } from "@/lib/mobileTheme";
import type { MobileConversationMessage, MobileProperty, MobileSearchContext } from "@/types/mobile";

type GiftedMobileMessage = IMessage & {
  mobileMessage: MobileConversationMessage;
};

type BubbleRenderProps = BubbleProps<GiftedMobileMessage> & {
  onVisibleTextChange?: () => void;
};

type GiftedChatComponent = <TMessage extends IMessage = IMessage>(props: {
  messages?: TMessage[];
  isTyping?: boolean;
  user?: { _id: string | number; name?: string };
  renderAvatar?: (...args: any[]) => React.ReactNode;
  renderDay?: (...args: any[]) => React.ReactNode;
  renderTime?: (...args: any[]) => React.ReactNode;
  renderUsername?: (...args: any[]) => React.ReactNode;
  renderBubble?: (props: BubbleProps<TMessage>) => React.ReactNode;
  renderCustomView?: (props: BubbleProps<TMessage>) => React.ReactNode;
  renderInputToolbar?: (props: any) => React.ReactNode;
  isCustomViewBottom?: boolean;
  inverted?: boolean;
  messagesContainerStyle?: Record<string, unknown>;
  keyboardShouldPersistTaps?: "always" | "never" | "handled";
  textInputProps?: Record<string, unknown>;
  onSend?: (...args: any[]) => void;
}) => React.ReactElement | null;

type ConversationTimelineProps = {
  messages: MobileConversationMessage[];
  isTyping?: boolean;
  streamingAssistantText?: string;
  value: string;
  onChange: (value: string) => void;
  onSend: (value: string) => void;
  onSubmitVoiceRecording: (fileUri: string) => Promise<void>;
  selectedProperties?: MobileProperty[];
  comparePicking?: boolean;
  maxCompareProperties?: number;
  onPressPromptProperty?: (property: MobileProperty) => void;
  onPressComparePrompt?: () => void;
  onRemoveSelectedProperty?: (propertyId: string) => void;
  onToggleComparePicking?: () => void;
  onPropertyPress: (property: MobileProperty) => void;
  onAddPropertyToSelection?: (property: MobileProperty) => void;
  onOpenProperty?: (property: MobileProperty) => void;
  onOpenGallery?: (property: MobileProperty, initialIndex: number) => void;
  onSuggestedPromptPress: (prompt: string) => void;
  onShowMoreSearchResults?: (searchContext: MobileSearchContext) => void;
  ambientBackgroundColor?: string;
  bottomInset?: number;
  headerContent?: React.ReactNode;
  selectedPropertyIds?: string[];
  showAuthCallout?: boolean;
  onContinueAuthGate?: () => void;
  onRequestAdvisor?: () => void;
  composerVariant?: "landing" | "thread";
};

function buildGiftedMessage(message: MobileConversationMessage): GiftedMobileMessage {
  return {
    _id: message.id,
    text: message.text,
    createdAt: message.createdAt ?? Date.now(),
    user: {
      _id: message.role === "user" ? "user" : "assistant",
      name: message.role === "user" ? "Buyer" : "Anan",
    },
    mobileMessage: message,
  };
}

function useFastRevealText(text: string, enabled: boolean) {
  const [visibleText, setVisibleText] = useState(text);

  useEffect(() => {
    if (!enabled || text.length <= 1) {
      setVisibleText(text);
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let index = 0;
    const chunkSize = text.length > 280 ? 18 : text.length > 160 ? 14 : 10;

    setVisibleText("");

    const tick = () => {
      index = Math.min(text.length, index + chunkSize);
      setVisibleText(text.slice(0, index));
      if (index < text.length) {
        timeoutId = setTimeout(tick, 16);
      }
    };

    timeoutId = setTimeout(tick, 16);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [enabled, text]);

  return visibleText;
}

function loadGiftedChat(): GiftedChatComponent | null {
  try {
    const keyboardControllerModule = TurboModuleRegistry.get("KeyboardController") as
      | { getConstants?: unknown }
      | null;
    if (typeof keyboardControllerModule?.getConstants !== "function") {
      return null;
    }

    const giftedChatModule = require("react-native-gifted-chat") as {
      GiftedChat?: GiftedChatComponent;
    };

    return giftedChatModule.GiftedChat ?? null;
  } catch {
    return null;
  }
}

function useKeyboardInset() {
  const [keyboardInset, setKeyboardInset] = useState(0);

  useEffect(() => {
    const resolveInset = (screenY?: number) => {
      if (typeof screenY !== "number") return 0;
      const screenHeight = Dimensions.get("window").height;
      return Math.max(screenHeight - screenY, 0);
    };

    const onKeyboardShow = (event: { endCoordinates?: { screenY?: number; height?: number } }) => {
      const nextInset =
        resolveInset(event.endCoordinates?.screenY) ||
        Math.max(event.endCoordinates?.height ?? 0, 0);
      setKeyboardInset(nextInset);
    };

    const onKeyboardHide = () => {
      setKeyboardInset(0);
    };

    const showSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillChangeFrame" : "keyboardDidShow",
      onKeyboardShow,
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      onKeyboardHide,
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return keyboardInset;
}

function PromptChips({
  prompts,
  onPress,
}: {
  prompts: string[];
  onPress: (prompt: string) => void;
}) {
  const theme = useAppTheme();

  return (
    <ScrollView
      horizontal
      className="mt-4"
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ flexDirection: "row-reverse", paddingHorizontal: 2 }}
    >
      {prompts.map((prompt, index) => (
        <Pressable
          key={prompt}
          className="px-4 py-2"
          style={({ pressed }) => ({
            borderRadius: theme.radii.pill,
            justifyContent: "center",
            marginLeft: index === prompts.length - 1 ? 0 : 8,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
          onPress={() => onPress(prompt)}
        >
          <AppText className="text-[13px] font-cairo-bold" style={{ color: theme.colors.ink }}>
            {prompt}
          </AppText>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function AssistantStructuredContent(props: {
  message: MobileConversationMessage;
  onPropertyPress: (property: MobileProperty) => void;
  onAddPropertyToSelection?: (property: MobileProperty) => void;
  onOpenProperty?: (property: MobileProperty) => void;
  onOpenGallery?: (property: MobileProperty, initialIndex: number) => void;
  onSuggestedPromptPress: (prompt: string) => void;
  onShowMoreSearchResults?: (searchContext: MobileSearchContext) => void;
  ambientBackgroundColor?: string;
  comparePicking?: boolean;
  selectedPropertyIds?: string[];
}) {
  const theme = useAppTheme();
  const { dictionary } = useMobileLocale();
  const { message } = props;
  const suggestedPrompts = message.suggestedPrompts ?? [];

  const hasStructuredContent =
    Boolean(message.uiTurn) ||
    (message.properties?.length ?? 0) > 0 ||
    (message.cards?.length ?? 0) > 0 ||
    ((message.searchResults?.length ?? 0) > 0 && message.searchContext) ||
    suggestedPrompts.length > 0;

  if (!hasStructuredContent) return null;

  return (
    <View className="mt-3">
      {message.uiTurn ? (
        <MobileAgUiTurnRenderer
          turn={message.uiTurn}
          onPropertyPress={props.onPropertyPress}
          onOpenProperty={props.onOpenProperty}
          onOpenGallery={props.onOpenGallery}
          onFollowupPromptPress={props.onSuggestedPromptPress}
          ambientBackgroundColor={props.ambientBackgroundColor}
          selectionEnabled={props.comparePicking}
          selectedPropertyIds={props.selectedPropertyIds}
          onAddPropertyToSelection={props.onAddPropertyToSelection}
        />
      ) : null}

      {!message.uiTurn && (message.properties?.length ?? 0) > 0 ? (
        <View className="mt-1">
          <PropertyRecommendationRow
            properties={message.properties ?? []}
            onPropertyPress={props.onPropertyPress}
            onOpenProperty={props.onOpenProperty}
            onOpenGallery={props.onOpenGallery}
            onShowMore={() => props.onSuggestedPromptPress(dictionary.assistant.showMoreResults)}
            ambientBackgroundColor={props.ambientBackgroundColor}
            selectionEnabled={props.comparePicking}
            selectedPropertyIds={props.selectedPropertyIds}
            onAddPropertyToSelection={props.onAddPropertyToSelection}
          />
        </View>
      ) : null}

      {message.searchContext && (message.searchResults?.length ?? 0) > 0 ? (
        <SearchResultsPanel
          searchContext={message.searchContext}
          results={message.searchResults ?? []}
          onPropertyPress={props.onPropertyPress}
          onOpenProperty={props.onOpenProperty}
          onOpenGallery={props.onOpenGallery}
          onShowMore={
            props.onShowMoreSearchResults && message.searchContext
              ? () => props.onShowMoreSearchResults?.(message.searchContext!)
              : undefined
          }
          ambientBackgroundColor={props.ambientBackgroundColor ?? theme.colors.canvas}
          selectionEnabled={props.comparePicking}
          selectedPropertyIds={props.selectedPropertyIds}
          onAddPropertyToSelection={props.onAddPropertyToSelection}
        />
      ) : null}

      {!message.uiTurn && (message.cards?.length ?? 0) > 0 ? (
        <View className="mt-4 gap-4">
          {(message.cards ?? []).map((card, index) => (
            <InsightCard key={`${card.type}-${index}`} card={card} />
          ))}
        </View>
      ) : null}

      {suggestedPrompts.length > 0 ? (
        <PromptChips prompts={suggestedPrompts} onPress={props.onSuggestedPromptPress} />
      ) : null}
    </View>
  );
}

function SearchingIndicator() {
  const theme = useAppTheme();

  return (
    <View className="items-start">
      <View
        className="rounded-full px-4 py-3"
        style={{ backgroundColor: theme.colors.surfaceMuted, borderWidth: 1, borderColor: theme.colors.border }}
      >
        <View className="flex-row items-center gap-1.5">
          <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
          <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: theme.colors.primary, opacity: 0.7 }} />
          <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: theme.colors.primary, opacity: 0.4 }} />
        </View>
      </View>
    </View>
  );
}

function AssistantMessageText({
  text,
  shouldAnimate,
  onVisibleTextChange,
}: {
  text: string;
  shouldAnimate: boolean;
  onVisibleTextChange?: () => void;
}) {
  const theme = useAppTheme();
  const { isRtl } = useMobileLocale();
  const trimmedText = text.trim();
  const startsWithLatin = /^[A-Za-z0-9]/.test(trimmedText);
  const textAlign = startsWithLatin ? "left" : "right";
  const writingDirection = startsWithLatin ? "ltr" : "rtl";
  const visibleText = useFastRevealText(text, shouldAnimate);

  useEffect(() => {
    onVisibleTextChange?.();
  }, [onVisibleTextChange, visibleText]);

  if (!trimmedText.length) {
    return <SearchingIndicator />;
  }

  return (
    <View className={isRtl ? "items-end" : "items-start"}>
      <View className="w-full px-1 py-1">
        <AppText
          responsiveRole="body"
          className="font-cairo-medium"
          style={{
            color: theme.colors.ink,
            textAlign,
            writingDirection,
            fontSize: 15,
            lineHeight: 27,
          }}
        >
          {visibleText}
        </AppText>
      </View>
    </View>
  );
}

function UserMessageBubble({ text }: { text: string }) {
  const theme = useAppTheme();
  const { isRtl } = useMobileLocale();
  const trimmedText = text.trim();
  const startsWithLatin = /^[A-Za-z0-9]/.test(trimmedText);
  const textAlign = startsWithLatin ? "left" : "right";
  const writingDirection = startsWithLatin ? "ltr" : "rtl";

  return (
    <View className={isRtl ? "items-start" : "items-end"}>
      <View style={{ maxWidth: "86%", paddingHorizontal: 2, paddingVertical: 2 }}>
        <AppText
          responsiveRole="body"
          className="font-cairo-medium leading-relaxed"
          style={{
            fontSize: 15,
            textAlign,
            writingDirection,
            color: theme.colors.inkMuted,
          }}
        >
          {text}
        </AppText>
      </View>
    </View>
  );
}

function AuthGateNotice({
  onContinue,
  onRequestAdvisor,
}: {
  onContinue: () => void;
  onRequestAdvisor: () => void;
}) {
  const theme = useAppTheme();
  const { dictionary, isRtl } = useMobileLocale();

  return (
    <MobileSurface tone="highlight" radius="card" shadow="none" className="mb-3 px-4 py-4">
      <AppText responsiveRole="bodyStrong" className="font-cairo-bold" style={{ color: theme.colors.ink }}>
        {dictionary.account.localSession}
      </AppText>
      <AppText responsiveRole="body" className="mt-2 font-medium" style={{ color: theme.colors.inkSoft }}>
        {dictionary.assistant.localHistory}
      </AppText>
      <View className={`mt-5 gap-3 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
        <View style={{ flex: 1 }}>
          <Button label={dictionary.common.confirm} variant="secondary" size="sm" onPress={onContinue} />
        </View>
        <View style={{ flex: 1 }}>
          <Button label={dictionary.assistant.requestAdvisor} variant="accent" size="sm" onPress={onRequestAdvisor} />
        </View>
      </View>
    </MobileSurface>
  );
}

function GiftedConversationToolbar({
  composer,
}: {
  composer: Omit<ConversationTimelineProps, "messages" | "headerContent">;
}) {
  const theme = useAppTheme();
  const bottomPadding = Math.max(composer.bottomInset ?? 0, 12);

  return (
    <View
      style={{
        paddingHorizontal: 18,
        paddingTop: 6,
        paddingBottom: bottomPadding,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        backgroundColor: composer.ambientBackgroundColor ?? theme.colors.canvas,
      }}
    >
      {composer.showAuthCallout && composer.onContinueAuthGate && composer.onRequestAdvisor ? (
        <AuthGateNotice onContinue={composer.onContinueAuthGate} onRequestAdvisor={composer.onRequestAdvisor} />
      ) : null}

      <ConversationComposer
        value={composer.value}
        onChange={composer.onChange}
        onSend={composer.onSend}
        onSubmitVoiceRecording={composer.onSubmitVoiceRecording}
        selectedProperties={composer.selectedProperties}
        comparePicking={composer.comparePicking}
        maxCompareProperties={composer.maxCompareProperties}
        onPressPromptProperty={composer.onPressPromptProperty}
        onPressComparePrompt={composer.onPressComparePrompt}
        onRemoveSelectedProperty={composer.onRemoveSelectedProperty}
        onToggleComparePicking={composer.onToggleComparePicking}
        isProcessing={composer.isTyping}
        variant={composer.composerVariant ?? "thread"}
      />
    </View>
  );
}

function PlainConversationFallback({
  messages,
  renderBubble,
  renderCustomView,
  renderInputToolbar,
  ambientBackgroundColor,
  bottomInset = 0,
  headerContent,
}: {
  messages: GiftedMobileMessage[];
  renderBubble: (props: BubbleRenderProps) => React.ReactNode;
  renderCustomView: (props: BubbleProps<GiftedMobileMessage>) => React.ReactNode;
  renderInputToolbar: () => React.ReactNode;
  ambientBackgroundColor?: string;
  bottomInset?: number;
  headerContent?: React.ReactNode;
}) {
  const keyboardInset = useKeyboardInset();
  const scrollRef = useRef<ScrollView | null>(null);
  const [toolbarHeight, setToolbarHeight] = useState(0);
  const toolbarLift = Platform.OS === "ios" ? keyboardInset : 0;
  const scrollBottomPadding = toolbarHeight > 0 ? toolbarHeight : 140 + bottomInset;

  const scrollToEnd = useCallback((animated = true) => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated });
    });
  }, []);

  useEffect(() => {
    scrollToEnd(false);
  }, [messages, scrollToEnd]);

  useEffect(() => {
    if (keyboardInset > 0 || toolbarHeight > 0) {
      scrollToEnd(false);
    }
  }, [keyboardInset, scrollToEnd, toolbarHeight]);

  return (
    <View className="flex-1" style={{ backgroundColor: ambientBackgroundColor }}>
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 12, paddingBottom: scrollBottomPadding }}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
        {headerContent ? <View className="pb-6">{headerContent}</View> : null}
        {messages.map((message) => (
          <View key={String(message._id)} className="mb-5">
            {renderBubble({ currentMessage: message, onVisibleTextChange: scrollToEnd })}
            {renderCustomView({ currentMessage: message })}
          </View>
        ))}
      </ScrollView>

      <View
        onLayout={(event) => {
          const nextHeight = Math.round(event.nativeEvent.layout.height);
          setToolbarHeight((current) => (current === nextHeight ? current : nextHeight));
        }}
        style={{
          marginBottom: toolbarLift,
          backgroundColor: ambientBackgroundColor,
        }}
      >
        {renderInputToolbar()}
      </View>
    </View>
  );
}

/**
 * WHY:   The buyer assistant needs one library-backed chat host without losing the existing Anan mobile visual language.
 * WHAT:  Renders the mobile conversation using Gifted Chat with custom Anan bubbles, structured cards, and composer shell.
 * HOW:   Maps stored mobile messages into Gifted Chat messages, injects a temporary streamed assistant row while the backend responds, and overrides the default toolbar/bubble rendering with existing mobile primitives.
 */
export function ConversationTimeline({
  messages,
  isTyping,
  streamingAssistantText,
  value,
  onChange,
  onSend,
  onSubmitVoiceRecording,
  selectedProperties = [],
  comparePicking = false,
  maxCompareProperties = 3,
  onPressPromptProperty,
  onPressComparePrompt,
  onRemoveSelectedProperty,
  onToggleComparePicking,
  onPropertyPress,
  onAddPropertyToSelection,
  onOpenProperty,
  onOpenGallery,
  onSuggestedPromptPress,
  onShowMoreSearchResults,
  ambientBackgroundColor,
  bottomInset = 0,
  headerContent,
  selectedPropertyIds = [],
  showAuthCallout = false,
  onContinueAuthGate,
  onRequestAdvisor,
  composerVariant = "thread",
}: ConversationTimelineProps) {
  const theme = useAppTheme();
  const GiftedChat = useMemo(() => loadGiftedChat(), []);
  const initialAssistantMessageIdRef = useRef<string | null>(
    [...messages].reverse().find((message) => message.role === "assistant")?.id ?? null,
  );
  const latestAssistantMessageId = useMemo(
    () => [...messages].reverse().find((message) => message.role === "assistant")?.id ?? null,
    [messages],
  );

  const giftedMessages = useMemo<GiftedMobileMessage[]>(() => {
    const normalized = messages.map(buildGiftedMessage);
    if (isTyping) {
      normalized.push({
        _id: "streaming-assistant",
        text: streamingAssistantText?.trim() ? streamingAssistantText : "",
        createdAt: Date.now(),
        pending: true,
        user: {
          _id: "assistant",
          name: "Anan",
        },
        mobileMessage: {
          id: "streaming-assistant",
          role: "assistant",
          text: streamingAssistantText?.trim() ? streamingAssistantText : "",
          suggestedPrompts: [],
        },
      });
    }
    return normalized;
  }, [isTyping, messages, streamingAssistantText]);

  const renderBubble = useCallback(
    (props: BubbleRenderProps) => {
      const currentMessage = props.currentMessage?.mobileMessage;
      if (!currentMessage) return null;

      const isUser = currentMessage.role === "user";
      const shouldAnimateAssistantText =
        currentMessage.role === "assistant" &&
        (
          props.currentMessage?.pending === true ||
          (
            currentMessage.id === latestAssistantMessageId &&
            latestAssistantMessageId !== initialAssistantMessageIdRef.current
          )
        );

      if (isUser) {
        return <UserMessageBubble text={currentMessage.text} />;
      }

      if (props.currentMessage?.pending && currentMessage.text.trim().length === 0) {
        return <SearchingIndicator />;
      }

      return (
        <View>
          <AssistantMessageText
            text={currentMessage.text}
            shouldAnimate={shouldAnimateAssistantText}
            onVisibleTextChange={props.onVisibleTextChange}
          />
        </View>
      );
    },
    [latestAssistantMessageId],
  );

  const renderCustomView = useCallback(
    (props: BubbleProps<GiftedMobileMessage>) => {
      const currentMessage = props.currentMessage?.mobileMessage;
      if (!currentMessage || currentMessage.role !== "assistant") return null;

      return (
        <AssistantStructuredContent
          message={currentMessage}
          onPropertyPress={onPropertyPress}
          onAddPropertyToSelection={onAddPropertyToSelection}
          onOpenProperty={onOpenProperty}
          onOpenGallery={onOpenGallery}
          onSuggestedPromptPress={onSuggestedPromptPress}
          onShowMoreSearchResults={onShowMoreSearchResults}
          ambientBackgroundColor={ambientBackgroundColor}
          comparePicking={comparePicking}
          selectedPropertyIds={selectedPropertyIds}
        />
      );
    },
    [ambientBackgroundColor, onOpenGallery, onOpenProperty, onPropertyPress, onShowMoreSearchResults, onSuggestedPromptPress],
  );

  const renderToolbar = () => (
    <GiftedConversationToolbar
      composer={{
        isTyping,
        streamingAssistantText,
        value,
        onChange,
        onSend,
        onSubmitVoiceRecording,
        selectedProperties,
        comparePicking,
        maxCompareProperties,
        onPressPromptProperty,
        onPressComparePrompt,
        onRemoveSelectedProperty,
        onToggleComparePicking,
        onPropertyPress,
        onAddPropertyToSelection,
        onOpenProperty,
        onOpenGallery,
        onSuggestedPromptPress,
        onShowMoreSearchResults,
        ambientBackgroundColor,
        bottomInset,
        selectedPropertyIds,
        showAuthCallout,
        onContinueAuthGate,
        onRequestAdvisor,
        composerVariant,
      }}
    />
  );

  if (!GiftedChat || headerContent) {
    return (
      <PlainConversationFallback
        messages={giftedMessages}
        renderBubble={renderBubble}
        renderCustomView={renderCustomView}
        renderInputToolbar={renderToolbar}
        ambientBackgroundColor={ambientBackgroundColor ?? theme.colors.canvas}
        bottomInset={bottomInset}
        headerContent={headerContent}
      />
    );
  }

  return (
    <GiftedChat<GiftedMobileMessage>
      messages={giftedMessages}
      isTyping={false}
      inverted={false}
      user={{ _id: "user", name: "Buyer" }}
      renderAvatar={() => null}
      renderDay={() => null}
      renderTime={() => null}
      renderUsername={() => null}
      renderBubble={renderBubble}
      renderCustomView={renderCustomView}
      isCustomViewBottom
      renderInputToolbar={renderToolbar}
      messagesContainerStyle={{
        backgroundColor: ambientBackgroundColor ?? theme.colors.canvas,
        paddingHorizontal: 18,
        paddingTop: 12,
      }}
      keyboardShouldPersistTaps="always"
      textInputProps={{
        editable: false,
      }}
      onSend={() => undefined}
    />
  );
}
