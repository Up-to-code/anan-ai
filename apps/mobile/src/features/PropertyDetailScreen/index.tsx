import type { ReactNode } from "react";
import { Alert, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { ArrowLeft, BadgeCheck, Bath, BedDouble, Building2, MapPin, Ruler, ShieldCheck } from "lucide-react-native";
import { getPropertyById } from "@/lib/mvp/ananAssistant";
import { formatCurrency } from "@/lib/mvp/formatters";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { StickyJourneyBar } from "@/features/PropertyDetailScreen/StickyJourneyBar";

/**
 * WHY:   Buyers need one lightweight detail screen before they commit to booking or advisor handoff.
 * WHAT:  Renders the selected property's imagery, facts, and journey context.
 * HOW:   Reads from the local MVP catalog and keeps the detail surface focused on trust and next steps.
 */
export default function PropertyDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const property = getPropertyById(params.id);

  if (!property) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-panel">
        <View className="w-[320px] border border-line bg-white px-5 py-6">
          <AppText tone="headline" className="text-lg">
            الوحدة غير متاحة
          </AppText>
          <AppText className="mt-2 text-sm leading-6 text-muted">
            عد إلى البحث أو المحادثة الرئيسية لاختيار وحدة أخرى من القائمة الحالية.
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-panel" edges={["top"]}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="bg-white">
          <Image
            source={property.heroImage}
            style={{ width: "100%", height: 280 }}
            contentFit="cover"
            transition={120}
          />
          <View className="absolute right-4 top-4">
            <IconButton icon={ArrowLeft} onPress={() => router.back()} />
          </View>
        </View>

        <View className="gap-5 px-5 pb-28 pt-5">
          <View className="border border-line bg-white px-4 py-4">
            <View className="flex-row-reverse items-start justify-between gap-3">
              <View className="flex-1">
                <AppText tone="headline" className="text-2xl leading-8">
                  {property.title}
                </AppText>
                <View className="mt-2 flex-row-reverse items-center gap-1">
                  <MapPin size={14} color="#64748B" />
                  <AppText className="text-sm text-muted">{property.address}</AppText>
                </View>
              </View>
              <AppText tone="headline" className="text-lg text-brand">
                {formatCurrency(property.price)}
              </AppText>
            </View>

            <View className="mt-4 flex-row-reverse flex-wrap gap-3 border-t border-line pt-4">
              <DetailFact icon={<BedDouble size={15} color="#64748B" />} label={`${property.beds} غرف`} />
              <DetailFact icon={<Bath size={15} color="#64748B" />} label={`${property.baths} حمامات`} />
              <DetailFact icon={<Ruler size={15} color="#64748B" />} label={`${property.sqft} قدم`} />
            </View>
          </View>

          <View className="border border-line bg-white px-4 py-4">
            <AppText tone="headline" className="text-base">
              قراءة سريعة
            </AppText>
            <AppText className="mt-3 text-sm leading-7 text-muted">{property.summary}</AppText>
          </View>

          <View className="border border-line bg-white px-4 py-4">
            <AppText tone="headline" className="text-base">
              نقاط تساعدك على القرار
            </AppText>
            <View className="mt-3 gap-3">
              <JourneyLine
                icon={<BadgeCheck size={15} color="#2563EB" />}
                title="القيمة الاستثمارية"
                body={`الإيجار السنوي التقديري يقارب ${formatCurrency(property.annualRentEstimate)} لهذه الوحدة.`}
              />
              <JourneyLine
                icon={<ShieldCheck size={15} color="#2563EB" />}
                title="التحقق"
                body={property.isVerified ? "الجهة المالكة موثقة داخل عنان." : "تحتاج مراجعة إضافية قبل الإغلاق النهائي."}
              />
              <JourneyLine
                icon={property.ownerType === "RED" ? <Building2 size={15} color="#2563EB" /> : <BadgeCheck size={15} color="#2563EB" />}
                title="المالك"
                body={`${property.ownerName} · ${property.ownerType === "RED" ? "مطور" : "وسيط"}`}
              />
            </View>
          </View>

          <View className="border border-line bg-white px-4 py-4">
            <AppText tone="headline" className="text-base">
              صور إضافية
            </AppText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingTop: 12 }}
            >
              {property.gallery.map((image) => (
                <Image
                  key={image}
                  source={image}
                  style={{ width: 176, height: 124, borderRadius: 2 }}
                  contentFit="cover"
                  transition={120}
                />
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      <StickyJourneyBar
        onBookViewing={() => Alert.alert("حجز زيارة", "تم تجهيز طلب الزيارة في نسخة الـ MVP الحالية.")}
        onTalkToAdvisor={() => Alert.alert("مستشار عنان", "تم تجهيز طلب تواصل مع مستشار عنان في نسخة الـ MVP الحالية.")}
      />
    </SafeAreaView>
  );
}

function DetailFact({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <View className="flex-row-reverse items-center gap-2 border border-line bg-panel px-3 py-2">
      {icon}
      <AppText className="text-sm text-ink">{label}</AppText>
    </View>
  );
}

function JourneyLine({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <View className="border border-line bg-panel px-3 py-3">
      <View className="flex-row-reverse items-center gap-2">
        {icon}
        <AppText className="text-sm font-cairo-bold text-ink">{title}</AppText>
      </View>
      <AppText className="mt-2 text-sm leading-6 text-muted">{body}</AppText>
    </View>
  );
}
