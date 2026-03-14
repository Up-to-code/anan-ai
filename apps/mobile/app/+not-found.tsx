import { Pressable, Text, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { router } from "expo-router";

/**
 * WHY:   Expo Router still needs a recoverable not-found surface for mobile deep links.
 * WHAT:  Shows a minimal Arabic-first fallback screen with a return action.
 * HOW:   Keeps styling intentionally plain to match the app's structural visual system.
 */
export default function NotFoundScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-surface px-6">
      <Text className="font-cairo-bold text-2xl text-ink">الصفحة غير موجودة</Text>
      <AppText className="mt-4 text-center text-lg">
        عذراً، هذه الصفحة غير موجودة
      </AppText>
      <Pressable onPress={() => router.replace("/" as any)} className="mt-6 border-2 border-slate-900 px-5 py-3 bg-surface">
        <AppText className="font-cairo-bold text-slate-900">
          العودة للرئيسية
        </AppText>
      </Pressable>
    </View>
  );
}
