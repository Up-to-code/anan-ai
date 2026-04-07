import { Pressable, ScrollView, View, Alert, Appearance } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  FileText,
  Globe,
  HelpCircle,
  LogOut,
  MessageSquare,
  Moon,
  Monitor,
  ShieldCheck,
  Sun,
  Trash2,
  User as UserIcon,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { MobileSectionHeading, MobileTopBar } from "@/components/ui/MobileChrome";
import { clearGuestThreadSnapshot, clearGuestThreadStore } from "@/lib/mobilePersistence";
import { useAppTheme } from "@/lib/mobileTheme";
import { getThemePreference, setThemePreference, type ThemeOverrideMode } from "@/lib/themeStore";

export default function AccountScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ threadId?: string; orderId?: string }>();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();

  const [themeMode, setThemeMode] = useState<ThemeOverrideMode>("system");

  useEffect(() => {
    if (!params.threadId && !params.orderId) return;
    void clearGuestThreadSnapshot();
  }, [params.orderId, params.threadId]);

  useEffect(() => {
    getThemePreference().then(setThemeMode);
  }, []);

  const handleThemeChange = async (mode: ThemeOverrideMode) => {
    setThemeMode(mode);
    await setThemePreference(mode);
    Appearance.setColorScheme(mode === "system" ? null : mode);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.canvas }}>
      <MobileTopBar
        insetTop={insets.top}
        backgroundColor={theme.colors.canvas}
        borderColor={theme.colors.border}
        title="حسابي"
        subtitle="الإعدادات والسجل"
        leading={<IconButton icon={ArrowLeft} onPress={() => router.back()} tone="panel" />}
        trailing={<View style={{ width: 44, height: 44 }} />}
      />

      <ScrollView 
        className="flex-1 px-5 pt-8" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 40) + 40 }}
      >
        {/* Profile Card */}
        <View
          className="px-5 py-6"
          style={{
            borderRadius: theme.radii.card, 
            borderWidth: 1, 
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surfaceMuted,
          }}
        >
          <View className="items-center">
            <View
              className="mb-4 items-center justify-center"
              style={{
                width: 80,
                height: 80,
                borderRadius: theme.radii.card,
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.primary,
              }}
            >
              <UserIcon size={32} color={theme.colors.primary} />
            </View>
            <MobileSectionHeading
              align="center"
              title="أحمد منصور"
              description="+966 50 123 4567"
            />
          </View>
        </View>

        {/* Theme Preferences */}
        <View className="mt-6 gap-3">
          <AppText className="text-[14px] font-cairo-bold text-right mx-1" style={{ color: theme.colors.inkMuted }}>
            مظهر التطبيق
          </AppText>
          <View
            className="flex-row-reverse p-1"
            style={{
              borderRadius: theme.radii.card,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surfaceMuted,
            }}
          >
            <ThemeToggleButton
              active={themeMode === "system"}
              icon={Monitor}
              label="تلقائي"
              onPress={() => handleThemeChange("system")}
            />
            <ThemeToggleButton
              active={themeMode === "dark"}
              icon={Moon}
              label="داكن"
              onPress={() => handleThemeChange("dark")}
            />
            <ThemeToggleButton
              active={themeMode === "light"}
              icon={Sun}
              label="فاتح"
              onPress={() => handleThemeChange("light")}
            />
          </View>
        </View>

        {/* Thread Status */}
        <View
          className="mt-6 px-5 py-5"
          style={{
            borderRadius: theme.radii.card,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
          }}
        >
          <MobileSectionHeading
            eyebrow="حالة المحادثة"
            title={params.threadId || params.orderId ? "تم التنفيذ من داخل الرحلة" : "الحساب مرتبط بجهازك"}
            description={
              params.threadId || params.orderId
                ? "يمكنك العودة الآن إلى نفس المحادثة ومتابعة الخطوات بدون فقدان السياق."
                : "السجل محفوظ محلياً على هذا الجهاز حالياً، ويمكنك دائماً الرجوع إلى شاشة المساعد."
            }
          />
        </View>

        {/* Menu Items */}
        <View
          className="mt-6 overflow-hidden"
          style={{
            borderRadius: theme.radii.card,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
          }}
        >
          <AccountRow icon={Bookmark} label="العقارات المحفوظة" onPress={() => {}} withBorder />
          <AccountRow
            icon={MessageSquare}
            label="السجل المحفوظ"
            onPress={() =>
              Alert.alert(
                "السجل المحلي فقط",
                "سجل المحادثات الحالي متاح من شاشة المساعد داخل هذا الجهاز.",
              )
            }
            withBorder
          />
          <AccountRow icon={Globe} label="لغة التطبيق - العربية" onPress={() => {}} withBorder />
          <AccountRow
            icon={ShieldCheck}
            label="الخصوصية والبيانات"
            onPress={() => router.push("/legal")}
            withBorder
          />
          <AccountRow icon={FileText} label="الشروط والاستخدام" onPress={() => router.push("/legal")} withBorder />
          <AccountRow
            icon={HelpCircle}
            label="الدعم ومراجعة المتجر"
            onPress={() => router.push("/legal")}
            withBorder
          />
          <AccountRow
            icon={Trash2}
            label="حذف البيانات المحلية"
            onPress={() =>
              Alert.alert(
                "حذف البيانات المحلية",
                "سيتم حذف السجل المحلي المحفوظ على هذا الجهاز فقط.",
                [
                  { text: "إلغاء", style: "cancel" },
                  {
                    text: "حذف",
                    style: "destructive",
                    onPress: async () => {
                      await clearGuestThreadStore();
                      Alert.alert("تم الحذف", "تم حذف البيانات المحلية.");
                    },
                  },
                ],
              )
            }
            destructive
          />
        </View>

        {/* Logout */}
        <View
          className="mt-6 overflow-hidden"
          style={{
            borderRadius: theme.radii.card,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
          }}
        >
          <AccountRow
            icon={LogOut}
            label="تسجيل الخروج"
            onPress={() => router.replace("/welcome")}
            destructive
          />
        </View>
      </ScrollView>
    </View>
  );
}

