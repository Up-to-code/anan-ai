import { useEffect, useMemo, useRef, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlashListRef } from "@shopify/flash-list";
import { Menu, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AnanMark } from "@/components/chat/AnanMark";
import { Button } from "@/components/ui/Button";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { MobilePill, MobileSectionHeading, MobileSurface, MobileTopBar } from "@/components/ui/MobileChrome";
import { ConversationComposer } from "@/features/BuyerAssistantHomeScreen/ConversationComposer";
import { ConversationTimeline } from "@/features/BuyerAssistantHomeScreen/ConversationTimeline";
import { usePropertyAssistant } from "@/hooks/usePropertyAssistant";
import { usePropertyFeed } from "@/hooks/usePropertyFeed";
import { buildBuyerChatSuggestions } from "@/lib/buyerAssistantShared";
import { useMobileLayout } from "@/lib/mobileLayout";
import { buildAssistantSearchContext, buildSearchRouteParams, filterPropertiesForSearch } from "@/lib/mobileSearch";
import { mobileTheme } from "@/lib/mobileTheme";
import type { MobileConversationMessage, MobileProperty, MobileSearchContext, MobileThreadSummary } from "@/types/mobile";

/**
 * WHY:   The buyer journey should begin in the same chat-first assistant product model as the shared public assistant.
 * WHAT:  Renders the mobile buyer assistant shell with welcome state, thread, journey notice, and local history access.
 * HOW:   Keeps the layout mobile-native while matching the broader buyer conversation hierarchy and action flow.
 */
export default function BuyerAssistantHomeScreen() {
  const insets = useSafeAreaInsets();
  const layout = useMobileLayout();
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

  const hasMessages = assistant.messages.length > 0;
  const isLandingMode = assistant.activeThreadKind === "welcome" && !hasMessages;
  const shellBackgroundColor = isLandingMode ? mobileTheme.colors.dark : mobileTheme.colors.canvasElevated;

  return (
    <View className="flex-1" style={{ backgroundColor: shellBackgroundColor }}>
      <MobileTopBar
        insetTop={insets.top}
        backgroundColor={shellBackgroundColor}
        borderColor={isLandingMode ? "rgba(255,255,255,0.08)" : mobileTheme.colors.borderStrong}
        leading={
          <IconButton
            icon={Menu}
            onPress={() => setIsHistoryOpen(true)}
            tone={isLandingMode ? "inversePanel" : "panel"}
            size="sm"
            accessibilityLabel="سجل المحادثات"
          />
        }
        trailing={
          <IconButton
            icon={User}
            onPress={() => router.push("/account")}
            tone={isLandingMode ? "inversePanel" : "panel"}
            size="sm"
            accessibilityLabel="الحساب"
          />
        }
        centerSlot={
          <View
            className="flex-row-reverse items-center gap-2 rounded-full px-4 py-2"
            style={{
              borderWidth: 1,
              borderColor: isLandingMode ? "rgba(255,255,255,0.08)" : mobileTheme.colors.border,
              backgroundColor: isLandingMode ? "#16181E" : mobileTheme.colors.surface,
            }}
          >
            <AnanMark size={16} />
            <AppText
              responsiveRole="bodyStrong"
              className="font-cairo-black tracking-tight"
              style={{ color: isLandingMode ? "#F8FAFC" : mobileTheme.colors.ink }}
            >
              عنان
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
                minHeight: layout.height * 0.5,
                justifyContent: "center",
                paddingHorizontal: layout.contentPadding,
                paddingBottom: layout.sectionGap + 8,
              }}
              showsVerticalScrollIndicator={false}
            >
              <WelcomeState
                suggestions={suggestions.map((suggestion) => suggestion.prompt)}
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
              contextProperty={assistant.activeProperty}
              bottomPadding={layout.sectionGap + 8}
              showLatestSuggestedPrompts={!keyboardVisible}
              onShowMoreSearchResults={openSearchResultsScreen}
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
            borderTopWidth: isLandingMode ? 0 : StyleSheet.hairlineWidth,
            borderTopColor: mobileTheme.colors.borderStrong,
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
  suggestions: string[];
  onSelect: (prompt: string) => void;
}) {
  const layout = useMobileLayout();

  return (
    <View className="items-stretch justify-center" style={{ gap: layout.sectionGap + 4 }}>
      <View className="items-center gap-5 px-5 py-10">
        <AnanMark size={42} />
        <AppText
          className="text-center font-cairo-black text-white"
          style={{
            fontSize: layout.isCompact ? 26 : layout.typeScale.headline.fontSize,
            lineHeight: layout.isCompact ? 38 : layout.typeScale.headline.lineHeight + 4,
          }}
        >
          كيف يمكنني مساعدتك اليوم؟
        </AppText>
      </View>
      <PromptSuggestions prompts={suggestions} onSelect={onSelect} />
    </View>
  );
}

