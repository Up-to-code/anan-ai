import { Alert, Appearance, Pressable, ScrollView, View } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  BarChart3,
  Bookmark,
  FileText,
  Globe,
  History,
  LogOut,
  Moon,
  Monitor,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  User as UserIcon,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobilePropertyCard } from "@/components/property/MobilePropertyCard";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { MobilePill, MobileSectionHeading, MobileSurface, MobileTopBar } from "@/components/ui/MobileChrome";
import { useBuyerAccount } from "@/hooks/useBuyerAccount";
import { usePropertyFeed } from "@/hooks/usePropertyFeed";
import { useAppTheme } from "@/lib/mobileTheme";
import { getThemePreference, setThemePreference, type ThemeOverrideMode } from "@/lib/themeStore";

/**
 * WHY:   Buyers need one trustworthy control center for profile identity, saved properties, conversation continuity, and device-level controls.
 * WHAT:  Renders the buyer account surface backed by the merged mobile account contract.
 * HOW:   Combines live viewer identity with local saved items, thread history, finance defaults, and privacy/reset actions inside one calm mobile layout.
 */
export default function AccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const account = useBuyerAccount();
  const feed = usePropertyFeed();
  const [themeMode, setThemeMode] = useState<ThemeOverrideMode>("system");

  useEffect(() => {
    getThemePreference().then(setThemeMode);
  }, []);

  const savedProperties = useMemo(
    () =>
      account.viewer.savedPropertyIds
        .map((propertyId) => feed.findPropertyById(propertyId))
        .filter(Boolean)
        .slice(0, 3),
    [account.viewer.savedPropertyIds, feed],
  );

  async function handleThemeChange(mode: ThemeOverrideMode) {
    setThemeMode(mode);
    await setThemePreference(mode);
    Appearance.setColorScheme(mode === "system" ? null : mode);
  }

  async function confirmResetLocalData() {
    Alert.alert(
      "حذف البيانات المحلية",
      "سيتم حذف السجل المحلي، العقارات المحفوظة، وتفضيلات هذا الجهاز فقط.",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            await account.resetLocalBuyerState();
            Alert.alert("تم الحذف", "تم حذف بيانات هذا الجهاز.");
          },
        },
      ],
    );
  }

  async function confirmLogout() {
    Alert.alert(
      "تسجيل الخروج",
      "سيعود التطبيق إلى شاشة البداية المحلية على هذا الجهاز.",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "تسجيل الخروج",
          style: "destructive",
          onPress: async () => {
            await account.resetLocalBuyerState();
            router.replace("/welcome");
          },
        },
      ],
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.canvas }}>
      <MobileTopBar
        insetTop={insets.top}
        backgroundColor={theme.colors.canvas}
        borderColor={theme.colors.border}
        title="حسابي"
        subtitle="الهوية، السجل، والخصوصية"
        leading={<IconButton icon={ArrowLeft} onPress={() => router.back()} tone="panel" />}
        trailing={<View style={{ width: 44, height: 44 }} />}
      />

      <ScrollView
        className="flex-1 px-5 pt-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 36) + 32 }}
      >
        <MobileSurface tone="muted" radius="hero" className="gap-5">
          <View className="flex-row-reverse items-center gap-4">
            <View
              className="items-center justify-center"
              style={{
                width: 72,
                height: 72,
                borderRadius: theme.radii.card,
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.primaryMuted,
              }}
            >
              <UserIcon size={28} color={theme.colors.primary} />
            </View>

            <View className="flex-1 items-end">
              <AppText className="text-right text-[22px] font-cairo-black" style={{ color: theme.colors.ink }}>
                {account.viewer.displayName}
              </AppText>
              <AppText className="mt-1 text-right text-[14px] font-medium" style={{ color: theme.colors.inkMuted }}>
                {account.viewer.phone ?? account.viewer.email ?? "جلسة محلية على هذا الجهاز"}
              </AppText>
            </View>
          </View>

          <View className="flex-row-reverse flex-wrap" style={{ gap: 8 }}>
            <MobilePill label={account.viewer.isAuthenticated ? "حساب مرتبط" : "وضع الضيف"} tone="primary" active />
            <MobilePill label={`${account.viewer.threadCount} محادثة`} />
            <MobilePill label={`${account.viewer.savedPropertyIds.length} محفوظ`} />
          </View>

          <AppText className="text-right text-[14px] leading-7 font-medium" style={{ color: theme.colors.inkSoft }}>
            {account.viewer.isAuthenticated
              ? "تم دمج الهوية الحية مع البيانات المحلية حتى تبقى المحادثة، العقارات المحفوظة، والتفضيلات متماسكة داخل نفس الرحلة."
              : "لا يزال التطبيق يعمل كاملاً على هذا الجهاز حتى بدون تسجيل دخول، مع حفظ السجل والعقارات المحفوظة محلياً."}
          </AppText>
        </MobileSurface>

        <View className="mt-6 gap-3">
          <AppText className="mx-1 text-right text-[14px] font-cairo-bold" style={{ color: theme.colors.inkMuted }}>
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
              onPress={() => void handleThemeChange("system")}
            />
            <ThemeToggleButton
              active={themeMode === "dark"}
              icon={Moon}
              label="داكن"
              onPress={() => void handleThemeChange("dark")}
            />
            <ThemeToggleButton
              active={themeMode === "light"}
              icon={Sun}
              label="فاتح"
              onPress={() => void handleThemeChange("light")}
            />
          </View>
        </View>

        <MobileSurface className="mt-6 gap-4" radius="hero">
          <MobileSectionHeading
            eyebrow="التمويل الافتراضي"
            title="افتراضاتك الحالية"
            description="يستخدمها التطبيق كنقطة بداية في شاشة التمويل والمحادثة عند غياب بيانات أكثر دقة."
          />
          <View className="flex-row-reverse" style={{ gap: 12 }}>
            <MetricPill label="دفعة أولى" value={`${account.viewer.preferences.financeDefaults.downPaymentPercent}%`} />
            <MetricPill label="مدة" value={`${account.viewer.preferences.financeDefaults.preferredYears} سنة`} />
            <MetricPill label="فائدة" value={`${account.viewer.preferences.financeDefaults.annualRate}%`} />
          </View>
          <Button label="افتح التمويل" variant="secondary" onPress={() => router.push("/finance")} />
        </MobileSurface>

        <MobileSurface className="mt-6 gap-4" radius="hero">
          <MobileSectionHeading
            eyebrow="العقارات المحفوظة"
            title={savedProperties.length > 0 ? "ارجع إلى اختياراتك بسرعة" : "لا توجد عقارات محفوظة بعد"}
            description={
              savedProperties.length > 0
                ? "يمكنك فتح التفاصيل أو العودة مباشرة إلى المحادثة بنفس العقار."
                : "افتح أي عقار من التفاصيل ثم احفظه ليظهر هنا داخل حسابك."
            }
          />

          {savedProperties.length > 0 ? (
            <View style={{ gap: 12 }}>
              {savedProperties.map((property) => (
                <MobilePropertyCard
                  key={property!.id}
                  variant="compact"
                  property={property!}
                  onPress={(nextProperty) =>
                    router.push({
                      pathname: "/property/[id]",
                      params: { id: nextProperty.id },
                    })
                  }
                  onActionPress={(nextProperty) =>
                    router.push({
                      pathname: "/",
                      params: {
                        propertyId: nextProperty.id,
                        ...(account.viewer.activeThreadId ? { threadId: account.viewer.activeThreadId } : {}),
                      },
                    })
                  }
                  actionLabel="تابع في المحادثة"
                  ambientBackgroundColor={theme.colors.canvas}
                />
              ))}
            </View>
          ) : null}
        </MobileSurface>

        <MobileSurface className="mt-6 gap-4" radius="hero">
          <MobileSectionHeading
            eyebrow="سجل المحادثات"
            title={account.recentThreads.length > 0 ? "آخر المحادثات" : "لا توجد محادثات محلية بعد"}
            description={
              account.recentThreads.length > 0
                ? "كل محادثة تعيدك إلى نفس السياق المحفوظ على هذا الجهاز."
                : "بمجرد بدء محادثة مع المساعد سيظهر السجل هنا."
            }
          />

          {account.recentThreads.length > 0 ? (
            account.recentThreads.slice(0, 4).map((thread) => (
              <Pressable
                key={thread.id}
                onPress={() =>
                  router.push({
                    pathname: "/",
                    params: { threadId: thread.id },
                  })
                }
                className="flex-row-reverse items-center gap-4 rounded-[20px] px-4 py-4 active:opacity-80"
                style={{ borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceMuted }}
              >
                <View
                  className="items-center justify-center rounded-full"
                  style={{ width: 42, height: 42, backgroundColor: theme.colors.surface }}
                >
                  <History size={18} color={theme.colors.inkMuted} />
                </View>
                <View className="flex-1 items-end">
                  <AppText className="text-right text-[15px] font-cairo-bold" style={{ color: theme.colors.ink }}>
                    {thread.title}
                  </AppText>
                  <AppText className="mt-1 text-right text-[13px] font-medium" style={{ color: theme.colors.inkMuted }}>
                    {thread.preview ?? "افتح المحادثة لمتابعة نفس الرحلة."}
                  </AppText>
                </View>
              </Pressable>
            ))
          ) : (
            <MobileSurface tone="muted" radius="card" className="items-center gap-2 py-8" shadow="none">
              <History size={18} color={theme.colors.inkMuted} />
              <AppText className="text-center text-[14px] font-cairo-bold" style={{ color: theme.colors.ink }}>
                لم تبدأ أي محادثة بعد
              </AppText>
              <AppText className="text-center text-[13px] font-medium" style={{ color: theme.colors.inkMuted }}>
                ابدأ من المساعد أو من البحث وسيظهر السجل هنا تلقائياً.
              </AppText>
            </MobileSurface>
          )}
        </MobileSurface>

        <View
          className="mt-6 overflow-hidden"
          style={{
            borderRadius: theme.radii.card,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
          }}
        >
          <AccountRow icon={BarChart3} label="رؤى السوق" onPress={() => router.push("/analytics")} withBorder />
          <AccountRow icon={ShieldCheck} label="الخصوصية والبيانات" onPress={() => router.push("/legal")} withBorder />
          <AccountRow icon={FileText} label="الشروط والاستخدام" onPress={() => router.push("/legal")} withBorder />
          <AccountRow icon={Globe} label="لغة التطبيق - العربية" onPress={() => {}} withBorder />
          <AccountRow
            icon={Sparkles}
            label="ابدأ محادثة جديدة"
            onPress={() => router.push("/")}
            withBorder
          />
          <AccountRow icon={Trash2} label="حذف البيانات المحلية" onPress={() => void confirmResetLocalData()} destructive />
        </View>

        <View
          className="mt-6 overflow-hidden"
          style={{
            borderRadius: theme.radii.card,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
          }}
        >
          <AccountRow icon={LogOut} label="تسجيل الخروج" onPress={() => void confirmLogout()} destructive />
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
        borderRadius: theme.radii.card - 4,
        backgroundColor: active ? theme.colors.surface : "transparent",
        ...(active
          ? {
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

function MetricPill({ label, value }: { label: string; value: string }) {
  const theme = useAppTheme();
  return (
    <View
      className="flex-1 rounded-[18px] px-3 py-3"
      style={{ borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceMuted }}
    >
      <AppText className="text-right text-[11px] font-cairo-bold" style={{ color: theme.colors.inkMuted }}>
        {label}
      </AppText>
      <AppText className="mt-1 text-right text-[16px] font-cairo-black" style={{ color: theme.colors.ink }}>
        {value}
      </AppText>
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
