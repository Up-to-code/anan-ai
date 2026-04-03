import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Mail, MessageCircle, Phone } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { mobileTheme } from "@/lib/mobileTheme";

type StickyJourneyBarProps = {
  onWhatsApp: () => void;
  onCall: () => void;
  onThirdAction: () => void;
  thirdActionLabel: string;
};

/**
 * WHY:   Buyer-facing detail screens still need fixed actions, but they should feel like normal marketplace contact bars.
 * WHAT:  Renders a flat bottom action strip with WhatsApp, call, and one contextual third action.
 * HOW:   Uses a safe-area-aware top-bordered bar and three equal actions so detail screens keep one consistent anchored footer.
 */
export function StickyJourneyBar({
  onWhatsApp,
  onCall,
  onThirdAction,
  thirdActionLabel,
}: StickyJourneyBarProps) {
  const insets = useSafeAreaInsets();
  const ThirdIcon = thirdActionLabel.includes("بريد") ? Mail : MessageCircle;

  return (
    <View
      className="absolute bottom-0 w-full px-4 pt-3"
      style={{ paddingBottom: Math.max(insets.bottom, 14) }}
    >
      <View
        className="flex-row-reverse gap-3 border-t px-1 pt-1"
        style={{
          borderColor: mobileTheme.colors.borderStrong,
          backgroundColor: mobileTheme.colors.canvasElevated,
        }}
      >
        <ActionButton label="واتساب" icon={<MessageCircle size={18} color="#16A34A" />} onPress={onWhatsApp} tone="success" />
        <ActionButton label="اتصال" icon={<Phone size={18} color={mobileTheme.colors.primary} />} onPress={onCall} tone="neutral" />
        <ActionButton
          label={thirdActionLabel}
          icon={<ThirdIcon size={18} color={mobileTheme.colors.primary} />}
          onPress={onThirdAction}
          tone="neutral"
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
}: {
  label: string;
  icon: ReactNode;
  onPress: () => void;
  tone: "success" | "neutral";
}) {
  return (
    <Pressable
      onPress={onPress}
      className="h-14 flex-1 flex-row-reverse items-center justify-center gap-2 rounded-[18px] border active:opacity-90"
      style={{
        borderColor: tone === "success" ? "#CDEFD8" : mobileTheme.colors.border,
        backgroundColor: tone === "success" ? mobileTheme.colors.successSoft : mobileTheme.colors.surface,
      }}
    >
      {icon}
      <AppText className={`text-[15px] font-cairo-black ${tone === "success" ? "text-emerald-600" : "text-blue-700"}`}>
        {label}
      </AppText>
    </Pressable>
  );
}
