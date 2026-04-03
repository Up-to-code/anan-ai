import type { ReactNode } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, View, useColorScheme } from "react-native";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Bath, BedDouble, ChevronLeft, Images, MapPin, Ruler, Search } from "lucide-react-native";
import { usePropertyDetail } from "@/hooks/usePropertyDetail";
import { getPropertyHeroImage, getPropertyLocationLabel } from "@/lib/mobileData";
import { buildSearchRouteParams, parseSearchRouteParams } from "@/lib/mobileSearch";
import { formatCurrency } from "@/lib/formatters";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { MobilePill, MobileSectionHeading, MobileSurface } from "@/components/ui/MobileChrome";
import { StickyJourneyBar } from "@/features/PropertyDetailScreen/StickyJourneyBar";
import { mobileTheme } from "@/lib/mobileTheme";
import type { MobileProperty } from "@/types/mobile";

/**
 * WHY:   Property details should feel like a natural continuation of the assistant journey instead of a stack of marketplace cards.
 * WHAT:  Renders an image-first, content-led property screen with flat sections, lightweight actions, broker access, and gallery shortcuts.
 * HOW:   Uses shared route context for assistant/search continuity while keeping media, facts, and navigation in one continuous scroll.
 */
export default function PropertyDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";
  const params = useLocalSearchParams<{
    id?: string;
    threadId?: string;
    sourcePropertyId?: string;
    searchSummary?: string;
    searchQuery?: string;
    searchArea?: string;
    searchOwnerType?: string;
  }>();
  const propertyId = params.id;
  const threadId = params.threadId;
  const searchContext = parseSearchRouteParams(params);
  const { property, isLoading } = usePropertyDetail(propertyId);

  function continueToAssistant() {
    if (!property) return;
    router.push({
      pathname: "/",
      params: {
        propertyId: property.id,
        ...(threadId ? { threadId } : {}),
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

  function requestAdvisor() {
    if (!property) return;
    Alert.alert(
      "افتح المحادثة أولاً",
      "حتى نكمل الطلب بنفس سياق العقار والنتائج، افتح المساعد أولاً ثم اطلب المستشار من داخل المحادثة.",
      [
        { text: "لاحقاً", style: "cancel" },
        {
          text: "افتح المساعد",
          onPress: continueToAssistant,
        },
      ],
    );
  }

  function openMap() {
    if (!property) return;
    void Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.address)}`,
    );
  }

  function openCall() {
    if (property?.owner.phone) {
      void Linking.openURL(`tel:${property.owner.phone}`);
      return;
    }
    requestAdvisor();
  }

  function openWhatsApp() {
    if (property?.owner.phone) {
      const sanitized = property.owner.phone.replace(/[^\d+]/g, "").replace(/^\+/, "");
      void Linking.openURL(`https://wa.me/${sanitized}`);
      return;
    }
    requestAdvisor();
  }

  function openThirdAction() {
    if (property?.owner.contactEmail) {
      void Linking.openURL(`mailto:${property.owner.contactEmail}`);
      return;
    }
    continueToAssistant();
  }

  function openGallery(initialIndex = 0) {
    if (!property) return;
    router.push({
      pathname: "/gallery",
      params: {
        propertyId: property.id,
        initialIndex: String(initialIndex),
        ...(threadId ? { threadId } : {}),
        ...buildSearchRouteParams(searchContext),
      },
    });
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: mobileTheme.colors.canvas }}>
        <ActivityIndicator size="large" color={mobileTheme.colors.primary} />
      </View>
    );
  }

  if (!property) {
    return (
      <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: mobileTheme.colors.canvas }}>
        <MobileSurface className="w-full items-center gap-4 px-8 py-10" radius="hero">
          <AppText className="text-center text-2xl font-cairo-black text-slate-900">الوحدة غير متاحة</AppText>
          <AppText className="text-center text-[15px] font-medium leading-relaxed text-slate-500">
            عد إلى البحث أو المحادثة الرئيسية لاختيار وحدة أخرى.
          </AppText>
        </MobileSurface>
      </View>
    );
  }

  const propertyTypeLabel = getPropertyTypeLabel(property);
  const listingTypeLabel = getListingTypeLabel(property);
  const screenBackground = isDark ? "#090A0C" : mobileTheme.colors.canvas;
  const textPrimary = isDark ? "#F8FAFC" : mobileTheme.colors.ink;
  const textSecondary = isDark ? "#CBD5E1" : "#64748B";
  const dividerColor = isDark ? "rgba(255,255,255,0.10)" : mobileTheme.colors.border;
  const detailRows = [
    { label: "نوع العقار", value: propertyTypeLabel },
    { label: "نوع العرض", value: listingTypeLabel },
    { label: "المساحة", value: `${property.sqft ?? 0} متر مربع` },
    { label: "الغرف", value: `${property.beds} غرف` },
    { label: "الحمامات", value: `${property.baths} حمامات` },
    { label: property.owner.type === "broker" ? "الوسيط" : "المطور", value: property.owner.name },
  ];

  return (
    <View className="flex-1" style={{ backgroundColor: screenBackground }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 132 }}>
        <Pressable className="relative" onPress={() => openGallery(0)}>
          <Image
            source={getPropertyHeroImage(property)}
            style={{ width: "100%", height: 360 }}
            contentFit="cover"
            transition={180}
          />
          <View className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.14)" }} />
          <View
            className="absolute inset-x-0 flex-row items-center justify-between px-5"
            style={{ top: insets.top + 14 }}
          >
            <IconButton icon={ArrowLeft} onPress={() => router.back()} tone="inversePanel" />
            {searchContext ? <MobilePill label="النتائج" onPress={returnToSearch} /> : <View />}
          </View>
          <View className="absolute bottom-5 right-5">
            <View
              className="flex-row-reverse items-center gap-2 rounded-full px-4 py-2"
              style={{ backgroundColor: "rgba(255,255,255,0.94)" }}
            >
              <Images size={15} color={mobileTheme.colors.primary} />
              <AppText className="text-[12px] font-cairo-black text-slate-900">
                افتح المعرض
              </AppText>
            </View>
          </View>
        </Pressable>

        <View className="px-5 pb-10 pt-6">
          <View className="items-end">
            <MobilePill label={propertyTypeLabel} tone="primary" active />
          </View>

          <View className="mt-4 flex-row-reverse items-start justify-between gap-4">
            <View className="flex-1">
              <AppText className="text-right text-[30px] font-cairo-black leading-[42px]" style={{ color: textPrimary }}>
                {property.title}
              </AppText>
              <View className="mt-2 flex-row-reverse items-center gap-2">
                <MapPin size={15} color={mobileTheme.colors.primary} />
                <AppText className="flex-1 text-right text-[14px] font-bold" style={{ color: textSecondary }}>
                  {getPropertyLocationLabel(property)}
                </AppText>
              </View>
            </View>
            <AppText className="text-right text-[24px] font-cairo-black leading-[34px]" style={{ color: textPrimary }}>
              {formatCurrency(property.price)}
            </AppText>
          </View>

          <View className="mt-5 flex-row-reverse flex-wrap gap-3">
            <InlineFact icon={<BedDouble size={15} color={mobileTheme.colors.inkMuted} />} label={`${property.beds} غرف`} />
            <InlineFact icon={<Bath size={15} color={mobileTheme.colors.inkMuted} />} label={`${property.baths} حمامات`} />
            <InlineFact icon={<Ruler size={15} color={mobileTheme.colors.inkMuted} />} label={`${property.sqft ?? 0} متر`} />
          </View>

          <View className="mt-5 flex-row-reverse flex-wrap gap-3">
            <SlimAction label="عرض الخريطة" icon={<MapPin size={15} color={mobileTheme.colors.primary} />} onPress={openMap} />
            <SlimAction label="التمويل" icon={<Search size={15} color={mobileTheme.colors.primary} />} onPress={() => router.push({ pathname: "/finance", params: { propertyId: property.id } })} />
            <SlimAction label="المساعد" icon={<ChevronLeft size={15} color={mobileTheme.colors.primary} />} onPress={continueToAssistant} />
          </View>

          <SectionDivider color={dividerColor} />

          <ContentSection title="نظرة سريعة">
            <AppText className="text-right text-[16px] leading-8" style={{ color: textSecondary }}>
              {property.aiSummary ??
                "وحدة سكنية جاهزة للعرض داخل تجربة عنان. يمكنك مراجعة التفاصيل ثم العودة للمحادثة لمقارنة العقار أو طلب تمويل أو متابعة مع مستشار."}
            </AppText>
          </ContentSection>

          <SectionDivider color={dividerColor} />

          <ContentSection title="تفاصيل العقار">
            <View style={{ borderTopWidth: 1, borderTopColor: dividerColor, borderBottomWidth: 1, borderBottomColor: dividerColor }}>
              {detailRows.map((row, index) => (
                <DetailRow
                  key={row.label}
                  label={row.label}
                  value={row.value}
                  withBorder={index < detailRows.length - 1}
                  dividerColor={dividerColor}
                  textPrimary={textPrimary}
                  textSecondary={textSecondary}
                />
              ))}
            </View>
          </ContentSection>

          <SectionDivider color={dividerColor} />

          <ContentSection title="الصور">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-row-reverse"
              contentContainerStyle={{ gap: 12 }}
            >
              {property.media.map((image, index) => (
                <Pressable key={image} onPress={() => openGallery(index)} className="active:opacity-85">
                  <Image
                    source={image}
                    style={{ width: 188, height: 126, borderRadius: 20 }}
                    contentFit="cover"
                    transition={180}
                  />
                </Pressable>
              ))}
            </ScrollView>
          </ContentSection>

          <SectionDivider color={dividerColor} />

          <ContentSection title={property.owner.type === "broker" ? "الوسيط" : "المطور"}>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/broker/[id]",
                  params: {
                    id: property.owner.id || "1",
                    propertyId: property.id,
                    ...(threadId ? { threadId } : {}),
                    ...buildSearchRouteParams(searchContext),
                  },
                })
              }
              className="flex-row items-center gap-3 py-2 active:opacity-90"
            >
              <Image
                source="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop"
                style={{ width: 64, height: 64, borderRadius: 32 }}
                contentFit="cover"
              />
              <View className="flex-1 items-end">
                <AppText className="text-right text-[18px] font-cairo-black" style={{ color: textPrimary }}>
                  {property.owner.name}
                </AppText>
                <AppText className="mt-1 text-right text-[14px] font-bold" style={{ color: textSecondary }}>
                  {property.owner.agencyLabel ?? (property.owner.type === "broker" ? "وسيط موثق" : "مطور موثق")}
                </AppText>
                <View className="mt-2 flex-row-reverse flex-wrap gap-2">
                  <StatusPill label={property.owner.isVerified ? "موثق" : "قيد المراجعة"} accent={property.owner.isVerified ? "mint" : "neutral"} />
                  {searchContext ? <StatusPill label="داخل نفس النتائج" accent="neutral" /> : null}
                </View>
              </View>
              <ChevronLeft size={18} color={mobileTheme.colors.primary} />
            </Pressable>
          </ContentSection>
        </View>
      </ScrollView>

      <StickyJourneyBar
        onWhatsApp={openWhatsApp}
        onCall={openCall}
        onThirdAction={openThirdAction}
        thirdActionLabel={property.owner.contactEmail ? "الإيميل" : "المساعد"}
      />
    </View>
  );
}

