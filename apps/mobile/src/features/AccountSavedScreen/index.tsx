import React, { useMemo } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, ChevronLeft, ChevronRight, MapPin } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobilePropertyCard } from "@/components/property/MobilePropertyCard";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { MobileTopBar } from "@/components/ui/MobileChrome";
import { useBuyerAccount } from "@/hooks/useBuyerAccount";
import { usePropertyFeed } from "@/hooks/usePropertyFeed";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/cn";
import { getPropertyHeroImage, getPropertyLocationLabel } from "@/lib/mobileData";
import { useMobileLocale } from "@/lib/mobileLocale";
import { useAppTheme } from "@/lib/mobileTheme";
import type { MobileProperty } from "@/types/mobile";
import { AccountEmptyState, AccountPageIntro } from "@/features/AccountScreen/shared";

/**
 * WHY:   Buyers need a full saved-properties view that feels quieter than the old dashboard framing.
 * WHAT:  Renders the saved collection with a minimal intro and the existing property-card actions.
 * HOW:   Resolves saved ids from the shared feed, keeps the summary lightweight, and falls back to a guided empty state when needed.
 */
export default function AccountSavedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const account = useBuyerAccount();
  const feed = usePropertyFeed();
  const { dictionary, locale } = useMobileLocale();
  const accountCopy = dictionary.account;
  const savedCopy = dictionary.accountSaved;

  const savedProperties = useMemo(
    () => account.viewer.savedPropertyIds.map((propertyId) => feed.findPropertyById(propertyId)).filter(Boolean),
    [account.viewer.savedPropertyIds, feed],
  );
  const firstSaved = savedProperties[0] ?? null;
  const remainingSaved = savedProperties.slice(1);
  const introDescription = firstSaved
    ? [formatCurrency(firstSaved.price, locale), getPropertyLocationLabel(firstSaved)].join(" · ")
    : undefined;

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.canvas }}>
      <MobileTopBar
        insetTop={insets.top}
        backgroundColor={theme.colors.canvas}
        borderColor={theme.colors.border}
        title={accountCopy.savedProperties}
        leading={<IconButton icon={ArrowLeft} onPress={() => router.back()} tone="panel" />}
        trailing={<View style={{ width: 44, height: 44 }} />}
      />

      <ScrollView
        className="flex-1 px-5 pt-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 32) + 24 }}
      >
        <View className="gap-4">
          <AccountPageIntro title={savedProperties.length > 0 ? `${savedProperties.length} ${accountCopy.saved}` : savedCopy.emptyTitle} tone="muted">
            {firstSaved?.title ? (
              <AppText className="text-[13px] font-cairo-bold" style={{ color: theme.colors.ink }}>
                {firstSaved.title}
              </AppText>
            ) : null}
            {introDescription ? (
              <AppText className="text-[12px] font-cairo-bold" style={{ color: theme.colors.inkMuted }}>
                {introDescription}
              </AppText>
            ) : null}
          </AccountPageIntro>

          {savedProperties.length > 0 ? (
            <View style={{ gap: 14 }}>
              {firstSaved ? (
                <MobilePropertyCard
                  variant="compact"
                  property={firstSaved}
                  onPress={(nextProperty) => router.push({ pathname: "/property/[id]", params: { id: nextProperty.id } })}
                  onActionPress={(nextProperty) =>
                    router.push({
                      pathname: "/",
                      params: {
                        propertyId: nextProperty.id,
                        ...(account.viewer.activeThreadId ? { threadId: account.viewer.activeThreadId } : {}),
                      },
                    })
                  }
                  actionLabel={accountCopy.continueInChat}
                  ambientBackgroundColor={theme.colors.canvas}
                />
              ) : null}

              {remainingSaved.length > 0 ? (
                <View>
                  {remainingSaved.map((property, index) => (
                    <SavedPropertyRow
                      key={property!.id}
                      property={property!}
                      locale={locale}
                      withBorder={index < remainingSaved.length - 1}
                      onPress={(nextProperty) => router.push({ pathname: "/property/[id]", params: { id: nextProperty.id } })}
                    />
                  ))}
                </View>
              ) : null}
            </View>
          ) : (
            <AccountEmptyState
              title={savedCopy.firstSaveTitle}
              body={savedCopy.firstSaveBody}
              action={<Button label={savedCopy.openSearch} variant="secondary" onPress={() => router.push("/search")} />}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function SavedPropertyRow({
  property,
  locale,
  withBorder = false,
  onPress,
}: {
  property: MobileProperty;
  locale: "ar" | "en";
  withBorder?: boolean;
  onPress: (property: MobileProperty) => void;
}) {
  const theme = useAppTheme();
  const { isRtl } = useMobileLocale();
  const ChevronIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <Pressable
      onPress={() => onPress(property)}
      className={cn(isRtl ? "flex-row-reverse" : "flex-row", "items-center gap-3 py-3")}
      style={withBorder ? { borderBottomWidth: 1, borderBottomColor: theme.colors.border } : undefined}
    >
      <Image
        source={{ uri: getPropertyHeroImage(property) }}
        style={{
          width: 68,
          height: 68,
          borderRadius: 16,
          backgroundColor: theme.colors.surfaceMuted,
        }}
      />

      <View className={cn("flex-1 gap-1", isRtl ? "items-end" : "items-start")}>
        <AppText className={cn(isRtl ? "text-right" : "text-left", "text-[14px] font-cairo-bold")} style={{ color: theme.colors.ink }} numberOfLines={1}>
          {property.title}
        </AppText>
        <AppText className={cn(isRtl ? "text-right" : "text-left", "text-[13px] font-cairo-bold")} style={{ color: theme.colors.primary }}>
          {formatCurrency(property.price, locale)}
        </AppText>
        <View className={cn(isRtl ? "flex-row-reverse" : "flex-row", "items-center gap-1.5")}>
          <MapPin size={12} color={theme.colors.inkMuted} />
          <AppText className={cn(isRtl ? "text-right" : "text-left", "text-[12px] font-medium")} style={{ color: theme.colors.inkMuted }} numberOfLines={1}>
            {getPropertyLocationLabel(property)}
          </AppText>
        </View>
      </View>

      <ChevronIcon size={16} color={theme.colors.inkMuted} />
    </Pressable>
  );
}
