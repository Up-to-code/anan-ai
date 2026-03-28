import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";

type StickyJourneyBarProps = {
  onBookViewing: () => void;
  onTalkToAdvisor: () => void;
};

/**
 * WHY:   The property detail screen needs fixed next-step CTAs.
 * WHAT:  Modernizes the bottom bar with a cleaner glassmorphism wrapper and bigger buttons.
 * HOW:   Uses our new rounded-full Button component within a shadow-heavy floating-style bar.
 */
export function StickyJourneyBar({ onBookViewing, onTalkToAdvisor }: StickyJourneyBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute bottom-0 w-full px-6 pt-5"
      style={{ paddingBottom: Math.max(insets.bottom, 20) }}
    >
      <View className="flex-row-reverse gap-4">
        <Button 
          label="حجز زيارة" 
          onPress={onBookViewing} 
          className="flex-1 rounded-full h-14" 
        />
        <Button
          label="المستشار"
          variant="secondary"
          onPress={onTalkToAdvisor}
          className="flex-1 rounded-full h-14"
        />
      </View>
    </View>
  );
}
