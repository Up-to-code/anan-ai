import React, { useEffect, useState } from "react";
import { Image, ScrollView, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Mail, Phone, UserRound } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { MobilePill, MobileTopBar } from "@/components/ui/MobileChrome";
import { useBuyerAccount } from "@/hooks/useBuyerAccount";
import { cn } from "@/lib/cn";
import { useMobileLocale } from "@/lib/mobileLocale";
import { useAppTheme } from "@/lib/mobileTheme";
import { AccountPageIntro, AccountSection } from "@/features/AccountScreen/shared";

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
 * WHY:   Buyers need one focused profile screen that keeps identity editing clear and calm inside the account flow.
 * WHAT:  Renders a minimal identity summary, editable contact form, and a small explanation of continuity impact.
 * HOW:   Reads the merged buyer account, keeps persistence local, and presents the form inside the same quieter shell used across account routes.
 */
export default function AccountProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const account = useBuyerAccount();
  const { dictionary, isRtl } = useMobileLocale();
  const profileCopy = dictionary.accountProfile;
  const accountCopy = dictionary.account;
  const [displayName, setDisplayName] = useState(account.viewer.displayName);
  const [phone, setPhone] = useState(account.viewer.phone ?? "");
  const [email, setEmail] = useState(account.viewer.email ?? "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDisplayName(account.viewer.displayName);
    setPhone(account.viewer.phone ?? "");
    setEmail(account.viewer.email ?? "");
  }, [account.viewer.displayName, account.viewer.email, account.viewer.phone]);

  const hasChanges =
    displayName.trim() !== account.viewer.displayName ||
    phone.trim() !== (account.viewer.phone ?? "") ||
    email.trim() !== (account.viewer.email ?? "");
  const identityTitle = resolveIdentityLabel({
    displayName: account.authSources.clerk?.displayName ?? account.viewer.displayName,
    email: account.authSources.clerk?.email ?? account.viewer.email,
    fallback: accountCopy.linkedAccount,
  });
  const identityRows = [
    { label: profileCopy.email, value: account.authSources.clerk?.email ?? account.viewer.email },
    { label: profileCopy.phone, value: account.authSources.clerk?.phone ?? account.viewer.phone },
  ].filter((row): row is { label: string; value: string } => typeof row.value === "string" && row.value.trim().length > 0);
  const identityDescription = account.viewer.email ?? account.viewer.phone ?? undefined;
  const avatarUrl = account.authSources.clerk?.imageUrl;

  async function saveProfile() {
    await account.updateProfile({
      displayName,
      phone,
      email,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.canvas }}>
      <MobileTopBar
        insetTop={insets.top}
        backgroundColor={theme.colors.canvas}
        borderColor={theme.colors.border}
        title={accountCopy.profile}
        leading={<IconButton icon={ArrowLeft} onPress={() => router.back()} tone="panel" />}
        trailing={saved ? <MobilePill label={profileCopy.saved} tone="primary" active /> : <View style={{ width: 44, height: 44 }} />}
      />

      <ScrollView
        className="flex-1 px-5 pt-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 32) + 24 }}
      >
        <View className="gap-4">
          <AccountPageIntro title={identityTitle} description={identityDescription} tone="muted">
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: theme.colors.surfaceMuted,
                  alignSelf: isRtl ? "flex-end" : "flex-start",
                }}
              />
            ) : null}
            <View className="gap-2">
              {identityRows.map((row, index) => (
                <ContinuityRow key={`${row.label}-${index}`} label={row.label} value={row.value} withBorder={index < identityRows.length - 1} />
              ))}
            </View>
          </AccountPageIntro>

          <AccountSection title={profileCopy.basicsTitle}>
            <View className="gap-4">
              <ProfileField
                icon={UserRound}
                label={profileCopy.displayName}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder={profileCopy.guestName}
              />
              <ProfileField
                icon={Phone}
                label={profileCopy.phone}
                value={phone}
                onChangeText={setPhone}
                placeholder={profileCopy.phonePlaceholder}
                keyboardType="phone-pad"
              />
              <ProfileField
                icon={Mail}
                label={profileCopy.email}
                value={email}
                onChangeText={setEmail}
                placeholder={profileCopy.emailPlaceholder}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Button
                label={hasChanges ? profileCopy.saveChanges : profileCopy.noChanges}
                onPress={() => void saveProfile()}
                disabled={!hasChanges || displayName.trim().length < 2}
              />
            </View>
          </AccountSection>
        </View>
      </ScrollView>
    </View>
  );
}

function ProfileField({
  icon: Icon,
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize = "sentences",
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "phone-pad" | "email-address";
  autoCapitalize?: "none" | "sentences";
}) {
  const theme = useAppTheme();
  const { isRtl } = useMobileLocale();

  return (
    <View className="gap-2">
      <View className={cn(isRtl ? "flex-row-reverse" : "flex-row", "items-center gap-2")}>
        <Icon size={15} color={theme.colors.primary} />
        <AppText className={cn(isRtl ? "text-right" : "text-left", "text-[13px] font-cairo-bold")} style={{ color: theme.colors.ink }}>
          {label}
        </AppText>
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.inkMuted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        textAlign={isRtl ? "right" : "left"}
        style={{
          minHeight: 52,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.canvas,
          color: theme.colors.ink,
          paddingHorizontal: 16,
          fontSize: 15,
        }}
      />
    </View>
  );
}

function ContinuityRow({
  label,
  value,
  withBorder = false,
}: {
  label: string;
  value: string;
  withBorder?: boolean;
}) {
  const theme = useAppTheme();
  const { isRtl } = useMobileLocale();

  return (
    <View
      className={cn(isRtl ? "flex-row-reverse" : "flex-row", "items-center justify-between gap-3 py-2")}
      style={withBorder ? { borderBottomWidth: 1, borderBottomColor: theme.colors.border } : undefined}
    >
      <AppText className={cn(isRtl ? "text-right" : "text-left", "text-[13px] font-cairo-bold")} style={{ color: theme.colors.ink }}>
        {label}
      </AppText>
      <AppText className={cn(isRtl ? "text-left" : "text-right", "text-[13px] font-medium")} style={{ color: theme.colors.inkMuted }}>
        {value}
      </AppText>
    </View>
  );
}
