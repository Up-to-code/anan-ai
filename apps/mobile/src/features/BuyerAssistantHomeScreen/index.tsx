import React, { useEffect, useMemo, useRef, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlashListRef } from "@shopify/flash-list";
import { Menu, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AnanMark } from "@/components/chat/AnanMark";
import { Button } from "@/components/ui/Button";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { MobileSurface, MobileTopBar } from "@/components/ui/MobileChrome";
import { ConversationComposer } from "@/features/BuyerAssistantHomeScreen/ConversationComposer";
import { ConversationTimeline } from "@/features/BuyerAssistantHomeScreen/ConversationTimeline";
import {
  buildPropertySelectionPrompt,
  buildPropertySelectionTopicPrompt,
} from "@/features/BuyerAssistantHomeScreen/propertyPrompt";
import { usePropertyAssistant } from "@/hooks/usePropertyAssistant";
import { usePropertyFeed } from "@/hooks/usePropertyFeed";
import { buildBuyerChatSuggestions, type BuyerChatSuggestion } from "@/lib/buyerAssistantShared";
import { useMobileLayout } from "@/lib/mobileLayout";
import { buildAssistantSearchContext, buildSearchRouteParams, filterPropertiesForSearch } from "@/lib/mobileSearch";
import { getMobileShadow, useAppTheme } from "@/lib/mobileTheme";
import type { MobileConversationMessage, MobileProperty, MobileSearchContext, MobileThreadSummary } from "@/types/mobile";

const MAX_COMPARE_PROPERTIES = 3;

