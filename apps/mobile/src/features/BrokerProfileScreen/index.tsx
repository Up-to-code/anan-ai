import type { ReactNode } from "react";
import { useState } from "react";
import { Pressable, ScrollView, View, useColorScheme } from "react-native";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Building2, Mail, MapPin, Phone, Star } from "lucide-react-native";
import { MobilePropertyListItem } from "@/components/property/MobilePropertyListItem";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { MobilePill, MobileTopBar } from "@/components/ui/MobileChrome";
import { usePropertyDetail } from "@/hooks/usePropertyDetail";
import { buildSearchRouteParams, parseSearchRouteParams } from "@/lib/mobileSearch";
import { mobileTheme } from "@/lib/mobileTheme";
import { StickyJourneyBar } from "@/features/PropertyDetailScreen/StickyJourneyBar";

type BrokerTab = "about" | "listings";

/**
 * WHY:   Broker and developer pages should inherit the same buyer-side workspace styling rather than feeling like separate profile cards.
 * WHAT:  Renders a flatter partner profile with summary facts, one linked property context, and lightweight section switching.
 * HOW:   Keeps navigation and contact behavior intact while replacing heavy banners and boxed sections with content-first rows and dividers.
 */
export default function BrokerProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";
  const [activeTab, setActiveTab] = useState<BrokerTab>("about");
  const params = useLocalSearchParams<{
    id?: string;
    propertyId?: string;
    threadId?: string;
    sourcePropertyId?: string;
    searchSummary?: string;
    searchQuery?: string;
    searchArea?: string;
    searchOwnerType?: string;
  }>();
  const propertyId = params.propertyId;
  const threadId = params.threadId;
  const searchContext = parseSearchRouteParams(params);
  const { property } = usePropertyDetail(propertyId);
  const owner = property?.owner;
  const partnerName = owner?.name ?? "الشريك العقاري";
  const agencyLabel = owner?.agencyLabel ?? (owner?.type === "broker" ? "وسيط موثق" : "مطور موثق");
  const rating = owner?.rating ?? 4.8;
  const activeListings = owner?.activeListings ?? 1;
  const serviceArea = property?.location ?? "القاهرة";
  const ownerPhone = owner?.phone;
  const ownerEmail = owner?.contactEmail;
  const screenBackground = isDark ? "#090A0C" : mobileTheme.colors.canvas;
  const textPrimary = isDark ? "#F8FAFC" : mobileTheme.colors.ink;
  const textSecondary = isDark ? "#CBD5E1" : "#64748B";
  const dividerColor = isDark ? "rgba(255,255,255,0.10)" : mobileTheme.colors.border;

  function continueToAssistant() {
    router.push({
      pathname: "/",
      params: {
        ...(threadId ? { threadId } : {}),
        ...(propertyId ? { propertyId } : {}),
      },
    });
  }

  function returnToSearch() {
    if (!searchContext) return;
    router.replace({
      pathname: "/search",
      params: buildSearchRouteParams(searchContext),
    });
  }

  function openCall() {
    if (ownerPhone) {
      void Linking.openURL(`tel:${ownerPhone}`);
      return;
    }
    continueToAssistant();
  }

  function openWhatsApp() {
    if (ownerPhone) {
      const sanitized = ownerPhone.replace(/[^\d+]/g, "").replace(/^\+/, "");
      void Linking.openURL(`https://wa.me/${sanitized}`);
      return;
    }
    continueToAssistant();
  }

  function openThirdAction() {
    if (ownerEmail) {
      void Linking.openURL(`mailto:${ownerEmail}`);
      return;
    }
    continueToAssistant();
  }

  return (
    <View className="flex-1" style={{ backgroundColor: screenBackground }}>
      <MobileTopBar
        insetTop={insets.top}
        title={owner?.type === "RED" ? "المطور" : "الوسيط"}
        subtitle="بيانات الشريك داخل نفس الرحلة"
        backgroundColor={screenBackground}
        borderColor={dividerColor}
        leading={<IconButton icon={ArrowLeft} onPress={() => router.back()} tone={isDark ? "inversePanel" : "panel"} />}
        trailing={searchContext ? <MobilePill label="النتائج" onPress={returnToSearch} /> : <View style={{ width: 44, height: 44 }} />}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 128 }}>
        <View className="px-5 pt-6">
          <View className="items-center">
            <Image
              source="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop"
              style={{ width: 112, height: 112, borderRadius: 56 }}
              contentFit="cover"
            />
            <AppText className="mt-4 text-center text-[28px] font-cairo-black" style={{ color: textPrimary }}>
              {partnerName}
            </AppText>
            <AppText className="mt-1 text-center text-[15px] font-bold" style={{ color: textSecondary }}>
              {agencyLabel}
            </AppText>
            <View className="mt-4 flex-row-reverse flex-wrap justify-center gap-2">
              <ProfileBadge label={owner?.type === "RED" ? "مطور" : "وسيط"} tone="dark" />
              <ProfileBadge label={owner?.isVerified ? "موثق" : "قيد المراجعة"} tone={owner?.isVerified ? "mint" : "neutral"} />
              <ProfileBadge label={`${activeListings} عقارات`} tone="neutral" />
            </View>
          </View>

          <SectionDivider color={dividerColor} />

          <View
            className="flex-row-reverse items-center rounded-full p-1"
            style={{ backgroundColor: isDark ? "#14161B" : mobileTheme.colors.surfaceMuted }}
          >
            <TabButton label="عن" isActive={activeTab === "about"} onPress={() => setActiveTab("about")} />
            <TabButton label="عقارات" isActive={activeTab === "listings"} onPress={() => setActiveTab("listings")} />
          </View>

          {activeTab === "about" ? (
            <View className="pt-6">
              <SectionTitle title="نبذة" />
              <AppText className="mt-4 text-right text-[16px] leading-8" style={{ color: textSecondary }}>
                {owner?.description ??
                  `${partnerName} يعمل داخل رحلة الشراء الحالية لهذا العقار، ويمكنك التواصل معه مباشرة أو العودة للمحادثة لمتابعة المقارنة والتمويل.`}
              </AppText>

              <SectionDivider color={dividerColor} />

              <SectionTitle title="معلومات سريعة" />
              <View className="mt-4 gap-4">
                <InfoRow icon={<Star size={18} color={mobileTheme.colors.primary} />} label="التقييم" value={`${rating}`} textPrimary={textPrimary} textSecondary={textSecondary} />
                <InfoRow icon={<MapPin size={18} color={mobileTheme.colors.primary} />} label="مناطق الخدمة" value={serviceArea} textPrimary={textPrimary} textSecondary={textSecondary} />
                <InfoRow icon={<Building2 size={18} color={mobileTheme.colors.primary} />} label="طبيعة العمل" value={owner?.type === "RED" ? "تطوير وبيع وحدات" : "بيع وتأجير وإدارة عروض"} textPrimary={textPrimary} textSecondary={textSecondary} />
              </View>

              {property ? (
                <>
                  <SectionDivider color={dividerColor} />
                  <SectionTitle title="العقار المرتبط" />
                  <View className="mt-4">
                    <MobilePropertyListItem
                      property={property}
                      onPress={() =>
                        router.push({
                          pathname: "/property/[id]",
                          params: {
                            id: property.id,
                            ...(threadId ? { threadId } : {}),
                            ...buildSearchRouteParams(searchContext),
                          },
                        })
                      }
                      onActionPress={continueToAssistant}
                      actionLabel="تابع مع عنان"
                    />
                  </View>
                </>
              ) : null}
            </View>
          ) : (
            <View className="pt-6">
              <SectionTitle title="العقارات" />
              <View className="mt-4 flex-row-reverse flex-wrap gap-3">
                <FilterPill label="الكل" active />
                <FilterPill label="للبيع" />
                <FilterPill label="للإيجار" />
              </View>
              <View className="mt-5">
                {property ? (
                  <MobilePropertyListItem
                    property={property}
                    onPress={() =>
                      router.push({
                        pathname: "/property/[id]",
                        params: {
                          id: property.id,
                          ...(threadId ? { threadId } : {}),
                          ...buildSearchRouteParams(searchContext),
                        },
                      })
                    }
                    onActionPress={continueToAssistant}
                    actionLabel="تابع مع عنان"
                  />
                ) : (
                  <AppText className="text-right text-[15px] leading-8" style={{ color: textSecondary }}>
                    لا توجد عقارات متاحة حالياً داخل هذه المعاينة.
                  </AppText>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <StickyJourneyBar
        onWhatsApp={openWhatsApp}
        onCall={openCall}
        onThirdAction={openThirdAction}
        thirdActionLabel={ownerEmail ? "الإيميل" : "المساعد"}
      />
    </View>
  );
}

function TabButton({
  label,
  isActive,
  onPress,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center rounded-full py-3 active:opacity-90"
      style={{ backgroundColor: isActive ? mobileTheme.colors.surface : "transparent" }}
    >
      <AppText className="text-[15px] font-cairo-black" style={{ color: isActive ? mobileTheme.colors.primary : mobileTheme.colors.inkMuted }}>
        {label}
      </AppText>
    </Pressable>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <AppText className="text-right text-[21px] font-cairo-black text-slate-950">{title}</AppText>;
}

function InfoRow({
  icon,
  label,
  value,
  textPrimary,
  textSecondary,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  textPrimary: string;
  textSecondary: string;
}) {
  return (
    <View className="flex-row-reverse items-center justify-between">
      <View className="flex-row-reverse items-center gap-3">
        {icon}
        <AppText className="text-right text-[15px] font-bold" style={{ color: textSecondary }}>{label}</AppText>
      </View>
      <AppText className="max-w-[58%] text-right text-[17px] font-cairo-black leading-8" style={{ color: textPrimary }}>
        {value}
      </AppText>
    </View>
  );
}

function ProfileBadge({
  label,
  tone,
}: {
  label: string;
  tone: "dark" | "mint" | "neutral";
}) {
  const backgroundColor =
    tone === "dark" ? mobileTheme.colors.dark : tone === "mint" ? mobileTheme.colors.successSoft : mobileTheme.colors.surfaceMuted;
  const textColor =
    tone === "dark" ? "#FFFFFF" : tone === "mint" ? mobileTheme.colors.success : mobileTheme.colors.inkMuted;

  return (
    <View className="rounded-full px-4 py-2" style={{ backgroundColor }}>
      <AppText className="text-[12px] font-cairo-black" style={{ color: textColor }}>{label}</AppText>
    </View>
  );
}

function FilterPill({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <View
      className="rounded-full px-4 py-2.5"
      style={{
        borderWidth: active ? 0 : 1,
        borderColor: mobileTheme.colors.border,
        backgroundColor: active ? mobileTheme.colors.primarySoft : mobileTheme.colors.surface,
      }}
    >
      <AppText className="text-[13px] font-cairo-black" style={{ color: active ? mobileTheme.colors.primary : mobileTheme.colors.inkMuted }}>
        {label}
      </AppText>
    </View>
  );
}

function SectionDivider({ color }: { color: string }) {
  return <View className="my-7" style={{ height: 1, backgroundColor: color }} />;
}
