import React, { useEffect, useMemo, useState } from "react";
import { type Href, Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { ScrollView, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { useBuyerAuth } from "@/hooks/useBuyerAuth";
import { formatMobileCopy } from "@/lib/i18n";
import { useMobileLocale } from "@/lib/mobileLocale";
import { useAppTheme } from "@/lib/mobileTheme";
import type { MobileAuthReturnTarget } from "@/types/mobile";
import { AuthBottomPanel, AuthHero, AuthLegalToggle, AuthMessageCard, AuthTextField, SuccessBadge, getAuthScreenMetrics, useAuthPanelPalette } from "./shared";

const RESEND_COOLDOWN_MS = 30_000;

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function AuthEmailVerifyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const auth = useBuyerAuth();
  const theme = useAppTheme();
  const { dictionary, isRtl } = useMobileLocale();
  const panel = useAuthPanelPalette();
  const { height: screenHeight } = useWindowDimensions();
  const params = useLocalSearchParams<{ email?: string | string[]; returnTo?: string | string[] }>();
  const emailAddress = firstParam(params.email) ?? "";
  const returnTo = firstParam(params.returnTo) as MobileAuthReturnTarget | undefined;
  const [code, setCode] = useState("");
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [nextResendAt, setNextResendAt] = useState(Date.now() + RESEND_COOLDOWN_MS);
  const [now, setNow] = useState(Date.now());
  const metrics = getAuthScreenMetrics(screenHeight);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(timer);
  }, []);

  const resendSeconds = useMemo(() => Math.max(0, Math.ceil((nextResendAt - now) / 1000)), [nextResendAt, now]);

  if (!auth.account.isHydrated || !auth.isLoaded) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.canvas }} />;
  }

  if (auth.isAuthenticated) {
    return <Redirect href={auth.getPostAuthPath(returnTo) as Href} />;
  }

  async function handleVerify() {
    const result = await auth.verifyEmailCode({ code, returnTo });
    if (result.status === "complete" && result.nextPath) {
      router.replace(result.nextPath as Href);
    }
  }

  async function handleResend() {
    const success = await auth.resendEmailCode();
    if (success) {
      setNextResendAt(Date.now() + RESEND_COOLDOWN_MS);
    }
  }

  async function handleCompleteProfile() {
    const result = await auth.completeTransferredSignUp({
      legalAccepted,
      returnTo,
    });
    if (result.status === "complete" && result.nextPath) {
      router.replace(result.nextPath as Href);
    }
  }

  async function handleStartOver() {
    await auth.startOver();
    router.replace({
      pathname: "/auth/email",
      params: returnTo ? { returnTo } : {},
    });
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
            eyebrow={auth.emailStep === "complete_profile" ? dictionary.authEmail.accountEyebrow : dictionary.authEmail.verifyEyebrow}
            title={auth.emailStep === "complete_profile" ? dictionary.authEmail.completeProfileTitle : dictionary.authEmail.verifyTitle}
            description={
              auth.emailStep === "complete_profile"
                ? dictionary.authEmail.completeProfileDescription
                : formatMobileCopy(dictionary.authEmail.verifyDescription, { email: emailAddress || dictionary.authEmail.genericEmail })
            }
            compact={metrics.heroCompact}
          />
        </View>

        <AuthBottomPanel>
          {auth.emailStep === "complete_profile" ? (
            <View className="gap-5">
              <View className={`items-center gap-3 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
                <View
                  className="items-center justify-center rounded-[18px]"
                  style={{ width: 44, height: 44, backgroundColor: panel.subtleSurface }}
                >
                  <SuccessBadge />
                </View>
                <View className={`flex-1 ${isRtl ? "items-end" : "items-start"}`}>
                  <AppText className={`${isRtl ? "text-right" : "text-left"} text-[17px] font-cairo-black`} style={{ color: panel.primaryText }}>
                    {dictionary.authEmail.emailVerified}
                  </AppText>
                  <AppText className={`${isRtl ? "text-right" : "text-left"} text-[13px] leading-7 font-medium`} style={{ color: panel.secondaryText }}>
                    {emailAddress || dictionary.authEmail.emailVerifiedFallback}
                  </AppText>
                </View>
              </View>

              {auth.missingProfileFields.includes("legal_accepted") ? (
                <AuthLegalToggle
                  checked={legalAccepted}
                  onChange={setLegalAccepted}
                  label={dictionary.authEmail.acceptLegal}
                />
              ) : (
                <AuthMessageCard
                  title={dictionary.authEmail.extraFieldsTitle}
                  body={dictionary.authEmail.extraFieldsBody}
                />
              )}

              {auth.errorMessage ? (
                <AuthMessageCard title={dictionary.authEmail.incompleteTitle} body={auth.errorMessage} tone="danger" />
              ) : null}

              <Button
                label={dictionary.authEmail.createAccount}
                className="h-[58px]"
                loading={auth.isBusy}
                disabled={auth.missingProfileFields.includes("legal_accepted") && !legalAccepted}
                onPress={() => void handleCompleteProfile()}
              />
              <Button label={dictionary.authEmail.startOver} variant="ghost" onPress={() => void handleStartOver()} />
            </View>
          ) : auth.emailStep === "verify" ? (
            <View className="gap-5">
              <AuthTextField
                label={dictionary.authEmail.verificationCode}
                value={code}
                onChangeText={setCode}
                placeholder="123456"
                keyboardType="number-pad"
                autoCapitalize="none"
              />

              {auth.errorMessage ? (
                <AuthMessageCard title={dictionary.authEmail.verifyError} body={auth.errorMessage} tone="danger" />
              ) : null}

              <Button
                label={dictionary.authEmail.verifyAndContinue}
                className="h-[58px]"
                loading={auth.isBusy}
                disabled={!code.trim()}
                onPress={() => void handleVerify()}
              />
              <Button
                label={resendSeconds > 0 ? formatMobileCopy(dictionary.authEmail.resendIn, { seconds: String(resendSeconds) }) : dictionary.authEmail.resendCode}
                variant="secondary"
                disabled={resendSeconds > 0 || auth.isBusy}
                onPress={() => void handleResend()}
              />
              <Button label={dictionary.authEmail.startOver} variant="ghost" onPress={() => void handleStartOver()} />
            </View>
          ) : (
            <View className="gap-4">
              <AppText className={`${isRtl ? "text-right" : "text-left"} text-[17px] font-cairo-black`} style={{ color: panel.primaryText }}>
                {dictionary.authEmail.startFromEmailTitle}
              </AppText>
              <AppText className={`${isRtl ? "text-right" : "text-left"} text-[13px] leading-7 font-medium`} style={{ color: panel.secondaryText }}>
                {dictionary.authEmail.startFromEmailBody}
              </AppText>
              <Button
                label={dictionary.authEmail.openEmailScreen}
                onPress={() =>
                  router.replace({
                    pathname: "/auth/email",
                    params: returnTo ? { returnTo } : {},
                  })
                }
              />
            </View>
          )}
        </AuthBottomPanel>
      </ScrollView>
    </View>
  );
}