export default function BuyerAssistantHomeScreen() {
  const insets = useSafeAreaInsets();
  const layout = useMobileLayout();
  const theme = useAppTheme();
  const assistant = usePropertyAssistant();
  const feed = usePropertyFeed();
  const router = useRouter();
  const params = useLocalSearchParams<{ propertyId?: string; threadId?: string }>();
  const listRef = useRef<FlashListRef<MobileConversationMessage> | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isComparePicking, setIsComparePicking] = useState(false);
  const appliedRoutePropertyId = useRef<string | null>(null);
  const appliedThreadId = useRef<string | null>(null);
  const suggestions = useMemo(() => buildBuyerChatSuggestions("ar", "default"), []);
  const assistantSearchContext = useMemo(
    () =>
      buildAssistantSearchContext({
        activeProperty: assistant.activeProperty,
        lastUserMessage: assistant.latestUserMessage,
        threadId: assistant.activeThreadId,
      }),
    [assistant.activeProperty, assistant.activeThreadId, assistant.latestUserMessage],
  );
  const composerBottomInset = keyboardVisible ? 10 : Math.max(insets.bottom, 12);
  
  useEffect(() => {
    const timer = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(timer);
  }, [assistant.messages.length]);

  useEffect(() => {
    if (keyboardVisible) {
      const timer = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 120);
      return () => clearTimeout(timer);
    }
  }, [keyboardVisible]);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (assistant.selectedProperties.length === 0 && isComparePicking) {
      setIsComparePicking(false);
    }
  }, [assistant.selectedProperties.length, isComparePicking]);

  useEffect(() => {
    if (!assistant.isHydrated) return;
    if (!params.propertyId) {
      appliedRoutePropertyId.current = null;
      return;
    }
    if (appliedRoutePropertyId.current === params.propertyId) return;
    const property = feed.findPropertyById(params.propertyId);
    if (!property) return;

    appliedRoutePropertyId.current = property.id;
    void assistant.askAboutProperty(property);
  }, [assistant, assistant.isHydrated, feed, params.propertyId]);

  useEffect(() => {
    if (!assistant.isHydrated) return;
    if (!params.threadId) {
      appliedThreadId.current = null;
      return;
    }
    if (appliedThreadId.current === params.threadId) return;
    appliedThreadId.current = params.threadId;
    void assistant.openHistoryThread(params.threadId);
  }, [assistant, assistant.isHydrated, params.threadId]);

  function openPropertyDetail(property: MobileProperty) {
    router.push({
      pathname: "/property/[id]",
      params: {
        id: property.id,
        ...(assistant.activeThreadId ? { threadId: assistant.activeThreadId } : {}),
      },
    });
  }

  function openPropertyGallery(property: MobileProperty, initialIndex: number) {
    router.push({
      pathname: "/gallery",
      params: {
        propertyId: property.id,
        initialIndex: String(initialIndex),
        ...(assistant.activeThreadId ? { threadId: assistant.activeThreadId } : {}),
      },
    });
  }

  function openAssistantSearchInChat() {
    if (!assistantSearchContext) return;
    const filtered = filterPropertiesForSearch(feed.properties, {
      query: assistantSearchContext.query ?? "",
      selectedArea: assistantSearchContext.area ?? "الكل",
      selectedOwnerType: assistantSearchContext.ownerType ?? "الكل",
      allFilterLabel: "الكل",
    }).filter((property) => property.id !== assistantSearchContext.sourcePropertyId);

    const nextResults = filtered.slice(0, 6);
    if (nextResults.length === 0) {
      assistant.showSearchResults({
        searchContext: assistantSearchContext,
        results: assistantSearchContext.sourcePropertyId
          ? feed.properties.filter((property) => property.id !== assistantSearchContext.sourcePropertyId).slice(0, 6)
          : feed.properties.slice(0, 6),
      });
      return;
    }

    assistant.showSearchResults({
      searchContext: assistantSearchContext,
      results: nextResults,
    });
  }

  function openSearchResultsScreen(searchContext: MobileSearchContext) {
    router.push({
      pathname: "/search",
      params: buildSearchRouteParams(searchContext),
    });
  }

  function applyPropertyPromptForProperty(property: MobileProperty) {
    const prompt = buildPropertySelectionTopicPrompt([property], "details");
    if (!prompt) return;
    assistant.setDraft(prompt);
  }

  function applyComparePrompt() {
    const prompt = buildPropertySelectionPrompt(assistant.selectedProperties);
    if (!prompt) return;
    assistant.setDraft(prompt);
    setIsComparePicking(false);
  }

  function addPropertyToSelection(property: MobileProperty) {
    assistant.addPropertyToSelection(property);
    if (assistant.selectedProperties.length + 1 >= MAX_COMPARE_PROPERTIES) {
      setIsComparePicking(false);
    }
  }

  const hasMessages = assistant.messages.length > 0;
  const isLandingMode = assistant.activeThreadKind === "welcome" && !hasMessages;
  const shellBackgroundColor = isLandingMode ? theme.colors.canvas : theme.colors.canvasElevated;
  const latestSuggestions =
    assistant.messages
      .at(-1)
      ?.suggestedPrompts?.map((prompt, index) => ({
        id: `${index}-${prompt}`,
        prompt,
        label: undefined,
      })) ?? suggestions;

  return (
    <View className="flex-1" style={{ backgroundColor: shellBackgroundColor }}>
      <MobileTopBar
        insetTop={insets.top}
        backgroundColor={shellBackgroundColor}
        borderColor={theme.colors.border}
        leading={
          <IconButton
            icon={Menu}
            onPress={() => setIsHistoryOpen(true)}
            tone="panel"
            size="sm"
            accessibilityLabel="سجل المحادثات"
          />
        }
        trailing={
          <IconButton
            icon={User}
            onPress={() => router.push("/account")}
            tone="panel"
            size="sm"
            accessibilityLabel="الحساب"
          />
        }
        centerSlot={
          <View
            className="flex-row-reverse items-center gap-2"
          >
            <AnanMark size={16} />
            <AppText
              responsiveRole="bodyStrong"
              className="font-cairo-bold"
              style={{ color: theme.colors.ink, fontSize: 16 }}
            >
              مساعد عنان
            </AppText>
          </View>
        }
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <View className="flex-1">
          {isLandingMode ? (
            <ScrollView
              className="flex-1"
              contentContainerStyle={{
                flexGrow: 1,
                paddingHorizontal: layout.contentPadding,
                paddingBottom: layout.sectionGap,
              }}
              showsVerticalScrollIndicator={false}
            >
              <WelcomeState />
            </ScrollView>
          ) : (
            <ConversationTimeline
              listRef={listRef}
              messages={assistant.messages}
              isTyping={assistant.isSubmitting}
              onPropertyPress={(property) => void assistant.askAboutProperty(property)}
              onAddPropertyToSelection={addPropertyToSelection}
              onOpenProperty={openPropertyDetail}
              onOpenGallery={openPropertyGallery}
              bottomPadding={layout.sectionGap}
              showLatestSuggestedPrompts={false}
              onShowMoreSearchResults={openSearchResultsScreen}
              ambientBackgroundColor={shellBackgroundColor}
              selectedPropertyIds={assistant.selectedProperties.map((property) => property.id)}
              comparePicking={isComparePicking}
              maxCompareProperties={MAX_COMPARE_PROPERTIES}
              onSuggestedPromptPress={(prompt) => {
                if (prompt.includes("مستشار")) {
                  void assistant.requestAdvisor();
                  return;
                }
                if (prompt.includes("نتائج مشابهة")) {
                  openAssistantSearchInChat();
                  return;
                }
                void assistant.submit(prompt);
              }}
            />
          )}
        </View>

        <View
          style={{
            paddingHorizontal: layout.contentPadding,
            paddingTop: assistant.showAuthCallout ? 6 : 6,
            paddingBottom: composerBottomInset,
            borderTopWidth: isLandingMode ? 0 : 1, // 1px delicate border
            borderTopColor: theme.colors.border,
            backgroundColor: shellBackgroundColor,
          }}
        >
          {assistant.showAuthCallout ? (
            <AuthGateNotice
              onContinue={() => void assistant.syncTranscriptToAccount()}
              onRequestAdvisor={() => void assistant.requestAdvisor()}
            />
          ) : null}

          <ExamplePromptFeed
            prompts={latestSuggestions}
            onSelect={(prompt) => void assistant.submit(prompt)}
          />

          <ConversationComposer
            value={assistant.draft}
            onChange={assistant.setDraft}
            onSend={() => void assistant.submit()}
            onSubmitVoiceRecording={(fileUri) => assistant.submitVoiceRecording(fileUri)}
            selectedProperties={assistant.selectedProperties}
            comparePicking={isComparePicking}
            maxCompareProperties={MAX_COMPARE_PROPERTIES}
            onPressPromptProperty={applyPropertyPromptForProperty}
            onPressComparePrompt={applyComparePrompt}
            onRemoveSelectedProperty={(propertyId) => assistant.removePropertyFromSelection(propertyId)}
            onToggleComparePicking={() => setIsComparePicking((current) => !current)}
            variant={isLandingMode ? "landing" : "thread"}
          />
        </View>
      </KeyboardAvoidingView>

      <HistorySheet
        open={isHistoryOpen}
        activeThreadId={assistant.activeThreadId}
        recentThreads={assistant.recentThreads}
        onClose={() => setIsHistoryOpen(false)}
        onReset={() => {
          assistant.createNewThread();
          setIsHistoryOpen(false);
        }}
        onSelectThread={(thread) => {
          setIsHistoryOpen(false);
          void assistant.openHistoryThread(thread.id);
        }}
      />
    </View>
  );
}

