import type { ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Compass, MessageSquareMore, ShieldCheck } from "lucide-react-native";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { MobilePill, MobileSectionHeading, MobileSurface } from "@/components/ui/MobileChrome";
import { AnanMark } from "@/components/chat/AnanMark";
import { useBuyerAccount } from "@/hooks/useBuyerAccount";
import { useAppTheme } from "@/lib/mobileTheme";

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const account = useBuyerAccount();

  async function startJourney(nextRoute: "/" | "/search") {
    await account.markOnboardingCompleted();
    router.replace(nextRoute);
  }

  return (
    <View className="flex-1 px-5" style={{ backgroundColor: theme.colors.canvas, paddingBottom: Math.max(insets.bottom, 20) }}>
      <View className="flex-1 justify-center" style={{ gap: theme.spacing.section }}>
        <MobileSurface tone="muted" radius="hero" className="gap-8" shadow="none">
          <View className="items-center">
            <View
              className="items-center justify-center"
              style={{
                width: 96,
                height: 96,
                borderRadius: theme.radii.panel,
                backgroundColor: theme.colors.surfaceStrong,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <AnanMark size={40} />
            </View>

            <MobilePill label="ANAN MOBILE" tone="primary" active className="mt-6" />
            <MobileSectionHeading
              align="center"
              className="mt-6 items-center"
              title="ابدأ رحلة الشراء من مكان واحد"
              description="ابحث عن العقار، راجع التفاصيل، وارجع دائماً إلى نفس المحادثة بخطوات واضحة وبسيطة."
            />
          </View>

          <View className="mt-8 gap-3">
            <FeatureRow icon={<MessageSquareMore size={18} color={theme.colors.primary} />} label="محادثة واحدة من البداية للنهاية" />
            <FeatureRow icon={<ShieldCheck size={18} color={theme.colors.teal} />} label="عروض ونتائج موثقة" />
            <FeatureRow icon={<Compass size={18} color={theme.colors.primary} />} label="بحث سريع وواضح" />
          </View>
        </MobileSurface>

        <View className="gap-3">
          <Button
            label="ابدأ مع المساعد"
            onPress={() => void startJourney("/")}
            className="h-[60px]"
          />
          <Button
            label="تصفح البحث"
            variant="secondary"
            onPress={() => void startJourney("/search")}
            className="h-[58px]"
          />
        </View>
      </View>
    </View>
  );
}

function FeatureRow({ icon, label }: { icon: ReactNode; label: string }) {
  const theme = useAppTheme();
  return (
    <MobileSurface
      radius="card"
      shadow="none"
      padded={false}
      className="flex-row-reverse items-center gap-3 px-4 py-4"
    >
      <View
        className="items-center justify-center"
        style={{
          width: 40,
          height: 40,
          borderRadius: theme.radii.pill,
          backgroundColor: theme.colors.surfaceMuted,
        }}
      >
        {icon}
      </View>
      <AppText className="flex-1 text-right text-[15px] font-cairo-bold" style={{ color: theme.colors.ink }}>
        {label}
      </AppText>
    </MobileSurface>
  );
}
