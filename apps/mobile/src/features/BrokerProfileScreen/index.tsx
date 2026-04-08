import React, { useState, type ReactNode } from "react";
import { Pressable, ScrollView, View } from "react-native";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Building2, MapPin, Star, ShieldCheck, Mail, Phone, MessageCircle } from "lucide-react-native";
import { MobilePropertyCard } from "@/components/property/MobilePropertyCard";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { MobilePill, MobileSectionHeading, MobileTopBar, MobileSurface } from "@/components/ui/MobileChrome";
import { usePropertyDetail } from "@/hooks/usePropertyDetail";
import { buildSearchRouteParams, parseSearchRouteParams } from "@/lib/mobileSearch";
import { useAppTheme, getMobileShadow } from "@/lib/mobileTheme";
import { StickyJourneyBar } from "@/features/PropertyDetailScreen/StickyJourneyBar";

type BrokerTab = "about" | "listings";

export default function BrokerProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
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
  
  // Defensive access to owner properties to avoid TS errors
  const owner = property?.owner;
  const partnerName = owner?.name ?? "الشريك العقاري";
  
  // Safe extraction of non-standard properties from owner (which might be typed differently in some hooks)
  const anyOwner = owner as any;
  const agencyLabel = anyOwner?.agencyLabel ?? (owner?.type === "broker" ? "وسيط موثق" : "مطور موثق");
  const rating = anyOwner?.rating ?? 4.8;
  const activeListings = anyOwner?.activeListings ?? 1;
  const serviceArea = property?.location ?? "الرياض";
  const ownerPhone = anyOwner?.phone;
  const ownerEmail = anyOwner?.contactEmail;
  const description = anyOwner?.description ?? `${partnerName} متخصص في تقديم أفضل الحلول العقارية السكنية والتجارية، مع التركيز على جودة الخدمة ورضا العملاء في ${serviceArea}.`;

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

  const roleTitle = owner?.type === "RED" ? "تفاصيل المطور" : "تفاصيل الوسيط";
  const roleLabel = owner?.type === "RED" ? "مطور موثق" : "وسيط موثق";

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.canvas }}>
      <MobileTopBar
        insetTop={insets.top}
        title={roleTitle}
        backgroundColor={theme.colors.canvas}
        borderColor={theme.colors.border}
        leading={<IconButton icon={ArrowLeft} onPress={() => router.back()} tone="panel" />}
        trailing={searchContext ? <MobilePill label="النتائج" onPress={returnToSearch} /> : <View style={{ width: 44, height: 44 }} />}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        <View className="gap-6 px-5 pt-6">
          <MobileSurface tone="muted" radius="hero" className="items-center gap-5" shadow="none">
            <View style={{ position: "relative" }}>
              <Image
                source="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop"
                style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: theme.colors.surface }}
                contentFit="cover"
              />
              {owner?.isVerified ? (
                <View
                  className="absolute bottom-0 right-0 h-7 w-7 items-center justify-center rounded-full"
                  style={{ backgroundColor: theme.colors.teal, borderWidth: 2, borderColor: theme.colors.surface }}
                >
                  <ShieldCheck size={16} color="#FFFFFF" />
                </View>
              ) : null}
            </View>

            <View className="items-center gap-2">
              <AppText className="text-center text-[26px] font-cairo-black tracking-tight" style={{ color: theme.colors.ink }}>
                {partnerName}
              </AppText>
              <AppText className="text-center text-[15px] font-cairo-bold" style={{ color: theme.colors.primary }}>
                {agencyLabel}
              </AppText>
            </View>

            <View className="flex-row-reverse flex-wrap justify-center" style={{ gap: 8 }}>
              <MobilePill label={roleLabel} tone="primary" active />
              <MobilePill label={`${activeListings} عقارات`} />
              <MobilePill label={`${rating} تقييم`} />
            </View>
          </MobileSurface>

          <View
            className="flex-row-reverse items-center p-1"
            style={{ borderRadius: 999, backgroundColor: theme.colors.surfaceMuted }}
          >
            <TabButton label="نبذة التعريف" isActive={activeTab === "about"} onPress={() => setActiveTab("about")} />
            <TabButton label="قائمة العقارات" isActive={activeTab === "listings"} onPress={() => setActiveTab("listings")} />
          </View>

          {activeTab === "about" ? (
            <View className="gap-6">
              <MobileSurface tone="highlight" radius="hero" className="gap-3" shadow="none">
                <MobileSectionHeading
                  eyebrow="نبذة"
                  title="عن الشريك"
                  description="الملف الشخصي هنا جزء من نفس رحلة العقار الحالية وليس صفحة منفصلة عن سياقك."
                />
                <AppText className="text-right text-[16px] font-cairo-medium leading-7" style={{ color: theme.colors.inkSoft }}>
                  {description}
                </AppText>
              </MobileSurface>

              <View className="gap-4">
                <AppText className="text-right text-[18px] font-cairo-bold px-1" style={{ color: theme.colors.ink }}>معلومات إضافية</AppText>
                <View className="gap-3">
                  <FeatureItem 
                    icon={<MapPin size={20} color={theme.colors.primary} />} 
                    title="المنطقة" 
                    value={serviceArea} 
                  />
                  <FeatureItem 
                    icon={<Building2 size={20} color={theme.colors.primary} />} 
                    title="التخصص" 
                    value={owner?.type === "RED" ? "تطوير عقاري" : "وساطة وتسويق"} 
                  />
                  <FeatureItem 
                    icon={<ShieldCheck size={20} color={theme.colors.primary} />} 
                    title="الحالة" 
                    value={owner?.isVerified ? "شريك معتمد" : "قيد المراجعة"} 
                  />
                </View>
              </View>

              {property ? (
                <View className="gap-4">
                  <AppText className="text-right text-[18px] font-cairo-bold px-1" style={{ color: theme.colors.ink }}>العقار الحالي</AppText>
                   <MobilePropertyCard 
                      variant="featured"
                      property={property}
                      onPress={(nextProperty) =>
                        router.push({
                          pathname: "/property/[id]",
                          params: { id: nextProperty.id, ...(threadId ? { threadId } : {}), ...buildSearchRouteParams(searchContext) },
                        })
                      }
                      onActionPress={continueToAssistant}
                      actionLabel="تابع في المحادثة"
                      ambientBackgroundColor={theme.colors.canvas}
                   />
                </View>
              ) : null}
            </View>
          ) : (
            <View className="gap-5">
              <AppText className="text-right text-[20px] font-cairo-bold px-1" style={{ color: theme.colors.ink }}>العقارات المتاحة</AppText>
              {property ? (
                <MobilePropertyCard 
                  variant="featured"
                  property={property}
                  onPress={(nextProperty) =>
                    router.push({
                      pathname: "/property/[id]",
                      params: { id: nextProperty.id, ...(threadId ? { threadId } : {}), ...buildSearchRouteParams(searchContext) },
                    })
                  }
                  onActionPress={continueToAssistant}
                  actionLabel="تابع في المحادثة"
                  ambientBackgroundColor={theme.colors.canvas}
                />
              ) : (
                <MobileSurface radius="hero" className="items-center gap-2 py-10" shadow="none">
                  <Star size={20} color={theme.colors.inkMuted} />
                  <AppText className="text-center font-cairo-medium" style={{ color: theme.colors.inkMuted }}>
                    لا توجد عقارات إضافية حالياً.
                  </AppText>
                </MobileSurface>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <StickyJourneyBar
        onWhatsApp={openWhatsApp}
        onCall={openCall}
        onThirdAction={openThirdAction}
        thirdActionLabel={ownerEmail ? "الإيميل" : "تابع في المحادثة"}
      />
    </View>
  );
}

function TabButton({ label, isActive, onPress }: { label: string; isActive: boolean; onPress: () => void }) {
  const theme = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center py-2.5 active:opacity-90"
      style={{ borderRadius: 999, backgroundColor: isActive ? theme.colors.surface : "transparent", ... (isActive ? getMobileShadow("none") : {}) }}
    >
      <AppText className="text-[14px] font-cairo-bold" style={{ color: isActive ? theme.colors.primary : theme.colors.inkMuted }}>
        {label}
      </AppText>
    </Pressable>
  );
}

function FeatureItem({ icon, title, value }: { icon: ReactNode; title: string; value: string }) {
  const theme = useAppTheme();
  return (
    <View 
      className="flex-row-reverse items-center justify-between p-4" 
      style={{ borderRadius: theme.radii.card, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }}
    >
      <View className="flex-row-reverse items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: theme.colors.primarySoft }}>
           {icon}
        </View>
        <AppText className="text-[14px] font-cairo-bold" style={{ color: theme.colors.inkMuted }}>{title}</AppText>
      </View>
      <AppText className="text-[15px] font-cairo-bold" style={{ color: theme.colors.ink }}>{value}</AppText>
    </View>
  );
}
