import type { ReactNode } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Bath, BedDouble, MapPin, Ruler } from "lucide-react-native";
import { usePropertyDetail } from "@/hooks/usePropertyDetail";
import { buildClientWebBridgeUrl, buildMobileAuthBridgePayload, getPropertyHeroImage, getPropertyLocationLabel } from "@/lib/mobileData";
import { formatCurrency } from "@/lib/formatters";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { StickyJourneyBar } from "@/features/PropertyDetailScreen/StickyJourneyBar";

/**
 * WHY:   The Nexus design requires a clean, breathable property overview.
 * WHAT:  Modernizes the property detail with premium rounded-3xl cards and spaced-out layout.
 * HOW:   Uses large Cairo-black typography and high-contrast styling for clear communication.
 */
export default function PropertyDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string }>();
  const { property, isLoading } = usePropertyDetail(params.id);

  async function requestAdvisor() {
    if (!property) return;
    const payload = buildMobileAuthBridgePayload({
      messages: [],
      activeProperty: property,
      includeHandoff: true,
    });
    await Linking.openURL(buildClientWebBridgeUrl(payload));
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-950">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!property) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-950">
        <View className="w-[85%] rounded-[32px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-8 py-10 shadow-sm items-center gap-4">
          <AppText className="text-2xl font-cairo-black text-slate-900 dark:text-slate-50 text-center">الوحدة غير متاحة</AppText>
          <AppText className="text-[15px] leading-relaxed text-slate-500 font-medium text-center">
            عد إلى البحث أو المحادثة الرئيسية لاختيار وحدة أخرى.
          </AppText>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-100 dark:bg-slate-950">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="relative bg-slate-200 dark:bg-slate-800">
          <Image
            source={getPropertyHeroImage(property)}
            style={{ width: "100%", height: 360 }}
            contentFit="cover"
            transition={200}
          />
          <View className="absolute right-6" style={{ top: insets.top + 16 }}>
            <IconButton 
              icon={ArrowLeft} 
              onPress={() => router.back()} 
              className="bg-white/95 dark:bg-slate-900/95 shadow-md border-0 w-12 h-12" 
            />
          </View>
        </View>

        <View className="gap-6 px-6 pb-40 pt-6">
          <View className="rounded-[32px] border border-slate-200 bg-white px-5 py-5 dark:border-slate-800 dark:bg-slate-900">
            <View className="flex-row-reverse items-start justify-between gap-4">
              <View className="flex-1">
                <AppText className="text-[26px] font-cairo-black leading-tight text-slate-900 dark:text-slate-50 text-right">
                  {property.title}
                </AppText>
                <View className="mt-2 flex-row-reverse items-center gap-1.5">
                  <MapPin size={14} color="#64748B" />
                  <AppText className="text-[14px] text-slate-500 font-bold">{getPropertyLocationLabel(property)}</AppText>
                </View>
              </View>
              <AppText className="text-2xl font-cairo-black text-primary">
                {formatCurrency(property.price)}
              </AppText>
            </View>

            <View className="mt-6 flex-row-reverse flex-wrap gap-4 border-t border-slate-50 dark:border-slate-800 pt-6">
              <DetailFact icon={<BedDouble size={18} color="#94A3B8" />} label={`${property.beds} غرف`} />
              <DetailFact icon={<Bath size={18} color="#94A3B8" />} label={`${property.baths} حمامات`} />
              <DetailFact icon={<Ruler size={18} color="#94A3B8" />} label={`${property.sqft ?? 0} قدم`} />
            </View>

            <View className="mt-6 gap-3">
              <Pressable
                onPress={() => router.push({ pathname: "/", params: { propertyId: property.id } })}
                className="w-full h-14 rounded-full bg-slate-900 items-center justify-center flex-row-reverse gap-2 active:scale-[0.98] transition-transform"
              >
                <AppText className="text-[16px] font-cairo-black text-white">واصل في المحادثة</AppText>
              </Pressable>
              <Pressable
                onPress={() => router.push({ pathname: "/finance", params: { propertyId: property.id } })}
                className="w-full h-14 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center flex-row-reverse gap-2 active:scale-[0.98] transition-transform"
              >
                <AppText className="text-[16px] font-cairo-black text-slate-900 dark:text-slate-50">حاسبة التمويل العقاري</AppText>
              </Pressable>
            </View>
          </View>

          <View className="rounded-[32px] border border-slate-200 bg-white px-5 py-5 dark:border-slate-800 dark:bg-slate-900">
            <AppText className="text-lg font-cairo-black text-slate-900 dark:text-slate-50 text-right mb-4">
              قراءة سريعة
            </AppText>
            <AppText className="text-[15px] leading-8 text-slate-500 dark:text-slate-400 font-medium text-right">
              {property.aiSummary ?? "هذا العقار متاح الآن عبر تجربة الموبايل الحية. افتح المحادثة لمراجعة التمويل والعائد والتحويل إلى مستشار."}
            </AppText>
          </View>

          <View className="gap-4">
            <AppText className="text-lg font-cairo-black text-slate-900 dark:text-slate-50 text-right">
              المسوق العقاري
            </AppText>
            <Pressable 
              onPress={() => router.push({ pathname: "/broker/[id]", params: { id: property.owner.id || "1", propertyId: property.id } })}
              className="flex-row-reverse items-center gap-4 bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800 p-4 active:scale-[0.98] transition-all"
            >
              <Image 
                source="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1000&auto=format&fit=crop" 
                style={{ width: 60, height: 60, borderRadius: 30 }} 
                contentFit="cover" 
              />
              <View className="flex-1">
                <AppText className="text-[16px] font-cairo-black text-slate-900 dark:text-slate-50 text-right">{property.owner.name}</AppText>
                <AppText className="text-[13px] font-medium text-slate-500 text-right">
                  {property.owner.agencyLabel ?? (property.owner.type === "broker" ? "وسيط موثق" : "مطور موثق")}
                </AppText>
              </View>
            </Pressable>
          </View>

          <View className="py-2">
            <AppText className="text-lg font-cairo-black text-slate-900 dark:text-slate-50 mb-6 text-right">
              الصور الداخلية
            </AppText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-row-reverse"
              contentContainerStyle={{ gap: 16 }}
            >
              {property.media.map((image) => (
                <Pressable 
                  key={image} 
                  onPress={() => router.push({ pathname: "/gallery", params: { propertyId: property.id } })}
                  className="active:opacity-80 transition-opacity"
                >
                  <Image
                    source={image}
                    style={{ width: 220, height: 160, borderRadius: 24 }}
                    contentFit="cover"
                    transition={200}
                  />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      <StickyJourneyBar
        onBookViewing={() => router.push({ pathname: "/", params: { propertyId: property.id } })}
        onTalkToAdvisor={() => void requestAdvisor()}
      />
    </View>
  );
}

function DetailFact({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <View className="flex-row-reverse items-center gap-2.5 rounded-full border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50 px-5 py-3">
      {icon}
      <AppText className="text-[14px] text-slate-600 dark:text-slate-300 font-cairo-black">{label}</AppText>
    </View>
  );
}