function WelcomeState({
}: {}) {
  const layout = useMobileLayout();
  const theme = useAppTheme();

  return (
    <View
      className="flex-1 items-stretch"
      style={{
        minHeight: Math.max(layout.height * 0.64, 460),
        justifyContent: "space-between",
        paddingTop: Math.max(layout.height * 0.18, 92),
        paddingBottom: 8,
      }}
    >
      <View className="items-center justify-center gap-4">
        <AnanMark size={28} />
        <AppText
          className="text-center font-cairo-bold text-[22px]"
          style={{ color: theme.colors.ink }}
        >
          كيف أقدر أساعدك اليوم؟
        </AppText>
      </View>

      <View className="px-6">
      </View>
    </View>
  );
}

function ExamplePromptFeed({
  prompts,
  onSelect,
}: {
  prompts: BuyerChatSuggestion[];
  onSelect: (prompt: string) => void;
}) {
  const layout = useMobileLayout();
  const theme = useAppTheme();

  if (prompts.length === 0) return null;

  return (
    <View
      className="mb-3"
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 2 }}
      >
        <View className="flex-row-reverse gap-2.5">
          {prompts.map((prompt) => (
            <Pressable
              key={prompt.id}
              onPress={() => onSelect(prompt.prompt)}
              className="justify-center px-4 py-3.5"
              style={({ pressed }) => ({
                width: Math.min(Math.max(layout.width * 0.5, 168), 208),
                minHeight: 70,
                borderRadius: 18,
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.border,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
            >
              <AppText
                className="text-right font-cairo-bold text-[13px] leading-6"
                style={{ color: theme.colors.ink }}
                numberOfLines={2}
              >
                {prompt.prompt}
              </AppText>
              {prompt.label ? (
                <AppText
                  className="mt-1 text-right text-[10.5px] leading-5"
                  style={{ color: theme.colors.inkMuted }}
                  numberOfLines={2}
                >
                  {prompt.label}
                </AppText>
              ) : null}
            </Pressable>
          ))}
        </View>
      </ScrollView>
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

  return (
    <MobileSurface tone="highlight" radius="card" shadow="none" className="mb-3 px-4 py-4">
      <AppText responsiveRole="bodyStrong" className="font-cairo-bold" style={{ color: theme.colors.ink }}>
        يحفظ السجل محلياً
      </AppText>
      <AppText responsiveRole="body" className="mt-2 font-medium" style={{ color: theme.colors.inkSoft }}>
        أكمل المحادثة داخل التطبيق مباشرة، أو اطلب تدخل المستشار إذا احتجت.
      </AppText>
      <View className="mt-5 flex-row-reverse gap-3">
        <View style={{ flex: 1 }}>
          <Button label="فهمت" variant="secondary" size="sm" onPress={onContinue} />
        </View>
        <View style={{ flex: 1 }}>
          <Button label="اطلب مستشاراً" variant="accent" size="sm" onPress={onRequestAdvisor} />
        </View>
      </View>
    </MobileSurface>
  );
}

function HistorySheet({
  open,
  activeThreadId,
  recentThreads,
  onClose,
  onReset,
  onSelectThread,
}: {
  open: boolean;
  activeThreadId: string | null;
  recentThreads: MobileThreadSummary[];
  onClose: () => void;
  onReset: () => void;
  onSelectThread: (thread: MobileThreadSummary) => void;
}) {
  const layout = useMobileLayout();
  const theme = useAppTheme();

  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1" style={{ backgroundColor: theme.colors.overlay }}>
        <Pressable className="flex-1" onPress={onClose} />
        <View
          className="max-h-[78%] pb-8 pt-6"
          style={{
            borderTopLeftRadius: theme.radii.panel,
            borderTopRightRadius: theme.radii.panel,
            paddingHorizontal: layout.contentPadding,
            backgroundColor: theme.colors.canvasElevated,
          }}
        >
          <View className="mb-5 items-center">
            <View className="h-1.5 w-16 rounded-full" style={{ backgroundColor: theme.colors.borderStrong }} />
          </View>
          <View className="mb-5 gap-3">
            <View className="flex-row-reverse items-center justify-between gap-3">
              <AppText responsiveRole="title" className="font-cairo-bold" style={{ color: theme.colors.ink }}>
                السجل السابق
              </AppText>
              <Button label="إغلاق" variant="ghost" size="sm" onPress={onClose} />
            </View>
            <AppText responsiveRole="body" className="font-medium" style={{ color: theme.colors.inkMuted }}>
              افتح محادثة سابقة أو ابدأ محادثة جديدة.
            </AppText>
            <Button
              label="محادثة جديدة"
              variant="accent"
              size="sm"
              onPress={onReset}
              textClassName="text-right"
              style={{ alignSelf: "flex-start" }}
            />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {recentThreads.length === 0 ? (
              <MobileSurface tone="muted" radius="card" shadow="none" className="px-5 py-5">
                <AppText responsiveRole="body" className="font-bold text-center" style={{ color: theme.colors.inkMuted }}>
                  لا يوجد سجل محفوظ.
                </AppText>
              </MobileSurface>
            ) : (
              <View className="gap-3">
                {recentThreads.map((thread) => {
                  const isActive = thread.id === activeThreadId;
                  return (
                    <Pressable
                      key={thread.id}
                      onPress={() => onSelectThread(thread)}
                      className="px-5 py-4"
                      style={({ pressed }) => ({
                        borderRadius: theme.radii.card,
                        borderWidth: 1,
                        borderColor: isActive ? theme.colors.primary : theme.colors.border,
                        backgroundColor: isActive ? theme.colors.primarySoft : theme.colors.surface,
                        transform: [{ scale: pressed ? 0.98 : 1 }],
                      })}
                    >
                      <AppText
                        responsiveRole="bodyStrong"
                        className="font-cairo-bold"
                        style={{ color: isActive ? theme.colors.primary : theme.colors.ink }}
                      >
                        {thread.title}
                      </AppText>
                      {thread.preview ? (
                        <AppText
                          responsiveRole="body"
                          className="mt-2 font-medium"
                          numberOfLines={2}
                          style={{ color: theme.colors.inkMuted }}
                        >
                          {thread.preview}
                        </AppText>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
