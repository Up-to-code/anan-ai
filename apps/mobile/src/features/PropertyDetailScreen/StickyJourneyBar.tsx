import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Mail, MessageCircle, Phone } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { useAppTheme } from "@/lib/mobileTheme";

type StickyJourneyBarProps = {
  onWhatsApp: () => void;
  onCall: () => void;
  onThirdAction: () => void;
  thirdActionLabel: string;
};

/**
 * WHY:   Buyer-facing detail screens still need fixed actions, but they should feel like a natural extension of the page.
 * WHAT:  Renders the safe-area-aware bottom contact bar with WhatsApp, call, and one contextual third action.
 * HOW:   Uses the shared mobile theme, a light top divider, and softer icon-text buttons so the footer stays quiet and consistent.
 */
export function StickyJourneyBar({
  onWhatsApp,
  onCall,
  onThirdAction,
  thirdActionLabel,
}: StickyJourneyBarProps) {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const ThirdIcon =
    thirdActionLabel.includes("بريد") || thirdActionLabel.includes("إيميل") || thirdActionLabel.includes("ايميل")
      ? Mail
      : MessageCircle;

  return (
    <View
      className="absolute bottom-0 w-full px-4"
      style={{
        paddingTop: 10,
        paddingBottom: Math.max(insets.bottom, 12),
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        backgroundColor: theme.colors.canvas,
      }}
    >
      <View className="flex-row-reverse gap-3">
        <ActionButton label="واتساب" icon={<MessageCircle size={18} color="#16A34A" />} onPress={onWhatsApp} tone="success" theme={theme} />
        <ActionButton label="اتصال" icon={<Phone size={18} color={theme.colors.primary} />} onPress={onCall} tone="neutral" theme={theme} />
        <ActionButton
          label={thirdActionLabel}
          icon={<ThirdIcon size={18} color={theme.colors.primary} />}
          onPress={onThirdAction}
          tone="neutral"
          theme={theme}
        />
      </View>
    </View>
  );
}

function ActionButton({
  label,
  icon,
  onPress,
  tone,
  theme,
}: {
  label: string;
  icon: ReactNode;
  onPress: () => void;
  tone: "success" | "neutral";
  theme: any;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="h-14 flex-1 flex-row-reverse items-center justify-center gap-2 border px-3 active:opacity-90"
      style={{
        borderRadius: theme.radii.panel,
        borderColor: tone === "success" ? "#CDEFD8" : theme.colors.border,
        backgroundColor:
          tone === "success" ? (theme.isDark ? "rgba(22, 163, 74, 0.15)" : theme.colors.successSoft) : theme.colors.surface,
      }}
    >
      <View
        className="items-center justify-center rounded-full"
        style={{
          width: 32,
          height: 32,
          backgroundColor: tone === "success" ? (theme.isDark ? "rgba(22, 163, 74, 0.2)" : "#FFFFFF") : theme.colors.surfaceMuted,
        }}
      >
        {icon}
      </View>
      <AppText className="text-[15px] font-cairo-bold" style={{ color: tone === "success" ? "#16A34A" : theme.colors.primary }}>
        {label}
      </AppText>
    </Pressable>
  );
}
