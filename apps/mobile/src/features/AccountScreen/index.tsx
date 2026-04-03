import { Pressable, ScrollView, View, Alert, useColorScheme } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ArrowLeft,
  Bookmark,
  FileText,
  Globe,
  HelpCircle,
  LogOut,
  MessageSquare,
  ShieldCheck,
  Trash2,
  User as UserIcon,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { MobileSectionHeading, MobileSurface, MobileTopBar } from "@/components/ui/MobileChrome";
import { clearGuestThreadSnapshot, clearGuestThreadStore } from "@/lib/mobilePersistence";
import { mobileTheme } from "@/lib/mobileTheme";

/**
 * WHY:   Account should be a simple support screen around the buyer journey, not a separate product mode.
 * WHAT:  Renders a straightforward profile/settings page with clear sections and lightweight status messaging.
 * HOW:   Uses stacked white panels and plain menu rows while preserving the current local-history messaging.
 */
export default function AccountScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ threadId?: string; orderId?: string }>();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";
  const screenBackground = isDark ? "#0B0C10" : mobileTheme.colors.canvas;
  const sectionBackground = isDark ? "#151821" : "#FFFFFF";
  const mutedSectionBackground = isDark ? "#111318" : "#F3F4F6";

  useEffect(() => {
    if (!params.threadId && !params.orderId) return;
    void clearGuestThreadSnapshot();
  }, [params.orderId, params.threadId]);

  return (
    <View className="flex-1" style={{ backgroundColor: screenBackground }}>
      <MobileTopBar
        insetTop={insets.top}
        backgroundColor={screenBackground}
        borderColor={isDark ? "rgba(255,255,255,0.08)" : mobileTheme.colors.borderStrong}
        title="حسابي"
        subtitle="إعدادات الرحلة الحالية"
        leading={<IconButton icon={ArrowLeft} onPress={() => router.back()} tone={isDark ? "inversePanel" : "panel"} />}
        trailing={<View style={{ width: 44, height: 44 }} />}
      />

      <ScrollView className="flex-1 px-5 pt-5" showsVerticalScrollIndicator={false}>
        <View className="rounded-[34px] px-5 py-6" style={{ borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.08)" : mobileTheme.colors.border, backgroundColor: mutedSectionBackground }}>
          <View className="items-center">
            <View
              className="mb-4 items-center justify-center rounded-full"
              style={{ width: 96, height: 96, backgroundColor: sectionBackground }}
            >
              <UserIcon size={40} color="#94A3B8" />
            </View>
            <MobileSectionHeading
              align="center"
              title="أحمد منصور"
              description="+966 50 123 4567"
            />
          </View>
        </View>

        <View className="mt-5 rounded-[28px] px-5 py-5" style={{ borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.08)" : mobileTheme.colors.border, backgroundColor: sectionBackground }}>
          <MobileSectionHeading
            eyebrow="THREAD STATUS"
            title={params.threadId || params.orderId ? "تم التنفيذ من داخل نفس الرحلة" : "الحساب مرتبط بالمحادثة الحالية"}
            description={
              params.threadId || params.orderId
                ? "يمكنك العودة الآن إلى نفس المحادثة ومتابعة الخطوات بدون فقدان السياق."
                : "السجل محفوظ محلياً على هذا الجهاز حالياً، ويمكنك دائماً الرجوع إلى شاشة المساعد لمتابعة نفس الخيط."
            }
          />
        </View>

        <View className="mt-5 overflow-hidden rounded-[28px]" style={{ borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.08)" : mobileTheme.colors.border, backgroundColor: sectionBackground }}>
          <AccountRow icon={Bookmark} label="العقارات المحفوظة" onPress={() => {}} />
          <AccountRow
            icon={MessageSquare}
            label="السجل المحفوظ"
            onPress={() =>
              Alert.alert(
                "السجل المحلي فقط",
                "سجل المحادثات الحالي متاح من شاشة المساعد داخل هذا الجهاز. سنضيف مزامنة الحساب لاحقاً.",
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
                      Alert.alert("تم الحذف", "تم حذف البيانات المحلية من هذا الجهاز.");
                    },
                  },
                ],
              )
            }
            destructive
          />
        </View>

        <View className="mb-12 mt-5 overflow-hidden rounded-[28px]" style={{ borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.08)" : mobileTheme.colors.border, backgroundColor: sectionBackground }}>
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
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row-reverse items-center gap-4 px-5 py-4 active:opacity-60 ${withBorder ? "border-b" : ""}`}
      style={withBorder ? { borderBottomColor: mobileTheme.colors.border } : undefined}
    >
      <View
        className="items-center justify-center rounded-full"
        style={{
          width: 44,
          height: 44,
          backgroundColor: destructive ? mobileTheme.colors.dangerSoft : mobileTheme.colors.surfaceMuted,
        }}
      >
        <Icon size={20} color={destructive ? mobileTheme.colors.danger : mobileTheme.colors.inkMuted} />
      </View>
      <AppText className={`flex-1 text-right text-[16px] font-cairo-black ${destructive ? "text-red-500" : "text-slate-900"}`}>
        {label}
      </AppText>
    </Pressable>
  );
}