function PromptSuggestions({
  prompts,
  onSelect,
}: {
  prompts: string[];
  onSelect: (prompt: string) => void;
}) {
  const layout = useMobileLayout();

  return (
    <View className="gap-3">
      {prompts.map((prompt) => (
        <Pressable
          key={prompt}
          onPress={() => onSelect(prompt)}
          className="flex-row-reverse items-center justify-between rounded-full px-5 py-4"
          style={{
            minHeight: layout.chipMinHeight + 8,
            borderRadius: 999,
            backgroundColor: "#16181E",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <AppText responsiveRole="chip" className="max-w-[84%] font-cairo-black tracking-tight text-white">
            {prompt}
          </AppText>
          <View className="h-5 w-5 rounded-full" style={{ backgroundColor: "rgba(245,158,11,0.16)", alignItems: "center", justifyContent: "center" }}>
            <View className="h-2 w-2 rounded-full" style={{ backgroundColor: "#F59E0B" }} />
          </View>
        </Pressable>
      ))}
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
  const layout = useMobileLayout();

  return (
    <MobileSurface
      tone="highlight"
      radius="panel"
      shadow="none"
      className="mb-3 px-4 py-4"
      style={{ borderRadius: layout.cardRadius + 2 }}
    >
      <AppText responsiveRole="bodyStrong" className="font-cairo-black text-slate-900">
        السجل محلي حالياً وطلب المستشار متاح من هنا
      </AppText>
      <AppText responsiveRole="body" className="mt-2 font-medium text-slate-500">
        لن نفتح بوابة ويب خارجية بعد الآن. أكمل المحادثة هنا، أو أرسل طلب المستشار مباشرة من نفس السياق.
      </AppText>
      <View className="mt-4 flex-row-reverse gap-3">
        <View style={{ flex: 1 }}>
          <Button label="فهمت" variant="secondary" size="sm" onPress={onContinue} />
        </View>
        <View style={{ flex: 1 }}>
          <Button label="اطلب مستشاراً" size="sm" onPress={onRequestAdvisor} />
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

  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1" style={{ backgroundColor: mobileTheme.colors.overlay }}>
        <Pressable className="flex-1" onPress={onClose} />
        <View
          className="max-h-[78%] pb-8 pt-6"
          style={{
            borderTopLeftRadius: layout.cardRadius + 8,
            borderTopRightRadius: layout.cardRadius + 8,
            paddingHorizontal: layout.contentPadding,
            backgroundColor: mobileTheme.colors.canvasElevated,
          }}
        >
          <View className="mb-5 items-center">
            <View className="h-1.5 w-16 rounded-full" style={{ backgroundColor: mobileTheme.colors.borderStrong }} />
          </View>
          <View className="mb-5 gap-3">
            <View className="flex-row-reverse items-center justify-between gap-3">
              <AppText responsiveRole="title" className="font-cairo-black text-slate-900">
                سجل المحادثات
              </AppText>
              <Button label="إغلاق" variant="ghost" size="sm" onPress={onClose} />
            </View>
            <AppText responsiveRole="body" className="font-medium text-slate-500">
              افتح محادثة سابقة أو ابدأ محادثة جديدة.
            </AppText>
            <Button
              label="محادثة جديدة"
              variant="secondary"
              size="sm"
              onPress={onReset}
              textClassName="text-right"
              style={{ alignSelf: "flex-start" }}
            />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {recentThreads.length === 0 ? (
              <MobileSurface tone="muted" radius="panel" shadow="none" className="px-5 py-5">
                <AppText responsiveRole="body" className="font-medium text-slate-500">
                  لا يوجد سجل محفوظ بعد. ابدأ محادثة جديدة وسيظهر أحدث السياق هنا.
                </AppText>
              </MobileSurface>
            ) : (
              <View className="gap-3">
                {recentThreads.map((thread) => (
                  <Pressable
                    key={thread.id}
                    onPress={() => onSelectThread(thread)}
                    className="px-5 py-4"
                    style={{
                      borderRadius: layout.cardRadius,
                      borderWidth: 1,
                      borderColor: thread.id === activeThreadId ? mobileTheme.colors.dark : mobileTheme.colors.border,
                      backgroundColor:
                        thread.id === activeThreadId ? mobileTheme.colors.dark : mobileTheme.colors.surface,
                    }}
                  >
                    <AppText
                      responsiveRole="bodyStrong"
                      className={`font-cairo-black ${
                        thread.id === activeThreadId ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {thread.title}
                    </AppText>
                    {thread.preview ? (
                      <AppText
                        responsiveRole="body"
                        className={`mt-2 font-medium ${
                          thread.id === activeThreadId ? "text-slate-100" : "text-slate-500"
                        }`}
                        numberOfLines={2}
                      >
                        {thread.preview}
                      </AppText>
                    ) : null}
                  </Pressable>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
