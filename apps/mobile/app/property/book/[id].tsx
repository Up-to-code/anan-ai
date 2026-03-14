import { useState } from "react";
import { View, ScrollView, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronRight, Calendar, Clock, Video, MapPin, CheckCircle2 } from "lucide-react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { usePropertyFeed } from "@/hooks/usePropertyFeed";

const DATES = [
  { day: "اليوم", date: "15" },
  { day: "غداً", date: "16" },
  { day: "الأحد", date: "17" },
  { day: "الإثنين", date: "18" },
  { day: "الثلاثاء", date: "19" },
];

const TIMES = ["4:00 PM", "5:00 PM", "6:00 PM", "7:30 PM", "8:00 PM"];

export default function BookAppointmentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { properties } = usePropertyFeed();
  const property = properties.find(p => p.id === id);

  const [date, setDate] = useState("15");
  const [time, setTime] = useState("5:00 PM");
  const [type, setType] = useState<"in_person" | "virtual">("in_person");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!property) return null;

  if (isSuccess) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-8">
        <Animated.View entering={FadeInDown.duration(500)} className="h-20 w-20 bg-emerald-50 rounded-full items-center justify-center mb-6">
          <CheckCircle2 size={40} color="#10b981" />
        </Animated.View>
        <Animated.Text entering={FadeInDown.duration(500).delay(100)} className="text-2xl font-cairo-bold text-slate-900 text-center">تم تأكيد الحجز!</Animated.Text>
        <Animated.Text entering={FadeInDown.duration(500).delay(200)} className="text-slate-500 text-center mt-3 leading-6">
          تم تحديث موعد الزيارة {type === "in_person" ? "الحضورية" : "الافتراضية"} لعقار "{property.title}". سنتواصل معك قريباً للتأكيد النهائي.
        </Animated.Text>
        <Animated.View entering={FadeInDown.duration(500).delay(300)} className="w-full mt-10">
          <Button label="العودة للعقار" onPress={() => router.back()} />
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <Animated.View entering={FadeIn.duration(300)} className="flex-1">
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400).delay(50)} className="flex-row items-center px-4 py-3" style={{ borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0" }}>
          <IconButton icon={ChevronRight} onPress={() => router.back()} />
          <AppText className="flex-1 text-center font-cairo-bold text-base text-slate-900">حجز موعد معاينة</AppText>
          <View className="w-10" />
        </Animated.View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Property Snippet */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)} className="px-5 py-4 bg-slate-50" style={{ borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0" }}>
          <AppText className="font-cairo-bold text-slate-900">{property.title}</AppText>
          <AppText className="text-sm text-slate-500 mt-1">{property.area} · {property.owner.name}</AppText>
        </Animated.View>

        {/* Type Selection */}
        <Animated.View entering={FadeInDown.duration(400).delay(150)} className="px-5 py-6" style={{ borderBottomWidth: 0.5, borderBottomColor: "#f1f5f9" }}>
          <AppText className="text-sm font-cairo-bold text-slate-900 mb-4">نوع المعاينة</AppText>
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => setType("in_person")}
              className={`flex-1 p-4 rounded-xl items-center border ${type === "in_person" ? "border-brand bg-brand/5" : "border-slate-200"}`}
            >
              <MapPin size={24} color={type === "in_person" ? "#2563EB" : "#64748b"} />
              <AppText className={`mt-2 font-cairo-bold ${type === "in_person" ? "text-brand" : "text-slate-500"}`}>حضور شخصي</AppText>
            </Pressable>
            <Pressable
              onPress={() => setType("virtual")}
              className={`flex-1 p-4 rounded-xl items-center border ${type === "virtual" ? "border-brand bg-brand/5" : "border-slate-200"}`}
            >
              <Video size={24} color={type === "virtual" ? "#2563EB" : "#64748b"} />
              <AppText className={`mt-2 font-cairo-bold ${type === "virtual" ? "text-brand" : "text-slate-500"}`}>جولة افتراضية</AppText>
            </Pressable>
          </View>
        </Animated.View>

        {/* Date Selection */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)} className="py-6" style={{ borderBottomWidth: 0.5, borderBottomColor: "#f1f5f9" }}>
          <AppText className="px-5 text-sm font-cairo-bold text-slate-900 mb-4">التاريخ</AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
            {DATES.map((d) => (
              <Pressable
                key={d.date}
                onPress={() => setDate(d.date)}
                className={`w-16 h-20 items-center justify-center rounded-xl border ${date === d.date ? "border-brand bg-brand" : "border-slate-200 bg-white"}`}
              >
                <AppText className={`text-xs mb-1 ${date === d.date ? "text-white/80" : "text-slate-500"}`}>{d.day}</AppText>
                <AppText className={`text-xl font-cairo-bold ${date === d.date ? "text-white" : "text-slate-900"}`}>{d.date}</AppText>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Time Selection */}
        <Animated.View entering={FadeInDown.duration(400).delay(250)} className="px-5 py-6">
          <AppText className="text-sm font-cairo-bold text-slate-900 mb-4">الوقت (مساءً)</AppText>
          <View className="flex-row flex-wrap gap-3">
            {TIMES.map((t) => (
              <Pressable
                key={t}
                onPress={() => setTime(t)}
                className={`py-3 px-6 rounded-lg border ${time === t ? "border-brand bg-brand/10" : "border-slate-200"}`}
              >
                <AppText className={`font-cairo-bold ${time === t ? "text-brand" : "text-slate-600"}`}>{t}</AppText>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <View className="h-24" />
      </ScrollView>

      {/* Bottom CTA */}
      <Animated.View entering={FadeInDown.duration(400).delay(300)} className="absolute bottom-0 left-0 right-0 bg-white px-5 pb-8 pt-3" style={{ borderTopWidth: 0.5, borderTopColor: "#e2e8f0" }}>
        <Button label={`تأكيد الحجز — ${time}`} onPress={() => setIsSuccess(true)} />
      </Animated.View>
    </Animated.View>
  </SafeAreaView>
);
}
