import React, { useMemo } from "react";
import { Alert, Image, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Bookmark, Clock3, LogOut, SlidersHorizontal, User as UserIcon } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { MobileTopBar } from "@/components/ui/MobileChrome";
import { useBuyerAccount } from "@/hooks/useBuyerAccount";
import { useBuyerAuth } from "@/hooks/useBuyerAuth";
import { usePropertyFeed } from "@/hooks/usePropertyFeed";
import { cn } from "@/lib/cn";
import { formatMobileCopy } from "@/lib/i18n";
import { useMobileLocale } from "@/lib/mobileLocale";
import { useAppTheme } from "@/lib/mobileTheme";
import { AccountActionList, AccountActionRow, AccountPageIntro, AccountSection } from "./shared";

function resolveIdentityLabel(args: {
  displayName?: string | null;
  email?: string | null;
  fallback: string;
}) {
  const displayName = args.displayName?.trim();
  if (displayName && displayName !== "ضيف عنان") return displayName;

  const emailPrefix = args.email?.trim().split("@")[0]?.replace(/[^a-zA-Z0-9]/g, "")?.slice(0, 5);
  if (emailPrefix) return emailPrefix;

  return args.fallback;
}

/**
 * WHY:   Buyers need a calm personal hub that feels close to the assistant shell without becoming a dashboard.
 * WHAT:  Renders the account home around identity first, then a quiet list of return paths and controls.
 * HOW:   Reads the shared buyer account and feed state, trims down badges/stats, and keeps saved/history continuity visible through light metadata.
 */
