import React, { useState } from "react";
import { type Href, Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { ScrollView, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { useBuyerAuth } from "@/hooks/useBuyerAuth";
import { useMobileLocale } from "@/lib/mobileLocale";
import { useAppTheme } from "@/lib/mobileTheme";
import type { MobileAuthReturnTarget } from "@/types/mobile";
import { AuthBottomPanel, AuthHero, AuthMessageCard, AuthTextField, getAuthScreenMetrics, useAuthPanelPalette } from "./shared";

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function AuthEmailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const auth = useBuyerAuth();
  const theme = useAppTheme();
  const { dictionary, isRtl } = useMobileLocale();
  const panel = useAuthPanelPalette();
  const { height: screenHeight } = useWindowDimensions();
  const params = useLocalSearchParams<{ returnTo?: string | string[] }>();
  const returnTo = firstParam(params.returnTo) as MobileAuthReturnTarget | undefined;
  const [emailAddress, setEmailAddress] = useState("");
  const metrics = getAuthScreenMetrics(screenHeight);

  if (!auth.account.isHydrated || !auth.isLoaded) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.canvas }} />;
  }

  if (auth.isAuthenticated) {
    return <Redirect href={auth.getPostAuthPath(returnTo) as Href} />;
  }

  async function handleContinue() {
    const success = await auth.requestEmailCode(emailAddress);
    if (success) {
      router.push({
        pathname: "/auth/email/verify",
        params: {
          email: emailAddress.trim().toLowerCase(),
          ...(returnTo ? { returnTo } : {}),
        },
      });
    }
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.canvas }}>
      <View
        className={`items-center justify-between px-5 ${isRtl ? "flex-row-reverse" : "flex-row"}`}
        style={{ paddingTop: insets.top + 8 }}
      >
        <View style={{ width: 44, height: 44 }} />
        <IconButton icon={ArrowLeft} onPress={() => router.back()} tone="panel" />
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
        <View className="px-5" style={{ paddingTop: metrics.heroTopPadding + 8 }}>
          <AuthHero
            eyebrow={dictionary.authEmail.eyebrow}
            title={dictionary.authEmail.title}
            description={dictionary.authEmail.description}
            compact={metrics.heroCompact}
          />
        </View>

        <AuthBottomPanel>
          <View className="gap-4">
            <AuthTextField
              label={dictionary.authEmail.emailLabel}
              value={emailAddress}
              onChangeText={setEmailAddress}
              placeholder="name@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {auth.errorMessage ? (
              <AuthMessageCard title={dictionary.authEmail.sendCodeError} body={auth.errorMessage} tone="danger" />
            ) : null}
            <Button
              label={dictionary.authEmail.sendCode}
              className="h-[58px]"
              loading={auth.isBusy}
              disabled={!emailAddress.trim()}
              onPress={() => void handleContinue()}
            />
            <AppText className={`${isRtl ? "text-right" : "text-left"} text-[12px] leading-6 font-medium`} style={{ color: panel.secondaryText }}>
              {dictionary.authEmail.helpText}
            </AppText>
          </View>
        </AuthBottomPanel>
      </ScrollView>
    </View>
  );
}
