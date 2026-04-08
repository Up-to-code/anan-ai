import React, { useEffect, useState, type ReactNode } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from "react-native";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Bath, BedDouble, Building2, ChevronLeft, MapPin, Ruler } from "lucide-react-native";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { MobileSurface, MobileTopBar } from "@/components/ui/MobileChrome";
import { GalleryViewport } from "@/features/GalleryScreen/GalleryViewport";
import { StickyJourneyBar } from "@/features/PropertyDetailScreen/StickyJourneyBar";
import { useBuyerAccount } from "@/hooks/useBuyerAccount";
import { usePropertyDetail } from "@/hooks/usePropertyDetail";
import { formatCurrency } from "@/lib/formatters";
import { getPropertyHeroImage, getPropertyLocationLabel } from "@/lib/mobileData";
import { buildSearchRouteParams, parseSearchRouteParams } from "@/lib/mobileSearch";
import { useAppTheme } from "@/lib/mobileTheme";
import type { MobileProperty } from "@/types/mobile";

/**
 * WHY:   Buyers need one calm property page that keeps the media, facts, and next actions easy to scan.
 * WHAT:  Renders the property details screen with an inline image carousel, simplified sections, and route continuity.
 * HOW:   Keeps the active image local to the page, reuses the shared gallery viewport inline, and opens a minimal fullscreen swiper when media is tapped.
 */
