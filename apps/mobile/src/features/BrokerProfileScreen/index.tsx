import { ScrollView, View, Pressable, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronRight, Phone, MessageCircle, ShieldCheck, Star, Clock, BarChart3 } from "lucide-react-native";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { PropertyChatCard } from "@/components/features/PropertyChatCard";
import { usePropertyFeed } from "@/hooks/usePropertyFeed";
import { Image } from "expo-image";

type BrokerProfileScreenProps = {
  brokerId: string;
};

// Mock broker data keyed by ID
const mockBrokers: Record<string, { name: string; type: string; license: string; responseRate: string; avgResponse: string; rating: number; listings: number; photo: string }> = {
  "broker-1": { name: "وسيط النخبة", type: "وسيط عقاري", license: "فال: 1200028472", responseRate: "98%", avgResponse: "5 دقائق", rating: 4.8, listings: 12, photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop" },
  "broker-2": { name: "بيت العاصمة", type: "وسيط عقاري", license: "فال: 1200034891", responseRate: "85%", avgResponse: "15 دقيقة", rating: 4.2, listings: 8, photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop" },
  "red-1": { name: "مطور عنان", type: "مطور عقاري", license: "فال: 1100019283", responseRate: "100%", avgResponse: "3 دقائق", rating: 4.9, listings: 24, photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop" },
  "red-2": { name: "واجهة الرياض للتطوير", type: "مطور عقاري", license: "فال: 1100027364", responseRate: "92%", avgResponse: "8 دقائق", rating: 4.5, listings: 16, photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop" },
};

export function BrokerProfileScreen({ brokerId }: BrokerProfileScreenProps) {
  const router = useRouter();
  const { properties } = usePropertyFeed();
  const broker = mockBrokers[brokerId] ?? mockBrokers["broker-1"]!;
  const brokerProperties = properties.filter(p => p.owner.id === brokerId);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header bar */}
        <View className="flex-row items-center px-4 py-3" style={{ borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0" }}>
          <IconButton icon={ChevronRight} onPress={() => router.back()} />
          <AppText className="flex-1 text-center text-base font-cairo-bold text-slate-900">ملف الوسيط</AppText>
          <View className="w-10" />
        </View>

        {/* Profile Header */}
        <View className="px-5 py-5">
          <View className="flex-row items-center gap-4">
            <View className="h-20 w-20 bg-slate-100 overflow-hidden">
              <Image source={broker.photo} className="h-full w-full" contentFit="cover" />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-1.5">
                <AppText className="text-xl font-cairo-bold text-slate-900">{broker.name}</AppText>
                <ShieldCheck size={16} color="#2563EB" />
              </View>
              <AppText className="text-sm text-slate-500 mt-0.5">{broker.type}</AppText>
              <AppText className="text-xs text-slate-400 mt-0.5">ترخيص {broker.license}</AppText>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View className="flex-row px-5 gap-0 mb-5">
          <StatBox icon={Star} label="التقييم" value={String(broker.rating)} color="#f59e0b" />
          <StatBox icon={BarChart3} label="الإعلانات" value={String(broker.listings)} color="#2563EB" />
          <StatBox icon={Clock} label="متوسط الرد" value={broker.avgResponse} color="#10b981" />
          <StatBox icon={MessageCircle} label="الاستجابة" value={broker.responseRate} color="#8b5cf6" />
        </View>

        {/* Action Buttons */}
        <View className="flex-row px-5 gap-3 mb-5">
          <View className="flex-1">
            <Button label="تحويل العميل للوسيط" onPress={() => {}} />
          </View>
          <Pressable
            onPress={() => Linking.openURL("tel:+966500000000")}
            className="h-12 w-12 bg-emerald-500 items-center justify-center"
          >
            <Phone size={18} color="#fff" />
          </Pressable>
        </View>

        {/* Properties List */}
        <View className="px-5 pb-8">
          <AppText className="text-sm font-cairo-bold text-slate-500 mb-3">المحفظة النشطة ({brokerProperties.length} وحدة)</AppText>
          <View className="gap-4">
            {brokerProperties.map((property) => (
              <PropertyChatCard key={property.id} property={property} />
            ))}
            {brokerProperties.length === 0 ? (
              <View className="py-8 items-center">
                <AppText className="text-sm text-slate-400">لا توجد وحدات نشطة حالياً</AppText>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <View className="flex-1 items-center py-3" style={{ borderWidth: 0.5, borderColor: "#f1f5f9" }}>
      <Icon size={16} color={color} />
      <AppText className="text-sm font-cairo-bold text-slate-900 mt-1">{value}</AppText>
      <AppText className="text-[10px] text-slate-400">{label}</AppText>
    </View>
  );
}
