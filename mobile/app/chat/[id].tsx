import { KeyboardAvoidingView, Platform, View, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { AIPanelResultCard } from "@/components/features/AIPanelResultCard";
import { AssistantExpandedComposer } from "@/features/HomeFeedScreen/AssistantExpandedComposer";
import { usePropertyAssistant } from "@/hooks/usePropertyAssistant";
import { usePropertyFeed } from "@/hooks/usePropertyFeed";
import { ChatMessage } from "@/types/mobile";

/**
 * Dedicated chat screen — clean, minimal workspace for AI property conversations.
 */
export default function PropertyChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { properties } = usePropertyFeed();
  const property = properties.find(p => p.id === id);
  const assistant = usePropertyAssistant(property);

  if (!property) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator color="#2563EB" />
      </View>
    );
  }

  if (!assistant.isOpen) {
    assistant.open();
  }

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === "user";

    if (isUser) {
      return (
        <View className="mb-4 pr-4 pl-16 items-end">
          <View className="bg-brand/10 px-4 py-3" style={{ borderRightWidth: 2, borderRightColor: "#2563EB" }}>
            <AppText className="text-slate-900">{item.text}</AppText>
          </View>
        </View>
      );
    }

    return (
      <View className="mb-4 pl-4 pr-16 items-start">
        {item.text ? (
          <View className="bg-slate-50 px-4 py-3 mb-2 w-full" style={{ borderLeftWidth: 1, borderLeftColor: "#94a3b8" }}>
            <AppText className="text-slate-800">{item.text}</AppText>
          </View>
        ) : null}
        {item.cards?.map((card, idx) => (
          <View key={`${card.type}-${idx}`} className="w-full mt-2">
            <AIPanelResultCard card={card} />
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Minimal header */}
      <View className="flex-row items-center px-4 py-3" style={{ borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0" }}>
        <IconButton icon={ChevronRight} onPress={() => router.back()} />
        <View className="flex-1 ml-2">
          <AppText className="text-base font-cairo-bold text-slate-900" numberOfLines={1}>
            {property.title}
          </AppText>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <FlatList
          data={assistant.messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ paddingVertical: 20 }}
          className="flex-1 bg-white"
        />

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
