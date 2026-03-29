import { StyleSheet, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <LinearGradient
      colors={isDark ? ["rgba(2,6,23,0)", "rgba(2,6,23,0.95)", "rgba(2,6,23,1)"] : ["rgba(255,255,255,0)", "rgba(255,255,255,0.95)", "rgba(255,255,255,1)"]}
      locations={[0, 0.4, 1]}
      className="absolute bottom-0 w-full px-6 pt-10"
      pointerEvents="box-none"
      style={{
        paddingBottom: Math.max(insets.bottom, 20),
      }}
    >
      <View className="flex-row-reverse gap-4" pointerEvents="auto">
        <Button 
          label="حجز زيارة" 
          onPress={onBookViewing} 
          className="flex-1 rounded-full h-14 shadow-sm" 
        />
        <Button
          label="المستشار"
          variant="secondary"
          onPress={onTalkToAdvisor}
          className="flex-1 rounded-full h-14 shadow-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
        />
      </View>
    </LinearGradient>
  );
}
