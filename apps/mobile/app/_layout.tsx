import "react-native-gesture-handler";
import "../global.css";

import { Cairo_400Regular, Cairo_500Medium, Cairo_700Bold, Cairo_900Black } from "@expo-google-fonts/cairo";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { I18nManager, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ConvexProvider } from "@/lib/convex";
import { mobileTheme } from "@/lib/mobileTheme";

void SplashScreen.preventAutoHideAsync();

/**
 * WHY:   The mobile app needs one root that configures RTL-safe providers, fonts, gestures, and future data wiring.
 * WHAT:  Wraps the Expo Router stack with gesture, safe-area, bottom-sheet, and optional Convex providers.
 * HOW:   Loads Cairo fonts, keeps headers hidden, and exposes a light-status-bar shell for the buyer app.
 */
export default function RootLayout() {
  const [loaded] = useFonts({
    Cairo_400Regular,
    Cairo_500Medium,
    Cairo_700Bold,
    Cairo_900Black,
  });

  useEffect(() => {
    if (loaded) {
      void SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    if (!I18nManager.isRTL) {
      I18nManager.allowRTL(true);
    }
  }, []);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ConvexProvider>
          <View style={{ flex: 1, backgroundColor: mobileTheme.colors.canvas }}>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }} />
          </View>
        </ConvexProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
