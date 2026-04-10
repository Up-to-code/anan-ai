import React from "react";
import { type Href, Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { ScrollView, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { useBuyerAuth } from "@/hooks/useBuyerAuth";
import { cn } from "@/lib/cn";
import { useMobileLocale } from "@/lib/mobileLocale";
import { useAppTheme } from "@/lib/mobileTheme";
import type { MobileAuthReturnTarget } from "@/types/mobile";
import {
  AppleBadge,
  AuthActionButton,
  AuthBottomPanel,
  AuthHero,
  AuthMessageCard,
  EmailBadge,
  GoogleBadge,
  getAuthScreenMetrics,
  useAuthPanelPalette,
} from "./shared";

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function AuthEntryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const auth = useBuyerAuth();
  const theme = useAppTheme();
  const panel = useAuthPanelPalette();
  const { dictionary, isRtl } = useMobileLocale();
  const { height: screenHeight } = useWindowDimensions();
  const params = useLocalSearchParams<{ returnTo?: string | string[] }>();
  const returnTo = firstParam(params.returnTo) as MobileAuthReturnTarget | undefined;
  const metrics = getAuthScreenMetrics(screenHeight);

  if (!auth.account.isHydrated || !auth.isLoaded) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.canvas }} />;
  }

  if (auth.isAuthenticated) {
    return <Redirect href={auth.getPostAuthPath(returnTo) as Href} />;
  }

  async function handleContinueAsGuest() {
    const nextPath = await auth.continueAsGuest();
    router.replace(nextPath as Href);
  }

  async function handleGoogle() {
    const nextPath = await auth.startGoogleSignIn(returnTo);
    if (nextPath) {
      router.replace(nextPath as Href);
    }
  }

  async function handleApple() {
    const nextPath = await auth.startAppleSignIn(returnTo);
    if (nextPath) {
      router.replace(nextPath as Href);
    }
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.canvas }}>
      <View
        className={cn("items-center justify-between px-5", isRtl ? "flex-row-reverse" : "flex-row")}
        style={{ paddingTop: insets.top + 8 }}
      >
        <View style={{ width: 44, height: 44 }} />
        {returnTo ? <IconButton icon={ArrowLeft} onPress={() => router.back()} tone="panel" /> : <View style={{ width: 44, height: 44 }} />}
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          minHeight: metrics.minHeight,
          paddingTop: 16,
          justifyContent: "space-between",
        }}
      >
        <View className="px-5" style={{ paddingTop: metrics.heroTopPadding }}>
          <AuthHero
            eyebrow={dictionary.auth.eyebrow}
            title={dictionary.auth.title}
            dot
            description={dictionary.auth.description}
            compact={metrics.heroCompact}
          />

          {auth.errorMessage ? (
            <View className="mt-8">
              <AuthMessageCard title={dictionary.auth.signInErrorTitle} body={auth.errorMessage} tone="danger" />
            </View>
          ) : null}
        </View>

        <AuthBottomPanel>
          {auth.isAppleAvailable ? (
            <AuthActionButton
              title={dictionary.auth.continueWithApple}
              accent={<AppleBadge />}
              tone="light"
              onPress={() => void handleApple()}
            />
          ) : null}
          <AuthActionButton
            title={dictionary.auth.continueWithGoogle}
            accent={<GoogleBadge />}
            tone="dark"
            onPress={() => void handleGoogle()}
          />
          <AuthActionButton
            title={dictionary.auth.continueWithEmail}
            accent={<EmailBadge />}
            tone="dark"
            onPress={() => router.push({ pathname: "/auth/email", params: returnTo ? { returnTo } : {} })}
          />

          <AuthActionButton
            title={dictionary.auth.continueAsGuest}
            accent={<View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: panel.iconOnDark }} />}
            tone="outline"
            compact
            onPress={() => void handleContinueAsGuest()}
          />

          <AppText
            className="pb-4 text-center text-[12px] leading-6 font-medium"
            style={{ color: panel.tertiaryText, paddingTop: metrics.footerNotePaddingTop }}
          >
            {dictionary.auth.footer}
          </AppText>
        </AuthBottomPanel>
      </ScrollView>
    </View>
  );
}
