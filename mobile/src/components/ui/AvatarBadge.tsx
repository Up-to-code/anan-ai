import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";

type AvatarBadgeProps = {
  label: string;
};

/**
 * WHY:   Owner identity needs a lightweight avatar marker even when no uploaded logo is available.
 * WHAT:  Renders a monogram tile from the supplied label.
 * HOW:   Uses the first character as a deterministic fallback identity mark.
 */
export function AvatarBadge({ label }: AvatarBadgeProps) {
  return (
    <View className="h-10 w-10 items-center justify-center bg-ink">
      <AppText tone="label" className="text-surface">
        {label.trim().charAt(0)}
      </AppText>
    </View>
  );
}
