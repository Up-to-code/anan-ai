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
import { formatMobileCopy, getMobileDictionary } from "@/lib/i18n";
import type { MobileLocale } from "@/lib/locale";
import { useMobileLocale } from "@/lib/mobileLocale";
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
  const { dictionary, isRtl, locale } = useMobileLocale();
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
      dictionary.property.openChatFirstTitle,
      dictionary.property.openChatFirstBody,
      [
        { text: dictionary.common.later, style: "cancel" },
        {
          text: dictionary.property.openChat,
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
          title={dictionary.propertyDetail.title}
          backgroundColor={theme.colors.canvas}
          borderColor={theme.colors.border}
          leading={<IconButton icon={ArrowLeft} onPress={() => router.back()} tone="panel" />}
        />
        <View className="flex-1 items-center justify-center px-6">
            <MobileSurface className="w-full items-center gap-4 px-8 py-10" radius="hero">
              <AppText className="text-center text-2xl font-cairo-bold" style={{ color: theme.colors.ink }}>
                {dictionary.property.unavailableTitle}
              </AppText>
              <AppText className="text-center text-[15px] font-medium leading-relaxed" style={{ color: theme.colors.inkMuted }}>
                {dictionary.property.unavailableBody}
              </AppText>
            </MobileSurface>
        </View>
      </View>
    );
  }

  const propertyTypeLabel = getPropertyTypeLabel(property, locale);
  const listingTypeLabel = getListingTypeLabel(property, locale);
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
        title={dictionary.propertyDetail.title}
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
                {formatCurrency(property.price, locale)}
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
                    {isSaved ? dictionary.property.saved : dictionary.property.save}
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
                    {dictionary.propertyDetail.openFinance}
                  </AppText>
                </Pressable>
              </View>
            </View>

            <View className="flex-row-reverse flex-wrap gap-x-5 gap-y-3">
              <InlineFact icon={<BedDouble size={16} color={theme.colors.primary} />} label={formatMobileCopy(dictionary.property.rooms, { count: String(property.beds) })} />
              <InlineFact icon={<Bath size={16} color={theme.colors.primary} />} label={formatMobileCopy(dictionary.property.baths, { count: String(property.baths) })} />
              <InlineFact
                icon={<Ruler size={16} color={theme.colors.primary} />}
                label={property.sqft ? formatMobileCopy(dictionary.property.sqft, { count: String(property.sqft) }) : dictionary.propertyDetail.areaUnknown}
              />
            </View>

            <View style={{ borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 18 }}>
              <InfoTableRow label={dictionary.propertyDetail.propertyType} value={propertyTypeLabel} />
              <InfoTableRow label={dictionary.propertyDetail.listingType} value={listingTypeLabel} />
              <InfoTableRow label={dictionary.propertyDetail.location} value={getPropertyLocationLabel(property)} onPress={openMap} />
              <InfoTableRow
                label={dictionary.propertyDetail.verificationStatus}
                value={
                  property.compliance?.permitStatus === "verified"
                    ? dictionary.property.verified
                    : property.compliance?.permitStatus === "pending_review"
                      ? dictionary.property.pendingReview
                      : dictionary.propertyDetail.needsReview
                }
                detail={
                  property.compliance?.adLicenseStatus
                    ? `${dictionary.propertyDetail.licenseLabel}: ${property.compliance.adLicenseStatus === "approved" ? dictionary.propertyDetail.licenseApproved : property.compliance.adLicenseStatus === "pending" ? dictionary.propertyDetail.licensePending : dictionary.propertyDetail.licenseRejected}`
                    : undefined
                }
              />
              <InfoTableRow
                label={dictionary.propertyDetail.starterFinance}
                value={property.finance ? formatCurrency(property.finance.estimatedMonthlyPayment, locale) : dictionary.propertyDetail.starterFinanceFallback}
                detail={
                  property.finance
                    ? formatMobileCopy(dictionary.propertyDetail.starterFinanceDetail, {
                        rate: String(property.finance.defaultAnnualRate),
                        years: String(property.finance.defaultYears),
                      })
                    : undefined
                }
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

            <View className="gap-4" style={{ borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 18 }}>
              <SectionHeading title={owner.type === "broker" ? dictionary.propertyDetail.publisherBroker : dictionary.propertyDetail.publisherDeveloper} />
              <OwnerPublisherCard
                name={property.owner.name}
                roleLabel={owner.type === "broker" ? dictionary.propertyDetail.verifiedBroker : dictionary.propertyDetail.verifiedDeveloper}
                agencyLabel={anyOwner.agencyLabel}
                isVerified={property.owner.isVerified}
              />
            </View>

            <View className="gap-3" style={{ borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 18 }}>
              <SectionHeading title={dictionary.propertyDetail.descriptionTitle} />
              <AppText className="text-right text-[16px] font-medium leading-8" style={{ color: theme.colors.inkSoft }}>
                {property.aiSummary ??
                  dictionary.propertyDetail.descriptionFallback}
              </AppText>
            </View>

            <View className="gap-4" style={{ borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 18 }}>
              <SectionHeading title={dictionary.propertyDetail.relatedTitle} />
              <View className="flex-row-reverse flex-wrap">
                {buildRelatedFacts({
                  locale,
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
                  {searchContext ? dictionary.propertyDetail.backToResults : dictionary.propertyDetail.backToChat}
                </AppText>
                <AppText className="mt-1 text-right text-[13px] font-medium" style={{ color: theme.colors.inkMuted }}>
                  {searchContext
                    ? searchContext.searchSummary || dictionary.propertyDetail.sameResults
                    : dictionary.propertyDetail.continueJourney}
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
        thirdActionLabel={anyOwner.contactEmail ? dictionary.propertyDetail.emailAction : dictionary.property.continueInAssistant}
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
  const { isRtl } = useMobileLocale();
  const content = (
    <View
      className={`items-center justify-between gap-4 py-4 ${isRtl ? "flex-row-reverse" : "flex-row"}`}
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
  const { isRtl } = useMobileLocale();
  return (
    <View className="w-1/2 pb-4 px-1">
      <AppText className={`${isRtl ? "text-right" : "text-left"} text-[12px] font-bold`} style={{ color: theme.colors.inkMuted }}>
        {label}
      </AppText>
      <AppText className={`mt-1 ${isRtl ? "text-right" : "text-left"} text-[15px] font-cairo-bold leading-7`} style={{ color: theme.colors.inkSoft }}>
        {value}
      </AppText>
    </View>
  );
}

function OwnerPublisherCard({
  name,
  roleLabel,
  agencyLabel,
  isVerified,
  onPress,
}: {
  name: string;
  roleLabel: string;
  agencyLabel?: string;
  isVerified: boolean;
  onPress?: () => void;
}) {
  const theme = useAppTheme();
  const { dictionary, isRtl } = useMobileLocale();
  const content = (
    <View
      className={`items-center gap-4 rounded-[24px] px-4 py-4 ${isRtl ? "flex-row-reverse" : "flex-row"}`}
      style={{
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
      }}
    >
      <View
        className="items-center justify-center rounded-full"
        style={{ width: 54, height: 54, backgroundColor: theme.colors.primarySoft }}
      >
        <Building2 size={22} color={theme.colors.primary} />
      </View>

      <View className={`flex-1 ${isRtl ? "items-end" : "items-start"}`}>
        <AppText className={`${isRtl ? "text-right" : "text-left"} text-[16px] font-cairo-bold`} style={{ color: theme.colors.ink }}>
          {name}
        </AppText>
        <AppText className={`mt-1 ${isRtl ? "text-right" : "text-left"} text-[13px] font-medium`} style={{ color: theme.colors.inkMuted }}>
          {agencyLabel ?? roleLabel}
        </AppText>
        <View className={`mt-2 items-center gap-2 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
          <AppText className={`${isRtl ? "text-right" : "text-left"} text-[12px] font-cairo-bold`} style={{ color: theme.colors.primary }}>
            {roleLabel}
          </AppText>
          <AppText className={`${isRtl ? "text-right" : "text-left"} text-[12px] font-medium`} style={{ color: theme.colors.inkMuted }}>
            {isVerified ? dictionary.propertyDetail.verifiedInAnan : dictionary.property.pendingReview}
          </AppText>
        </View>
      </View>

      {onPress ? <ChevronLeft size={18} color={theme.colors.inkMuted} /> : null}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return <Pressable onPress={onPress}>{content}</Pressable>;
}

function buildRelatedFacts({
  locale,
  hasSearchContext,
  searchSummary,
  searchArea,
  searchOwnerType,
  imageCount,
  ownerType,
}: {
  locale: MobileLocale;
  hasSearchContext: boolean;
  searchSummary?: string;
  searchArea?: string;
  searchOwnerType?: string;
  imageCount: number;
  ownerType: MobileProperty["owner"]["type"];
}) {
  const copy = getMobileDictionary(locale);
  if (hasSearchContext) {
    return [
      { label: copy.propertyDetail.relatedSummary, value: searchSummary ?? copy.propertyDetail.relatedResults },
      { label: copy.propertyDetail.searchArea, value: searchArea ?? copy.assistant.searchAll },
      { label: copy.propertyDetail.ownerType, value: searchOwnerType === "broker" ? copy.search.ownerBroker : searchOwnerType === "developer" ? copy.search.ownerDeveloper : copy.assistant.searchAll },
      { label: copy.propertyDetail.currentStatus, value: copy.propertyDetail.inCurrentResults },
    ];
  }

  return [
    { label: copy.propertyDetail.currentContext, value: copy.propertyDetail.insideConversation },
    { label: locale === "en" ? "Photo count" : "عدد الصور", value: formatMobileCopy(copy.propertyDetail.photosCount, { count: String(imageCount) }) },
    { label: copy.propertyDetail.ownerType, value: ownerType === "broker" ? copy.search.ownerBroker : copy.search.ownerDeveloper },
    { label: copy.propertyDetail.currentStatus, value: copy.propertyDetail.currentReference },
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

function getPropertyTypeLabel(property: MobileProperty, locale: MobileLocale) {
  const dictionary = getMobileDictionary(locale);
  const label = property.title.trim();
  if (label.includes("استوديو") || label.toLowerCase().includes("studio")) return dictionary.propertyDetail.studio;
  if (label.includes("فيلا") || label.toLowerCase().includes("villa")) return dictionary.property.typeVilla;
  if (label.includes("دوبلكس") || label.toLowerCase().includes("duplex")) return dictionary.property.typeDuplex;
  if (label.includes("شقة") || label.toLowerCase().includes("apartment")) return dictionary.property.typeApartment;
  return dictionary.propertyDetail.residentialUnit;
}

function getListingTypeLabel(property: MobileProperty, locale: "ar" | "en") {
  const dictionary = getMobileDictionary(locale);
  const searchableText = `${property.title} ${property.aiSummary ?? ""} ${property.status ?? ""}`;
  if (searchableText.includes("إيجار") || searchableText.includes("للإيجار") || searchableText.includes("شهري") || searchableText.toLowerCase().includes("rent")) {
    return dictionary.propertyDetail.forRent;
  }
  if (searchableText.includes("بيع") || searchableText.includes("للبيع") || searchableText.toLowerCase().includes("sale")) {
    return dictionary.propertyDetail.forSale;
  }
  return dictionary.propertyDetail.availableNow;
}
