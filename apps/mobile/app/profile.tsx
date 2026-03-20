import { View, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ChevronRight,
  Settings,
  Bell,
  Shield,
  LogOut,
  FileText,
  HelpCircle,
  Heart,
  History,
  User,
  Calendar,
} from "lucide-react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";

type ProfileMenuItem = {
  icon: any;
  label: string;
  onPress: () => void;
};

function ProfileHeader({ onBack }: { onBack: () => void }) {
  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(100)}
      className="flex-row items-center px-4 py-3"
      style={{ borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0" }}
    >
      <IconButton icon={ChevronRight} onPress={onBack} />
      <AppText className="flex-1 text-center text-base font-cairo-bold text-slate-900">حسابي</AppText>
      <View className="w-10" />
    </Animated.View>
  );
}

function ProfileIdentityCard() {
  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(150)}
      className="items-center px-5 py-6"
      style={{ borderBottomWidth: 0.5, borderBottomColor: "#f1f5f9" }}
    >
      <View className="mb-3 h-20 w-20 items-center justify-center rounded-full bg-slate-100">
        <User size={32} color="#94a3b8" />
      </View>
      <AppText className="text-xl font-cairo-bold text-slate-900">أحمد منصور</AppText>
      <AppText className="mt-1 text-sm text-slate-500">+966 50 123 4567</AppText>
      <Pressable className="mt-4 rounded-max bg-brand/10 px-4 py-2">
        <AppText className="text-sm font-cairo-bold text-brand">تعديل الملف الشخصي</AppText>
      </Pressable>
    </Animated.View>
  );
}

function SectionHeader({ label }: { label: string }) {
  return <AppText className="mb-2 mt-4 text-xs font-cairo-bold text-slate-500">{label}</AppText>;
}

function MenuItem({
  icon: Icon,
  label,
  onPress,
  destructive,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center py-4"
      style={{ borderBottomWidth: 0.5, borderBottomColor: "#f8fafc" }}
    >
      <View className="mr-3 h-8 w-8 items-center justify-center bg-slate-50">
        <Icon size={18} color={destructive ? "#ef4444" : "#64748b"} />
      </View>
      <AppText className={`flex-1 text-sm font-cairo-bold ${destructive ? "text-red-500" : "text-slate-900"}`}>
        {label}
      </AppText>
      <ChevronRight size={16} color="#cbd5e1" style={{ transform: [{ scaleX: -1 }] }} />
    </Pressable>
  );
}

function ProfileMenuSection({
  label,
  delay,
  items,
}: {
  label: string;
  delay: number;
  items: ProfileMenuItem[];
}) {
  return (
    <Animated.View entering={FadeInDown.duration(400).delay(delay)} className="px-5 py-2">
      <SectionHeader label={label} />
      {items.map((item) => (
        <MenuItem key={item.label} icon={item.icon} label={item.label} onPress={item.onPress} />
      ))}
    </Animated.View>
  );
}

function LogoutSection({ onLogout }: { onLogout: () => void }) {
  return (
    <Animated.View entering={FadeInDown.duration(400).delay(350)} className="px-5 py-6">
      <Pressable
        className="flex-row items-center justify-center bg-red-50 py-4"
        onPress={onLogout}
        style={{ borderWidth: 0.5, borderColor: "#fee2e2" }}
      >
        <LogOut size={18} color="#ef4444" />
        <AppText className="ml-2 font-cairo-bold text-red-500">تسجيل الخروج</AppText>
      </Pressable>
      <AppText className="mt-4 text-center text-[10px] text-slate-400">إصدار التطبيق 1.0.0</AppText>
    </Animated.View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const activityItems: ProfileMenuItem[] = [
    { icon: Heart, label: "العقارات المفضلة", onPress: () => router.push("/saved" as any) },
    { icon: Calendar, label: "مواعيد المعاينة", onPress: () => router.push("/appointments" as any) },
    { icon: History, label: "محادثات المساعد الذكي", onPress: () => router.push("/" as any) },
  ];
  const settingsItems: ProfileMenuItem[] = [
    { icon: Bell, label: "الإشعارات", onPress: () => {} },
    { icon: Shield, label: "الخصوصية والأمان", onPress: () => {} },
    { icon: Settings, label: "تفضيلات التطبيق", onPress: () => {} },
  ];
  const supportItems: ProfileMenuItem[] = [
    { icon: HelpCircle, label: "مركز المساعدة", onPress: () => {} },
    { icon: FileText, label: "الشروط والموافقة", onPress: () => {} },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <Animated.View entering={FadeIn.duration(300)} className="flex-1">
        <ProfileHeader onBack={() => router.back()} />
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <ProfileIdentityCard />
          <ProfileMenuSection label="نشاطي" delay={200} items={activityItems} />
          <ProfileMenuSection label="الإعدادات" delay={250} items={settingsItems} />
          <ProfileMenuSection label="الدعم والمساعدة" delay={300} items={supportItems} />
          <LogoutSection onLogout={() => router.replace("/auth/welcome" as any)} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}
