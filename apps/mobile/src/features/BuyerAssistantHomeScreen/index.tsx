import React, { useEffect, useMemo, useRef, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlashListRef } from "@shopify/flash-list";
import { Menu, Plus, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AnanMark } from "@/components/chat/AnanMark";
import { Button } from "@/components/ui/Button";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { MobileSurface, MobileTopBar } from "@/components/ui/MobileChrome";
import { ConversationComposer } from "@/features/BuyerAssistantHomeScreen/ConversationComposer";
import { ConversationTimeline } from "@/features/BuyerAssistantHomeScreen/ConversationTimeline";
import { applyActivePropertyPromptToDraft } from "@/features/BuyerAssistantHomeScreen/propertyPrompt";
import { usePropertyAssistant } from "@/hooks/usePropertyAssistant";
import { usePropertyFeed } from "@/hooks/usePropertyFeed";
import { buildBuyerChatSuggestions, type BuyerChatSuggestion } from "@/lib/buyerAssistantShared";
import { useMobileLayout } from "@/lib/mobileLayout";
import { buildAssistantSearchContext, buildSearchRouteParams, filterPropertiesForSearch } from "@/lib/mobileSearch";
import { useAppTheme, getMobileShadow } from "@/lib/mobileTheme";
import type { MobileConversationMessage, MobileProperty, MobileSearchContext, MobileThreadSummary } from "@/types/mobile";

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
    if (!assistant.isHydrated) return;
    if (!params.propertyId) return;
    if (appliedRoutePropertyId.current === params.propertyId) return;
    const property = feed.findPropertyById(params.propertyId);
    if (!property) return;

    appliedRoutePropertyId.current = property.id;
    void assistant.askAboutProperty(property);
  }, [assistant, assistant.isHydrated, feed, params.propertyId]);

  useEffect(() => {
    if (!assistant.isHydrated) return;
    if (!params.threadId) return;
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

  function applyActivePropertyPrompt(property: MobileProperty) {
    assistant.setDraft((currentDraft) => applyActivePropertyPromptToDraft(currentDraft, property));
  }

  const hasMessages = assistant.messages.length > 0;
  const isLandingMode = assistant.activeThreadKind === "welcome" && !hasMessages;
  const shellBackgroundColor = isLandingMode ? theme.colors.canvas : theme.colors.canvasElevated;

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
                paddingBottom: layout.sectionGap + 8,
              }}
              showsVerticalScrollIndicator={false}
            >
              <WelcomeState
                suggestions={suggestions}
                onSelect={(prompt) => void assistant.submit(prompt)}
              />
            </ScrollView>
          ) : (
            <ConversationTimeline
              listRef={listRef}
              messages={assistant.messages}
              isTyping={assistant.isSubmitting}
              onPropertyPress={(property) => void assistant.askAboutProperty(property)}
              onOpenProperty={openPropertyDetail}
              onOpenGallery={openPropertyGallery}
              bottomPadding={layout.sectionGap + 8}
              showLatestSuggestedPrompts={!keyboardVisible}
              onShowMoreSearchResults={openSearchResultsScreen}
              ambientBackgroundColor={shellBackgroundColor}
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

          <ConversationComposer
            value={assistant.draft}
            onChange={assistant.setDraft}
            onSend={() => void assistant.submit()}
            onSubmitVoiceRecording={(fileUri) => assistant.submitVoiceRecording(fileUri)}
            activeProperty={assistant.activeProperty}
            onApplyActivePropertyPrompt={applyActivePropertyPrompt}
            ambientBackgroundColor={shellBackgroundColor}
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
  suggestions,
  onSelect,
}: {
  suggestions: BuyerChatSuggestion[];
  onSelect: (prompt: string) => void;
}) {
  const layout = useMobileLayout();
  const theme = useAppTheme();

  return (
    <View
      className="flex-1 items-stretch"
      style={{
        minHeight: Math.max(layout.height * 0.62, 440),
        justifyContent: "space-between",
        paddingTop: Math.max(layout.height * 0.16, 72),
        paddingBottom: 12,
      }}
    >
      <View className="items-center justify-center">
        <View
          className="items-center justify-center"
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <AnanMark size={24} />
        </View>
      </View>

      <View>
        <PromptSuggestions prompts={suggestions} onSelect={onSelect} />
      </View>
    </View>
  );
}

function PromptSuggestions({
  prompts,
  onSelect,
}: {
  prompts: BuyerChatSuggestion[];
  onSelect: (prompt: string) => void;
}) {
  const layout = useMobileLayout();
  const theme = useAppTheme();
  const cardWidth = Math.min(Math.max(layout.width * 0.5, 164), 188);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 2 }}
    >
      <View className="flex-row-reverse gap-3">
        {prompts.map((prompt) => (
          <Pressable
            key={prompt.id}
            onPress={() => onSelect(prompt.prompt)}
            className="justify-center px-3.5 py-3"
            style={({ pressed }) => ({
              width: cardWidth,
              minHeight: 68,
              borderRadius: 14,
              backgroundColor: theme.colors.promptStarterSurface,
              borderWidth: 1,
              borderColor: theme.colors.border,
              ...getMobileShadow("card"),
              transform: [{ scale: pressed ? 0.97 : 1 }],
            })}
          >
            <AppText
              className="text-right font-cairo-bold text-[11.5px] leading-snug"
              style={{ color: theme.colors.ink }}
              numberOfLines={2}
            >
              {prompt.prompt}
            </AppText>
            {prompt.label ? (
              <AppText
                className="mt-0.5 text-right text-[10px] leading-snug"
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
  );
}


function AuthGateNotice({
  onContinue,
  onRequestAdvisor,
}: {
  onContinue: () => void;
  onRequestAdvisor: () => void;
}) {
  const layout = useMobileLayout();
  const theme = useAppTheme();

  return (
    <MobileSurface
      tone="highlight"
      radius="card"
      shadow="none"
      className="mb-3 px-4 py-4"
    >
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
            borderTopLeftRadius: theme.radii.panel, // Soft panel corner logic
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
                        borderRadius: theme.radii.card, // Gentle 16px radius
                        borderWidth: 1,
                        borderColor: isActive ? theme.colors.primary : theme.colors.border,
                        backgroundColor: isActive
                          ? theme.colors.primarySoft
                          : theme.colors.surface,
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
