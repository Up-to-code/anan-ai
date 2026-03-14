import { View, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronRight, Settings, Bell, Shield, LogOut, FileText, HelpCircle, Heart, History, User, Calendar } from "lucide-react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <Animated.View entering={FadeIn.duration(300)} className="flex-1">
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)} className="flex-row items-center px-4 py-3" style={{ borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0" }}>
          <IconButton icon={ChevronRight} onPress={() => router.back()} />
          <AppText className="flex-1 text-center font-cairo-bold text-base text-slate-900">حسابي</AppText>
          <View className="w-10" />
        </Animated.View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* User Card */}
          <Animated.View entering={FadeInDown.duration(400).delay(150)} className="px-5 py-6 items-center" style={{ borderBottomWidth: 0.5, borderBottomColor: "#f1f5f9" }}>
            <View className="h-20 w-20 rounded-full bg-slate-100 items-center justify-center mb-3">
              <User size={32} color="#94a3b8" />
            </View>
            <AppText className="text-xl font-cairo-bold text-slate-900">أحمد منصور</AppText>
            <AppText className="text-sm text-slate-500 mt-1">+966 50 123 4567</AppText>
            
            <Pressable className="mt-4 px-4 py-2 bg-brand/10 rounded-max">
              <AppText className="text-sm font-cairo-bold text-brand">تعديل الملف الشخصي</AppText>
            </Pressable>
          </Animated.View>

          {/* Activity */}
          <Animated.View entering={FadeInDown.duration(400).delay(200)} className="px-5 py-2">
            <SectionHeader label="نشاطي" />
            <MenuItem icon={Heart} label="العقارات المفضلة" onPress={() => router.push("/saved" as any)} />
            <MenuItem icon={Calendar} label="مواعيد المعاينة" onPress={() => router.push("/appointments" as any)} />
            <MenuItem icon={History} label="محادثات المساعد الذكي" onPress={() => router.push("/" as any)} />
          </Animated.View>

          {/* Settings */}
          <Animated.View entering={FadeInDown.duration(400).delay(250)} className="px-5 py-2">
            <SectionHeader label="الإعدادات" />
            <MenuItem icon={Bell} label="الإشعارات" onPress={() => {}} />
            <MenuItem icon={Shield} label="الخصوصية والأمان" onPress={() => {}} />
            <MenuItem icon={Settings} label="تفضيلات التطبيق" onPress={() => {}} />
          </Animated.View>

          {/* Support */}
          <Animated.View entering={FadeInDown.duration(400).delay(300)} className="px-5 py-2">
            <SectionHeader label="الدعم والمساعدة" />
            <MenuItem icon={HelpCircle} label="مركز المساعدة" onPress={() => {}} />
            <MenuItem icon={FileText} label="الشروط والموافقة" onPress={() => {}} />
          </Animated.View>

          {/* Logout */}
          <Animated.View entering={FadeInDown.duration(400).delay(350)} className="px-5 py-6">
            <Pressable 
              className="flex-row items-center justify-center py-4 bg-red-50"
              onPress={() => router.replace("/auth/welcome" as any)}
              style={{ borderWidth: 0.5, borderColor: "#fee2e2" }}
            >
              <LogOut size={18} color="#ef4444" />
              <AppText className="font-cairo-bold text-red-500 ml-2">تسجيل الخروج</AppText>
            </Pressable>
            <AppText className="text-center text-[10px] text-slate-400 mt-4">إصدار التطبيق 1.0.0</AppText>
          </Animated.View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

function SectionHeader({ label }: { label: string }) {
  return <AppText className="text-xs font-cairo-bold text-slate-500 mt-4 mb-2">{label}</AppText>;
}

function MenuItem({ icon: Icon, label, onPress, destructive }: { icon: any; label: string; onPress: () => void; destructive?: boolean }) {
  return (
    <Pressable 
      onPress={onPress}
      className="flex-row items-center py-4"
      style={{ borderBottomWidth: 0.5, borderBottomColor: "#f8fafc" }}
    >
      <View className="h-8 w-8 items-center justify-center bg-slate-50 mr-3">
        <Icon size={18} color={destructive ? "#ef4444" : "#64748b"} />
      </View>
      <AppText className={`flex-1 text-sm font-cairo-bold ${destructive ? "text-red-500" : "text-slate-900"}`}>{label}</AppText>
      <ChevronRight size={16} color="#cbd5e1" style={{ transform: [{ scaleX: -1 }] }} />
    </Pressable>
  );
}