function SlimAction({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row-reverse items-center gap-2 rounded-full px-4 py-3 active:opacity-90"
      style={{
        borderWidth: 1,
        borderColor: mobileTheme.colors.border,
        backgroundColor: mobileTheme.colors.surfaceMuted,
      }}
    >
      {icon}
      <AppText className="text-[13px] font-cairo-black text-blue-700">{label}</AppText>
    </Pressable>
  );
}

function InlineFact({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <View
      className="flex-row-reverse items-center gap-2 rounded-full px-4 py-2.5"
      style={{ backgroundColor: mobileTheme.colors.surfaceMuted }}
    >
      {icon}
      <AppText className="text-[13px] font-cairo-black text-slate-700">{label}</AppText>
    </View>
  );
}

function ContentSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View>
      <AppText className="text-right text-[21px] font-cairo-black text-slate-950">{title}</AppText>
      <View className="mt-4">{children}</View>
    </View>
  );
}

function SectionDivider({ color }: { color: string }) {
  return <View className="my-7" style={{ height: 1, backgroundColor: color }} />;
}

function DetailRow({
  label,
  value,
  withBorder,
  dividerColor,
  textPrimary,
  textSecondary,
}: {
  label: string;
  value: string;
  withBorder?: boolean;
  dividerColor: string;
  textPrimary: string;
  textSecondary: string;
}) {
  return (
    <View
      className="flex-row-reverse items-center justify-between px-1 py-4"
      style={withBorder ? { borderBottomWidth: 1, borderBottomColor: dividerColor } : undefined}
    >
      <AppText className="text-right text-[15px] font-bold" style={{ color: textSecondary }}>{label}</AppText>
      <AppText className="max-w-[58%] text-right text-[17px] font-cairo-black leading-8" style={{ color: textPrimary }}>
        {value}
      </AppText>
    </View>
  );
}

