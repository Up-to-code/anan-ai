import "react-native-gesture-handler";
import "../global.css";

import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { Cairo_400Regular, Cairo_500Medium, Cairo_700Bold, Cairo_900Black } from "@expo-google-fonts/cairo";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Appearance, I18nManager, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { MobileSurface } from "@/components/ui/MobileChrome";
import { BuyerAccountProvider, useBuyerAccount } from "@/hooks/useBuyerAccount";
import { ConvexProvider } from "@/lib/convex";
import { MobileLocaleProvider, useMobileLocale } from "@/lib/mobileLocale";
import { getMobileBackendReadiness, getMobileClerkPublishableKey } from "@/lib/mobileEnv";
import { useAppTheme } from "@/lib/mobileTheme";
import { getThemePreference } from "@/lib/themeStore";

void SplashScreen.preventAutoHideAsync();

const clerkPublishableKey = getMobileClerkPublishableKey();
const mobileBackend = getMobileBackendReadiness();

function BackendRequiredScreen() {
  const theme = useAppTheme();
  const { dictionary, isRtl } = useMobileLocale();
  const detail =
    mobileBackend.reason === "invalid_convex_url"
      ? dictionary.runtime.invalidBackendBody
      : dictionary.runtime.backendRequiredBody;

  return (
    <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: theme.colors.canvas }}>
      <MobileSurface tone="muted" radius="hero" className="w-full max-w-[420px] gap-4 px-6 py-8">
        <AppText className={`${isRtl ? "text-right" : "text-left"} text-[24px] font-cairo-black`} style={{ color: theme.colors.ink }}>
          {dictionary.runtime.backendRequiredTitle}
        </AppText>
        <AppText className={`${isRtl ? "text-right" : "text-left"} text-[15px] leading-8 font-cairo-medium`} style={{ color: theme.colors.inkSoft }}>
          {detail}
        </AppText>
        <AppText className={`${isRtl ? "text-right" : "text-left"} text-[13px] leading-7 font-cairo-medium`} style={{ color: theme.colors.inkMuted }}>
          {dictionary.runtime.backendRequiredHint}
        </AppText>
      </MobileSurface>
    </View>
  );
}

function AppShell() {
  const account = useBuyerAccount();

  return (
    <MobileLocaleProvider locale={account.viewer.preferences.locale}>
      <AppShellContent />
    </MobileLocaleProvider>
  );
}

function AppShellContent() {
  const theme = useAppTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.canvas }}>
      <StatusBar style={theme.isDark ? "light" : "dark"} />
      {mobileBackend.isReady ? <Stack screenOptions={{ headerShown: false }} /> : <BackendRequiredScreen />}
    </View>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    Cairo_400Regular,
    Cairo_500Medium,
    Cairo_700Bold,
    Cairo_900Black,
  });
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
        <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
          <ConvexProvider>
            <BuyerAccountProvider>
              <AppShell />
            </BuyerAccountProvider>
          </ConvexProvider>
        </ClerkProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
