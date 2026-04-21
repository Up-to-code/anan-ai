import React, { useEffect, useState } from "react";
import { Alert, Appearance, Pressable, ScrollView, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { MobileTopBar } from "@/components/ui/MobileChrome";
import { useBuyerAccount } from "@/hooks/useBuyerAccount";
import { useBuyerAuth } from "@/hooks/useBuyerAuth";
import { cn } from "@/lib/cn";
import type { MobileLocale } from "@/lib/locale";
import { useMobileLocale } from "@/lib/mobileLocale";
import { useAppTheme } from "@/lib/mobileTheme";
import { getThemePreference, setThemePreference, type ThemeOverrideMode } from "@/lib/themeStore";
import { AccountPageIntro } from "@/features/AccountScreen/shared";

function parseNumberInput(value: string, fallback: number) {
  const parsed = Number(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * WHY:   Buyers need one calm control surface for appearance, language, finance defaults, privacy review, and device/session actions.
 * WHAT:  Renders the redesigned settings screen as a stripped-back list of controls.
 * HOW:   Keeps the existing theme/locale/account behaviors while removing extra intro copy, card shells, and decorative row chrome.
 */
export default function AccountSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const account = useBuyerAccount();
  const auth = useBuyerAuth();
  const { dictionary, isRtl } = useMobileLocale();
  const accountCopy = dictionary.account;
  const settingsCopy = dictionary.settings;
  const [themeMode, setThemeMode] = useState<ThemeOverrideMode>("system");
  const [downPaymentPercent, setDownPaymentPercent] = useState(String(account.viewer.preferences.financeDefaults.downPaymentPercent));
  const [preferredYears, setPreferredYears] = useState(String(account.viewer.preferences.financeDefaults.preferredYears));
  const [annualRate, setAnnualRate] = useState(String(account.viewer.preferences.financeDefaults.annualRate));

  useEffect(() => {
    getThemePreference().then(setThemeMode);
  }, []);

  useEffect(() => {
    setDownPaymentPercent(String(account.viewer.preferences.financeDefaults.downPaymentPercent));
    setPreferredYears(String(account.viewer.preferences.financeDefaults.preferredYears));
    setAnnualRate(String(account.viewer.preferences.financeDefaults.annualRate));
  }, [
    account.viewer.preferences.financeDefaults.annualRate,
    account.viewer.preferences.financeDefaults.downPaymentPercent,
    account.viewer.preferences.financeDefaults.preferredYears,
  ]);

  async function handleThemeChange(mode: ThemeOverrideMode) {
    setThemeMode(mode);
    await setThemePreference(mode);
    Appearance.setColorScheme(mode === "system" ? null : mode);
  }

  async function saveFinanceDefaults() {
    await account.updateFinanceDefaults({
      downPaymentPercent: Math.max(0, parseNumberInput(downPaymentPercent, account.viewer.preferences.financeDefaults.downPaymentPercent)),
      preferredYears: Math.max(1, parseNumberInput(preferredYears, account.viewer.preferences.financeDefaults.preferredYears)),
      annualRate: Math.max(0, parseNumberInput(annualRate, account.viewer.preferences.financeDefaults.annualRate)),
    });
  }

  async function handleLanguageChange(nextLocale: MobileLocale) {
    if (nextLocale === account.viewer.preferences.locale) return;
    await account.updatePreferences({ locale: nextLocale });
  }

  function confirmResetLocalData() {
    Alert.alert(
      settingsCopy.clearLocalDataTitle,
      settingsCopy.clearLocalDataBody,
      [
        { text: dictionary.common.cancel, style: "cancel" },
        {
          text: dictionary.common.delete,
          style: "destructive",
          onPress: async () => {
            await account.resetLocalBuyerState();
            router.replace("/?newThread=1");
          },
        },
      ],
    );
  }

  function confirmLogout() {
    Alert.alert(
      account.viewer.isAuthenticated ? settingsCopy.signOutTitle : settingsCopy.connectAccountTitle,
      account.viewer.isAuthenticated ? settingsCopy.signOutBody : settingsCopy.connectAccountBody,
      [
        { text: dictionary.common.cancel, style: "cancel" },
        {
          text: account.viewer.isAuthenticated ? settingsCopy.signOut : settingsCopy.openSignIn,
          style: account.viewer.isAuthenticated ? "destructive" : "default",
          onPress: async () => {
            if (account.viewer.isAuthenticated) {
              const nextPath = await auth.signOutToGuest();
              if (nextPath) {
                router.replace(nextPath);
              }
              return;
            }

            router.push({
              pathname: "/auth",
              params: {
                returnTo: "/account/settings",
              },
            });
          },
        },
      ],
    );
  }

  const sessionTitle = account.viewer.isAuthenticated ? settingsCopy.signOut : settingsCopy.connectAccount;
  const privacyStatus = account.viewer.consents.privacyAcceptedAt ? accountCopy.privacyReviewed : accountCopy.privacyPending;
  const termsStatus = account.viewer.consents.termsAcceptedAt ? accountCopy.termsReviewed : accountCopy.termsPending;
  const accountLabel = account.viewer.email ?? account.viewer.phone ?? sessionTitle;

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.canvas }}>
      <MobileTopBar
        insetTop={insets.top}
        backgroundColor={theme.colors.canvas}
        borderColor={theme.colors.border}
        title={accountCopy.settings}
        leading={<IconButton icon={ArrowLeft} onPress={() => router.back()} tone="panel" />}
        trailing={<View style={{ width: 44, height: 44 }} />}
      />

      <ScrollView
        className="flex-1 px-5 pt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 32) + 24 }}
      >
        <View className="gap-6">
          <AccountPageIntro title={accountCopy.settings} description={accountLabel} tone="muted" />

          <SettingsSection label={settingsCopy.appearanceTitle}>
            <SettingsRail>
              <ThemeToggleButton active={themeMode === "system"} label={settingsCopy.automatic} onPress={() => void handleThemeChange("system")} />
              <ThemeToggleButton active={themeMode === "dark"} label={settingsCopy.dark} onPress={() => void handleThemeChange("dark")} />
              <ThemeToggleButton active={themeMode === "light"} label={settingsCopy.light} onPress={() => void handleThemeChange("light")} />
            </SettingsRail>
          </SettingsSection>

          <SettingsSection label={settingsCopy.languageTitle}>
            <SettingsRail>
              <LanguageToggleButton
                active={account.viewer.preferences.locale === "ar"}
                label={dictionary.locale.arabic}
                onPress={() => void handleLanguageChange("ar")}
              />
              <LanguageToggleButton
                active={account.viewer.preferences.locale === "en"}
                label={dictionary.locale.english}
                onPress={() => void handleLanguageChange("en")}
              />
            </SettingsRail>
          </SettingsSection>

          <SettingsSection label={settingsCopy.financeTitle}>
            <View>
              <SettingInput
                label={settingsCopy.downPaymentPercent}
                value={downPaymentPercent}
                onChangeText={setDownPaymentPercent}
                suffix="%"
                withBorder
              />
              <SettingInput
                label={settingsCopy.repaymentYears}
                value={preferredYears}
                onChangeText={setPreferredYears}
                suffix={settingsCopy.repaymentYearsSuffix}
                withBorder
              />
              <SettingInput
                label={settingsCopy.annualInterest}
                value={annualRate}
                onChangeText={setAnnualRate}
                suffix="%"
              />
            </View>

            <View className={cn(isRtl ? "flex-row-reverse" : "flex-row", "gap-3")}>
              <Button className="flex-1" label={settingsCopy.saveFinanceDefaults} size="sm" onPress={() => void saveFinanceDefaults()} />
              <Button className="flex-1" label={settingsCopy.openFinanceScreen} size="sm" variant="ghost" onPress={() => router.push("/finance")} />
            </View>
          </SettingsSection>

          <SettingsSection label={settingsCopy.trustTitle}>
            <View>
              <MinimalActionRow
                label={settingsCopy.privacyData}
                status={privacyStatus}
                onPress={() => router.push("/legal")}
                withBorder
              />
              <MinimalActionRow
                label={settingsCopy.termsAndUse}
                status={termsStatus}
                onPress={() => router.push("/legal")}
              />
            </View>
          </SettingsSection>

          <SettingsSection label={settingsCopy.deviceSectionTitle}>
            <View>
              <MinimalActionRow
                label={settingsCopy.newChat}
                onPress={() => router.push("/")}
                withBorder
              />
              <MinimalActionRow
                label={settingsCopy.clearLocalData}
                destructive
                onPress={confirmResetLocalData}
                withBorder
              />
              <MinimalActionRow
                label={sessionTitle}
                destructive={account.viewer.isAuthenticated}
                onPress={confirmLogout}
              />
            </View>
          </SettingsSection>
        </View>
      </ScrollView>
    </View>
  );
}

function SettingsSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const theme = useAppTheme();
  const { isRtl } = useMobileLocale();

  return (
    <View className="gap-2" style={{ borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 14 }}>
      <AppText className={cn(isRtl ? "text-right" : "text-left", "text-[12px] font-cairo-black")} style={{ color: theme.colors.inkMuted }}>
        {label}
      </AppText>
      {children}
    </View>
  );
}

function SettingsRail({ children }: { children: React.ReactNode }) {
  const { isRtl } = useMobileLocale();

  return (
    <View className={cn(isRtl ? "flex-row-reverse" : "flex-row", "gap-2")}>
      {children}
    </View>
  );
}

function MinimalActionRow({
  label,
  status,
  destructive = false,
  withBorder = false,
  onPress,
}: {
  label: string;
  status?: string;
  destructive?: boolean;
  withBorder?: boolean;
  onPress: () => void;
}) {
  const theme = useAppTheme();
  const { isRtl } = useMobileLocale();

  return (
    <Pressable
      onPress={onPress}
      className={cn(isRtl ? "flex-row-reverse" : "flex-row", "items-center justify-between gap-3 py-3")}
      style={withBorder ? { borderBottomWidth: 1, borderBottomColor: theme.colors.border } : undefined}
    >
      <AppText
        className={cn("flex-1", isRtl ? "text-right" : "text-left", "text-[14px] font-cairo-bold")}
        style={{ color: destructive ? theme.colors.danger : theme.colors.ink }}
      >
        {label}
      </AppText>
      {status ? (
        <AppText className={cn(isRtl ? "text-left" : "text-right", "text-[11px] font-cairo-bold")} style={{ color: theme.colors.inkMuted }}>
          {status}
        </AppText>
      ) : null}
    </Pressable>
  );
}

