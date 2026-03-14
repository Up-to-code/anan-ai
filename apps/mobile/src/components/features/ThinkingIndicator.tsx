import { useEffect, useRef, useState } from "react";
import { Animated, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Sparkles } from "lucide-react-native";

type ThinkingIndicatorProps = {
  steps?: string[];
};

const PHRASES = [
  "جاري قراءة المعطيات...",
  "البحث في قواعد البيانات...",
  "تحليل أفضل الخيارات...",
  "صياغة الرد النهائي..."
];

/**
 * AG-UI Reasoning Indicator — shows the AI is "thinking" with
 * animated pulsing dots and dynamic reasoning step labels.
 * Like ChatGPT's "Searching...", "Analyzing data..."
 */
export function ThinkingIndicator({ steps = [] }: ThinkingIndicatorProps) {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    // Dot animation
    const animateDot = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    };
    animateDot(dot1, 0);
    animateDot(dot2, 150);
    animateDot(dot3, 300);

    // Phrase cycling animation (only if no explicit steps are passed)
    if (steps.length === 0) {
      const phraseInterval = setInterval(() => {
        Animated.sequence([
          Animated.timing(textOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start(() => {
          setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
          Animated.timing(textOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
        });
      }, 2500);

      return () => clearInterval(phraseInterval);
    }
  }, [steps.length]);

  return (
    <View className="mb-4 pl-4 pr-16">
      <View className="flex-row items-center gap-2 mb-2">
        <Sparkles size={14} color="#2563EB" />
        <Animated.View style={{ opacity: textOpacity }}>
          <AppText className="text-xs text-brand font-cairo-bold">
            {steps.length > 0 ? "يفكر..." : PHRASES[phraseIndex]}
          </AppText>
        </Animated.View>
      </View>

      {/* Reasoning steps if provided */}
      {steps.map((step, i) => (
        <View key={i} className="flex-row items-center gap-2 mb-1 ml-5">
          <View className="h-1 w-1 bg-brand rounded-full" />
          <AppText className="text-xs text-slate-400">{step}</AppText>
        </View>
      ))}

      {/* Pulsing dots */}
      <View className="flex-row items-center gap-1.5 ml-5 mt-1">
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View
            key={i}
            className="h-2 w-2 bg-brand rounded-full"
            style={{ opacity: dot }}
          />
        ))}
      </View>
    </View>
  );
}
