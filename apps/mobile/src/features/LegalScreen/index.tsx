import type { ReactNode } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { ArrowLeft, FileText, HelpCircle, Mic, ShieldCheck, Trash2 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { MobilePill, MobileSectionHeading, MobileSurface, MobileTopBar } from "@/components/ui/MobileChrome";
import { useBuyerAccount } from "@/hooks/useBuyerAccount";
import { useAppTheme } from "@/lib/mobileTheme";

/**
 * WHY:   Privacy and review-readiness copy must map to real buyer-app actions rather than static legal placeholders.
 * WHAT:  Renders the buyer privacy surface with consent markers, support routing, and device-data reset controls.
 * HOW:   Keeps the sections review-friendly while writing acknowledgements into the buyer account contract and using the same local reset path as the account screen.
 */
export default function LegalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const account = useBuyerAccount();

  function confirmDeleteLocalData() {
    Alert.alert(
      "حذف البيانات المحلية",
      "سيتم حذف سجل المحادثات، العقارات المحفوظة، وتفضيلات هذا الجهاز فقط.",
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

  async function openSupport() {
    await account.setConsent("supportAcceptedAt");
    const mailUrl = "mailto:support@anan.sa?subject=Anan%20Mobile%20Support";
    const canOpen = await Linking.canOpenURL(mailUrl);
    if (canOpen) {
      await Linking.openURL(mailUrl);
      return;
    }
    Alert.alert("الدعم", "support@anan.sa");
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.canvas }}>
      <MobileTopBar
        insetTop={insets.top}
        backgroundColor={theme.colors.canvas}
        borderColor={theme.colors.border}
        title="الخصوصية والبيانات"
        subtitle="إرشادات دقيقة داخل التطبيق"
        leading={<IconButton icon={ArrowLeft} onPress={() => router.back()} tone="panel" />}
        trailing={<View style={{ width: 44, height: 44 }} />}
      />

      <ScrollView
        className="flex-1 px-5 pt-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 40) + 20 }}
      >
        <MobileSurface tone="muted" radius="hero" className="gap-4" shadow="none">
          <MobileSectionHeading
            eyebrow="مركز الثقة"
            title="الخصوصية، الصوت، والدعم"
            description="كل عناصر هذه الصفحة مرتبطة مباشرة بعقود البيانات المحلية ومسار الدعم الحقيقي داخل تطبيق المشتري."
          />
          <View className="flex-row-reverse flex-wrap" style={{ gap: 8 }}>
            <MobilePill label={account.viewer.consents.privacyAcceptedAt ? "الخصوصية مراجعَة" : "مراجعة الخصوصية مطلوبة"} tone="primary" active={Boolean(account.viewer.consents.privacyAcceptedAt)} />
            <MobilePill label={account.viewer.consents.termsAcceptedAt ? "الشروط مراجعَة" : "الشروط بانتظار المراجعة"} tone="primary" active={Boolean(account.viewer.consents.termsAcceptedAt)} />
          </View>
        </MobileSurface>

        <LegalSection
          icon={ShieldCheck}
          title="الخصوصية"
          body="يستخدم عنان بيانات المحادثة الحالية لتقديم التوصيات العقارية، المقارنة، ومتابعة نفس الرحلة. عند العمل كضيف، يبقى السجل محفوظاً محلياً على هذا الجهاز."
          status={account.viewer.consents.privacyAcceptedAt ? "تمت المراجعة" : "بانتظار المراجعة"}
          statusTone={account.viewer.consents.privacyAcceptedAt ? "primary" : "default"}
        >
          <Button
            label="أؤكد فهم سياسة الخصوصية"
            variant="secondary"
            onPress={() => void account.setConsent("privacyAcceptedAt")}
          />
        </LegalSection>

        <LegalSection
          icon={Mic}
          title="استخدام الميكروفون"
          body="لن يطلب التطبيق إذن الميكروفون إلا عندما تبدأ تسجيل رسالة صوتية بنفسك. يستخدم الصوت لتحويله إلى نص داخل نفس المحادثة."
          status={account.viewer.consents.microphoneAcceptedAt ? "تمت المراجعة" : "اختياري"}
          statusTone={account.viewer.consents.microphoneAcceptedAt ? "primary" : "default"}
        >
          <Button
            label="فهمت استخدام الميكروفون"
            variant="secondary"
            onPress={() => void account.setConsent("microphoneAcceptedAt")}
          />
        </LegalSection>

        <LegalSection
          icon={FileText}
          title="الشروط والاستخدام"
          body="التجربة الحالية مخصصة لتصفح العقارات، المقارنة، فهم التمويل، وطلب المتابعة. لا توجد مدفوعات داخل التطبيق في هذه النسخة."
          status={account.viewer.consents.termsAcceptedAt ? "تمت المراجعة" : "بانتظار المراجعة"}
          statusTone={account.viewer.consents.termsAcceptedAt ? "primary" : "default"}
        >
          <Button
            label="أؤكد فهم شروط الاستخدام"
            variant="secondary"
            onPress={() => void account.setConsent("termsAcceptedAt")}
          />
        </LegalSection>

        <LegalSection
          icon={HelpCircle}
          title="الدعم"
          body="يمكنك طلب الدعم من داخل التطبيق عبر المساعد أو مراسلة فريق التشغيل مباشرة. هذا يضمن أن أسئلة المراجعة أو الخصوصية تصل إلى نفس الجهة المسؤولة."
          status={account.viewer.consents.supportAcceptedAt ? "تم فتح قناة الدعم" : "متاح دائماً"}
          statusTone={account.viewer.consents.supportAcceptedAt ? "primary" : "default"}
        >
          <Button label="تواصل مع الدعم" onPress={() => void openSupport()} />
        </LegalSection>

        <Pressable
          onPress={confirmDeleteLocalData}
          className="mt-5 flex-row-reverse items-center gap-4 rounded-[24px] px-5 py-5 active:opacity-80"
          style={{
            borderWidth: 1,
            borderColor: theme.colors.danger,
            backgroundColor: theme.colors.dangerSoft,
          }}
        >
          <View
            className="items-center justify-center rounded-full"
            style={{ width: 44, height: 44, backgroundColor: theme.colors.surface }}
          >
            <Trash2 size={18} color={theme.colors.danger} />
          </View>
          <View className="flex-1">
            <AppText className="text-right text-[16px] font-cairo-black" style={{ color: theme.colors.danger }}>
              حذف البيانات المحلية
            </AppText>
            <AppText className="mt-1 text-right text-[13px] font-medium" style={{ color: theme.colors.inkMuted }}>
              يمسح السجل المحلي والعقارات المحفوظة وتفضيلات هذا الجهاز فقط.
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
  status,
  statusTone,
  children,
}: {
  icon: typeof ShieldCheck;
  title: string;
  body: string;
  status: string;
  statusTone: "default" | "primary";
  children: ReactNode;
}) {
  const theme = useAppTheme();
  return (
    <MobileSurface className="mt-5 gap-4" radius="hero" shadow="none">
      <View className="flex-row-reverse items-center gap-3">
        <View
          className="items-center justify-center rounded-full"
          style={{ width: 42, height: 42, backgroundColor: theme.colors.primarySoft }}
        >
          <Icon size={18} color={theme.colors.primary} />
        </View>
        <AppText className="flex-1 text-right text-[18px] font-cairo-black" style={{ color: theme.colors.ink }}>
          {title}
        </AppText>
      </View>

      <View className="mt-4 flex-row-reverse">
        <MobilePill label={status} tone={statusTone === "primary" ? "primary" : "default"} active={statusTone === "primary"} />
      </View>

      <AppText className="mt-4 text-right text-[15px] leading-8" style={{ color: theme.colors.inkMuted }}>
        {body}
      </AppText>

      <View>{children}</View>
    </MobileSurface>
  );
}
