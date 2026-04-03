import { Alert, Pressable, ScrollView, View, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, FileText, HelpCircle, Mic, ShieldCheck, Trash2 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { MobileTopBar } from "@/components/ui/MobileChrome";
import { clearGuestThreadStore } from "@/lib/mobilePersistence";
import { mobileTheme } from "@/lib/mobileTheme";

/**
 * WHY:   App Review and end users need one clear place to understand privacy, local data behavior, and permission usage inside the buyer app.
 * WHAT:  Renders the in-app legal and policy surface covering privacy, microphone usage, support, and local data deletion.
 * HOW:   Uses static buyer-facing copy plus one explicit local-data reset action so the screen remains reviewable without backend state.
 */
export default function LegalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";
  const screenBackground = isDark ? "#090A0C" : mobileTheme.colors.canvas;
  const sectionBackground = isDark ? "#151821" : mobileTheme.colors.surface;
  const dividerColor = isDark ? "rgba(255,255,255,0.08)" : mobileTheme.colors.border;
  const textSecondary = isDark ? "#CBD5E1" : "#64748B";

  function confirmDeleteLocalData() {
    Alert.alert(
      "حذف البيانات المحلية",
      "سيتم حذف سجل المحادثات المحلي المحفوظ على هذا الجهاز فقط.",
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
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: screenBackground }}>
      <MobileTopBar
        insetTop={insets.top}
        backgroundColor={screenBackground}
        borderColor={dividerColor}
        title="الخصوصية والبيانات"
        subtitle="إرشادات التطبيق وبيانات المراجعة"
        leading={<IconButton icon={ArrowLeft} onPress={() => router.back()} tone={isDark ? "inversePanel" : "panel"} />}
        trailing={<View style={{ width: 44, height: 44 }} />}
      />

      <ScrollView className="flex-1 px-5 pt-5" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <LegalSection
          icon={ShieldCheck}
          title="الخصوصية"
          body="يستخدم عنان بيانات المحادثة الحالية فقط لتقديم التوصيات العقارية، مقارنة الخيارات، ومتابعة نفس الرحلة داخل التطبيق. السجل الحالي يُحفظ محلياً على هذا الجهاز في وضع الضيف."
          isDark={isDark}
          sectionBackground={sectionBackground}
          textSecondary={textSecondary}
        />

        <LegalSection
          icon={Mic}
          title="استخدام الميكروفون"
          body="يطلب التطبيق إذن الميكروفون فقط عندما تختار تسجيل رسالة صوتية. التسجيل يُستخدم لتحويل صوتك إلى نص داخل نفس المحادثة، ولا يتم طلب الإذن قبل تفعيل التسجيل منك."
          isDark={isDark}
          sectionBackground={sectionBackground}
          textSecondary={textSecondary}
        />

        <LegalSection
          icon={FileText}
          title="الشروط والاستخدام"
          body="هذا التطبيق مخصص لتصفح العقارات، فهم التوصيات، وطلب المتابعة العقارية داخل تجربة عنان. لا توجد مدفوعات داخل التطبيق حالياً، ولا يتم إنشاء حساب إلزامي لاستخدام التجربة الأساسية."
          isDark={isDark}
          sectionBackground={sectionBackground}
          textSecondary={textSecondary}
        />

        <LegalSection
          icon={HelpCircle}
          title="الدعم"
          body="للحصول على دعم داخل التطبيق، افتح المحادثة واطلب مستشاراً. وللاستفسارات التشغيلية أو مراجعة المتجر، استخدم جهة الدعم الرسمية الخاصة بعنان عند إعداد بيانات App Store Connect."
          isDark={isDark}
          sectionBackground={sectionBackground}
          textSecondary={textSecondary}
        />

        <Pressable
          onPress={confirmDeleteLocalData}
          className="mt-5 flex-row-reverse items-center gap-4 rounded-[24px] px-5 py-5 active:opacity-80"
          style={{
            borderWidth: 1,
            borderColor: "#F6CFCF",
            backgroundColor: isDark ? "#221416" : mobileTheme.colors.dangerSoft,
          }}
        >
          <View
            className="items-center justify-center rounded-full"
            style={{ width: 44, height: 44, backgroundColor: isDark ? "#3A1D22" : "#FFFFFF" }}
          >
            <Trash2 size={18} color={mobileTheme.colors.danger} />
          </View>
          <View className="flex-1">
            <AppText className="text-right text-[16px] font-cairo-black text-red-600">حذف البيانات المحلية</AppText>
            <AppText className="mt-1 text-right text-[13px] font-medium" style={{ color: textSecondary }}>
              يمسح سجل المحادثات المحلي المحفوظ على هذا الجهاز فقط.
            </AppText>
          </View>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function LegalSection({
  icon: Icon,
  title,
  body,
  isDark,
  sectionBackground,
  textSecondary,
}: {
  icon: typeof ShieldCheck;
  title: string;
  body: string;
  isDark: boolean;
  sectionBackground: string;
  textSecondary: string;
}) {
  return (
    <View
      className="mt-5 rounded-[24px] px-5 py-5"
      style={{
        borderWidth: 1,
        borderColor: isDark ? "rgba(255,255,255,0.08)" : mobileTheme.colors.border,
        backgroundColor: sectionBackground,
      }}
    >
      <View className="flex-row-reverse items-center gap-3">
        <View
          className="items-center justify-center rounded-full"
          style={{ width: 42, height: 42, backgroundColor: mobileTheme.colors.primarySoft }}
        >
          <Icon size={18} color={mobileTheme.colors.primary} />
        </View>
        <AppText className="flex-1 text-right text-[18px] font-cairo-black text-slate-900">{title}</AppText>
      </View>
      <AppText className="mt-4 text-right text-[15px] leading-8" style={{ color: textSecondary }}>
        {body}
      </AppText>
    </View>
  );
}
