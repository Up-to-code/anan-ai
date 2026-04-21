import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Menu, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AnanMark } from "@/components/chat/AnanMark";
import { Button } from "@/components/ui/Button";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { MobileSurface, MobileTopBar } from "@/components/ui/MobileChrome";
import { ConversationTimeline } from "@/features/BuyerAssistantHomeScreen/ConversationTimeline";
import {
  buildPropertySelectionPrompt,
  buildPropertySelectionTopicPromptForLocale,
} from "@/features/BuyerAssistantHomeScreen/propertyPrompt";
import { usePropertyAssistant } from "@/hooks/usePropertyAssistant";
import { usePropertyFeed } from "@/hooks/usePropertyFeed";
import { cn } from "@/lib/cn";
import { useMobileLocale } from "@/lib/mobileLocale";
import { useMobileLayout } from "@/lib/mobileLayout";
import { buildAssistantSearchContext, buildSearchRouteParams } from "@/lib/mobileSearch";
import { useAppTheme } from "@/lib/mobileTheme";
import type { MobileProperty, MobileSearchContext, MobileThreadSummary } from "@/types/mobile";

const MAX_COMPARE_PROPERTIES = 3;

function useStableEvent<T extends (...args: never[]) => void>(handler: T) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  return useCallback(((...args: Parameters<T>) => handlerRef.current(...args)) as T, []);
}

