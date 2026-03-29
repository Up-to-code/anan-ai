import { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View, Platform, useColorScheme } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlashListRef } from "@shopify/flash-list";
import { History, Menu, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AnanMark } from "@/components/chat/AnanMark";
import { ComposerDock } from "@/components/chat/ComposerDock";
import { MessageList } from "@/components/chat/MessageList";
import { Button } from "@/components/ui/Button";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { usePropertyAssistant } from "@/hooks/usePropertyAssistant";
import { usePropertyFeed } from "@/hooks/usePropertyFeed";
import { buildBuyerChatSuggestions } from "@/lib/buyerAssistantShared";
import { useMobileLayout } from "@/lib/mobileLayout";
import { useKeyboardDock } from "@/lib/useKeyboardDock";
import type { MobileConversationMessage, MobileProperty, MobileThreadSummary } from "@/types/mobile";

/**
 * WHY:   The buyer journey should begin in the same chat-first assistant product model as client-web.
 * WHAT:  Renders the mobile buyer assistant shell with welcome state, thread, auth gate, and history access.
 * HOW:   Keeps the layout mobile-native while matching the web buyer conversation hierarchy and action flow.
 */
export default function BuyerAssistantHomeScreen() {
  const insets = useSafeAreaInsets();
  const layout = useMobileLayout();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const assistant = usePropertyAssistant();
  const feed = usePropertyFeed();
  const router = useRouter();
  const params = useLocalSearchParams<{ propertyId?: string; threadId?: string }>();
  const listRef = useRef<FlashListRef<MobileConversationMessage> | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [dockHeight, setDockHeight] = useState(layout.composerHeight + 32);
  const dock = useKeyboardDock({ bottomInset: insets.bottom, dockHeight });
  const appliedRoutePropertyId = useRef<string | null>(null);
  const appliedThreadId = useRef<string | null>(null);
  const suggestions = useMemo(() => buildBuyerChatSuggestions("ar", "default"), []);

  useEffect(() => {
    const timer = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(timer);
  }, [assistant.messages.length]);

  useEffect(() => {
    if (dock.keyboardVisible) {
      const timer = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 120);
      return () => clearTimeout(timer);
    }
  }, [dock.keyboardVisible]);

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
    router.push({ pathname: "/property/[id]", params: { id: property.id } });
  }

  const hasMessages = assistant.messages.length > 0;

  return (
    <View className="flex-1 bg-slate-100 dark:bg-slate-950">
      <View
        className="bg-slate-100 dark:bg-slate-950 pb-4"
        style={{ paddingTop: insets.top + 8, paddingHorizontal: layout.contentPadding }}
      >
        <View className="flex-row items-center justify-between relative mt-2">
          <View className="w-12 h-12 items-start justify-center">
            <IconButton icon={Menu} onPress={() => setIsHistoryOpen(true)} tone="panel" className="rounded-full" />
          </View>

          <View className="absolute left-0 right-0 items-center justify-center pointer-events-none z-0" style={{ height: 52 }}>
            <View className="flex-row-reverse items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-4 py-2 dark:border-slate-800 dark:bg-slate-900/90">
              <AnanMark size={20} />
              <View className="items-end">
                <AppText responsiveRole="chip" className="font-cairo-black tracking-tight text-slate-900 dark:text-slate-50">
                  عنان
                </AppText>
                <AppText responsiveRole="meta" className="font-medium text-slate-500 dark:text-slate-400">
                  مساعدك العقاري
                </AppText>
              </View>
            </View>
          </View>

          <View className="flex-row items-center gap-1.5 z-10">
            <IconButton icon={History} onPress={() => setIsHistoryOpen(true)} tone="panel" className="rounded-full" />
            <IconButton icon={User} onPress={() => router.push("/account")} tone="panel" className="rounded-full" />
          </View>
        </View>
      </View>

      <View className="flex-1">
        {assistant.activeThreadKind === "welcome" && !hasMessages ? (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              minHeight: layout.height * 0.52,
              justifyContent: "center",
              paddingHorizontal: layout.contentPadding,
              paddingBottom: dock.listBottomPadding,
            }}
            showsVerticalScrollIndicator={false}
          >
            <WelcomeState
              suggestions={suggestions.map((suggestion) => suggestion.prompt)}
              onSelect={(prompt) => void assistant.submit(prompt)}
            />
          </ScrollView>
        ) : (
          <MessageList
            listRef={listRef}
            messages={assistant.messages}
            isTyping={assistant.isSubmitting}
            onPropertyPress={(property) => void assistant.askAboutProperty(property)}
            onOpenProperty={openPropertyDetail}
            contextProperty={assistant.activeProperty}
            bottomPadding={dock.listBottomPadding}
            showLatestSuggestedPrompts={!dock.keyboardVisible}
            onSuggestedPromptPress={(prompt) => {
              if (prompt.includes("مستشار")) {
                void assistant.requestAdvisor();
                return;
              }
              void assistant.submit(prompt);
            }}
          />
        )}
      </View>

      <View
        className="absolute left-0 right-0"
        style={{
          bottom: dock.dockBottomOffset,
        }}
      >
        <View
          onLayout={(event) => {
            const nextHeight = Math.ceil(event.nativeEvent.layout.height);
            if (nextHeight !== dockHeight) setDockHeight(nextHeight);
          }}
          style={{
            paddingHorizontal: layout.contentPadding,
            paddingBottom: dock.keyboardVisible && Platform.OS === "ios" ? 12 : Math.max(insets.bottom, 12),
          }}
        >
          {assistant.showAuthCallout ? (
            <AuthGateNotice
              onContinue={() => void assistant.syncTranscriptToAccount(false)}
              onRequestAdvisor={() => void assistant.requestAdvisor()}
            />
          ) : null}

          <ComposerDock
            value={assistant.draft}
            onChange={assistant.setDraft}
            onSend={() => void assistant.submit()}
            onSubmitVoiceRecording={(fileUri) => assistant.submitVoiceRecording(fileUri)}
          />
        </View>
      </View>

      <HistorySheet
        open={isHistoryOpen}
        activeThreadId={assistant.activeThreadId}
        recentThreads={assistant.recentThreads}
        onClose={() => setIsHistoryOpen(false)}
        onReset={() => {
          assistant.resetToWelcome();
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
      <View className="items-center gap-4">
        <View className="h-20 w-20 items-center justify-center rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <AnanMark size={40} />
        </View>
        <AppText responsiveRole="title" className="text-center font-cairo-black text-slate-900 dark:text-slate-50">
          كيف أقدر أساعدك اليوم؟
        </AppText>
        <AppText responsiveRole="body" className="text-center font-medium text-slate-500 dark:text-slate-400 px-4 leading-7">
          اطلب ترشيحات عقارية، راجع التمويل، قارن الخيارات، أو اطلب تحويلك إلى مستشار من نفس المحادثة.
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
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ flexDirection: "row-reverse", paddingHorizontal: 2 }}
    >
      {prompts.map((prompt, index) => (
        <Pressable
          key={prompt}
          onPress={() => onSelect(prompt)}
          className="border border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900"
          style={{
            minHeight: layout.chipMinHeight + 4,
            borderRadius: 999,
            justifyContent: "center",
            marginLeft: index === prompts.length - 1 ? 0 : 10,
            maxWidth: layout.width * 0.72,
            shadowColor: "#0F172A",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.06,
            shadowRadius: 16,
            elevation: 3,
          }}
        >
          <AppText responsiveRole="chip" className="font-cairo-black tracking-tight text-slate-900 dark:text-slate-100">
            {prompt}
          </AppText>
        </Pressable>
      ))}
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

  return (
    <View
      className="mb-3 border border-dashed border-slate-300 bg-white px-4 py-4 dark:border-slate-700 dark:bg-slate-900"
      style={{ borderRadius: layout.cardRadius }}
    >
      <AppText responsiveRole="bodyStrong" className="font-cairo-black text-slate-900 dark:text-slate-50">
        سجّل الدخول لحفظ السجل أو إكمال التحويل
      </AppText>
      <AppText responsiveRole="body" className="mt-2 font-medium text-slate-500 dark:text-slate-400">
        سنستخدم بوابة الويب الحالية لحفظ المحادثة على حسابك ثم نعيدك إلى التجربة المناسبة.
      </AppText>
      <View className="mt-4 flex-row-reverse gap-3">
        <View style={{ flex: 1 }}>
          <Button label="حفظ السجل" variant="secondary" size="sm" onPress={onContinue} />
        </View>
        <View style={{ flex: 1 }}>
          <Button label="اطلب مستشاراً" size="sm" onPress={onRequestAdvisor} />
        </View>
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

  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/40">
        <Pressable className="flex-1" onPress={onClose} />
        <View
          className="max-h-[78%] bg-slate-50 pb-8 pt-6 dark:bg-slate-950"
          style={{
            borderTopLeftRadius: layout.cardRadius + 8,
            borderTopRightRadius: layout.cardRadius + 8,
            paddingHorizontal: layout.contentPadding,
          }}
        >
          <View className="mb-5 items-center">
            <View className="h-1.5 w-16 rounded-full bg-slate-300 dark:bg-slate-700" />
          </View>
          <View className="mb-5 gap-3">
            <View className="flex-row-reverse items-center justify-between gap-3">
              <AppText responsiveRole="title" className="font-cairo-black text-slate-900 dark:text-slate-50">
                سجل المحادثات
              </AppText>
              <Button label="إغلاق" variant="ghost" size="sm" onPress={onClose} />
            </View>
            <AppText responsiveRole="body" className="font-medium text-slate-500 dark:text-slate-400">
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
              <View
                className="border border-slate-200 bg-white px-5 py-5 dark:border-slate-800 dark:bg-slate-900"
                style={{ borderRadius: layout.cardRadius }}
              >
                <AppText responsiveRole="body" className="font-medium text-slate-500 dark:text-slate-400">
                  لا يوجد سجل محفوظ بعد. ابدأ محادثة جديدة وسيظهر أحدث السياق هنا.
                </AppText>
              </View>
            ) : (
              <View className="gap-3">
                {recentThreads.map((thread) => (
                  <Pressable
                    key={thread.id}
                    onPress={() => onSelectThread(thread)}
                    className={`border px-5 py-4 ${
                      thread.id === activeThreadId
                        ? "border-slate-900 bg-slate-900 dark:border-slate-50 dark:bg-slate-50"
                        : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                    }`}
                    style={{ borderRadius: layout.cardRadius }}
                  >
                    <AppText
                      responsiveRole="bodyStrong"
                      className={`font-cairo-black ${
                        thread.id === activeThreadId ? "text-white dark:text-slate-950" : "text-slate-900 dark:text-slate-50"
                      }`}
                    >
                      {thread.title}
                    </AppText>
                    {thread.preview ? (
                      <AppText
                        responsiveRole="body"
                        className={`mt-2 font-medium ${
                          thread.id === activeThreadId ? "text-slate-100 dark:text-slate-700" : "text-slate-500 dark:text-slate-400"
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