function ThemeToggleButton({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  const theme = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center justify-center py-2"
      style={{
        borderBottomWidth: 2,
        borderBottomColor: active ? theme.colors.ink : theme.colors.border,
      }}
    >
      <AppText
        className={`text-[13px] ${active ? "font-cairo-bold" : "font-cairo-medium"}`}
        style={{ color: active ? theme.colors.ink : theme.colors.inkMuted }}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

function LanguageToggleButton({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  const theme = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center justify-center py-2"
      style={{
        borderBottomWidth: 2,
        borderBottomColor: active ? theme.colors.ink : theme.colors.border,
      }}
    >
      <AppText
        className={`text-[13px] ${active ? "font-cairo-bold" : "font-cairo-medium"}`}
        style={{ color: active ? theme.colors.ink : theme.colors.inkMuted }}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

function SettingInput({
  label,
  value,
  onChangeText,
  suffix,
  withBorder = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  suffix: string;
  withBorder?: boolean;
}) {
  const theme = useAppTheme();
  const { isRtl } = useMobileLocale();

  return (
    <View
      className={cn(isRtl ? "flex-row-reverse" : "flex-row", "items-center justify-between gap-4 py-3")}
      style={withBorder ? { borderBottomWidth: 1, borderBottomColor: theme.colors.border } : undefined}
    >
      <AppText className={cn("flex-1", isRtl ? "text-right" : "text-left", "text-[13px] font-cairo-bold")} style={{ color: theme.colors.ink }}>
        {label}
      </AppText>
      <View className={cn(isRtl ? "flex-row-reverse" : "flex-row", "items-center gap-2")}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          textAlign="center"
          style={{
            minHeight: 40,
            width: 82,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            color: theme.colors.ink,
            paddingHorizontal: 12,
            fontSize: 14,
            fontWeight: "700",
          }}
        />
        <AppText className={cn(isRtl ? "text-left" : "text-right", "text-[10px] font-cairo-bold")} style={{ color: theme.colors.inkMuted }}>
          {suffix}
        </AppText>
      </View>
    </View>
  );
}
