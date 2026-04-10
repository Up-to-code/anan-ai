import { Stack, useRouter } from "expo-router";
import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { useMobileLocale } from "@/lib/mobileLocale";

/**
 * WHY:   The mobile app still needs a recoverable fallback when a route is missing.
 * WHAT:  Shows a compact Arabic-first not-found screen with a single return action.
 * HOW:   Uses the same flat surfaces and brand tokens as the rest of the buyer shell.
 */
export default function NotFoundScreen() {
  const router = useRouter();
  const { dictionary } = useMobileLocale();

  return (
    <>
      <Stack.Screen options={{ title: dictionary.navigation.notFound }} />
      <View className="flex-1 items-center justify-center bg-panel px-6">
        <View className="w-full max-w-[320px] gap-4 border border-line bg-white px-5 py-6">
          <AppText tone="headline" className="text-xl">
            {dictionary.navigation.notFound}
          </AppText>
          <AppText className="text-sm leading-6 text-muted">
            {dictionary.navigation.notFoundBody}
          </AppText>
          <Button label={dictionary.navigation.backToAnan} onPress={() => router.replace("/")} />
        </View>
      </View>
    </>
  );
}
