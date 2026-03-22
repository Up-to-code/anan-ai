import { useEffect } from "react";
import { Mic, SendHorizonal } from "lucide-react-native";
import { Pressable, TextInput, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { AppText } from "@/components/ui/AppText";

type ComposerDockProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
};

/**
 * WHY:   The assistant home needs one durable composer that survives long threads and keyboard changes.
 * WHAT:  Renders a multiline input, send action, and voice-ready placeholder slot with motion.
 * HOW:   Keeps the layout flat and compact so the bottom dock remains legible above the keyboard.
 */
export function ComposerDock({ value, onChange, onSend }: ComposerDockProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View className="border-t border-line bg-white px-4 pt-3">
      <View className="border border-line bg-panel px-3 py-3">
        <TextInput
          value={value}
          onChangeText={onChange}
          multiline
          maxLength={280}
          placeholder="اكتب ما تبحث عنه أو اطلب تمويلاً أو مقارنة"
          placeholderTextColor="#64748B"
          style={{
            minHeight: 48,
            maxHeight: 112,
            color: "#0F172A",
            fontFamily: "Cairo_400Regular",
            fontSize: 15,
            textAlign: "right",
            writingDirection: "rtl",
          }}
        />
        <View className="mt-3 flex-row-reverse items-center justify-between">
          <Pressable className="border border-line bg-white px-3 py-2">
            <Animated.View className="flex-row-reverse items-center gap-2" style={animatedStyle}>
              <Mic size={16} color="#64748B" />
              <AppText className="text-xs text-muted">قريباً</AppText>
            </Animated.View>
          </Pressable>
          <Pressable
            onPress={onSend}
            className="flex-row-reverse items-center gap-2 border border-brand bg-brand px-4 py-2"
          >
            <SendHorizonal size={16} color="#FFFFFF" />
            <AppText className="text-sm font-cairo-bold text-white">إرسال</AppText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