function ThemeToggleButton({
  active,
  icon: Icon,
  label,
  onPress,
}: {
  active: boolean;
  icon: typeof Monitor;
  label: string;
  onPress: () => void;
}) {
  const theme = useAppTheme();
  
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 flex-row-reverse items-center justify-center gap-2 py-3"
      style={{
        borderRadius: theme.radii.card - 4, // Inner pill 
        backgroundColor: active ? theme.colors.surface : "transparent",
        ...(active
          ? {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }
          : {}),
      }}
    >
      <Icon size={16} color={active ? theme.colors.primary : theme.colors.inkMuted} />
      <AppText
        className={`text-[14px] ${active ? "font-cairo-bold" : "font-cairo-medium"}`}
        style={{ color: active ? theme.colors.primary : theme.colors.inkMuted }}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

function AccountRow({
  icon: Icon,
  label,
  onPress,
  destructive,
  withBorder,
}: {
  icon: typeof Bookmark;
  label: string;
  onPress: () => void;
  destructive?: boolean;
  withBorder?: boolean;
}) {
  const theme = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      className="flex-row-reverse items-center gap-4 px-5 py-4 active:opacity-60"
      style={withBorder ? { borderBottomWidth: 1, borderBottomColor: theme.colors.border } : undefined}
    >
      <View
        className="items-center justify-center"
        style={{
          width: 40,
          height: 40,
          borderRadius: theme.radii.card,
          backgroundColor: destructive ? theme.colors.dangerSoft : theme.colors.surfaceMuted,
        }}
      >
        <Icon size={20} color={destructive ? theme.colors.danger : theme.colors.inkMuted} />
      </View>
      <AppText
        className="flex-1 text-right text-[15px] font-cairo-bold"
        style={{ color: destructive ? theme.colors.danger : theme.colors.ink }}
      >
        {label}
      </AppText>
    </Pressable>
  );
}