export default function AccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const account = useBuyerAccount();
  const auth = useBuyerAuth();
  const feed = usePropertyFeed();
  const { locale, dictionary, isRtl } = useMobileLocale();
  const accountCopy = dictionary.account;
  const navigationCopy = dictionary.navigation;
  const settingsCopy = dictionary.settings;

  const savedProperties = useMemo(
    () =>
      account.viewer.savedPropertyIds
        .map((propertyId) => feed.findPropertyById(propertyId))
        .filter(Boolean),
    [account.viewer.savedPropertyIds, feed],
  );
  const featuredSavedProperty = savedProperties[0] ?? null;
  const latestThread = account.recentThreads[0];
  const viewerMeta = account.viewer.phone ?? account.viewer.email;
  const profileStatus = account.viewer.isAuthenticated ? viewerMeta : accountCopy.guestMode;
  const localeLabel = locale === "ar" ? dictionary.locale.arabic : dictionary.locale.english;
  const guestSummary = [
    formatMobileCopy(accountCopy.savedCount, { count: account.viewer.savedPropertyIds.length }),
    formatMobileCopy(accountCopy.chatsCount, { count: account.viewer.threadCount }),
  ].join(" · ");
  const heroTitle = account.viewer.isAuthenticated
    ? resolveIdentityLabel({
        displayName: account.authSources.clerk?.displayName ?? account.viewer.displayName,
        email: account.authSources.clerk?.email ?? account.viewer.email,
        fallback: accountCopy.linkedAccount,
      })
    : accountCopy.guestMode;
  const heroImageUrl = account.authSources.clerk?.imageUrl;
  const heroSubline = account.viewer.isAuthenticated ? viewerMeta ?? accountCopy.linkedAccount : guestSummary;
  const heroFootnote = account.viewer.isAuthenticated
    ? [
        formatMobileCopy(accountCopy.savedCount, { count: account.viewer.savedPropertyIds.length }),
        formatMobileCopy(accountCopy.chatsCount, { count: account.viewer.threadCount }),
      ].join(" · ")
    : featuredSavedProperty?.title ?? latestThread?.title ?? localeLabel;
  const sessionLabel = account.viewer.isAuthenticated ? settingsCopy.signOut : settingsCopy.connectAccount;
  const verificationLabel = account.viewer.isAuthenticated ? dictionary.common.verified : accountCopy.guestMode;

  function openSettings() {
    router.push("/account/settings");
  }

  function confirmSessionAction() {
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
              if (nextPath) router.replace(nextPath);
              return;
            }

            router.push({
              pathname: "/auth",
              params: {
                returnTo: "/account",
              },
            });
          },
        },
      ],
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.canvas }}>
      <MobileTopBar
        insetTop={insets.top}
        backgroundColor={theme.colors.canvas}
        borderColor={theme.colors.border}
        title={navigationCopy.accountTitle}
        leading={<IconButton icon={ArrowLeft} onPress={() => router.back()} tone="panel" />}
        trailing={<View style={{ width: 44, height: 44 }} />}
      />

      <ScrollView
        className="flex-1 px-5 pt-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 36) + 24 }}
      >
        <View className="gap-5">
          <AccountPageIntro title={heroTitle} description={heroSubline ?? undefined} tone="muted">
            <View className="items-center gap-3 py-4">
              {heroImageUrl ? (
                <Image
                  source={{ uri: heroImageUrl }}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    backgroundColor: theme.colors.surfaceMuted,
                  }}
                />
              ) : (
                <View
                  className="items-center justify-center"
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    backgroundColor: theme.colors.primarySoft,
                  }}
                >
                  <UserIcon size={30} color={theme.colors.primary} />
                </View>
              )}
              <View className="items-center gap-1">
                <AppText className="text-center text-[22px] font-cairo-bold" style={{ color: theme.colors.ink }}>
                  {heroTitle}
                </AppText>
                {heroSubline ? (
                  <AppText className="text-center text-[13px] font-medium" style={{ color: theme.colors.inkMuted }}>
                    {heroSubline}
                  </AppText>
                ) : null}
              </View>
              <View
                className="px-3 py-1"
                style={{
                  borderRadius: 999,
                  backgroundColor: account.viewer.isAuthenticated ? "#E8F7EE" : theme.colors.surfaceMuted,
                }}
              >
                <AppText
                  className="text-[12px] font-cairo-bold"
                  style={{ color: account.viewer.isAuthenticated ? "#1F7A45" : theme.colors.inkMuted }}
                >
                  {verificationLabel}
                </AppText>
              </View>
              {heroFootnote ? (
                <AppText className="text-center text-[12px] font-medium" style={{ color: theme.colors.inkSoft }}>
                  {heroFootnote}
                </AppText>
              ) : null}
            </View>
          </AccountPageIntro>

          <AccountSection>
            <AccountActionList>
              <AccountActionRow
                icon={UserIcon}
                label={accountCopy.profile}
                description={profileStatus}
                testID="account-hub-profile"
                onPress={() => router.push("/account/profile")}
                withBorder
              />
              <AccountActionRow
                icon={Bookmark}
                label={accountCopy.savedProperties}
                description={featuredSavedProperty?.title ?? accountCopy.savedProperties}
                status={String(account.viewer.savedPropertyIds.length)}
                testID="account-hub-saved"
                onPress={() => router.push("/account/saved")}
                withBorder
              />
              <AccountActionRow
                icon={Clock3}
                label={accountCopy.history}
                description={latestThread?.title ?? latestThread?.preview}
                status={String(account.viewer.threadCount)}
                testID="account-hub-history"
                onPress={() => router.push("/account/history")}
                withBorder
              />
              <AccountActionRow
                icon={SlidersHorizontal}
                label={accountCopy.settings}
                status={localeLabel}
                testID="account-hub-settings"
                onPress={openSettings}
              />
            </AccountActionList>
          </AccountSection>

          <AccountSection>
            <AccountActionList>
              <AccountActionRow
                icon={LogOut}
                label={sessionLabel}
                destructive={account.viewer.isAuthenticated}
                testID="account-hub-session"
                onPress={confirmSessionAction}
              />
            </AccountActionList>
          </AccountSection>
        </View>
      </ScrollView>
    </View>
  );
}
