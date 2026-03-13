import { Sparkles } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { AppText } from "@/components/ui/AppText";

type CollapsedAIPillProps = {
  placeholder?: string;
  onPress: () => void;
};

/**
 * Slim, translucent floating AI input bar sitting at the bottom of the feed.
 * Tapping navigates to the dedicated chat screen.
 */
export function CollapsedAIPill({ placeholder = "اسأل عن هذه الوحدة", onPress }: CollapsedAIPillProps) {
  return (
    <Pressable
      onPress={onPress}
      className="w-full flex-row items-center bg-white/10 px-4 py-3"
      style={{ borderWidth: 0.5, borderColor: "rgba(255,255,255,0.25)" }}
    >
      <Sparkles size={16} color="rgba(255,255,255,0.7)" />
      <AppText className="flex-1 text-sm text-white/60 ml-3">{placeholder}</AppText>
    </Pressable>
  );
}
