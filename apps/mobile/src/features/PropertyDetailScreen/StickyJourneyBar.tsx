import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";

type StickyJourneyBarProps = {
  onBookViewing: () => void;
  onTalkToAdvisor: () => void;
};

/**
 * WHY:   The property detail screen needs fixed next-step CTAs that stay visible above bottom insets.
 * WHAT:  Renders the booking and advisor actions at the bottom of the property journey.
 * HOW:   Applies safe-area padding and compact button treatments to avoid hidden actions on modern devices.
 */
export function StickyJourneyBar({ onBookViewing, onTalkToAdvisor }: StickyJourneyBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="border-t border-line bg-white px-5 pt-3"
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
    >
      <View className="flex-row-reverse gap-3">
        <Button label="حجز زيارة" onPress={onBookViewing} className="flex-1" />
        <Button
          label="مستشار عنان"
          variant="secondary"
          onPress={onTalkToAdvisor}
          className="flex-1"
        />
      </View>
    </View>
  );
}
