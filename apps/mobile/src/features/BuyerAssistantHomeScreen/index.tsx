import { useEffect, useRef } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { FlashListRef } from "@shopify/flash-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Menu, Settings, User } from "lucide-react-native";
import { ComposerDock } from "@/components/chat/ComposerDock";
import { AnanMark } from "@/components/chat/AnanMark";
import { MessageList } from "@/components/chat/MessageList";
import { useBuyerAssistant } from "@/hooks/useBuyerAssistant";
import { AppText } from "@/components/ui/AppText";
import type { ConversationMessage, JourneyAction, PropertyPreview } from "@/types/chat";

/**
 * WHY:   The buyer journey starts here. It must look premium and inviting.
 * WHAT:  Modernizes the home screen with a minimalist header and beautiful suggestion cards.
 * HOW:   Uses rounded-3xl for cards, clean spacing, and Arabic copy for the suggestions.
 */
export default function BuyerAssistantHomeScreen() {
  const insets = useSafeAreaInsets();
  const assistant = useBuyerAssistant();
  const router = useRouter();
  const listRef = useRef<FlashListRef<ConversationMessage> | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(timer);
  }, [assistant.messages.length]);

  function handlePropertyPress(property: PropertyPreview) {
    assistant.setContextProperty(property);
    router.push({ pathname: "/property/[id]", params: { id: property.id } });
  }

  function handleActionPress(action: JourneyAction) {
    if (action.type === "open_property") {
      router.push({ pathname: "/property/[id]", params: { id: action.propertyId } });
      return;
    }
    assistant.handleJourneyAction(action);
  }

  const hasMessages = assistant.messages.length > 0;

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      {/* Minimalist Nexus Header */}
      <View className="flex-row-reverse items-center justify-between px-6 pb-2" style={{ paddingTop: insets.top + 16 }}>
        <Pressable 
          onPress={() => router.push("/welcome")}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 active:scale-95 transition-transform"
        >
          <Menu size={22} color="#64748B" />
        </Pressable>

        {/* Center Logo Identity */}
        <View className="flex-1 items-center justify-center opacity-80 pl-4">
          <AnanMark />
        </View>

        <View className="flex-row-reverse items-center gap-3">
          <Pressable 
            onPress={() => router.push("/account")}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 active:scale-95 transition-transform"
          >
             <User size={20} color="#64748B" />
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View className="flex-1 mt-4">
          <MessageList
            listRef={listRef}
            messages={assistant.messages}
            isTyping={assistant.isTyping}
            onPropertyPress={handlePropertyPress}
            onActionPress={handleActionPress}
          />

          {!hasMessages && (
            <View className="px-6 py-6" style={{ direction: "rtl" }}>
               <AppText className="text-[28px] font-cairo-black text-slate-900 dark:text-slate-50 mb-2 leading-tight">
                  كيف أقدر أساعدك؟
               </AppText>
               <AppText className="text-[15px] font-medium text-slate-400 mb-8 leading-relaxed">
                  ابدأ محادثة، أو اختر من الاقتراحات السريعة تحت.
               </AppText>

               <ScrollView 
                 horizontal 
                 showsHorizontalScrollIndicator={false}
                 className="flex-row-reverse"
                 contentContainerStyle={{ gap: 16 }}
               >
                 <Pressable 
                   onPress={() => assistant.setDraft("أريد شقة ٣ غرف نوم وصالة شمال الرياض")}
                   className="h-32 w-48 justify-between rounded-2xl bg-slate-100 dark:bg-slate-800 p-5 active:scale-95 transition-all"
                 >
                   <AppText className="font-cairo-black text-[15px] leading-relaxed text-slate-900 dark:text-slate-50 text-right">أريد شقة ٣ غرف...</AppText>
                   <AppText className="font-cairo-bold text-[13px] text-slate-400 text-right">في شمال الرياض</AppText>
                 </Pressable>

                 <Pressable 
                   onPress={() => assistant.setDraft("ما هو متوسط أسعار المتر التقديرية في حي النرجس؟")}
                   className="h-32 w-48 justify-between rounded-2xl bg-slate-100 dark:bg-slate-800 p-5 active:scale-95 transition-all"
                 >
                   <AppText className="font-cairo-black text-[15px] leading-relaxed text-slate-900 dark:text-slate-50 text-right">ما متوسط الأسعار...</AppText>
                   <AppText className="font-cairo-bold text-[13px] text-slate-400 text-right">في حي النرجس</AppText>
                 </Pressable>
               </ScrollView>
            </View>
          )}

          <View className="px-6" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
            <ComposerDock
              value={assistant.draft}
              onChange={assistant.setDraft}
              onSend={() => assistant.submit()}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