function StatusPill({
  label,
  accent,
}: {
  label: string;
  accent: "mint" | "neutral";
}) {
  return (
    <View
      className="flex-row-reverse items-center gap-2 rounded-full px-4 py-2"
      style={{
        backgroundColor: accent === "mint" ? mobileTheme.colors.successSoft : mobileTheme.colors.surfaceMuted,
      }}
    >
      <AppText className={`text-[12px] font-cairo-black ${accent === "mint" ? "text-emerald-600" : "text-slate-600"}`}>
        {label}
      </AppText>
    </View>
  );
}

function getPropertyTypeLabel(property: MobileProperty) {
  const label = property.title.trim();
  if (label.includes("استوديو")) return "استوديو";
  if (label.includes("فيلا")) return "فيلا";
  if (label.includes("دوبلكس")) return "دوبلكس";
  if (label.includes("شقة")) return "شقة";
  return "وحدة سكنية";
}

function getListingTypeLabel(property: MobileProperty) {
  const searchableText = `${property.title} ${property.aiSummary ?? ""} ${property.status ?? ""}`;
  if (searchableText.includes("إيجار") || searchableText.includes("للإيجار") || searchableText.includes("شهري")) {
    return "للإيجار";
  }
  if (searchableText.includes("بيع") || searchableText.includes("للبيع")) {
    return "للبيع";
  }
  return "متاح الآن";
}
