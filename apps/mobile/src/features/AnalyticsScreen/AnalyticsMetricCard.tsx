import type { LucideIcon } from "lucide-react-native";
import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { MobileSurface } from "@/components/ui/MobileChrome";
import { useAppTheme } from "@/lib/mobileTheme";

type AnalyticsMetricCardTone = "default" | "highlight" | "success";

/**
 * WHY:   The analytics mock-up needs one shared KPI card so the page reads as a calm system, not a stack of unrelated widgets.
 * WHAT:  Renders a compact metric surface with one icon, one value, and a short explanation.
 * HOW:   Reuses the shared mobile surface primitive and maps the tone to semantic accent colors from the mobile theme.
 */
export function AnalyticsMetricCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone?: AnalyticsMetricCardTone;
}) {
  const theme = useAppTheme();
  const surfaceTone = tone === "highlight" ? "highlight" : tone === "success" ? "success" : "default";
  const iconBackgroundColor =
    tone === "highlight"
      ? theme.colors.primarySoft
      : tone === "success"
        ? theme.colors.successSoft
        : theme.colors.surfaceMuted;
  const iconColor =
    tone === "highlight"
      ? theme.colors.primary
      : tone === "success"
        ? theme.colors.success
        : theme.colors.inkSoft;

  return (
    <MobileSurface
      tone={surfaceTone}
      radius="panel"
      className="gap-4"
      style={{ width: "48%", minHeight: 160 }}
    >
      <View
        className="items-center justify-center rounded-full self-start"
        style={{ width: 44, height: 44, backgroundColor: iconBackgroundColor }}
      >
        <Icon size={20} color={iconColor} strokeWidth={2.2} />
      </View>

      <View className="gap-2">
        <AppText className="text-[12px] font-cairo-bold" style={{ color: theme.colors.inkMuted }}>
          {label}
        </AppText>
        <AppText className="text-[26px] leading-[34px] font-cairo-black" style={{ color: theme.colors.ink }}>
          {value}
        </AppText>
        <AppText className="text-[13px] leading-6 font-cairo-medium" style={{ color: theme.colors.inkSoft }}>
          {helper}
        </AppText>
      </View>
    </MobileSurface>
  );
}
