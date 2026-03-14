import { View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronRight, Calendar, Clock, MapPin, Video } from "lucide-react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { usePropertyFeed } from "@/hooks/usePropertyFeed";
import { MobilePropertyFeedItem } from "@/types/mobile";

export default function AppointmentsScreen() {
  const router = useRouter();
  const { properties } = usePropertyFeed();

  // Mock upcoming appointments using the first two properties
  const upcomingAppointments = [
    { id: "apt-1", property: properties[0], date: "15", day: "اليوم", time: "5:00 PM", type: "in_person" as const },
    { id: "apt-2", property: properties[1], date: "18", day: "الإثنين", time: "4:00 PM", type: "virtual" as const },
  ].filter(a => a.property !== undefined) as { id: string; property: MobilePropertyFeedItem; date: string; day: string; time: string; type: "in_person" | "virtual" }[];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <Animated.View entering={FadeIn.duration(300)} className="flex-1">
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)} className="flex-row items-center px-4 py-3" style={{ borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0" }}>
          <IconButton icon={ChevronRight} onPress={() => router.back()} />
          <AppText className="flex-1 text-center font-cairo-bold text-base text-slate-900">مواعيد المعاينة</AppText>
          <View className="w-10" />
        </Animated.View>

        <Animated.FlatList
          data={upcomingAppointments}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, gap: 16 }}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.duration(400).delay(150 + index * 100)}>
              <Pressable
                onPress={() => router.push(`/property/${item.property.id}` as any)}
                className="bg-white rounded-xl overflow-hidden"
                style={{ borderWidth: 0.5, borderColor: "#e2e8f0" }}
              >
                {/* Appointment Header */}
                <View className="flex-row items-center px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <View className="h-12 w-12 bg-white rounded-lg border border-slate-200 items-center justify-center">
                    <AppText className="text-xs text-slate-500 mb-0.5">{item.day}</AppText>
                    <AppText className="text-lg font-cairo-bold text-slate-900 leading-5">{item.date}</AppText>
                  </View>
                  <View className="flex-1 ml-3">
                    <View className="flex-row items-center gap-1.5 mb-1">
                      <Clock size={14} color="#64748b" />
                      <AppText className="text-sm font-cairo-bold text-slate-700">{item.time}</AppText>
                    </View>
                    <View className="flex-row items-center gap-1.5">
                      {item.type === "in_person" ? <MapPin size={14} color="#10b981" /> : <Video size={14} color="#2563EB" />}
                      <AppText className={`text-xs ${item.type === "in_person" ? "text-emerald-600" : "text-brand"}`}>
                        {item.type === "in_person" ? "معاينة حضورية" : "جولة افتراضية"}
                      </AppText>
                    </View>
                  </View>
                </View>

                {/* Property Details */}
                <View className="p-4">
                  <AppText className="font-cairo-bold text-slate-900 mb-1">{item.property.title}</AppText>
                  <AppText className="text-sm text-slate-500">{item.property.location} · مع {item.property.owner.name}</AppText>
                  
                  <View className="flex-row justify-end mt-3 gap-3">
                    <AppText className="text-xs font-cairo-bold text-slate-400">إلغاء الموعد</AppText>
                    <AppText className="text-xs font-cairo-bold text-brand">إعادة جدولة</AppText>
                  </View>
                </View>
              </Pressable>
            </Animated.View>
          )}
          ListEmptyComponent={
            <Animated.View entering={FadeInDown.duration(400).delay(200)} className="py-20 items-center justify-center">
              <View className="h-16 w-16 bg-slate-50 items-center justify-center mb-4 rounded-full">
                <Calendar size={24} color="#cbd5e1" />
              </View>
              <AppText className="text-base font-cairo-bold text-slate-900 text-center">لا توجد مواعيد قادمة</AppText>
              <AppText className="text-sm text-slate-500 text-center mt-2 px-8">
                قم بحجز موعد معاينة لعقاراتك المفضلة وسوف تظهر هنا لتسهيل متابعتها.
              </AppText>
            </Animated.View>
          }
        />
      </Animated.View>
    </SafeAreaView>
  );
}
