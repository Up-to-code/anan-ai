import { KeyboardAvoidingView, Platform, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Sparkles, Search, User } from "lucide-react-native";
import Animated, { FadeIn, FadeInDown, Layout } from "react-native-reanimated";
import { AppText } from "@/components/ui/AppText";
import { PropertyChatCard } from "@/components/features/PropertyChatCard";
import { AIPanelResultCard } from "@/components/features/AIPanelResultCard";
import { ThinkingIndicator } from "@/components/features/ThinkingIndicator";
import { StreamingText } from "@/components/features/StreamingText";
import { AssistantExpandedComposer } from "@/features/HomeFeedScreen/AssistantExpandedComposer";
import { usePropertyFeed } from "@/hooks/usePropertyFeed";
import { usePropertyAssistant } from "@/hooks/usePropertyAssistant";
import { ChatMessage, MobilePropertyFeedItem } from "@/types/mobile";

/**
 * ChatGPT-style home screen with AG-UI patterns:
 * - Streaming text responses
 * - Thinking/reasoning indicators
 * - Rich inline property cards with swipeable media
 * - Suggestion chips for quick actions
 */
export default function HomeFeedScreen() {
  const router = useRouter();
  const { properties } = usePropertyFeed();
  const [selectedProperty, setSelectedProperty] = useState<MobilePropertyFeedItem | undefined>(undefined);
  const assistant = usePropertyAssistant(selectedProperty);

  useEffect(() => {
    if (!assistant.isOpen && properties.length > 0) {
      setSelectedProperty(properties[0]);
    }
  }, [properties.length]);

  useEffect(() => {
    if (selectedProperty && !assistant.isOpen) {
      assistant.open();
    }
  }, [selectedProperty]);

  const navigateToProperty = (property: MobilePropertyFeedItem) => {
    router.push(`/chat/${property.id}` as any);
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isUser = item.role === "user";
    const delay = index * 100;

    // User message
    if (isUser) {
      return (
        <Animated.View 
          entering={FadeInDown.duration(400).delay(delay)}
          layout={Layout.springify()}
          className="mb-4 pr-4 pl-16 items-end"
        >
          <View className="bg-brand/10 px-4 py-3" style={{ borderRightWidth: 2, borderRightColor: "#2563EB" }}>
            <AppText className="text-slate-900">{item.text}</AppText>
          </View>
        </Animated.View>
      );
    }

    // AG-UI: Thinking state
    if (item.isThinking) {
      return (
        <Animated.View entering={FadeIn.duration(300)} layout={Layout.springify()}>
          <ThinkingIndicator steps={item.reasoningSteps} />
        </Animated.View>
      );
    }

    // AI message with AG-UI streaming + rich content
    return (
      <Animated.View 
        entering={item.isStreaming ? FadeIn.duration(300) : FadeInDown.duration(400).delay(delay)}
        layout={Layout.springify()}
        className="mb-5 pl-4 pr-8 items-start"
      >
        {/* Streaming or static text */}
        {item.text ? (
          <View className="mb-3 w-full">
            {item.isStreaming ? (
              <StreamingText text={item.text} speed={15} />
            ) : (
              <AppText className="text-slate-700 leading-6">{item.text}</AppText>
            )}
          </View>
        ) : null}

        {/* Embedded property cards with media */}
        {item.properties?.map((property, pIdx) => (
          <Animated.View entering={item.isStreaming ? FadeInDown.duration(400).delay(300 + pIdx * 100) : undefined} key={property.id} className="w-full mb-3">
            <PropertyChatCard
              property={property}
              onPress={() => navigateToProperty(property)}
            />
          </Animated.View>
        ))}

        {/* AG-UI Tool result cards */}
        {item.cards?.map((card, idx) => (
          <Animated.View entering={FadeInDown.duration(400).delay(300 + idx * 100)} key={`${card.type}-${idx}`} className="w-full mb-3">
            <AIPanelResultCard card={card} />
          </Animated.View>
        ))}
      </Animated.View>
    );
  };

  // Build chat messages — welcome + properties if no conversation yet
  const chatMessages: ChatMessage[] = assistant.messages.length > 0
    ? assistant.messages
    : [{
        id: "welcome",
        role: "assistant",
        text: "مرحباً بك في عنان 👋\nأنا مساعدك العقاري الذكي. أخبرني عن ميزانيتك، المنطقة المفضلة، أو نوع العقار وسأساعدك في إيجاد الأنسب.",
        isStreaming: true,
      }, {
        id: "properties-showcase",
        role: "assistant",
        text: "إليك بعض الوحدات المتاحة حالياً — اسحب الصور لتصفحها، أو اضغط على أي وحدة للتعمق أكثر:",
        properties: properties.slice(0, 4),
      }];

  // Quick action suggestions 
  const suggestions = [
    "🏠 أبحث عن شقة بميزانية ١.٥ مليون",
    "📊 احسب العائد الاستثماري",
    "💳 اعرض خطة السداد",
    "⚖️ قارن بين الوحدات",
    "🔍 هل راتبي يؤهلني للتمويل؟",
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(400)} className="flex-row items-center justify-between px-5 py-3" style={{ borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0" }}>
        <View className="flex-row items-center gap-2">
          <View className="h-8 w-8 bg-brand items-center justify-center">
            <Sparkles size={16} color="#FFFFFF" />
          </View>
          <View>
            <AppText className="text-base font-cairo-bold text-slate-900">عنان</AppText>
            <AppText className="text-[10px] text-slate-400">مساعد عقاري ذكي</AppText>
          </View>
        </View>
        <View className="flex-row items-center gap-4">
          <Pressable onPress={() => router.push("/search" as any)} className="h-8 w-8 items-center justify-center">
            <Search size={18} color="#94a3b8" />
          </Pressable>
          <Pressable onPress={() => router.push("/profile" as any)} className="h-8 w-8 bg-slate-100 rounded-full items-center justify-center">
            <User size={16} color="#64748b" />
          </Pressable>
        </View>
      </Animated.View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Animated.FlatList
          data={chatMessages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage as any}
          contentContainerStyle={{ paddingVertical: 20 }}
          className="flex-1"
          itemLayoutAnimation={Layout.springify()}
        />

        {/* Quick suggestion chips */}
        {assistant.messages.length === 0 ? (
          <Animated.View entering={FadeInDown.duration(400).delay(400)} className="px-4 pb-2">
            <Animated.FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={suggestions}
              keyExtractor={(item) => item}
              renderItem={({ item: prompt }) => (
                <Pressable
                  onPress={() => {
                    assistant.setQuery(prompt);
                    void assistant.send();
                  }}
                  className="px-3 py-2 mr-2 bg-slate-50"
                  style={{ borderWidth: 0.5, borderColor: "#e2e8f0" }}
                >
                  <AppText className="text-xs text-slate-600">{prompt}</AppText>
                </Pressable>
              )}
            />
          </Animated.View>
        ) : null}

        {/* Composer */}
        <View className="px-4 pb-6 pt-3 bg-white" style={{ borderTopWidth: 0.5, borderTopColor: "#e2e8f0" }}>
          <AssistantExpandedComposer
            value={assistant.query}
            onChange={assistant.setQuery}
            onSend={() => void assistant.send()}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
