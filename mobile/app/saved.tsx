import { View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronRight, Heart } from "lucide-react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { PropertyChatCard } from "@/components/features/PropertyChatCard";
import { usePropertyFeed } from "@/hooks/usePropertyFeed";

export default function SavedPropertiesScreen() {
  const router = useRouter();
  const { properties } = usePropertyFeed();
  
  // Just mock taking the first 3 properties as "saved" for demonstration
  const savedProperties = properties.slice(0, 3);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <Animated.View entering={FadeIn.duration(300)} className="flex-1">
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)} className="flex-row items-center px-4 py-3" style={{ borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0" }}>
          <IconButton icon={ChevronRight} onPress={() => router.back()} />
          <AppText className="flex-1 text-center font-cairo-bold text-base text-slate-900">العقارات المفضلة</AppText>
          <View className="w-10" />
        </Animated.View>

        <Animated.FlatList
          data={savedProperties}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20, gap: 12 }}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.duration(400).delay(150 + index * 100)}>
              <PropertyChatCard property={item} />
            </Animated.View>
          )}
          ListEmptyComponent={
            <Animated.View entering={FadeInDown.duration(400).delay(200)} className="py-20 items-center justify-center px-8">
              <View className="h-16 w-16 bg-slate-50 items-center justify-center mb-4 rounded-full">
                <Heart size={24} color="#cbd5e1" />
              </View>
              <AppText className="text-base font-cairo-bold text-slate-900 text-center">لا توجد عقارات مفضلة</AppText>
              <AppText className="text-sm text-slate-500 text-center mt-2">
                اضغط على أيقونة القلب على أي عقار لإضافته إلى مفضلتك والرجوع إليه لاحقاً.
              </AppText>
            </Animated.View>
          }
        />
      </Animated.View>
    </SafeAreaView>
  );
}