export default function PropertyDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const account = useBuyerAccount();
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [property?.id]);

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
      "افتح صفحة المحادثة أولاً",
      "حتى نكمل الطلب بنفس سياق العقار والنتائج، افتح صفحة المحادثة أولاً ثم اطلب المستشار من داخلها.",
      [
        { text: "لاحقاً", style: "cancel" },
        {
          text: "افتح المحادثة",
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
    const ownerPhone = property ? (property.owner as { phone?: string }).phone : undefined;
    if (ownerPhone) {
      void Linking.openURL(`tel:${ownerPhone}`);
      return;
    }
    requestAdvisor();
  }

  function openWhatsApp() {
    const ownerPhone = property ? (property.owner as { phone?: string }).phone : undefined;
    if (ownerPhone) {
      const sanitized = ownerPhone.replace(/[^\d+]/g, "").replace(/^\+/, "");
      void Linking.openURL(`https://wa.me/${sanitized}`);
      return;
    }
    requestAdvisor();
  }

  function openThirdAction() {
    const ownerEmail = property ? (property.owner as { contactEmail?: string }).contactEmail : undefined;
    if (ownerEmail) {
      void Linking.openURL(`mailto:${ownerEmail}`);
      return;
    }
    continueToAssistant();
  }

  function openGallery(initialIndex = currentImageIndex) {
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

  function openBrokerProfile() {
    if (!property) return;
    router.push({
      pathname: "/broker/[id]",
      params: {
        id: property.owner.id || "1",
        propertyId: property.id,
        ...(threadId ? { threadId } : {}),
        ...buildSearchRouteParams(searchContext),
      },
    });
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: theme.colors.canvas }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!property) {
    return (
      <View className="flex-1" style={{ backgroundColor: theme.colors.canvas }}>
        <MobileTopBar
          insetTop={insets.top}
          title="تفاصيل العقار"
          backgroundColor={theme.colors.canvas}
          borderColor={theme.colors.border}
          leading={<IconButton icon={ArrowLeft} onPress={() => router.back()} tone="panel" />}
        />
        <View className="flex-1 items-center justify-center px-6">
          <MobileSurface className="w-full items-center gap-4 px-8 py-10" radius="hero">
            <AppText className="text-center text-2xl font-cairo-bold" style={{ color: theme.colors.ink }}>
              الوحدة غير متاحة
            </AppText>
            <AppText className="text-center text-[15px] font-medium leading-relaxed" style={{ color: theme.colors.inkMuted }}>
              عد إلى البحث أو المحادثة الرئيسية لاختيار وحدة أخرى.
            </AppText>
          </MobileSurface>
        </View>
      </View>
    );
  }

  const propertyTypeLabel = getPropertyTypeLabel(property);
  const listingTypeLabel = getListingTypeLabel(property);
  const images = property.media.length > 0 ? property.media : [getPropertyHeroImage(property)];
  const owner = property.owner;
  const anyOwner = owner as {
    phone?: string;
    contactEmail?: string;
    agencyLabel?: string;
  };
  const isSaved = account.isPropertySaved(property.id);

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.canvas }}>
      <MobileTopBar
        insetTop={insets.top}
        title="تفاصيل العقار"
        backgroundColor={theme.colors.canvas}
        borderColor={theme.colors.border}
        leading={<IconButton icon={ArrowLeft} onPress={() => router.back()} tone="panel" />}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 168 + Math.max(insets.bottom, 12) }}
      >
        <View className="gap-5 px-5 pt-5">
          <MobileSurface radius="hero" padded={false} style={{ overflow: "hidden", backgroundColor: theme.colors.surfaceMuted }}>
            <GalleryViewport
              images={images}
              currentIndex={currentImageIndex}
              initialIndex={0}
              onIndexChange={setCurrentImageIndex}
              viewportHeight={328}
              backgroundColor={theme.colors.surfaceMuted}
              onPressImage={openGallery}
            />
          </MobileSurface>

          {images.length > 1 ? (
            <View className="gap-3">
              <AppText className="text-right text-[13px] font-cairo-bold" style={{ color: theme.colors.inkMuted }}>
                {currentImageIndex + 1} من {images.length} صور
              </AppText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10, paddingHorizontal: 2 }}
              >
                {images.map((image, index) => {
                  const isActive = index === currentImageIndex;
                  return (
                    <Pressable
                      key={`${image}-${index}`}
                      onPress={() => setCurrentImageIndex(index)}
                      style={{
                        width: 70,
                        height: 70,
                        overflow: "hidden",
                        borderRadius: theme.radii.panel,
                        borderWidth: 1,
                        borderColor: isActive ? theme.colors.primaryMuted : theme.colors.border,
                        backgroundColor: theme.colors.surfaceMuted,
                      }}
                    >
                      <Image source={image} style={{ width: "100%", height: "100%" }} contentFit="cover" transition={120} />
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}

          <View className="gap-5 px-1 pb-2">
            <View className="gap-3">
              <AppText className="text-right text-[22px] font-cairo-bold leading-[32px]" style={{ color: theme.colors.ink }}>
                {property.title}
              </AppText>
              <AppText className="text-right text-[28px] font-cairo-bold" style={{ color: theme.colors.primary }}>
                {formatCurrency(property.price)}
              </AppText>
              <View className="flex-row-reverse flex-wrap" style={{ gap: 10 }}>
                <Pressable
                  onPress={() => void account.toggleSavedProperty(property.id)}
                  className="px-4 py-2.5"
                  style={{
                    borderRadius: theme.radii.pill,
                    borderWidth: 1,
                    borderColor: isSaved ? theme.colors.primaryMuted : theme.colors.border,
                    backgroundColor: isSaved ? theme.colors.primarySoft : theme.colors.surfaceMuted,
                  }}
                >
                  <AppText className="text-[13px] font-cairo-bold" style={{ color: isSaved ? theme.colors.primary : theme.colors.inkSoft }}>
                    {isSaved ? "تم الحفظ" : "احفظ العقار"}
                  </AppText>
                </Pressable>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/finance",
                      params: {
                        propertyId: property.id,
                        ...(threadId ? { threadId } : {}),
                        ...buildSearchRouteParams(searchContext),
                      },
                    })
                  }
                  className="px-4 py-2.5"
                  style={{
                    borderRadius: theme.radii.pill,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surfaceMuted,
                  }}
                >
                  <AppText className="text-[13px] font-cairo-bold" style={{ color: theme.colors.inkSoft }}>
                    افتح التمويل
                  </AppText>
                </Pressable>
              </View>
            </View>

            <View className="flex-row-reverse flex-wrap gap-x-5 gap-y-3">
              <InlineFact icon={<BedDouble size={16} color={theme.colors.primary} />} label={`${property.beds} غرف`} />
              <InlineFact icon={<Bath size={16} color={theme.colors.primary} />} label={`${property.baths} حمامات`} />
              <InlineFact
                icon={<Ruler size={16} color={theme.colors.primary} />}
                label={property.sqft ? `${property.sqft} م²` : "المساحة غير محددة"}
              />
            </View>

            <View style={{ borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 18 }}>
              <InfoTableRow label="النوع" value={propertyTypeLabel} />
              <InfoTableRow label="نوع العرض" value={listingTypeLabel} />
              <InfoTableRow label="الموقع" value={getPropertyLocationLabel(property)} onPress={openMap} />
              <InfoTableRow
                label="الجهة"
                value={property.owner.name}
                detail={anyOwner.agencyLabel ?? (owner.type === "broker" ? "وسيط موثق" : "مطور موثق")}
                onPress={openBrokerProfile}
              />
              <InfoTableRow
                label="حالة التحقق"
                value={
                  property.compliance?.permitStatus === "verified"
                    ? "موثق"
                    : property.compliance?.permitStatus === "pending_review"
                      ? "قيد المراجعة"
                      : "بحاجة إلى مراجعة"
                }
                detail={
                  property.compliance?.adLicenseStatus
                    ? `الرخصة: ${property.compliance.adLicenseStatus === "approved" ? "موافق عليها" : property.compliance.adLicenseStatus === "pending" ? "قيد المراجعة" : "مرفوضة"}`
                    : undefined
                }
              />
              <InfoTableRow
                label="تمويل مبدئي"
                value={property.finance ? formatCurrency(property.finance.estimatedMonthlyPayment) : "افتح التمويل"}
                detail={property.finance ? `فائدة ${property.finance.defaultAnnualRate}% لمدة ${property.finance.defaultYears} سنة` : undefined}
                onPress={() =>
                  router.push({
                    pathname: "/finance",
                    params: {
                      propertyId: property.id,
                      ...(threadId ? { threadId } : {}),
                      ...buildSearchRouteParams(searchContext),
                    },
                  })
                }
              />
            </View>

            <View className="gap-3" style={{ borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 18 }}>
              <SectionHeading title="الوصف" />
              <AppText className="text-right text-[16px] font-medium leading-8" style={{ color: theme.colors.inkSoft }}>
                {property.aiSummary ??
                  "وحدة سكنية جاهزة للعرض داخل تجربة عنان. يمكنك مراجعة التفاصيل ثم العودة للمحادثة لمقارنة العقار أو طلب تمويل أو متابعة مع مستشار."}
              </AppText>
            </View>

            <View className="gap-4" style={{ borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 18 }}>
              <SectionHeading title="مرتبطة بالنتيجة الحالية" />
              <View className="flex-row-reverse flex-wrap">
                {buildRelatedFacts({
                  hasSearchContext: Boolean(searchContext),
                  searchSummary: searchContext?.searchSummary,
                  searchArea: searchContext?.area,
                  searchOwnerType: searchContext?.ownerType,
                  imageCount: images.length,
                  ownerType: owner.type,
                }).map((item) => (
                  <GridTextItem key={item.label} label={item.label} value={item.value} />
                ))}
              </View>
            </View>

            <Pressable
              onPress={searchContext ? returnToSearch : continueToAssistant}
              className="flex-row-reverse items-center gap-3 active:opacity-90"
              style={{ borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 18, paddingBottom: 4 }}
            >
              <ChevronLeft size={18} color={theme.colors.inkMuted} />
              <View className="flex-1 items-end">
              <AppText className="text-right text-[15px] font-cairo-bold" style={{ color: theme.colors.ink }}>
                  {searchContext ? "العودة إلى النتائج المرتبطة" : "العودة إلى صفحة المحادثة"}
                </AppText>
                <AppText className="mt-1 text-right text-[13px] font-medium" style={{ color: theme.colors.inkMuted }}>
                  {searchContext
                    ? searchContext.searchSummary || "نفس النتائج التي جئت منها"
                    : "افتح نفس الرحلة في المحادثة لمتابعة المقارنة أو طلب المستشار"}
                </AppText>
              </View>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <StickyJourneyBar
        onWhatsApp={openWhatsApp}
        onCall={openCall}
        onThirdAction={openThirdAction}
        thirdActionLabel={anyOwner.contactEmail ? "الإيميل" : "تابع في المحادثة"}
      />
    </View>
  );
}