export default function BuyerAssistantHomeScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const { locale, dictionary, isRtl } = useMobileLocale();
  const assistant = usePropertyAssistant();
  const feed = usePropertyFeed();
  const router = useRouter();
  const params = useLocalSearchParams<{ newThread?: string; propertyId?: string; threadId?: string }>();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isComparePicking, setIsComparePicking] = useState(false);
  const appliedRoutePropertyId = useRef<string | null>(null);
  const appliedThreadId = useRef<string | null>(null);
  const appliedNewThreadToken = useRef<string | null>(null);
  const assistantSearchContext = useMemo(
    () =>
      buildAssistantSearchContext({
        activeProperty: assistant.activeProperty,
        lastUserMessage: assistant.latestUserMessage,
        threadId: assistant.activeThreadId,
        locale,
      }),
    [assistant.activeProperty, assistant.activeThreadId, assistant.latestUserMessage, locale],
  );
  const handleCreateNewThread = useStableEvent(() => {
    assistant.createNewThread();
  });
  const handleSetPropertyContext = useStableEvent((property: MobileProperty) => {
    assistant.setPropertyContext(property);
  });
  const handleOpenHistoryThread = useStableEvent((threadId: string) => {
    void assistant.openHistoryThread(threadId);
  });

  useEffect(() => {
    if (assistant.selectedProperties.length === 0 && isComparePicking) {
      setIsComparePicking(false);
    }
  }, [assistant.selectedProperties.length, isComparePicking]);

  useEffect(() => {
    if (!assistant.isHydrated) return;
    if (!params.newThread) {
      appliedNewThreadToken.current = null;
      return;
    }
    if (appliedNewThreadToken.current === params.newThread) return;

    appliedNewThreadToken.current = params.newThread;
    setIsComparePicking(false);
    handleCreateNewThread();
    router.replace("/");
  }, [assistant.isHydrated, handleCreateNewThread, params.newThread, router]);

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
    setIsComparePicking(false);
    handleSetPropertyContext(property);
  }, [assistant.isHydrated, feed, handleSetPropertyContext, params.propertyId]);

  useEffect(() => {
    if (!assistant.isHydrated) return;
    if (!params.threadId) {
      appliedThreadId.current = null;
      return;
    }
    if (appliedThreadId.current === params.threadId) return;
    appliedThreadId.current = params.threadId;
    setIsComparePicking(false);
    handleOpenHistoryThread(params.threadId);
  }, [assistant.isHydrated, handleOpenHistoryThread, params.threadId]);

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
    openSearchResultsScreen(assistantSearchContext);
  }

  function openSearchResultsScreen(searchContext: MobileSearchContext) {
    router.push({
      pathname: "/search",
      params: buildSearchRouteParams(searchContext),
    });
  }

  function applyPropertyPromptForProperty(property: MobileProperty) {
    const prompt = buildPropertySelectionTopicPromptForLocale([property], "details", locale);
    if (!prompt) return;
    assistant.setDraft(prompt);
  }

  function applyComparePrompt() {
    const prompt = buildPropertySelectionPrompt(assistant.selectedProperties, locale);
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

  function submitDraft(nextValue: string) {
    setIsComparePicking(false);
    void assistant.submit(nextValue);
  }

  function submitSuggestedPrompt(prompt: string) {
    setIsComparePicking(false);
    if (prompt === dictionary.assistant.requestAdvisor || prompt.toLowerCase().includes("advisor")) {
      void assistant.requestAdvisor();
      return;
    }
    if (prompt === dictionary.assistant.showMoreResults || prompt.toLowerCase().includes("similar results")) {
      openAssistantSearchInChat();
      return;
    }
    void assistant.submit(prompt);
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
            accessibilityLabel={dictionary.assistant.history}
          />
        }
        trailing={
          <IconButton
            icon={User}
            onPress={() => router.push("/account")}
            tone="panel"
            size="sm"
            accessibilityLabel={dictionary.common.account}
          />
        }
        centerSlot={
          <View
            className={cn("items-center gap-2", isRtl ? "flex-row-reverse" : "flex-row")}
          >
            <AnanMark size={16} />
            <AppText
              responsiveRole="bodyStrong"
              className="font-cairo-bold"
              style={{ color: theme.colors.ink, fontSize: 16 }}
            >
              {dictionary.assistant.title}
            </AppText>
          </View>
        }
      />

      <View className="flex-1">
        {isLandingMode ? (
          <ConversationTimeline
            messages={[]}
            isTyping={assistant.isSubmitting}
            streamingAssistantText={assistant.streamingAssistantText}
            value={assistant.draft}
            onChange={assistant.setDraft}
            onSend={submitDraft}
            onSubmitVoiceRecording={(fileUri) => assistant.submitVoiceRecording(fileUri)}
            selectedProperties={assistant.selectedProperties}
            comparePicking={isComparePicking}
            maxCompareProperties={MAX_COMPARE_PROPERTIES}
            onPressPromptProperty={applyPropertyPromptForProperty}
            onPressComparePrompt={applyComparePrompt}
            onRemoveSelectedProperty={(propertyId) => assistant.removePropertyFromSelection(propertyId)}
            onToggleComparePicking={() => setIsComparePicking((current) => !current)}
            onPropertyPress={(property) => assistant.setPropertyContext(property)}
            onAddPropertyToSelection={addPropertyToSelection}
            onOpenProperty={openPropertyDetail}
            onOpenGallery={openPropertyGallery}
            onShowMoreSearchResults={openSearchResultsScreen}
            ambientBackgroundColor={shellBackgroundColor}
            bottomInset={insets.bottom}
            headerContent={<WelcomeState />}
            selectedPropertyIds={assistant.selectedProperties.map((property) => property.id)}
            onSuggestedPromptPress={submitSuggestedPrompt}
            showAuthCallout={assistant.showAuthCallout}
            onContinueAuthGate={() => assistant.setShowAuthCallout(false)}
            onRequestAdvisor={() => void assistant.requestAdvisor()}
            composerVariant="landing"
          />
        ) : (
          <ConversationTimeline
            messages={assistant.messages}
            isTyping={assistant.isSubmitting}
            streamingAssistantText={assistant.streamingAssistantText}
            value={assistant.draft}
            onChange={assistant.setDraft}
            onSend={submitDraft}
            onSubmitVoiceRecording={(fileUri) => assistant.submitVoiceRecording(fileUri)}
            selectedProperties={assistant.selectedProperties}
            comparePicking={isComparePicking}
            maxCompareProperties={MAX_COMPARE_PROPERTIES}
            onPressPromptProperty={applyPropertyPromptForProperty}
            onPressComparePrompt={applyComparePrompt}
            onRemoveSelectedProperty={(propertyId) => assistant.removePropertyFromSelection(propertyId)}
            onToggleComparePicking={() => setIsComparePicking((current) => !current)}
            onPropertyPress={(property) => assistant.setPropertyContext(property)}
            onAddPropertyToSelection={addPropertyToSelection}
            onOpenProperty={openPropertyDetail}
            onOpenGallery={openPropertyGallery}
            onShowMoreSearchResults={openSearchResultsScreen}
            ambientBackgroundColor={shellBackgroundColor}
            bottomInset={insets.bottom}
            selectedPropertyIds={assistant.selectedProperties.map((property) => property.id)}
            onSuggestedPromptPress={submitSuggestedPrompt}
            showAuthCallout={assistant.showAuthCallout}
            onContinueAuthGate={() => assistant.setShowAuthCallout(false)}
            onRequestAdvisor={() => void assistant.requestAdvisor()}
            composerVariant="thread"
          />
        )}
      </View>

      <HistorySheet
        open={isHistoryOpen}
        activeThreadId={assistant.activeThreadId}
        recentThreads={assistant.recentThreads}
        onClose={() => setIsHistoryOpen(false)}
        onReset={() => {
          setIsComparePicking(false);
          assistant.createNewThread();
          setIsHistoryOpen(false);
        }}
        onSelectThread={(thread) => {
          setIsComparePicking(false);
          setIsHistoryOpen(false);
          void assistant.openHistoryThread(thread.id);
        }}
      />
    </View>
  );
}

function WelcomeState() {
  const layout = useMobileLayout();
  const theme = useAppTheme();
  const { dictionary } = useMobileLocale();

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
          {dictionary.auth.title}
        </AppText>
      </View>

      <View className="px-6">
      </View>
    </View>
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
  const { dictionary, isRtl } = useMobileLocale();

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
            <View className={`items-center justify-between gap-3 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
              <AppText responsiveRole="title" className="font-cairo-bold" style={{ color: theme.colors.ink }}>
                {dictionary.assistant.history}
              </AppText>
              <Button label={dictionary.common.close} variant="ghost" size="sm" onPress={onClose} />
            </View>
            <AppText responsiveRole="body" className="font-medium" style={{ color: theme.colors.inkMuted }}>
              {dictionary.accountHistory.titleBody}
            </AppText>
            <Button
              label={dictionary.assistant.threadFallbackTitle}
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
                  {dictionary.accountHistory.emptyTitle}
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
