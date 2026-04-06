import "react-native-gesture-handler";
import "../global.css";

import { Cairo_400Regular, Cairo_500Medium, Cairo_700Bold, Cairo_900Black } from "@expo-google-fonts/cairo";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Appearance, I18nManager, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ConvexProvider } from "@/lib/convex";
import { useAppTheme } from "@/lib/mobileTheme";
import { getThemePreference } from "@/lib/themeStore";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    Cairo_400Regular,
    Cairo_500Medium,
    Cairo_700Bold,
    Cairo_900Black,
  });
  const theme = useAppTheme();

  useEffect(() => {
    // Mount custom appearance override
    getThemePreference().then((mode) => {
      if (mode !== "system") {
        Appearance.setColorScheme(mode);
      }
    });

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
          <View style={{ flex: 1, backgroundColor: theme.colors.canvas }}>
            <StatusBar style={theme.isDark ? "light" : "dark"} />
            <Stack screenOptions={{ headerShown: false }} />
          </View>
        </ConvexProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