function InlineFact({ icon, label }: { icon: ReactNode; label: string }) {
  const theme = useAppTheme();
  return (
    <View className="flex-row-reverse items-center gap-2">
      {icon}
      <AppText className="text-right text-[14px] font-cairo-bold" style={{ color: theme.colors.inkSoft }}>
        {label}
      </AppText>
    </View>
  );
}

function InfoTableRow({
  label,
  value,
  detail,
  onPress,
}: {
  label: string;
  value: string;
  detail?: string;
  onPress?: () => void;
}) {
  const theme = useAppTheme();
  const content = (
    <View
      className="flex-row-reverse items-center justify-between gap-4 py-4"
      style={{
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      }}
    >
      {onPress ? <ChevronLeft size={16} color={theme.colors.inkMuted} /> : null}
      <View className="flex-1 items-end">
        <AppText className="text-right text-[15px] font-cairo-bold" style={{ color: theme.colors.ink }}>
          {value}
        </AppText>
        {detail ? (
          <AppText className="mt-1 text-right text-[12px] font-medium" style={{ color: theme.colors.inkMuted }}>
            {detail}
          </AppText>
        ) : null}
      </View>
      <AppText className="text-right text-[13px] font-bold" style={{ color: theme.colors.inkMuted }}>
        {label}
      </AppText>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable onPress={onPress} className="active:opacity-90">
      {content}
    </Pressable>
  );
}

