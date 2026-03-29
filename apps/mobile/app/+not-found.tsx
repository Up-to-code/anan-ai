import { Stack, useRouter } from "expo-router";
import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";

/**
 * WHY:   The mobile app still needs a recoverable fallback when a route is missing.
 * WHAT:  Shows a compact Arabic-first not-found screen with a single return action.
 * HOW:   Uses the same flat surfaces and brand tokens as the rest of the buyer shell.
 */
export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: "غير موجود" }} />
      <View className="flex-1 items-center justify-center bg-panel px-6">
        <View className="w-full max-w-[320px] gap-4 border border-line bg-white px-5 py-6">
          <AppText tone="headline" className="text-xl">
            هذه الصفحة غير متاحة
          </AppText>
          <AppText className="text-sm leading-6 text-muted">
            ارجع إلى مساحة المحادثة الرئيسية لمتابعة البحث، مقارنة الوحدات، أو طلب تمويل مناسب.
          </AppText>
          <Button label="العودة إلى عنان" onPress={() => router.replace("/")} />
        </View>
      </View>
    </>
  );
}
