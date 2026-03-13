import { ScrollView, View, Pressable, Linking, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronRight, Heart, Share2, MessageCircle, Phone, MapPin, BedDouble, Bath, Ruler, ShieldCheck, Sparkles } from "lucide-react-native";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { PropertyMediaPager } from "@/components/features/PropertyMediaPager";
import { usePropertyFeed } from "@/hooks/usePropertyFeed";
import { Image } from "expo-image";

const SCREEN_WIDTH = Dimensions.get("window").width;

/**
 * Full property detail screen — immersive media, specs, broker info, and CTAs.
 */
export default function PropertyDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { properties } = usePropertyFeed();
  const property = properties.find(p => p.id === id);

  if (!property) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <AppText className="text-slate-400">جاري التحميل...</AppText>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Media Gallery */}
        <View style={{ height: SCREEN_WIDTH * 0.75 }}>
          <PropertyMediaPager media={property.media} width={SCREEN_WIDTH} />

          {/* Floating back button */}
          <View className="absolute top-3 right-4 z-10">
            <Pressable
              onPress={() => router.back()}
              className="h-10 w-10 bg-white/90 items-center justify-center"
            >
              <ChevronRight size={20} color="#0f172a" />
            </Pressable>
          </View>

          {/* Floating action bar */}
          <View className="absolute top-3 left-4 z-10 flex-row gap-2">
            <Pressable className="h-10 w-10 bg-white/90 items-center justify-center">
              <Heart size={18} color="#0f172a" strokeWidth={1.5} />
            </Pressable>
            <Pressable className="h-10 w-10 bg-white/90 items-center justify-center">
              <Share2 size={18} color="#0f172a" strokeWidth={1.5} />
            </Pressable>
          </View>
        </View>

        {/* Property Info */}
        <View className="px-5 pt-5 pb-4">
          <AppText className="text-2xl font-cairo-bold text-slate-900">{property.title}</AppText>

          <View className="flex-row items-center gap-1 mt-2">
            <MapPin size={14} color="#94a3b8" />
            <AppText className="text-sm text-slate-500">{property.area ?? property.location} · {property.address}</AppText>
          </View>

          <AppText className="text-2xl font-cairo-bold text-brand mt-3">
            {new Intl.NumberFormat("en-SA", { style: "currency", currency: "SAR", maximumFractionDigits: 0 }).format(property.price)}
          </AppText>
        </View>

        {/* Specs Strip */}
        <View className="flex-row px-5 gap-0 mb-4">
          <SpecBox icon={BedDouble} label="غرف النوم" value={String(property.beds)} />
          <SpecBox icon={Bath} label="الحمامات" value={String(property.baths)} />
          <SpecBox icon={Ruler} label="المساحة" value={property.sqft ? `${property.sqft} م²` : "—"} />
        </View>

        {/* AI Summary */}
        {property.aiSummary ? (
          <View className="mx-5 mb-4 px-4 py-3 bg-brand/5" style={{ borderLeftWidth: 2, borderLeftColor: "#2563EB" }}>
            <View className="flex-row items-center gap-1.5 mb-1.5">
              <Sparkles size={12} color="#2563EB" />
              <AppText className="text-xs font-cairo-bold text-brand">تحليل ذكي</AppText>
            </View>
            <AppText className="text-sm text-slate-700 leading-5">{property.aiSummary}</AppText>
          </View>
        ) : null}

        {/* Finance Quick Access */}
        <Pressable
          onPress={() => router.push(`/property/finance/${property.id}` as any)}
          className="mx-5 mb-4 flex-row items-center gap-3 p-3 bg-brand/5"
          style={{ borderWidth: 0.5, borderColor: "#dbeafe" }}
        >
          <View className="h-10 w-10 bg-brand/10 items-center justify-center">
            <AppText className="text-lg">💳</AppText>
          </View>
          <View className="flex-1">
            <AppText className="text-sm font-cairo-bold text-slate-900">التفاصيل المالية</AppText>
            <AppText className="text-xs text-slate-400 mt-0.5">خطط السداد · التمويل · البنوك المعتمدة</AppText>
          </View>
          <ChevronRight size={14} color="#2563EB" style={{ transform: [{ scaleX: -1 }] }} />
        </Pressable>

        {/* Broker Section */}
        <Pressable
          onPress={() => router.push(`/broker/${property.owner.id}` as any)}
          className="mx-5 mb-4 flex-row items-center gap-3 p-3"
          style={{ borderWidth: 0.5, borderColor: "#e2e8f0" }}
        >
          <View className="h-12 w-12 bg-slate-100 items-center justify-center">
            <AppText className="font-cairo-bold text-slate-600 text-lg">{property.owner.name.charAt(0)}</AppText>
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-1.5">
              <AppText className="font-cairo-bold text-slate-900">{property.owner.name}</AppText>
              {property.owner.isVerified ? <ShieldCheck size={14} color="#2563EB" /> : null}
            </View>
            <AppText className="text-xs text-slate-400 mt-0.5">
              {property.owner.type === "broker" ? "وسيط عقاري" : "مطور عقاري"} · اضغط لعرض الملف
            </AppText>
          </View>
          <ChevronRight size={16} color="#94a3b8" style={{ transform: [{ scaleX: -1 }] }} />
        </Pressable>

        {/* Quick Prompts */}
        <View className="px-5 mb-4">
          <AppText className="text-xs font-cairo-bold text-slate-500 mb-2">اقتراحات مساعد عنان</AppText>
          <View className="flex-row flex-wrap gap-2">
            {property.recommendedPrompts.map((prompt) => (
              <Pressable
                key={prompt}
                onPress={() => router.push(`/chat/${property.id}` as any)}
                className="px-3 py-2 bg-slate-50"
                style={{ borderWidth: 0.5, borderColor: "#e2e8f0" }}
              >
                <AppText className="text-xs text-slate-600">{prompt}</AppText>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Spacer for bottom CTA */}
        <View className="h-24" />
      </ScrollView>

      {/* Fixed Bottom CTA Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white px-5 pb-8 pt-3" style={{ borderTopWidth: 0.5, borderTopColor: "#e2e8f0" }}>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Button label="محادثة مع المساعد" onPress={() => router.push(`/chat/${property.id}` as any)} />
          </View>
          <Pressable
            onPress={() => Linking.openURL(`tel:+966500000000`)}
            className="h-12 w-12 bg-emerald-500 items-center justify-center"
          >
            <Phone size={18} color="#fff" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function SpecBox({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View className="flex-1 items-center py-3" style={{ borderWidth: 0.5, borderColor: "#f1f5f9" }}>
      <Icon size={18} color="#94a3b8" />
      <AppText className="text-base font-cairo-bold text-slate-900 mt-1">{value}</AppText>
      <AppText className="text-[10px] text-slate-400">{label}</AppText>
    </View>
  );
}