function GridTextItem({ label, value }: { label: string; value: string }) {
  const theme = useAppTheme();
  return (
    <View className="w-1/2 pb-4 px-1">
      <AppText className="text-right text-[12px] font-bold" style={{ color: theme.colors.inkMuted }}>
        {label}
      </AppText>
      <AppText className="mt-1 text-right text-[15px] font-cairo-bold leading-7" style={{ color: theme.colors.inkSoft }}>
        {value}
      </AppText>
    </View>
  );
}

function buildRelatedFacts({
  hasSearchContext,
  searchSummary,
  searchArea,
  searchOwnerType,
  imageCount,
  ownerType,
}: {
  hasSearchContext: boolean;
  searchSummary?: string;
  searchArea?: string;
  searchOwnerType?: string;
  imageCount: number;
  ownerType: MobileProperty["owner"]["type"];
}) {
  if (hasSearchContext) {
    return [
      { label: "ملخص النتائج", value: searchSummary ?? "نتائج مرتبطة" },
      { label: "منطقة البحث", value: searchArea ?? "الكل" },
      { label: "نوع الجهة", value: searchOwnerType ?? "الكل" },
      { label: "الوضع الحالي", value: "ضمن النتائج الحالية" },
    ];
  }

  return [
    { label: "السياق الحالي", value: "داخل المحادثة" },
    { label: "عدد الصور", value: `${imageCount} صور` },
    { label: "نوع الجهة", value: ownerType === "broker" ? "وسيط" : "مطور" },
    { label: "الوضع الحالي", value: "العقار المرجعي الحالي" },
  ];
}

function SectionHeading({ title }: { title: string }) {
  const theme = useAppTheme();
  return (
    <AppText className="text-right text-[17px] font-cairo-bold" style={{ color: theme.colors.ink }}>
      {title}
    </AppText>
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
