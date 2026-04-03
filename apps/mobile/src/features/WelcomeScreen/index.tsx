import type { ReactNode } from "react";
import { View, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { Compass, MessageSquareMore, ShieldCheck } from "lucide-react-native";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { MobilePill, MobileSectionHeading, MobileSurface } from "@/components/ui/MobileChrome";
import { AnanMark } from "@/components/chat/AnanMark";
import { mobileTheme } from "@/lib/mobileTheme";

/**
 * WHY:   The optional welcome route should feel like a normal polished start page, not a concept screen.
 * WHAT:  Renders a simple branded welcome screen with concise benefits and clear entry actions.
 * HOW:   Uses one centered hero card, a quiet benefits row, and direct actions into assistant or search.
 */
export default function WelcomeScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === "dark";
  const screenBackground = isDark ? "#0B0C10" : mobileTheme.colors.canvas;
  const sectionBackground = isDark ? "#151821" : "#F3F4F6";

  return (
    <View className="flex-1 px-6" style={{ backgroundColor: screenBackground }}>
      <View className="flex-1 justify-center">
        <View
          className="rounded-[34px] px-6 py-8"
          style={{ borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.08)" : mobileTheme.colors.border, backgroundColor: sectionBackground }}
        >
          <View className="items-center">
            <View
              className="mb-6 items-center justify-center"
              style={{
                width: 96,
                height: 96,
                borderRadius: mobileTheme.radii.panel,
                backgroundColor: mobileTheme.colors.dark,
              }}
            >
              <AnanMark size={40} />
            </View>

            <MobilePill label="ANAN MOBILE" tone="primary" active />
            <MobileSectionHeading
              align="center"
              className="mt-6 items-center"
              title="ابدأ رحلة الشراء من مكان واحد"
              description="ابحث عن العقار، راجع التفاصيل، وارجع دائماً إلى نفس المحادثة بخطوات واضحة وبسيطة."
            />
          </View>

          <View className="mt-8 gap-3">
            <FeatureRow icon={<MessageSquareMore size={18} color={mobileTheme.colors.primary} />} label="محادثة واحدة من البداية للنهاية" />
            <FeatureRow icon={<ShieldCheck size={18} color={mobileTheme.colors.teal} />} label="عروض ونتائج موثقة" />
            <FeatureRow icon={<Compass size={18} color={mobileTheme.colors.primary} />} label="بحث سريع وواضح" />
          </View>
        </View>

        <View className="mt-6 gap-3">
          <Button
            label="ابدأ مع المساعد"
            onPress={() => router.replace("/")}
            className="h-[60px]"
          />
          <Button
            label="تصفح البحث"
            variant="secondary"
            onPress={() => router.push("/search")}
            className="h-[58px]"
          />
        </View>
      </View>
    </View>
  );
}

function FeatureRow({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <MobileSurface
      radius="card"
      shadow="none"
      padded={false}
      className="flex-row-reverse items-center gap-3 px-4 py-4"
    >
      <View
        className="items-center justify-center rounded-full"
        style={{
          width: 40,
          height: 40,
          backgroundColor: mobileTheme.colors.surfaceMuted,
        }}
      >
        {icon}
      </View>
      <AppText className="flex-1 text-right text-[15px] font-cairo-black text-slate-900">
        {label}
      </AppText>
    </MobileSurface>
  );
}
