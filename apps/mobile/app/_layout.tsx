import "react-native-gesture-handler";
import "../global.css";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Cairo_400Regular, Cairo_700Bold, useFonts } from "@expo-google-fonts/cairo";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { I18nManager } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ConvexProvider } from "@/lib/convex";

void SplashScreen.preventAutoHideAsync();

/**
 * WHY:   The mobile app needs one root that configures RTL-safe providers, fonts, gestures, and Convex.
 * WHAT:  Wraps the Expo Router stack with gesture, safe-area, bottom-sheet, and data providers.
 * HOW:   Loads Cairo fonts, keeps the stack headerless, and applies a light-status-bar shell.
 */
export default function RootLayout() {
  const [loaded] = useFonts({
    Cairo_400Regular,
    Cairo_700Bold,
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
          <BottomSheetModalProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }} />
          </BottomSheetModalProvider>
        </ConvexProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
