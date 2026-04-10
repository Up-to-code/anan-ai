import type { ReactNode } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { ArrowLeft, FileText, HelpCircle, Mic, ShieldCheck, Trash2 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { MobilePill, MobileSectionHeading, MobileSurface, MobileTopBar } from "@/components/ui/MobileChrome";
import { useBuyerAccount } from "@/hooks/useBuyerAccount";
import { cn } from "@/lib/cn";
import { useMobileLocale } from "@/lib/mobileLocale";
import { useAppTheme } from "@/lib/mobileTheme";

/**
 * WHY:   Privacy and review-readiness copy must map to real buyer-app actions rather than static legal placeholders.
 * WHAT:  Renders the buyer privacy surface with consent markers, support routing, and device-data reset controls.
 * HOW:   Keeps the sections review-friendly while writing acknowledgements into the buyer account contract and using the same local reset path as the account screen.
 */
export default function LegalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const account = useBuyerAccount();
  const { dictionary, isRtl } = useMobileLocale();

  function confirmDeleteLocalData() {
    Alert.alert(
      dictionary.legal.clearLocalDataTitle,
      dictionary.legal.clearLocalDataConfirm,
      [
        { text: dictionary.common.cancel, style: "cancel" },
        {
          text: dictionary.common.delete,
          style: "destructive",
          onPress: async () => {
            await account.resetLocalBuyerState();
            Alert.alert(dictionary.legal.deletedTitle, dictionary.legal.deletedBody);
          },
        },
      ],
    );
  }

  async function openSupport() {
    await account.setConsent("supportAcceptedAt");
    const mailUrl = "mailto:support@anan.sa?subject=Anan%20Mobile%20Support";
    const canOpen = await Linking.canOpenURL(mailUrl);
    if (canOpen) {
      await Linking.openURL(mailUrl);
      return;
    }
    Alert.alert(dictionary.legal.supportTitleShort, "support@anan.sa");
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.canvas }}>
      <MobileTopBar
        insetTop={insets.top}
        backgroundColor={theme.colors.canvas}
        borderColor={theme.colors.border}
        title={dictionary.navigation.legal}
        subtitle={dictionary.navigation.legalSubtitle}
        leading={<IconButton icon={ArrowLeft} onPress={() => router.back()} tone="panel" />}
        trailing={<View style={{ width: 44, height: 44 }} />}
      />

      <ScrollView
        className="flex-1 px-5 pt-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 40) + 20 }}
      >
        <MobileSurface tone="muted" radius="hero" className="gap-4" shadow="none">
          <MobileSectionHeading
            eyebrow={dictionary.legal.trustCenter}
            title={dictionary.legal.title}
            description={dictionary.legal.description}
          />
          <View className={cn(isRtl ? "flex-row-reverse" : "flex-row", "flex-wrap")} style={{ gap: 8 }}>
            <MobilePill label={account.viewer.consents.privacyAcceptedAt ? dictionary.account.privacyReviewed : dictionary.legal.reviewRequired} tone="primary" active={Boolean(account.viewer.consents.privacyAcceptedAt)} />
            <MobilePill label={account.viewer.consents.termsAcceptedAt ? dictionary.account.termsReviewed : dictionary.account.termsPending} tone="primary" active={Boolean(account.viewer.consents.termsAcceptedAt)} />
          </View>
        </MobileSurface>

        <LegalSection
          icon={ShieldCheck}
          title={dictionary.legal.privacyTitle}
          body={dictionary.legal.privacyBody}
          status={account.viewer.consents.privacyAcceptedAt ? dictionary.legal.reviewDone : dictionary.legal.reviewPending}
          statusTone={account.viewer.consents.privacyAcceptedAt ? "primary" : "default"}
        >
          <Button
            label={dictionary.legal.confirmPrivacy}
            variant="secondary"
            onPress={() => void account.setConsent("privacyAcceptedAt")}
          />
        </LegalSection>

        <LegalSection
          icon={Mic}
          title={dictionary.legal.microphoneTitle}
          body={dictionary.legal.microphoneBody}
          status={account.viewer.consents.microphoneAcceptedAt ? dictionary.legal.reviewDone : dictionary.legal.optional}
          statusTone={account.viewer.consents.microphoneAcceptedAt ? "primary" : "default"}
        >
          <Button
            label={dictionary.legal.confirmMicrophone}
            variant="secondary"
            onPress={() => void account.setConsent("microphoneAcceptedAt")}
          />
        </LegalSection>

        <LegalSection
          icon={FileText}
          title={dictionary.legal.termsTitle}
          body={dictionary.legal.termsBody}
          status={account.viewer.consents.termsAcceptedAt ? dictionary.legal.reviewDone : dictionary.legal.reviewPending}
          statusTone={account.viewer.consents.termsAcceptedAt ? "primary" : "default"}
        >
          <Button
            label={dictionary.legal.confirmTerms}
            variant="secondary"
            onPress={() => void account.setConsent("termsAcceptedAt")}
          />
        </LegalSection>

        <LegalSection
          icon={HelpCircle}
          title={dictionary.legal.supportTitle}
          body={dictionary.legal.supportBody}
          status={account.viewer.consents.supportAcceptedAt ? dictionary.legal.supportOpened : dictionary.legal.alwaysAvailable}
          statusTone={account.viewer.consents.supportAcceptedAt ? "primary" : "default"}
        >
          <Button label={dictionary.legal.contactSupport} onPress={() => void openSupport()} />
        </LegalSection>

        <Pressable
          onPress={confirmDeleteLocalData}
          className={cn("mt-5 items-center gap-4 rounded-[24px] px-5 py-5 active:opacity-80", isRtl ? "flex-row-reverse" : "flex-row")}
          style={{
            borderWidth: 1,
            borderColor: theme.colors.danger,
            backgroundColor: theme.colors.dangerSoft,
          }}
        >
          <View
            className="items-center justify-center rounded-full"
            style={{ width: 44, height: 44, backgroundColor: theme.colors.surface }}
          >
            <Trash2 size={18} color={theme.colors.danger} />
          </View>
          <View className="flex-1">
            <AppText className={cn("text-[16px] font-cairo-black", isRtl ? "text-right" : "text-left")} style={{ color: theme.colors.danger }}>
              {dictionary.legal.clearLocalData}
            </AppText>
            <AppText className={cn("mt-1 text-[13px] font-medium", isRtl ? "text-right" : "text-left")} style={{ color: theme.colors.inkMuted }}>
              {dictionary.legal.clearLocalDataBody}
            </AppText>
          </View>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function LegalSection({
  icon: Icon,
  title,
  body,
  status,
  statusTone,
  children,
}: {
  icon: typeof ShieldCheck;
  title: string;
  body: string;
  status: string;
  statusTone: "default" | "primary";
  children: ReactNode;
}) {
  const theme = useAppTheme();
  const { isRtl } = useMobileLocale();
  return (
    <MobileSurface className="mt-5 gap-4" radius="hero" shadow="none">
      <View className={cn("items-center gap-3", isRtl ? "flex-row-reverse" : "flex-row")}>
        <View
          className="items-center justify-center rounded-full"
          style={{ width: 42, height: 42, backgroundColor: theme.colors.primarySoft }}
        >
          <Icon size={18} color={theme.colors.primary} />
        </View>
        <AppText className={cn("flex-1 text-[18px] font-cairo-black", isRtl ? "text-right" : "text-left")} style={{ color: theme.colors.ink }}>
          {title}
        </AppText>
      </View>

      <View className={cn("mt-4", isRtl ? "flex-row-reverse" : "flex-row")}>
        <MobilePill label={status} tone={statusTone === "primary" ? "primary" : "default"} active={statusTone === "primary"} />
      </View>

      <AppText className={cn("mt-4 text-[15px] leading-8", isRtl ? "text-right" : "text-left")} style={{ color: theme.colors.inkMuted }}>
        {body}
      </AppText>

      <View>{children}</View>
    </MobileSurface>
  );
}
